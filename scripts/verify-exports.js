// scripts/verify-exports.js
console.log('🔍 Checking exports from lib/config.ts...\n');

try {
    const config = require('../lib/config');

    console.log('✅ Exports found:');
    console.log('  - SiteConfig:', typeof config.SiteConfig);
    console.log('  - VehicleTypeConfig:', typeof config.VehicleTypeConfig);
    console.log('  - PriceDetails:', typeof config.PriceDetails);
    console.log('  - defaultConfig:', typeof config.defaultConfig);
    console.log('  - validateConfig:', typeof config.validateConfig);

    if (config.defaultConfig) {
        console.log('\n📋 defaultConfig contents:');
        console.log('  shippingCost:', config.defaultConfig.shippingCost);
        console.log('  shippingToPristina:', config.defaultConfig.shippingToPristina);
        console.log('  defaultMarginPercentage:', config.defaultConfig.defaultMarginPercentage);
        console.log('  defaultMinimumMargin:', config.defaultConfig.defaultMinimumMargin);
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}