#!/bin/bash

echo "🔧 FIXING PRICING TO USE API EURO BASE PRICE"
echo "============================================="

# 1. Update lib/api.ts - Add new fields to Lot interface
echo ""
echo "📝 1. Updating lib/api.ts with new Lot interface fields..."
if [ -f "lib/api.ts" ]; then
  # Check if fields already exist
  if ! grep -q "price_with_margin_and_kosovo" "lib/api.ts"; then
    # Make a backup
    cp lib/api.ts lib/api.ts.backup
    echo "   ✅ Backup created: lib/api.ts.backup"
    
    # Find the Lot interface and add new fields
    sed -i '/export interface Lot {/,/}/ {
      /buy_now:/a\
  price_with_margin_and_kosovo?: number;\
  price_with_margin_no_discount?: number;\
  step5?: number;
    }' lib/api.ts
    
    echo "   ✅ Added price fields to Lot interface"
  else
    echo "   ⏭️  Fields already exist in Lot interface"
  fi
else
  echo "   ❌ lib/api.ts not found!"
fi

# 2. Update CarDetailClient.tsx
echo ""
echo "📝 2. Updating CarDetailClient.tsx to use Euro base price..."
if [ -f "components/cars/CarDetailClient.tsx" ]; then
  cp components/cars/CarDetailClient.tsx components/cars/CarDetailClient.tsx.backup
  echo "   ✅ Backup created: components/cars/CarDetailClient.tsx.backup"
  
  # Replace the price extraction logic
  sed -i '/const price = lot\?\.buy_now \|\| 0;/c\
  \ \ // ✅ USE EURO PRICE FROM API AS BASE\\n\ \ const euroBasePrice = lot?.price_with_margin_and_kosovo || lot?.step5 || 0;\\n\ \ const usdPrice = lot?.buy_now || 0;\\n\ \ \\n\ \ // Log for debugging\\n\ \ console.log(\x27💰 Car pricing:\x27, {\\n\ \ \ \ vin: car.vin,\\n\ \ \ \ euroBasePrice,\\n\ \ \ \ usdPrice,\\n\ \ \ \ using: euroBasePrice ? \x27Euro base price\x27 : \x27USD fallback\x27\\n\ \ });\\n\ \ \\n\ \ // Use Euro base price if available\\n\ \ const basePriceForCalculation = euroBasePrice || usdPrice;\\n\ \ const price = basePriceForCalculation;' components/cars/CarDetailClient.tsx
  
  echo "   ✅ Updated price extraction to use Euro base price"
else
  echo "   ❌ components/cars/CarDetailClient.tsx not found!"
fi

# 3. Update CarCard.tsx
echo ""
echo "📝 3. Updating CarCard.tsx to use Euro base price..."
if [ -f "components/cars/CarCard.tsx" ]; then
  cp components/cars/CarCard.tsx components/cars/CarCard.tsx.backup
  echo "   ✅ Backup created: components/cars/CarCard.tsx.backup"
  
  # Replace the price extraction in CarCard
  sed -i '/const price = lot\?\.buy_now \|\| 0;/c\
  \ \ // Use Euro base price for display\\n\ \ const price = lot?.price_with_margin_and_kosovo || lot?.step5 || lot?.buy_now || 0;' components/cars/CarCard.tsx
  
  echo "   ✅ Updated CarCard price display"
else
  echo "   ❌ components/cars/CarCard.tsx not found!"
fi

# 4. Update useCarFilters.ts
echo ""
echo "📝 4. Updating useCarFilters.ts for price filtering..."
if [ -f "hooks/useCarFilters.ts" ]; then
  cp hooks/useCarFilters.ts hooks/useCarFilters.ts.backup
  echo "   ✅ Backup created: hooks/useCarFilters.ts.backup"
  
  # Replace the price extraction in filtering logic
  sed -i '/const price = car.lots\?\.\[0\]\?\.buy_now \|\| 0;/c\
        const price = car.lots?.[0]?.price_with_margin_and_kosovo || car.lots?.[0]?.step5 || car.lots?.[0]?.buy_now || 0;' hooks/useCarFilters.ts
  
  echo "   ✅ Updated useCarFilters.ts price filtering"
else
  echo "   ❌ hooks/useCarFilters.ts not found!"
fi

# 5. Update useFilterWithSkeleton.ts
echo ""
echo "📝 5. Updating useFilterWithSkeleton.ts for price filtering..."
if [ -f "hooks/useFilterWithSkeleton.ts" ]; then
  cp hooks/useFilterWithSkeleton.ts hooks/useFilterWithSkeleton.ts.backup
  echo "   ✅ Backup created: hooks/useFilterWithSkeleton.ts.backup"
  
  # Replace the price extraction in filtering logic
  sed -i '/const price = car.lots\?\.\[0\]\?\.buy_now \|\| 0;/c\
        const price = car.lots?.[0]?.price_with_margin_and_kosovo || car.lots?.[0]?.step5 || car.lots?.[0]?.buy_now || 0;' hooks/useFilterWithSkeleton.ts
  
  echo "   ✅ Updated useFilterWithSkeleton.ts price filtering"
