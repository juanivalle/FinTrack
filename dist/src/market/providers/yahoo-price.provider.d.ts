import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';
export declare class YahooPriceProvider implements IPriceProvider {
    private readonly logger;
    private readonly symbolMap;
    getPrice(symbol: string): Promise<PriceData>;
}
