#!/bin/bash

OUTPUT_FILE="output.txt"

# Clear the output file if it exists
> "$OUTPUT_FILE"

echo "📁 Gathering files that need database integration (config + admin only)..."
echo "================================================" >> "$OUTPUT_FILE"
echo "Files needed for database integration review" >> "$OUTPUT_FILE"
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
echo "🔍 Collecting configuration files (need database)..."
echo ""

# Core configuration files (NEED DATABASE)
CONFIG_FILES=(
    "lib/config.ts"
    "lib/ConfigContext.tsx"
    "lib/configServer.ts"
    "lib/db.ts"
    "app/api/config/route.ts"
)

for file in "${CONFIG_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting admin authentication files (need database)..."
echo ""

# Admin auth files (NEED DATABASE)
ADMIN_FILES=(
    "app/admin/page.tsx"
    "app/api/admin/verify/route.ts"
    "lib/rateLimit.ts"
)

for file in "${ADMIN_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "🔍 Collecting files that use config (will auto-update)..."
echo ""

# Files that USE config (don't need DB changes, but should be reviewed)
CONFIG_USER_FILES=(
    "components/cars/CarDetailClient.tsx"
    "components/cars/CarCard.tsx"
    "components/layout/Footer.tsx"
    "components/layout/Header.tsx"
)

for file in "${CONFIG_USER_FILES[@]}"; do
    add_file "$file"
done

echo ""
echo "================================================"
echo "✅ Done! All files have been copied to: $OUTPUT_FILE"
echo "📊 Total files collected: $(grep -c "FILE:" "$OUTPUT_FILE")"
echo "================================================"
echo ""
echo "📝 Summary of what needs database:"
echo "   - Site configuration (shipping costs, contact info)"
echo "   - Admin authentication (single admin user)"
echo ""
echo "✅ Everything else stays client-side:"
echo "   - Filters (stay in URL/localStorage)"
echo "   - Recently viewed (stays in localStorage)"
echo "   - Comparisons (stays in localStorage)"
echo "   - Car listings (from API, not our DB)"
echo ""
echo "You can now share the contents of $OUTPUT_FILE"