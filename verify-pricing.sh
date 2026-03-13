#!/bin/bash

echo "🔍 VERIFYING PRICING CHANGES"
echo "============================="

# Check each file for the correct price extraction
FILES=(
  "components/cars/CarDetailClient.tsx"
  "components/cars/CarCard.tsx"
  "hooks/useCarFilters.ts"
  "hooks/useFilterWithSkeleton.ts"
  "workers/filterWorker.ts"
  "components/cars/RecentlyViewedTracker.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo ""
    echo "📄 $file:"
    if grep -q "price_with_margin_and_kosovo" "$file"; then
      echo "   ✅ Using Euro base price"
      # Show the line
      grep -n "price_with_margin_and_kosovo" "$file" | head -1
    else
      echo "   ❌ Still using old pricing!"
    fi
  else
    echo "   ⚠️  $file not found"
  fi
done

echo ""
echo "📊 Admin panel should now show correct breakdown:"
echo "   Makina: €49,970 (from API)"
echo "   + Transporti Durrës: €3,500 (from admin)"
echo "   + Transporti Prishtinë: €350 (from admin)"
echo "   = Total: €53,820"
