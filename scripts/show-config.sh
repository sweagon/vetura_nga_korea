#!/bin/bash
echo "Ì≥Å DATABASE CONFIGURATION"
echo "========================"
echo ""
echo "1. lib/db.ts:"
echo "------------"
cat lib/db.ts | grep -v "^import" | head -50
echo ""
echo "2. lib/config.ts:"
echo "----------------"
cat lib/config.ts | grep -v "^import" | head -50
echo ""
echo "3. lib/ConfigContext.tsx (calculateFinalPrice):"
echo "----------------------------------------------"
cat lib/ConfigContext.tsx | grep -A 20 "calculateFinalPrice"
echo ""
echo "4. Current site_config from DB:"
echo "------------------------------"
node -e "
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });
async function getConfig() {
  const { rows } = await sql\`SELECT * FROM site_config WHERE id = 1\`;
  console.log(JSON.stringify(rows[0], null, 2));
}
getConfig();
"
