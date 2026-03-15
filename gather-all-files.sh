#!/bin/bash

OUTPUT_FILE="output.txt"

# Clear the output file if it exists
> "$OUTPUT_FILE"

echo "📁 Gathering all necessary files for review..."
echo "================================================" >> "$OUTPUT_FILE"
echo "Files gathered for system-wide review" >> "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "================================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to add a file to the output
add_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "Adding: $file"
        echo "" >> "$OUTPUT_FILE"
        echo "================================================" >> "$OUTPUT_FILE"
        echo "FILE: $file" >> "$OUTPUT_FILE"
        echo "================================================" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    else
        echo "⚠️  Warning: $file not found"
    fi
}

echo ""
echo "🔍 Collecting configuration files..."
echo "-----------------------------------"

# Core configuration files
CONFIG_FILES=(
    "lib/config.ts"
    "lib/db.ts"
    "lib/ConfigContext.tsx"
    "lib/configServer.ts"
    "lib/api.ts"
)

for file in "${CONFIG_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting car component files..."
echo "------------------------------------"

CAR_COMPONENTS=(
    "components/cars/CarDetailClient.tsx"
    "components/cars/CarCard.tsx"
    "components/cars/CarSpecs.tsx"
    "components/cars/CarDetailTabs.tsx"
    "components/cars/ImageGallery.tsx"
    "components/cars/RecentlyViewedTracker.tsx"
)

for file in "${CAR_COMPONENTS[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting admin files..."
echo "----------------------------"

ADMIN_FILES=(
    "app/admin/page.tsx"
    "app/api/admin/verify/route.ts"
    "app/api/admin/check-session/route.ts"
    "app/api/admin/sessions/route.ts"
    "app/api/config/route.ts"
)

for file in "${ADMIN_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting hook files..."
echo "---------------------------"

HOOK_FILES=(
    "hooks/useCarFilters.ts"
    "hooks/useFilterWithSkeleton.ts"
    "hooks/useDebounce.ts"
)

for file in "${HOOK_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting worker files..."
echo "-----------------------------"

WORKER_FILES=(
    "workers/filterWorker.ts"
)

for file in "${WORKER_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting filter component files..."
echo "---------------------------------------"

FILTER_FILES=(
    "components/filters/AdvancedFilterSidebar.tsx"
    "components/filters/RangeFilter.tsx"
    "components/ui/CompactSearch.tsx"
    "components/ui/CustomSelect.tsx"
    "contexts/FilterContext.tsx"
)

for file in "${FILTER_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting page files..."
echo "---------------------------"

PAGE_FILES=(
    "app/cars/page.tsx"
    "app/cars/CarsContentWrapper.tsx"
    "app/cars/CarsFilter.tsx"
    "app/cars/[id]/page.tsx"
    "app/cars/[id]/CarDetailClientWrapper.tsx"
)

for file in "${PAGE_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting utility files..."
echo "------------------------------"

UTILITY_FILES=(
    "lib/rateLimit.ts"
    "lib/recentlyViewed.ts"
    "lib/translations.ts"
    "lib/staticManufacturers.ts"
    "lib/filterCache.ts"
)

for file in "${UTILITY_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting price calculation files..."
echo "----------------------------------------"

PRICE_FILES=(
    "lib/priceCalculator.ts"
    "lib/exchangeRates.ts"
)

for file in "${PRICE_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "================================================"
echo "✅ Done! All files have been copied to: $OUTPUT_FILE"
echo "📊 Total files collected: $(grep -c "FILE:" "$OUTPUT_FILE")"
echo "================================================"
echo ""
echo "You can now review the contents of $OUTPUT_FILE"
echo "Or share it for analysis"