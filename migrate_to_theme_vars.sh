#!/bin/bash

# migrate_to_theme_vars.sh
# This script helps replace hardcoded Tailwind classes with theme variables

echo "Creating migration report..."

# Find all files with background classes and suggest replacements
find . -type f \( -name "*.tsx" -o -name "*.jsx" \) ! -path "*/node_modules/*" | while read -r file; do
    sed -i.tmp \
        -e 's/bg-white/bg-surface/g' \
        -e 's/bg-gray-50/bg-secondary/g' \
        -e 's/bg-gray-100/bg-secondary/g' \
        -e 's/bg-gray-200/bg-tertiary/g' \
        -e 's/bg-gray-800/bg-primary/g' \
        -e 's/bg-gray-900/bg-primary/g' \
        -e 's/bg-black/bg-primary/g' \
        -e 's/from-gray-50/from-secondary/g' \
        -e 's/to-white/to-surface/g' \
        -e 's/border-gray-200/border-theme/g' \
        -e 's/border-gray-100/border-theme/g' \
        "$file"
    rm -f "$file.tmp"
done

echo "Migration complete! Please review changes and test thoroughly."