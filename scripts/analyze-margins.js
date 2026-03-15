// scripts/analyze-margins.js
const VINS = [
    'W1KWJ8AB4NG106073', // Mercedes
    'SCBFT63W0GC057590', // Bentley
    // Add more VINs to analyze
];

const KRW_TO_EUR = 0.000628;
const COMPETITOR_SHIPPING = 3500; // Their estimated shipping cost

async function analyzeMargins() {
    console.log('📊 Margin Analysis Report\n');

    for (const vin of VINS) {
        try {
            const response = await fetch(`https://api.bestautomarket.com/api/cars?search_query=${vin}`);
            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                console.log(`❌ No data found for VIN: ${vin}`);
                continue;
            }

            const car = data.data[0];
            const lot = car.lots[0];

            // Calculate raw Korean price
            const rawPrice = Math.round(lot.details.original_price * KRW_TO_EUR);

            // Their price to Durrës
            const theirPrice = lot.price_with_margin_and_kosovo;

            // Their cost (raw + shipping)
            const theirCost = rawPrice + COMPETITOR_SHIPPING;

            // Their actual margin
            const theirMargin = theirPrice - theirCost;
            const marginPercent = (theirMargin / rawPrice * 100).toFixed(1);

            console.log(`${car.manufacturer.name} ${car.model.name} ${car.year}:`);
            console.log(`  Raw Korean price: €${rawPrice.toLocaleString()}`);
            console.log(`  Their shipping: €${COMPETITOR_SHIPPING}`);
            console.log(`  Their cost: €${theirCost.toLocaleString()}`);
            console.log(`  Their price (Durrës): €${theirPrice.toLocaleString()}`);
            console.log(`  Their actual margin: €${theirMargin.toLocaleString()} (${marginPercent}%)`);

            // Also show Kosovo prices
            console.log(`  Their Kosovo price: €${(theirPrice + 350).toLocaleString()}`);
            console.log('  ' + '-'.repeat(50));

        } catch (error) {
            console.error(`Error analyzing ${vin}:`, error.message);
        }
    }
}

analyzeMargins();