import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import type { IPriceProvider } from './interfaces/price-provider.interface';
import Redis from 'ioredis';

@Injectable()
export class MarketService {
    constructor(
        @Inject('PRICE_PROVIDER') private priceProvider: IPriceProvider,
        @Inject('REDIS_CLIENT') private redis: Redis,
    ) { }

    async getPrice(symbol: string) {
        // Check cache
        const cacheKey = `price_v10:${symbol}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Fetch from provider
        const data = await this.priceProvider.getPrice(symbol);

        // Set cache (4 minutes TTL to satisfy free tier limits)
        await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 240);

        return data;
    }

    async searchAssets(query: string) {
        if (!query || query.length < 2) return [];

        try {
            const url = `https://symbol-search.tradingview.com/symbol_search?text=${query}&lang=es&limit=10`;
            const response = await axios.get(url, {
                headers: {
                    'Origin': 'https://www.tradingview.com',
                    'Referer': 'https://www.tradingview.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // Map TradingView format to our internal format
            return response.data.map((item: any) => {
                let type = 'Stocks';
                if (item.type === 'crypto') type = 'Crypto';
                if (item.type === 'forex') type = 'Forex';
                if (item.type === 'index') type = 'Index';

                // Construct symbol based on type for best compatibility
                // TV returns "symbol": "BTCUSDT", "exchange": "BINANCE"
                // We want "BTC" as display symbol, but store logical symbol maybe?
                // Our generic map uses just the ticker usually.

                return {
                    symbol: item.symbol,
                    name: item.description,
                    type: type,
                    exchange: item.exchange,
                    fullSymbol: `${item.exchange}:${item.symbol}`
                };
            });
        } catch (error) {
            console.error('TradingView Search Error', error.message);
            return [];
        }
    }
}
