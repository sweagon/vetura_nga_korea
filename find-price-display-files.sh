#!/bin/bash

echo "🔍 Finding files that display pricing..."
echo "========================================"

# Files that show price breakdown
echo "📁 Files with price breakdown display:"
echo "---------------------------------------"
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs grep -l "shippingCost.*shippingToPristina\|Transporti.*Durrës" 2>/dev/null | while read file; do
    echo "   📄 $file"
    grep -n "shippingCost\|shippingToPristina\|Transporti" "$file" 2>/dev/null | head -3
    echo ""
done

echo ""
echo "📁 Files that calculate final price:"
echo "-------------------------------------"
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs grep -l "finalPrice.*shipping\|price.*shipping" 2>/dev/null | while read file; do
    echo "   📄 $file"
done

echo ""
echo "📁 Files with ConfigContext usage:"
echo "----------------------------------"
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | xargs grep -l "useConfig\|calculateFinalPrice" 2>/dev/null | while read file; do
    echo "   📄 $file"
done

echo ""
echo "========================================"
echo "🔧 Files that need to be updated:"
echo "========================================"
echo "1. lib/ConfigContext.tsx (calculateFinalPrice function)"
echo "2. components/cars/CarDetailClient.tsx (price display)"
echo "3. components/cars/CarCard.tsx (card price display)"
echo "4. app/admin/page.tsx (admin preview)"
echo "5. app/cars/page.tsx (listing page)"
echo "6. hooks/useCarFilters.ts (price filtering)"