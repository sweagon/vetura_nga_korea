// scripts/find-best-deals.js
require('dotenv').config({ path: '.env.local' });

const TARGET_MANUFACTURERS = [88, 16, 9, 147]; // Mercedes, BMW, Audi, VW
const MAX_PRICE = 50000; // Max price in USD
const MIN_YEAR = 2018;

async function findBestDeals() {
    console.log('🎯 Hunting for best car deals...');
    console.log('================================');

    for (const manufacturerId of TARGET_MANUFACTURERS) {
        console.log(`\n📊 Checking manufacturer ID: ${manufacturerId}`);

        try {
            const response = await fetch(
                `http://localhost:3000/api/proxy/cars?manufacturer_id=${manufacturerId}&buy_now_price_to=${MAX_PRICE}&from_year=${MIN_YEAR}&per_page=5`
            );
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                data.data.forEach(car => {
                    const lot = car.lots?.[0];
                    if (lot && lot.status?.name === 'sale') {
                        console.log(`\n🔍 ${car.manufacturer?.name} ${car.model?.name} ${car.year}`);
                        console.log(`   VIN: ${car.vin}`);
                        console.log(`   Price: $${lot.buy_now?.toLocaleString() || 'N/A'}`);
                        console.log(`   Status: ${lot.status?.name}`);

                        // Check if it's a potential deal
                        if (lot.buy_now && lot.buy_now < 30000 && car.year >= 2020) {
                            console.log(`   ⭐️ HOT DEAL! ⭐️`);
                        }

                        console.log(`   Link: http://localhost:3000/cars/${car.vin}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Error checking manufacturer ${manufacturerId}:`, error.message);
        }
    }
}

findBestDeals();