#!/bin/bash

# Script to collect files for filter button repositioning
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

echo "📁 Collecting files for filter button repositioning..."
echo ""

# Primary files needed
add_file "app/cars/CarsContentWrapper.tsx"
add_file "components/ui/FilterToggle.tsx"
add_file "components/filters/AdvancedFilterSidebar.tsx"
add_file "app/cars/page.tsx"
add_file "components/ui/CompactSearch.tsx"
add_file "app/globals.css"

echo ""
echo "✅ Done! Check $OUTPUT_FILE"
echo ""
echo "These files will help me understand:"
echo "  • Where the filter button is currently placed"
echo "  • The filter toggle component structure"
echo "  • The sidebar behavior"
echo "  • The overall page layout"
echo "  • Where you want to integrate it (near CompactSearch)"
echo "  • Any existing styles"