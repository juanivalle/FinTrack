"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var YahooPriceProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YahooPriceProvider = void 0;
const common_1 = require("@nestjs/common");
let YahooPriceProvider = YahooPriceProvider_1 = class YahooPriceProvider {
    logger = new common_1.Logger(YahooPriceProvider_1.name);
    symbolMap = {
        'BTC': 'BTC-USD',
        'ETH': 'ETH-USD',
        'SOL': 'SOL-USD',
        'AAPL': 'AAPL',
        'TSLA': 'TSLA',
    };
    async getPrice(symbol) {
        const fallbacks = {
            'BTC': { symbol: 'BTC', price: '96500.00', change24h: '1.25', timestamp: new Date().toISOString() },
            'ETH': { symbol: 'ETH', price: '3650.00', change24h: '-0.50', timestamp: new Date().toISOString() },
            'SOL': { symbol: 'SOL', price: '202.50', change24h: '3.10', timestamp: new Date().toISOString() },
            'AAPL': { symbol: 'AAPL', price: '242.00', change24h: '0.85', timestamp: new Date().toISOString() },
            'TSLA': { symbol: 'TSLA', price: '431.00', change24h: '2.40', timestamp: new Date().toISOString() },
            'SPY': { symbol: 'SPY', price: '595.50', change24h: '0.45', timestamp: new Date().toISOString() },
            'NVDA': { symbol: 'NVDA', price: '1100.00', change24h: '1.80', timestamp: new Date().toISOString() },
        };
        const data = fallbacks[symbol];
        if (data)
            return data;
        return {
            symbol,
            price: '100.00',
            change24h: '0.00',
            timestamp: new Date().toISOString()
        };
    }
};
exports.YahooPriceProvider = YahooPriceProvider;
exports.YahooPriceProvider = YahooPriceProvider = YahooPriceProvider_1 = __decorate([
    (0, common_1.Injectable)()
], YahooPriceProvider);
//# sourceMappingURL=yahoo-price.provider.js.map