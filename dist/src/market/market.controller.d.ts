import { MarketService } from './market.service';
export declare class MarketController {
    private marketService;
    constructor(marketService: MarketService);
    getPrice(symbol: string): Promise<any>;
}
