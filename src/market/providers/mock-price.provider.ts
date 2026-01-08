import { Injectable } from '@nestjs/common';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';

@Injectable()
export class MockPriceProvider implements IPriceProvider {
    private basePrices: Record<string, number> = {
        'BTC': 95000.00,
        'ETH': 3500.00,
        'SOL': 195.50,
        'AAPL': 240.00,
        'TSLA': 431.00,
        // Fallbacks
        'BTC/USD': 95000.00,
        'ETH/USD': 3500.00
    };

    async getPrice(symbol: string): Promise<PriceData> {
        if (!this.basePrices[symbol]) {
            // Initialize unknown symbol with a somewhat realistic starting price
            // Stocks usually 50-500, Crypto varies. 
            this.basePrices[symbol] = 100 + Math.random() * 200;
        }

        const base = this.basePrices[symbol];
        const volatility = base * 0.002; // 0.2% volatility
        const change = (Math.random() - 0.5) * volatility;

        // Update base slightly so it "trends"
        this.basePrices[symbol] = base + change;

        return {
            symbol,
            price: this.basePrices[symbol].toFixed(2),
            timestamp: new Date().toISOString(),
        };
    }
}
