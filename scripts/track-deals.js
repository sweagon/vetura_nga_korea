// scripts/track-deals.js
const fs = require('fs');
const path = require('path');

const DEALS_FILE = path.join(__dirname, '../data/hot-deals.json');

async function trackDeals() {
    console.log('📊 Tracking hot deals...\n');

    const deals = [];
    const manufacturers = [88, 16, 9, 147]; // Mercedes, BMW, Audi, VW

    for (const mfr of manufacturers) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/proxy/cars?manufacturer_id=${mfr}&buy_now_price_to=50000&per_page=20`
            );
            const data = await response.json();

            if (data.data) {
                data.data.forEach(car => {
                    const lot = car.lots?.[0];
                    if (lot && lot.buy_now) {
                        // Calculate deal score
                        const price = lot.buy_now;
                        const year = car.year;
                        const age = 2026 - year;
                        const expectedPrice = 50000 - (age * 3000);
                        const dealScore = expectedPrice - price;

                        deals.push({
                            vin: car.vin,
                            title: `${car.manufacturer?.name} ${car.model?.name}`,
                            year: car.year,
                            price: price,
                            expectedPrice: expectedPrice,
                            dealScore: dealScore,
                            url: `http://localhost:3000/cars/${car.vin}`,
                            status: dealScore > 10000 ? 'HOT' : dealScore > 5000 ? 'GOOD' : 'OK'
                        });
                    }
                });
            }
        } catch (error) {
            console.error(`Error checking manufacturer ${mfr}:`, error.message);
        }
    }

    // Sort by best deals
    deals.sort((a, b) => b.dealScore - a.dealScore);

    // Save to file
    fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));

    // Show top 10 deals
    console.log('🔥 TOP 10 HOTTEST DEALS:\n');
    deals.slice(0, 10).forEach((deal, i) => {
        console.log(`${i + 1}. ${deal.title} (${deal.year})`);
        console.log(`   Price: $${deal.price.toLocaleString()}`);
        console.log(`   Expected: $${deal.expectedPrice.toLocaleString()}`);
        console.log(`   Save: $${deal.dealScore.toLocaleString()}`);
        console.log(`   Status: ${deal.status} 🔥`);
        console.log(`   Link: ${deal.url}\n`);
    });
}

trackDeals();