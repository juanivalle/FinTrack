import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';

@Injectable()
@Injectable()
export class BinanceHybridPriceProvider implements IPriceProvider {
    private readonly logger = new Logger(BinanceHybridPriceProvider.name);
    private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

    // State for Stocks (Last known real price)
    private stockState: Record<string, { price: number, lastUpdate: number }> = {
        'AAPL': { price: 260.35, lastUpdate: 0 },
        'TSLA': { price: 431.40, lastUpdate: 0 },
        'SPY': { price: 595.00, lastUpdate: 0 },
        'NVDA': { price: 1100.00, lastUpdate: 0 }
    };

    private readonly SCRAPE_INTERVAL = 30 * 60 * 1000; // 30 mins

    constructor(private readonly httpService: HttpService) { }

    async getPrice(symbol: string): Promise<PriceData> {
        // 1. Check if Crypto
        const geckoId = this.getCoinGeckoId(symbol);
        if (geckoId) {
            return this.fetchCoinGeckoPrice(symbol, geckoId);
        }

        // 2. Else, Stocks -> Smart Scrape (No Simulation)
        return this.getSmartStockPrice(symbol);
    }

    private getCoinGeckoId(symbol: string): string | null {
        const map: Record<string, string> = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana',
            'BNB': 'binancecoin',
            'XRP': 'ripple',
            'ADA': 'cardano'
        };
        return map[symbol] || null;
    }

    private async fetchCoinGeckoPrice(originalSymbol: string, geckoId: string): Promise<PriceData> {
        try {
            const url = `${this.COINGECKO_API}?ids=${geckoId}&vs_currencies=usd`;
            const { data } = await firstValueFrom(this.httpService.get(url));

            if (data[geckoId] && data[geckoId].usd) {
                return {
                    symbol: originalSymbol,
                    price: data[geckoId].usd.toFixed(2),
                    change24h: '0.00', // CoinGecko Simple API doesn't give 24h change in free tier easily without 'include_24hr_change=true'
                    timestamp: new Date().toISOString()
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            this.logger.error(`CoinGecko fetch failed for ${originalSymbol}: ${error.message}`);
            return { symbol: originalSymbol, price: '0.00', timestamp: new Date().toISOString() };
        }
    }

    private async getSmartStockPrice(symbol: string): Promise<PriceData> {
        const now = Date.now();
        const state = this.stockState[symbol] || { price: 0, lastUpdate: 0 };

        // Attempt scrape if stale
        if (now - state.lastUpdate > this.SCRAPE_INTERVAL || state.price === 0) {
            try {
                this.logger.log(`Attempting to scrape ${symbol}...`);
                const realPrice = await this.scrapeGoogleFinance(symbol);
                if (realPrice) {
                    state.price = realPrice;
                    state.lastUpdate = now;
                    this.stockState[symbol] = state;
                }
            } catch (e) {
                this.logger.error(`Scrape failed for ${symbol}: ${e.message}`);
                // Proceed with stale price if available, otherwise 0
            }
        }

        // Return real state price or 0.00 (NO SIMULATION)
        return {
            symbol,
            price: state.price > 0 ? state.price.toFixed(2) : '0.00',
            change24h: '0.00', // Scraper doesn't get change% reliably yet
            timestamp: new Date().toISOString()
        };
    }

    private async scrapeGoogleFinance(symbol: string): Promise<number | null> {
        try {
            const exchange = symbol === 'SPY' ? 'NYSEARCA' : 'NASDAQ';
            const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;

            const { data } = await firstValueFrom(this.httpService.get(url, {
                responseType: 'text',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }));

            const match = data.match(/<div class="YMlKec fxKbKc">([^<]+)<\/div>/);
            if (match) {
                const priceStr = match[1].replace('$', '').replace(',', '');
                return parseFloat(priceStr);
            }
            return null;
        } catch (e) {
            return null;
        }
    }
}