else
  echo "   ❌ hooks/useFilterWithSkeleton.ts not found!"
fi

# 6. Update filterWorker.ts
echo ""
echo "📝 6. Updating filterWorker.ts for web worker filtering..."
if [ -f "workers/filterWorker.ts" ]; then
  cp workers/filterWorker.ts workers/filterWorker.ts.backup
  echo "   ✅ Backup created: workers/filterWorker.ts.backup"
  
  # Replace the price extraction in worker
  sed -i '/const price = car.lots\?\.\[0\]\?\.buy_now \|\| 0;/c\
            const price = car.lots?.[0]?.price_with_margin_and_kosovo || car.lots?.[0]?.step5 || car.lots?.[0]?.buy_now || 0;' workers/filterWorker.ts
  
  echo "   ✅ Updated filterWorker.ts"
else
  echo "   ❌ workers/filterWorker.ts not found!"
fi

# 7. Update RecentlyViewedTracker.tsx
echo ""
echo "📝 7. Updating RecentlyViewedTracker.tsx..."
if [ -f "components/cars/RecentlyViewedTracker.tsx" ]; then
  cp components/cars/RecentlyViewedTracker.tsx components/cars/RecentlyViewedTracker.tsx.backup
  echo "   ✅ Backup created: components/cars/RecentlyViewedTracker.tsx.backup"
  
  # Replace the price extraction in tracker
  sed -i '/const price = lot\?\.buy_now \|\| 0;/c\
        const price = lot?.price_with_margin_and_kosovo || lot?.step5 || lot?.buy_now || 0;' components/cars/RecentlyViewedTracker.tsx
  
  echo "   ✅ Updated RecentlyViewedTracker.tsx"
else
  echo "   ❌ components/cars/RecentlyViewedTracker.tsx not found!"
fi

# 8. Add debug section to admin panel (optional)
echo ""
echo "📝 8. Adding debug section to admin panel..."
if [ -f "app/admin/page.tsx" ]; then
  cp app/admin/page.tsx app/admin/page.tsx.backup
  echo "   ✅ Backup created: app/admin/page.tsx.backup"
  
  # Check if debug section already exists
  if ! grep -q "API Price Debug" "app/admin/page.tsx"; then
    # Find a good spot to insert (before the security notice)
    sed -i '/{/* Security Notice */}/i \
\
                {/* API Price Debug */}\
                <div className="bg-surface\/30 backdrop-blur-sm border border-light\/20 rounded-xl p-4 mb-8">\
                    <h3 className="font-semibold mb-2 text-primary">🔍 Debug: API Price Fields</h3>\
                    <p className="text-sm text-muted">\
                        <span className="font-medium">price_with_margin_and_kosovo:</span> API Euro price (use as base)<br/>\
                        <span className="font-medium">step5:</span> Alternative Euro price<br/>\
                        <span className="font-medium">buy_now:</span> USD price (fallback only)<br/>\
                        <span className="text-orange-500 mt-2 block">✅ Your shipping/margin from above will be added to Euro base price</span>\
                    </p>\
                </div>' app/admin/page.tsx
    
    echo "   ✅ Added debug section to admin panel"
  else
    echo "   ⏭️  Debug section already exists"
  fi
else
  echo "   ❌ app/admin/page.tsx not found!"
fi

# 9. Create a verification script
echo ""
echo "📝 9. Creating verification script..."
cat > verify-pricing.sh << 'EOF'
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
EOF

chmod +x verify-pricing.sh
echo "   ✅ Created verify-pricing.sh - run this to check your changes"

# Summary
echo ""
echo "============================================="
echo "✅ FIX COMPLETE!"
echo "============================================="
echo ""
echo "📁 Backups created for all modified files"
echo ""
echo "Next steps:"
echo "1. Run './verify-pricing.sh' to check all changes"
echo "2. Test the Bentley car page (VIN: SCBFT63W0GC057590)"
echo "3. Check admin panel to ensure shipping values are correct"
echo "4. If something goes wrong, restore from backups:"
echo "   cp lib/api.ts.backup lib/api.ts"
echo "   etc."
echo ""
echo "The math should now be:"
echo "   Makina: €49,970 (from API)"
echo "   + Transporti Durrës: €3,500"
echo "   + Transporti Prishtinë: €350"
echo "   = Total: €53,820"