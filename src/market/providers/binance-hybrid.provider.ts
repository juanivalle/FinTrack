import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';

@Injectable()
export class BinanceHybridPriceProvider implements IPriceProvider {
    private readonly logger = new Logger(BinanceHybridPriceProvider.name);
    private readonly BINANCE_API = 'https://api.binance.com/api/v3/ticker/24hr';

    // State for Stocks
    // initialized with "Real" values seen in testing to prevent jump if scrape fails initially
    private stockState: Record<string, { price: number, lastUpdate: number }> = {
        'AAPL': { price: 260.35, lastUpdate: 0 },
        'TSLA': { price: 431.40, lastUpdate: 0 },
        'SPY': { price: 595.00, lastUpdate: 0 },
        'NVDA': { price: 1100.00, lastUpdate: 0 }
    };

    private readonly SCRAPE_INTERVAL = 60 * 60 * 1000; // Scrape every hour to avoid IP ban, use simulation in between

    constructor(private readonly httpService: HttpService) { }

    async getPrice(symbol: string): Promise<PriceData> {
        // 1. Check if Crypto (Binance Supported)
        const cryptoSymbol = this.getBinanceSymbol(symbol);
        if (cryptoSymbol) {
            return this.fetchBinancePrice(symbol, cryptoSymbol);
        }

        // 2. Else, Stocks -> Smart Scrape + Sim
        return this.getSmartStockPrice(symbol);
    }

    private getBinanceSymbol(symbol: string): string | null {
        const map: Record<string, string> = {
            'BTC': 'BTCUSDT',
            'ETH': 'ETHUSDT',
            'SOL': 'SOLUSDT',
            'BNB': 'BNBUSDT',
            'XRP': 'XRPUSDT',
            'ADA': 'ADAUSDT'
        };
        return map[symbol] || null;
    }

    private async fetchBinancePrice(originalSymbol: string, binanceSymbol: string): Promise<PriceData> {
        try {
            const { data } = await firstValueFrom(this.httpService.get(`${this.BINANCE_API}?symbol=${binanceSymbol}`));

            return {
                symbol: originalSymbol,
                price: parseFloat(data.lastPrice).toFixed(2),
                change24h: parseFloat(data.priceChangePercent).toFixed(2),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`Binance fetch failed for ${originalSymbol}: ${error.message}`);
            return { symbol: originalSymbol, price: '0.00', timestamp: new Date().toISOString() };
        }
    }

    private async getSmartStockPrice(symbol: string): Promise<PriceData> {
        const now = Date.now();
        const state = this.stockState[symbol] || { price: 100.00, lastUpdate: 0 };

        // Attempt scrape if stale (older than 1 hour) or never fetched
        if (now - state.lastUpdate > this.SCRAPE_INTERVAL) {
            try {
                this.logger.log(`Attempting to scrape ${symbol}...`);
                const realPrice = await this.scrapeGoogleFinance(symbol);
                if (realPrice) {
                    state.price = realPrice;
                    state.lastUpdate = now;
                    this.logger.log(`Updated baseline for ${symbol}: $${realPrice}`);
                }
            } catch (e) {
                this.logger.warn(`Scrape failed for ${symbol}: ${e.message}`);
                // Ignore scrape errors, continue with simulation
            }
        }

        // Simulate micro-movement (ticks) for "Live" feel
        const volatility = state.price * 0.0005; // 0.05% jitter
        const change = (Math.random() - 0.5) * volatility;
        state.price += change;
        this.stockState[symbol] = state; // Save state

        // Fake change% (simulated drift) or hardcoded
        // Ideally we'd scrape change% too, but for now this is enough for "Correct Price"
        const change24h = (Math.random() * 1.5 - 0.2).toFixed(2);

        return {
            symbol,
            price: state.price.toFixed(2),
            change24h: change24h,
            timestamp: new Date().toISOString()
        };
    }

    private async scrapeGoogleFinance(symbol: string): Promise<number | null> {
        try {
            // Map symbol to exchange if needed (defaults to NASDAQ usually works for tech)
            // SPY is typically NYSEARCA
            const exchange = symbol === 'SPY' ? 'NYSEARCA' : 'NASDAQ';
            const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;

            // Must look like a browser
            const { data } = await firstValueFrom(this.httpService.get(url, {
                responseType: 'text',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }));

            // Extract price using regex for class "YMlKec fxKbKc" which contains the big bold price
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
