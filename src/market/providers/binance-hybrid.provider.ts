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
    private stockState: Record<string, { price: number, change24h: number, lastUpdate: number }> = {
        'AAPL': { price: 260.35, change24h: 0.00, lastUpdate: 0 },
        'TSLA': { price: 431.40, change24h: 0.00, lastUpdate: 0 },
        'SPY': { price: 595.00, change24h: 0.00, lastUpdate: 0 },
        'NVDA': { price: 1100.00, change24h: 0.00, lastUpdate: 0 }
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

    // State for Crypto (Last known real price & change)
    private cryptoState: Record<string, { price: number, change24h: number, lastUpdate: number }> = {};

    private async fetchCoinGeckoPrice(originalSymbol: string, geckoId: string): Promise<PriceData> {
        try {
            const url = `${this.COINGECKO_API}?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`;
            const { data } = await firstValueFrom(this.httpService.get(url));

            if (data[geckoId] && data[geckoId].usd) {
                const price = data[geckoId].usd;
                const change = data[geckoId].usd_24h_change || 0;

                // Update Cache
                this.cryptoState[originalSymbol] = {
                    price,
                    change24h: change,
                    lastUpdate: Date.now()
                };

                return {
                    symbol: originalSymbol,
                    price: price.toFixed(2),
                    change24h: change.toFixed(2),
                    timestamp: new Date().toISOString()
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            this.logger.error(`CoinGecko fetch failed for ${originalSymbol}: ${error.message}`);

            // Check cache on failure (429 or other)
            const cached = this.cryptoState[originalSymbol];
            if (cached) {
                return {
                    symbol: originalSymbol,
                    price: cached.price.toFixed(2),
                    change24h: cached.change24h.toFixed(2),
                    timestamp: new Date().toISOString()
                };
            }

            return { symbol: originalSymbol, price: '0.00', change24h: '0.00', timestamp: new Date().toISOString() };
        }
    }

    private async getSmartStockPrice(symbol: string): Promise<PriceData> {
        const now = Date.now();
        const state = this.stockState[symbol] || { price: 0, lastUpdate: 0, change24h: 0 };

        // Attempt scrape if stale
        if (now - state.lastUpdate > this.SCRAPE_INTERVAL || state.price === 0) {
            try {
                this.logger.log(`Attempting to scrape ${symbol}...`);
                const result = await this.scrapeGoogleFinance(symbol);
                if (result && result.price) {
                    state.price = result.price;
                    state.change24h = result.change || 0;
                    state.lastUpdate = now;
                    this.stockState[symbol] = state;
                }
            } catch (e) {
                this.logger.error(`Scrape failed for ${symbol}: ${e.message}`);
            }
        }

        return {
            symbol,
            price: state.price > 0 ? state.price.toFixed(2) : '0.00',
            // Return collected change or 0.00
            change24h: (state as any).change24h ? (state as any).change24h.toFixed(2) : '0.00',
            timestamp: new Date().toISOString()
        };
    }

    private async scrapeGoogleFinance(symbol: string): Promise<{ price: number, change: number } | null> {
        try {
            const exchange = symbol === 'SPY' ? 'NYSEARCA' : 'NASDAQ';
            const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;

            const { data } = await firstValueFrom(this.httpService.get(url, {
                responseType: 'text',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }));

            // Price regex (class "YMlKec fxKbKc")
            const priceMatch = data.match(/<div class="YMlKec fxKbKc">([^<]+)<\/div>/);

            // Change regex (often in a span/div with "JwB6zf" or similar, usually has + or - before number and %)
            // Trying a more generic approach for change %: look for percentage pattern near price or specific class "JwB6zf"
            // Example: <div class="JwB6zf" ...>+1.25%</div>
            const changeMatch = data.match(/<div class="[a-zA-Z0-9 ]*JwB6zf[^"]*">\+?(-?[\d,]+\.\d+)%<\/div>/);

            if (priceMatch) {
                const priceStr = priceMatch[1].replace('$', '').replace(',', '');
                const changeStr = changeMatch ? changeMatch[1].replace(',', '') : '0';

                return {
                    price: parseFloat(priceStr),
                    change: parseFloat(changeStr)
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    }
}
