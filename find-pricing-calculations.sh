#!/bin/bash

echo "🔍 Searching for pricing calculations and config usage..."
echo "=============================================="

# Files to search
FILES=(
  "lib/ConfigContext.tsx"
  "lib/api.ts"
  "components/cars/CarDetailClient.tsx"
  "components/cars/CarCard.tsx"
  "app/cars/page.tsx"
  "app/cars/[id]/page.tsx"
  "hooks/useCarFilters.ts"
  "hooks/useFilterWithSkeleton.ts"
  "workers/filterWorker.ts"
  "lib/filterCache.ts"
  "app/admin/page.tsx"
)

echo ""
echo "📁 Files with pricing calculations:"
echo "------------------------------------"

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo ""
    echo "📄 $file:"
    echo "-------------------"
    
    # Search for price-related calculations
    grep -n -E "(price|buy_now|markup|shipping|finalPrice|calculate|formatPrice|config\.|vehicleTypes|shippingCost|markupPercentage)" "$file" | \
    grep -v "import" | \
    grep -v "//.*ignore" | \
    head -20
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "=============================================="
echo ""
echo "💰 Looking for specific price values..."
echo "----------------------------------------"

# Search for specific price patterns
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v "node_modules" | while read -r file; do
  if grep -q -E "(price|buy_now|markup|shipping|finalPrice|calculate|formatPrice)" "$file" 2>/dev/null; then
    echo ""
    echo "📄 $file:"
    grep -n -E "(price|buy_now|markup|shipping|finalPrice|calculate|formatPrice)" "$file" | head -5
  fi
done

echo ""
echo "=============================================="
echo ""
echo "🔧 Checking config values in admin..."
echo "--------------------------------------"

if [ -f "app/admin/page.tsx" ]; then
  echo "Current admin config values found:"
  grep -n -E "(shippingCost|markupPercentage|minimumMarkup|vehicleTypes|suv|default)" "app/admin/page.tsx" | grep -E "(value=|defaultConfig|localConfig)" | head -10
fi

echo ""
echo "=============================================="
echo ""
echo "📊 Checking API price handling..."
echo "----------------------------------"

if [ -f "lib/api.ts" ]; then
  echo "API price fields:"
  grep -n -E "(buy_now|price|lots\[0\]\.buy_now)" "lib/api.ts" | head -10
fi