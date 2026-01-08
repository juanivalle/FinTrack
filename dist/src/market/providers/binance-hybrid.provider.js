"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BinanceHybridPriceProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceHybridPriceProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let BinanceHybridPriceProvider = BinanceHybridPriceProvider_1 = class BinanceHybridPriceProvider {
    httpService;
    logger = new common_1.Logger(BinanceHybridPriceProvider_1.name);
    BINANCE_API = 'https://api.binance.com/api/v3/ticker/24hr';
    stockState = {
        'AAPL': { price: 260.35, lastUpdate: 0 },
        'TSLA': { price: 431.40, lastUpdate: 0 },
        'SPY': { price: 595.00, lastUpdate: 0 },
        'NVDA': { price: 1100.00, lastUpdate: 0 }
    };
    SCRAPE_INTERVAL = 60 * 60 * 1000;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getPrice(symbol) {
        const cryptoSymbol = this.getBinanceSymbol(symbol);
        if (cryptoSymbol) {
            return this.fetchBinancePrice(symbol, cryptoSymbol);
        }
        return this.getSmartStockPrice(symbol);
    }
    getBinanceSymbol(symbol) {
        const map = {
            'BTC': 'BTCUSDT',
            'ETH': 'ETHUSDT',
            'SOL': 'SOLUSDT',
            'BNB': 'BNBUSDT',
            'XRP': 'XRPUSDT',
            'ADA': 'ADAUSDT'
        };
        return map[symbol] || null;
    }
    async fetchBinancePrice(originalSymbol, binanceSymbol) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.BINANCE_API}?symbol=${binanceSymbol}`));
            return {
                symbol: originalSymbol,
                price: parseFloat(data.lastPrice).toFixed(2),
                change24h: parseFloat(data.priceChangePercent).toFixed(2),
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error(`Binance fetch failed for ${originalSymbol}: ${error.message}`);
            return { symbol: originalSymbol, price: '0.00', timestamp: new Date().toISOString() };
        }
    }
    async getSmartStockPrice(symbol) {
        const now = Date.now();
        const state = this.stockState[symbol] || { price: 100.00, lastUpdate: 0 };
        if (now - state.lastUpdate > this.SCRAPE_INTERVAL) {
            try {
                this.logger.log(`Attempting to scrape ${symbol}...`);
                const realPrice = await this.scrapeGoogleFinance(symbol);
                if (realPrice) {
                    state.price = realPrice;
                    state.lastUpdate = now;
                    this.logger.log(`Updated baseline for ${symbol}: $${realPrice}`);
                }
            }
            catch (e) {
                this.logger.warn(`Scrape failed for ${symbol}: ${e.message}`);
            }
        }
        const volatility = state.price * 0.0005;
        const change = (Math.random() - 0.5) * volatility;
        state.price += change;
        this.stockState[symbol] = state;
        const change24h = (Math.random() * 1.5 - 0.2).toFixed(2);
        return {
            symbol,
            price: state.price.toFixed(2),
            change24h: change24h,
            timestamp: new Date().toISOString()
        };
    }
    async scrapeGoogleFinance(symbol) {
        try {
            const exchange = symbol === 'SPY' ? 'NYSEARCA' : 'NASDAQ';
            const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
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
        }
        catch (e) {
            return null;
        }
    }
};
exports.BinanceHybridPriceProvider = BinanceHybridPriceProvider;
exports.BinanceHybridPriceProvider = BinanceHybridPriceProvider = BinanceHybridPriceProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], BinanceHybridPriceProvider);
//# sourceMappingURL=binance-hybrid.provider.js.map