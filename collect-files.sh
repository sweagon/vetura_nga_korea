#!/bin/bash

# Minimal version - only essential files
OUTPUT_FILE="output.txt"
> "$OUTPUT_FILE"

add_file() {
    if [ -f "$1" ]; then
        echo "=========================================" >> "$OUTPUT_FILE"
        echo "FILE: $1" >> "$OUTPUT_FILE"
        echo "=========================================" >> "$OUTPUT_FILE"
        cat "$1" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "✅ Added: $1"
    else
        echo "❌ Missing: $1"
    fi
}

echo "📁 Collecting essential files..."

# Core files only
add_file "app/cars/CarsContentWrapper.tsx"
add_file "hooks/useCarFilters.ts"
add_file "components/cars/CarCard.tsx"
add_file "components/ui/LoadingSkeleton.tsx"
add_file "components/filters/AdvancedFilterSidebar.tsx"
add_file "lib/api.ts"
add_file "hooks/useDebounce.ts"
add_file "components/ui/CompactSearch.tsx"
add_file "components/ui/CustomSelect.tsx"
add_file "app/cars/page.tsx"

echo ""
echo "✅ Done! Check $OUTPUT_FILE"