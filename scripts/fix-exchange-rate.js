// scripts/fix-exchange-rate.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesToCheck = [
    '../lib/priceCalculator.ts',
    '../lib/api.ts'
];

function fixExchangeRate() {
    console.log('Ì¥ß Fixing exchange rates...\n');
    
    filesToCheck.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for KRW exchange rate
            const krwMatch = content.match(/KRW_TO_EUR\s*=\s*([0-9.]+)/);
            if (krwMatch) {
                const currentRate = parseFloat(krwMatch[1]);
                console.log(`${filePath}: KRW rate = ${currentRate}`);
                
                if (currentRate !== 0.000628) {
                    content = content.replace(
                        /(KRW_TO_EUR\s*=\s*)[0-9.]+/,
                        `$10.000628`
                    );
                    fs.writeFileSync(fullPath, content);
                    console.log(`  ‚úÖ Fixed to 0.000628`);
                } else {
                    console.log(`  ‚úÖ Already correct`);
                }
            }
            
            // Check for API price priority
            if (filePath.includes('api.ts')) {
                if (!content.includes('price_with_margin_and_kosovo')) {
                    console.log(`  ‚ùå price_with_margin_and_kosovo not found in api.ts`);
                }
            }
        } else {
            console.log(`‚ùå File not found: ${fullPath}`);
        }
    });
    
    console.log('\n‚úÖ Exchange rate fix complete!');
}

fixExchangeRate();
