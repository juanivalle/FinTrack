import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketGateway } from './market.gateway';
import { BinanceHybridPriceProvider } from './providers/binance-hybrid.provider';
import { RedisModule } from '../redis/redis.module';
import { MarketController } from './market.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [RedisModule, HttpModule],
    providers: [
        MarketService,
        MarketGateway,
        {
            provide: 'PRICE_PROVIDER',
            useClass: BinanceHybridPriceProvider,
        },
    ],
    controllers: [MarketController],
    exports: [MarketService],
})
export class MarketModule { }
