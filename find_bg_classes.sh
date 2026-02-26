#!/bin/bash

# More targeted script for React/Next.js projects
TARGET_DIRS="components app pages src"
SEARCH_DIR="${1:-.}"
OUTPUT_FILE="background_classes_detailed.txt"

echo "Searching for background classes in React components..." > $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE

for dir in $TARGET_DIRS; do
    if [ -d "$SEARCH_DIR/$dir" ]; then
        echo "" >> $OUTPUT_FILE
        echo "📁 DIRECTORY: $dir" >> $OUTPUT_FILE
        echo "-----------------------------------" >> $OUTPUT_FILE
        
        find "$SEARCH_DIR/$dir" -type f \( -name "*.tsx" -o -name "*.jsx" \) | while read -r file; do
            relative_path="${file#$SEARCH_DIR/}"
            
            echo "" >> $OUTPUT_FILE
            echo "File: $relative_path" >> $OUTPUT_FILE
            
            # Extract all className strings
            grep -o 'className="[^"]*"' "$file" 2>/dev/null | while read -r classline; do
                # Find background classes
                echo "$classline" | grep -o "\(bg-\|from-\|to-\|via-\|backdrop-\)[a-zA-Z0-9/\-]\+" | while read -r bgclass; do
                    echo "  • $bgclass" >> $OUTPUT_FILE
                done
            done
        done
    fi
done

echo "" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "DARK THEME MIGRATION GUIDE" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
cat << 'EOF' >> $OUTPUT_FILE

Quick reference for your dark theme:

🟥 Primary Colors:
  - Ferrari Red: ferrari-red (accent)
  - Dark Red: ferrari-dark (hover states)

⬛ Background Colors:
  - Main Background: dark-bg (#0A0A0A)
  - Surface Level 1: dark-surface (#141414) - cards, modals
  - Surface Level 2: dark-surface-2 (#1E1E1E) - hover, inputs
  - Borders: dark-border (#2A2A2A)

📝 Text Colors:
  - Primary Text: dark-text (white)
  - Secondary Text: dark-text-secondary (#A0A0A0)
  - Muted Text: dark-text-muted (#666666)

Common Replacements:
  bg-gray-50 → bg-dark-surface
  bg-gray-100 → bg-dark-surface
  bg-gray-200 → bg-dark-surface-2
  bg-gray-800 → bg-dark-bg
  bg-gray-900 → bg-dark-bg
  bg-white → bg-dark-surface
  bg-black → bg-dark-bg
  
Gradients:
  Use from-ferrari-red to-ferrari-dark for primary gradients
  Use from-dark-bg to-dark-surface for subtle gradients
EOF

echo "✅ Detailed report saved to: $OUTPUT_FILE"