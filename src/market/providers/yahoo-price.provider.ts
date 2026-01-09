import { Injectable, Logger } from '@nestjs/common';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';
import yahooFinance from 'yahoo-finance2';

@Injectable()
export class YahooPriceProvider implements IPriceProvider {
    private readonly logger = new Logger(YahooPriceProvider.name);

    private readonly symbolMap: Record<string, string> = {
        'BTC': 'BTC-USD',
        'ETH': 'ETH-USD',
        'SOL': 'SOL-USD',
        'AAPL': 'AAPL',
        'TSLA': 'TSLA',
    };

    async getPrice(symbol: string): Promise<PriceData> {
        try {
            const yahooSymbol = this.symbolMap[symbol] || symbol;
            const quote: any = await yahooFinance.quote(yahooSymbol);

            if (!quote) {
                throw new Error(`No quote found for ${symbol}`);
            }

            return {
                symbol,
                price: (quote.regularMarketPrice || 0).toFixed(2),
                change24h: (quote.regularMarketChangePercent || 0).toFixed(2),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`Yahoo Finance fetch failed for ${symbol}: ${error.message}`);
            // User requested NO FAKE FALLBACK. 
            // Return 0.00 to indicate failure explicitly as requested.
            return {
                symbol,
                price: '0.00',
                change24h: '0.00',
                timestamp: new Date().toISOString()
            };
        }
    }
}

