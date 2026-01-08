const https = require('https');

function fetchPrice(symbol, exchange) {
    return new Promise((resolve, reject) => {
        const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
        console.log("Fetching:", url);

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Look for: <div class="YMlKec fxKbKc">431.00</div> (Class names change, but structure is usually similar)
                // Or "last_price" key in some buried json.
                // Google Finance class `YMlKec fxKbKc` is fairly stable for the big price number.

                const match = data.match(/<div class="YMlKec fxKbKc">([^<]+)<\/div>/);
                if (match) {
                    resolve(match[1]);
                } else {
                    reject("Price not found in HTML");
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    try {
        const tsla = await fetchPrice('TSLA', 'NASDAQ');
        console.log("TSLA Price:", tsla);

        const aapl = await fetchPrice('AAPL', 'NASDAQ');
        console.log("AAPL Price:", aapl);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
