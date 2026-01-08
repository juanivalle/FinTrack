import { Injectable, Inject } from '@nestjs/common';
import type { IPriceProvider } from './interfaces/price-provider.interface';
import Redis from 'ioredis';

@Injectable()
export class MarketService {
    constructor(
        @Inject('PRICE_PROVIDER') private priceProvider: IPriceProvider,
        @Inject('REDIS_CLIENT') private redis: Redis,
    ) { }

    async getPrice(symbol: string) {
        // Check cache
        const cacheKey = `price_v10:${symbol}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Fetch from provider
        const data = await this.priceProvider.getPrice(symbol);

        // Set cache (4 minutes TTL to satisfy free tier limits)
        await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 240);

        return data;
    }
}
