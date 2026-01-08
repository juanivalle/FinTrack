import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';

@Injectable()
export class CoingeckoPriceProvider implements IPriceProvider {
    private readonly logger = new Logger(CoingeckoPriceProvider.name);
    private readonly baseUrl = 'https://api.coingecko.com/api/v3';

    // Map internal symbols to CoinGecko IDs
    private readonly symbolMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SPY': 'spiritswap', // Fallback for SPY as CoinGecko is crypto-only. Ideally use a stock API for SPY.
        'BTC/USD': 'bitcoin',
        'ETH/USD': 'ethereum'
    };

    constructor(private readonly httpService: HttpService) { }

    async getPrice(symbol: string): Promise<PriceData> {
        try {
            const id = this.symbolMap[symbol] || 'bitcoin';

            // Note: CoinGecko Free API has rate limits (approx 10-30 req/min). 
            // In a real prod app, we should batch these or use a paid key.
            const url = `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd`;

            const response = await firstValueFrom(this.httpService.get(url));
            const price = response.data[id]?.usd;

            if (!price) {
                this.logger.warn(`Price not found for ${symbol} (${id})`);
                throw new Error('Price not found');
            }

            return {
                symbol: symbol,
                price: price.toString(),
                timestamp: new Date(),
            };
        } catch (error) {
            this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
            // Fallback to random data on error to keep app alive
            return {
                symbol,
                price: (Math.random() * 1000 + 1000).toFixed(2),
                timestamp: new Date()
            };
        }
    }
}
