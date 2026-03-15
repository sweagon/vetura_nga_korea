// scripts/check-car-status.js
require('dotenv').config({ path: '.env.local' });

const VIN = process.argv[2] || 'SCBFT63W0GC057590'; // Default to your Bentley

async function checkCarStatus() {
    console.log(`🔍 Checking status for VIN: ${VIN}`);
    console.log('=====================================');

    try {
        // Use your existing API endpoint
        const response = await fetch(`http://localhost:3000/api/proxy/vin/${VIN}`);
        const data = await response.json();

        if (!data || !data.lots || data.lots.length === 0) {
            console.log('❌ No lots found for this VIN');
            return;
        }

        const lot = data.lots[0];

        console.log('\n📋 CAR DETAILS:');
        console.log(`   ${data.manufacturer?.name} ${data.model?.name} ${data.year}`);

        console.log('\n💰 PRICING INFORMATION:');
        console.log(`   Buy Now: $${lot.buy_now?.toLocaleString() || 'N/A'}`);
        console.log(`   Current Bid: $${lot.bid?.toLocaleString() || 'No bids'}`);
        console.log(`   Final Bid: $${lot.final_bid?.toLocaleString() || 'N/A'}`);
        console.log(`   Seller Reserve: $${lot.seller_reserve?.toLocaleString() || 'Not set'}`);

        console.log('\n📊 AUCTION STATUS:');
        console.log(`   Status: ${lot.status?.name} (ID: ${lot.status?.id})`);
        console.log(`   Auction Type: ${lot.auction_type || 'Standard'}`);
        console.log(`   Condition: ${lot.condition?.name || 'Unknown'}`);

        // Determine if it's a good deal
        console.log('\n💡 DEAL ANALYSIS:');

        if (lot.status?.name === 'sale') {
            console.log(`   ✅ Available for purchase`);

            if (lot.buy_now) {
                console.log(`   ✅ Buy Now available at $${lot.buy_now.toLocaleString()}`);

                // Compare with original price if available
                if (lot.details?.original_price) {
                    const originalPriceKRW = lot.details.original_price;
                    const originalPriceEUR = Math.round(originalPriceKRW * 0.00068);
                    console.log(`   📉 Original price: ₩${originalPriceKRW.toLocaleString()} (≈€${originalPriceEUR.toLocaleString()})`);

                    const savings = Math.round((originalPriceEUR - (lot.buy_now * 0.93)));
                    if (savings > 0) {
                        console.log(`   🎯 Potential savings: ~€${savings.toLocaleString()}`);
                    }
                }
            }

            if (lot.bid) {
                console.log(`   🔨 Active auction with bid $${lot.bid.toLocaleString()}`);
            }
        } else {
            console.log(`   ❌ Not available for sale (Status: ${lot.status?.name})`);
        }

        console.log('\n🔗 Quick Links:');
        console.log(`   View car: http://localhost:3000/cars/${VIN}`);
        console.log(`   API direct: http://localhost:3000/api/proxy/vin/${VIN}`);

    } catch (error) {
        console.error('❌ Error checking car status:', error.message);
    }
}

checkCarStatus();