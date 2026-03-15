// scripts/test-raw-pricing.js
const VIN = 'W1KWJ8AB4NG106073';

async function testRawPricing() {
    console.log('🔍 Testing raw Korean pricing...\n');

    try {
        const response = await fetch(`https://api.bestautomarket.com/api/cars?search_query=${VIN}`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            console.log('❌ No car found');
            return;
        }

        const car = data.data[0];
        const lot = car.lots[0];

        console.log(`🚗 ${car.manufacturer.name} ${car.model.name} ${car.year}`);
        console.log('='.repeat(50));

        console.log('\n📊 API Data:');
        console.log(`   original_price: ₩${lot.details.original_price.toLocaleString()}`);
        console.log(`   buy_now: $${lot.buy_now.toLocaleString()}`);
        console.log(`   price_with_margin_and_kosovo: €${lot.price_with_margin_and_kosovo}`);

        // Calculate raw Korean price
        const KRW_TO_EUR = 0.000628;
        const rawPrice = Math.round(lot.details.original_price * KRW_TO_EUR);

        console.log('\n💰 Price Breakdown:');
        console.log(`   Raw Korean price: €${rawPrice.toLocaleString()}`);
        console.log(`   Old site price: €${lot.price_with_margin_and_kosovo.toLocaleString()}`);
        console.log(`   Their margin: €${(lot.price_with_margin_and_kosovo - rawPrice).toLocaleString()}`);

        // Your costs (from DB)
        const yourShipping = 3500;
        const yourPristinaShipping = 350;
        const yourMargin = 1000; // Example minimum margin

        const yourFinalPrice = rawPrice + yourShipping + yourPristinaShipping + yourMargin;

        console.log('\n🏷️ Your Pricing:');
        console.log(`   Raw base: €${rawPrice.toLocaleString()}`);
        console.log(`   + Your shipping: €${yourShipping}`);
        console.log(`   + Prishtina: €${yourPristinaShipping}`);
        console.log(`   + Your margin: €${yourMargin}`);
        console.log(`   = Your final: €${yourFinalPrice.toLocaleString()}`);
        console.log(`   vs Their final: €${lot.price_with_margin_and_kosovo.toLocaleString()}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testRawPricing();