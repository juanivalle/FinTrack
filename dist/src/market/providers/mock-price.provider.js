"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPriceProvider = void 0;
const common_1 = require("@nestjs/common");
let MockPriceProvider = class MockPriceProvider {
    basePrices = {
        'BTC': 95000.00,
        'ETH': 3500.00,
        'SOL': 195.50,
        'AAPL': 240.00,
        'TSLA': 431.00,
        'BTC/USD': 95000.00,
        'ETH/USD': 3500.00
    };
    async getPrice(symbol) {
        if (!this.basePrices[symbol]) {
            this.basePrices[symbol] = 100 + Math.random() * 200;
        }
        const base = this.basePrices[symbol];
        const volatility = base * 0.002;
        const change = (Math.random() - 0.5) * volatility;
        this.basePrices[symbol] = base + change;
        return {
            symbol,
            price: this.basePrices[symbol].toFixed(2),
            timestamp: new Date().toISOString(),
        };
    }
};
exports.MockPriceProvider = MockPriceProvider;
exports.MockPriceProvider = MockPriceProvider = __decorate([
    (0, common_1.Injectable)()
], MockPriceProvider);
//# sourceMappingURL=mock-price.provider.js.map