// scripts/debug-car-api.js
const https = require('https');

const carId = 6321670;
const vin = 'ZAM57YTG4K1316602';

const urls = [
    `https://api.bestautomarket.com/api/cars/${carId}`,
    `https://api.bestautomarket.com/api/car/${carId}`,
    `https://api.bestautomarket.com/api/vehicle/${carId}`,
    `https://api.bestautomarket.com/api/cars?vin=${vin}`,
    `https://api.bestautomarket.com/api/cars?id=${carId}`,
    `https://api.bestautomarket.com/api/cars/${vin}`,
];

async function testUrl(url) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing: ${url}`);

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const contentType = res.headers['content-type'] || '';
                const isHTML = data.trim().startsWith('<!DOCTYPE');

                console.log(`   Status: ${res.statusCode}`);
                console.log(`   Content-Type: ${contentType}`);

                if (res.statusCode === 200 && !isHTML) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`   ✅ SUCCESS! Found car data`);
                        if (json.id || json.data) {
                            const carData = json.data || json;
                            console.log(`   Car: ${carData.manufacturer?.name} ${carData.model?.name}`);
                        }
                        resolve({ url, success: true, data: json });
                    } catch (e) {
                        console.log(`   ❌ Invalid JSON: ${e.message}`);
                        resolve({ url, success: false });
                    }
                } else if (res.statusCode === 404) {
                    console.log(`   ❌ 404 Not Found`);
                    resolve({ url, success: false });
                } else {
                    console.log(`   ❌ Failed with status ${res.statusCode}`);
                    resolve({ url, success: false });
                }
            });
        }).on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            resolve({ url, success: false });
        });
    });
}

async function main() {
    console.log('🔍 Testing different API endpoint patterns...\n');

    for (const url of urls) {
        await testUrl(url);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

main();