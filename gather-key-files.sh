#!/bin/bash

# gather-key-files.sh
# Get only the 8 most important files for review

OUTPUT_FILE="key-files-review.txt"

# Clear the output file if it exists
> "$OUTPUT_FILE"

echo "========================================" >> "$OUTPUT_FILE"
echo "KEY FILES FOR REVIEW - Performance & Filter Issues" >> "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to add a file to the output
add_file() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        echo "" >> "$OUTPUT_FILE"
        echo "========================================" >> "$OUTPUT_FILE"
        echo "FILE: $file" >> "$OUTPUT_FILE"
        echo "DESCRIPTION: $description" >> "$OUTPUT_FILE"
        echo "========================================" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "✅ Added: $file"
    else
        echo "❌ Not found: $file"
    fi
}

echo "📁 Gathering 8 key files for review..."
echo ""

# The 8 most important files
add_file "app/cars/CarGrid.tsx" "Main filtering logic - CLIENT-SIDE FILTERS"
add_file "lib/api.ts" "API calls and timeouts - SLOW API ISSUES"
add_file "app/cars/CarsContent.tsx" "Filter management and UI"
add_file "components/filters/FilterSidebar.tsx" "Desktop filter UI"
add_file "components/ui/MobileFilters.tsx" "Mobile filter UI"
add_file "hooks/useCarFilters.ts" "Filter state management"
add_file "app/api/proxy/[...path]/route.ts" "Proxy request handling"
add_file "next.config.js" "Proxy and image optimization config"

echo ""
echo "========================================"
echo "✅ Done! 8 key files saved to: $OUTPUT_FILE"
echo "========================================"

# Show which files were found
echo ""
echo "📋 Results:"
grep "FILE:" "$OUTPUT_FILE" | sed 's/FILE:/   -/'