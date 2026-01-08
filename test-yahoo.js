// Try importing the class directly
// Common pattern for this library if it demands instantiation
const yahooFinanceModule = require('yahoo-finance2');

async function test() {
    try {
        console.log("Modules keys:", Object.keys(yahooFinanceModule));
        // If it has a default export that is the instance, use it
        // But the error said "Call new YahooFinance()"

        // Let's try to find the class
        const YahooFinance = yahooFinanceModule.YahooFinance || yahooFinanceModule.default?.YahooFinance;

        if (YahooFinance) {
            const yf = new YahooFinance();
            console.log("Fetching AAPL with new instance...");
            const result = await yf.quote('AAPL');
            console.log("Success:", result.regularMarketPrice);
        } else {
            // Maybe the default export IS the bucket but we need to suppress warnings?
            console.log("Could not find YahooFinance class constructor.");

            // Fallback attempt: just use the default export again but maybe catch the error differently?
            // actually the error IS from the library, so the library is loaded.

            // Try the 'default' export which is typically the singleton
            const yfVal = yahooFinanceModule.default;
            const result = await yfVal.quote('AAPL');
            console.log("Success with default:", result.regularMarketPrice);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
