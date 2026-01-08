"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketModule = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("./market.service");
const market_gateway_1 = require("./market.gateway");
const binance_hybrid_provider_1 = require("./providers/binance-hybrid.provider");
const redis_module_1 = require("../redis/redis.module");
const market_controller_1 = require("./market.controller");
const axios_1 = require("@nestjs/axios");
let MarketModule = class MarketModule {
};
exports.MarketModule = MarketModule;
exports.MarketModule = MarketModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule, axios_1.HttpModule],
        providers: [
            market_service_1.MarketService,
            market_gateway_1.MarketGateway,
            {
                provide: 'PRICE_PROVIDER',
                useClass: binance_hybrid_provider_1.BinanceHybridPriceProvider,
            },
        ],
        controllers: [market_controller_1.MarketController],
        exports: [market_service_1.MarketService],
    })
], MarketModule);
//# sourceMappingURL=market.module.js.map