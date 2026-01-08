import { HttpService } from '@nestjs/axios';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';
export declare class CoingeckoPriceProvider implements IPriceProvider {
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly symbolMap;
    constructor(httpService: HttpService);
    getPrice(symbol: string): Promise<PriceData>;
}
