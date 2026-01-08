export interface PriceData {
    symbol: string;
    price: string;
    timestamp: Date | string | number;
    change24h?: string;
}

export interface IPriceProvider {
    getPrice(symbol: string): Promise<PriceData>;
}
