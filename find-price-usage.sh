#!/bin/bash

echo "🔍 Finding all files that use car pricing..."
echo "============================================"

echo "📁 Files using price_with_margin_and_kosovo:"
echo "---------------------------------------------"
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs grep -l "price_with_margin_and_kosovo" 2>/dev/null | while read file; do
    echo "   📄 $file"
    grep -n "price_with_margin_and_kosovo" "$file" | head -2
    echo ""
done

echo ""
echo "📁 Files using buy_now:"
echo "------------------------"
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs grep -l "buy_now" 2>/dev/null | while read file; do
    echo "   📄 $file"
done

echo ""
echo "📁 Files using original_price:"
echo "-------------------------------"
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs grep -l "original_price" 2>/dev/null | while read file; do
    echo "   📄 $file"
done

echo ""
echo "========================================"
echo "🔧 Files that need to be updated:"
echo "========================================"
echo "1. lib/api.ts - Add helper function"
echo "2. components/cars/CarDetailClient.tsx"
echo "3. components/cars/CarCard.tsx"
echo "4. hooks/useCarFilters.ts"
echo "5. workers/filterWorker.ts"