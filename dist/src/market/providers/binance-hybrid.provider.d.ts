import { HttpService } from '@nestjs/axios';
import { IPriceProvider, PriceData } from '../interfaces/price-provider.interface';
export declare class BinanceHybridPriceProvider implements IPriceProvider {
    private readonly httpService;
    private readonly logger;
    private readonly BINANCE_API;
    private stockState;
    private readonly SCRAPE_INTERVAL;
    constructor(httpService: HttpService);
    getPrice(symbol: string): Promise<PriceData>;
    private getBinanceSymbol;
    private fetchBinancePrice;
    private getSmartStockPrice;
    private scrapeGoogleFinance;
}
