#!/bin/bash

# Script to fix FilterSidebar TypeScript errors
# Run: chmod +x fix-filtersidebar.sh && ./fix-filtersidebar.sh

FILE="components/cars/FilterSidebar.tsx"

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    exit 1
fi

echo "🔧 Fixing FilterSidebar.tsx TypeScript errors..."

# Create backup
cp "$FILE" "$FILE.bak"
echo "📦 Backup created: $FILE.bak"

# Fix 1: Update expandedSections state to include engine, power, features
sed -i 's/expandedSections\.engine/expandedSections\.engineSize/g' "$FILE"
sed -i 's/expandedSections\.power/expandedSections\.powerRange/g' "$FILE"
sed -i 's/expandedSections\.features/expandedSections\.features/g' "$FILE"

# Fix 2: Update the expandedSections state initialization
sed -i '/const \[expandedSections, setExpandedSections\] = useState({/,/});/c\
    const [expandedSections, setExpandedSections] = useState({\
        quickFilters: true,\
        popular: true,\
        price: true,\
        year: true,\
        mileage: true,\
        make: false,\
        fuel: false,\
        transmission: false,\
        engineSize: false,\
        powerRange: false,\
        features: false\
    });' "$FILE"

# Fix 3: Update toggleSection calls to use correct keys
sed -i 's/toggleSection('\''engine'\'')/toggleSection('\''engineSize'\'')/g' "$FILE"
sed -i 's/toggleSection('\''power'\'')/toggleSection('\''powerRange'\'')/g' "$FILE"
sed -i 's/toggleSection('\''features'\'')/toggleSection('\''features'\'')/g' "$FILE"

echo "✅ Fixes applied!"
echo ""
echo "📝 Next steps:"
echo "1. Review changes: git diff $FILE"
echo "2. If everything looks good, run: npm run build"
echo "3. To restore backup: cp $FILE.bak $FILE"