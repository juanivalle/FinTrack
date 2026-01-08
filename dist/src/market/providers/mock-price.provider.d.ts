import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';
export declare class MockPriceProvider implements IPriceProvider {
    private basePrices;
    getPrice(symbol: string): Promise<PriceData>;
}
