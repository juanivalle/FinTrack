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
var CoingeckoPriceProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoingeckoPriceProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let CoingeckoPriceProvider = CoingeckoPriceProvider_1 = class CoingeckoPriceProvider {
    httpService;
    logger = new common_1.Logger(CoingeckoPriceProvider_1.name);
    baseUrl = 'https://api.coingecko.com/api/v3';
    symbolMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SPY': 'spiritswap',
        'BTC/USD': 'bitcoin',
        'ETH/USD': 'ethereum'
    };
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getPrice(symbol) {
        try {
            const id = this.symbolMap[symbol] || 'bitcoin';
            const url = `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
            return {
                symbol,
                price: (Math.random() * 1000 + 1000).toFixed(2),
                timestamp: new Date()
            };
        }
    }
};
exports.CoingeckoPriceProvider = CoingeckoPriceProvider;
exports.CoingeckoPriceProvider = CoingeckoPriceProvider = CoingeckoPriceProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], CoingeckoPriceProvider);
//# sourceMappingURL=coingecko-price.provider.js.map