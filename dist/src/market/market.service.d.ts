import type { IPriceProvider } from './interfaces/price-provider.interface';
import Redis from 'ioredis';
export declare class MarketService {
    private priceProvider;
    private redis;
    constructor(priceProvider: IPriceProvider, redis: Redis);
    getPrice(symbol: string): Promise<any>;
}
