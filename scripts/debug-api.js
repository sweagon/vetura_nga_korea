// scripts/debug-api.js
const https = require('https');

const testIds = [17246139, 17246138, 17246137]; // Test with different IDs

testIds.forEach(id => {
    const url = `https://api.bestautomarket.com/api/cars/${id}`;
    console.log(`\n🔍 Testing: ${url}`);

    https.get(url, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (data.trim().startsWith('<!DOCTYPE')) {
                console.log('⚠️  Received HTML (likely 404 page)');
                console.log('First 200 chars:', data.substring(0, 200));
            } else {
                try {
                    const json = JSON.parse(data);
                    console.log('✅ Valid JSON received');
                    console.log('Has car data:', !!json.id);
                } catch (e) {
                    console.log('❌ Invalid JSON:', e.message);
                }
            }
        });
    }).on('error', console.error);
});