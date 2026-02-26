#!/bin/bash

# Script: extract_color_classes.sh
# Usage: ./extract_color_classes.sh /path/to/your/project

# Set the directory to search (default: current directory)
SEARCH_DIR="${1:-.}"
OUTPUT_FILE="color_classes_analysis.txt"

echo "🔍 Extracting all color-related classes from: $SEARCH_DIR"
echo "==================================================" > $OUTPUT_FILE
echo "COLOR CLASSES ANALYSIS - $(date)" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Arrays of patterns to search for
BG_PATTERNS=(
    "bg-"
    "from-"
    "to-"
    "via-"
)

TEXT_PATTERNS=(
    "text-"
)

BORDER_PATTERNS=(
    "border-"
    "ring-"
    "outline-"
)

OTHER_PATTERNS=(
    "shadow-"
    "divide-"
    "placeholder-"
)

# Define theme mapping
declare -A COLOR_MAP=(
    # Background colors
    ["bg-white"]="bg-surface"
    ["bg-black"]="bg-primary"
    ["bg-gray-50"]="bg-surface"
    ["bg-gray-100"]="bg-surface"
    ["bg-gray-200"]="bg-surface-2"
    ["bg-gray-300"]="bg-tertiary"
    ["bg-gray-400"]="bg-tertiary"
    ["bg-gray-500"]="bg-elevated"
    ["bg-gray-600"]="bg-elevated"
    ["bg-gray-700"]="bg-primary"
    ["bg-gray-800"]="bg-primary"
    ["bg-gray-900"]="bg-primary"
    ["bg-slate-50"]="bg-surface"
    ["bg-slate-100"]="bg-surface"
    ["bg-slate-200"]="bg-surface-2"
    ["bg-slate-800"]="bg-primary"
    ["bg-slate-900"]="bg-primary"
    ["bg-zinc-50"]="bg-surface"
    ["bg-zinc-100"]="bg-surface"
    ["bg-zinc-200"]="bg-surface-2"
    ["bg-zinc-800"]="bg-primary"
    ["bg-zinc-900"]="bg-primary"
    ["bg-neutral-50"]="bg-surface"
    ["bg-neutral-100"]="bg-surface"
    ["bg-neutral-200"]="bg-surface-2"
    ["bg-neutral-800"]="bg-primary"
    ["bg-neutral-900"]="bg-primary"
    ["bg-stone-50"]="bg-surface"
    ["bg-stone-100"]="bg-surface"
    ["bg-stone-200"]="bg-surface-2"
    ["bg-stone-800"]="bg-primary"
    ["bg-stone-900"]="bg-primary"
    ["bg-red-50"]="bg-error-bg"
    ["bg-red-100"]="bg-error-bg"
    ["bg-red-500"]="bg-ferrari-red"
    ["bg-red-600"]="bg-ferrari-dark"
    ["bg-green-50"]="bg-success-bg"
    ["bg-green-100"]="bg-success-bg"
    ["bg-green-500"]="bg-success-text"
    ["bg-yellow-50"]="bg-warning-bg"
    ["bg-yellow-100"]="bg-warning-bg"
    ["bg-yellow-500"]="bg-warning-text"
    ["bg-blue-50"]="bg-info-bg"
    ["bg-blue-100"]="bg-info-bg"
    ["bg-blue-500"]="bg-info-text"
    ["bg-purple-50"]="bg-surface"
    ["bg-pink-50"]="bg-surface"
    ["bg-indigo-50"]="bg-surface"
    
    # Text colors
    ["text-white"]="text-primary"
    ["text-black"]="text-primary"
    ["text-gray-50"]="text-primary"
    ["text-gray-100"]="text-primary"
    ["text-gray-200"]="text-primary"
    ["text-gray-300"]="text-primary"
    ["text-gray-400"]="text-muted"
    ["text-gray-500"]="text-secondary"
    ["text-gray-600"]="text-secondary"
    ["text-gray-700"]="text-primary"
    ["text-gray-800"]="text-primary"
    ["text-gray-900"]="text-primary"
    ["text-slate-400"]="text-muted"
    ["text-slate-500"]="text-secondary"
    ["text-slate-600"]="text-secondary"
    ["text-slate-700"]="text-primary"
    ["text-slate-800"]="text-primary"
    ["text-slate-900"]="text-primary"
    ["text-red-500"]="text-error-text"
    ["text-red-600"]="text-error-text"
    ["text-green-500"]="text-success-text"
    ["text-green-600"]="text-success-text"
    ["text-yellow-500"]="text-warning-text"
    ["text-yellow-600"]="text-warning-text"
    ["text-blue-500"]="text-info-text"
    ["text-blue-600"]="text-info-text"
    ["text-ferrari-red"]="text-ferrari-red"
    
    # Border colors
    ["border-white"]="border-light"
    ["border-black"]="border-strong"
    ["border-gray-50"]="border-light"
    ["border-gray-100"]="border-light"
    ["border-gray-200"]="border-light"
    ["border-gray-300"]="border-medium"
    ["border-gray-400"]="border-medium"
    ["border-gray-500"]="border-strong"
    ["border-gray-600"]="border-strong"
    ["border-gray-700"]="border-strong"
    ["border-gray-800"]="border-strong"
    ["border-gray-900"]="border-strong"
    ["border-slate-200"]="border-light"
    ["border-slate-300"]="border-medium"
    ["border-slate-700"]="border-strong"
    ["border-slate-800"]="border-strong"
    ["border-red-200"]="border-error-border"
    ["border-red-300"]="border-error-border"
    ["border-green-200"]="border-success-border"
    ["border-green-300"]="border-success-border"
    ["border-yellow-200"]="border-warning-border"
    ["border-yellow-300"]="border-warning-border"
    ["border-blue-200"]="border-info-border"
    ["border-blue-300"]="border-info-border"
    ["border-ferrari-red"]="border-ferrari-red"
    
    # Ring/Outline colors
    ["ring-gray-200"]="ring-medium"
    ["ring-gray-300"]="ring-medium"
    ["ring-red-500"]="ring-ferrari-red"
    ["ring-ferrari-red"]="ring-ferrari-red"
    ["outline-gray-200"]="outline-medium"
    ["outline-gray-300"]="outline-medium"
    
    # Shadow colors
    ["shadow-sm"]="shadow-sm"
    ["shadow"]="shadow"
    ["shadow-md"]="shadow-md"
    ["shadow-lg"]="shadow-lg"
    ["shadow-xl"]="shadow-xl"
    ["shadow-2xl"]="shadow-2xl"
    ["shadow-inner"]="shadow-inner"
    ["shadow-gray-200"]="shadow-medium"
    ["shadow-gray-300"]="shadow-medium"
    ["shadow-red-500"]="shadow-ferrari-red"
    
    # Gradient colors
    ["from-gray-50"]="from-surface"
    ["from-gray-100"]="from-surface"
    ["from-gray-200"]="from-surface-2"
    ["from-gray-800"]="from-primary"
    ["from-gray-900"]="from-primary"
    ["from-ferrari-red"]="from-ferrari-red"
    ["from-red-500"]="from-ferrari-red"
    ["to-gray-50"]="to-surface"
    ["to-gray-100"]="to-surface"
    ["to-gray-200"]="to-surface-2"
    ["to-gray-800"]="to-primary"
    ["to-gray-900"]="to-primary"
    ["to-ferrari-dark"]="to-ferrari-dark"
    ["via-gray-50"]="via-surface"
    ["via-gray-100"]="via-surface"
    ["via-ferrari-red"]="via-ferrari-red"
    
    # Divide colors
    ["divide-gray-200"]="divide-medium"
    ["divide-gray-300"]="divide-medium"
    ["divide-gray-700"]="divide-strong"
    
    # Placeholder colors
    ["placeholder-gray-400"]="placeholder-muted"
    ["placeholder-gray-500"]="placeholder-secondary"
)

# Function to extract and analyze classes
extract_classes() {
    local pattern=$1
    local description=$2
    local output_file=$3
    
    echo "" >> $output_file
    echo "📌 $description" >> $output_file
    echo "-----------------------------------" >> $output_file
    
    # Find all files and extract matching classes
    find "$SEARCH_DIR" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" -o -name "*.css" \) \
        ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/build/*" | while read -r file; do
        
        relative_path="${file#$SEARCH_DIR/}"
        
        # Use grep to find matches with context
        matches=$(grep -n -H -E "$pattern" "$file" 2>/dev/null | grep -E "(className=|class:)" | head -20)
        
        if [ ! -z "$matches" ]; then
            echo "" >> $output_file
            echo "📁 $relative_path" >> $output_file
            
            echo "$matches" | while read -r line; do
                line_num=$(echo "$line" | cut -d: -f2)
                content=$(echo "$line" | cut -d: -f3-)
                
                # Extract all matching classes
                echo "$content" | grep -o -E "$pattern" | sort -u | while read -r class; do
                    suggestion="${COLOR_MAP[$class]}"
                    
                    if [ ! -z "$suggestion" ]; then
                        echo "  Line $line_num: $class → $suggestion" >> $output_file
                    else
                        echo "  Line $line_num: $class ⚠️  (no mapping)" >> $output_file
                    fi
                done
            done
        fi
    done
}

# Extract all background classes
echo "Extracting background classes..."
extract_classes "bg-[a-zA-Z0-9\/\-_]+" "BACKGROUND CLASSES" "$OUTPUT_FILE"
extract_classes "from-[a-zA-Z0-9\/\-_]+" "GRADIENT FROM CLASSES" "$OUTPUT_FILE"
extract_classes "to-[a-zA-Z0-9\/\-_]+" "GRADIENT TO CLASSES" "$OUTPUT_FILE"
extract_classes "via-[a-zA-Z0-9\/\-_]+" "GRADIENT VIA CLASSES" "$OUTPUT_FILE"

# Extract all text classes
echo "Extracting text classes..."
extract_classes "text-[a-zA-Z0-9\/\-_]+" "TEXT CLASSES" "$OUTPUT_FILE"

# Extract all border classes
echo "Extracting border classes..."
extract_classes "border-[a-zA-Z0-9\/\-_]+" "BORDER CLASSES" "$OUTPUT_FILE"
extract_classes "ring-[a-zA-Z0-9\/\-_]+" "RING CLASSES" "$OUTPUT_FILE"
extract_classes "outline-[a-zA-Z0-9\/\-_]+" "OUTLINE CLASSES" "$OUTPUT_FILE"

# Extract other classes
echo "Extracting other classes..."
extract_classes "shadow-[a-zA-Z0-9\/\-_]+" "SHADOW CLASSES" "$OUTPUT_FILE"
extract_classes "divide-[a-zA-Z0-9\/\-_]+" "DIVIDE CLASSES" "$OUTPUT_FILE"
extract_classes "placeholder-[a-zA-Z0-9\/\-_]+" "PLACEHOLDER CLASSES" "$OUTPUT_FILE"

# Generate summary statistics
echo "" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "📊 SUMMARY STATISTICS" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "Top 20 most used background classes:" >> $OUTPUT_FILE
find "$SEARCH_DIR" -type f \( -name "*.tsx" -o -name "*.jsx" \) ! -path "*/node_modules/*" | \
    xargs grep -ho "bg-[a-zA-Z0-9/\-]\+" 2>/dev/null | sort | uniq -c | sort -rn | head -20 >> $OUTPUT_FILE

echo "" >> $OUTPUT_FILE
echo "Top 20 most used text classes:" >> $OUTPUT_FILE
find "$SEARCH_DIR" -type f \( -name "*.tsx" -o -name "*.jsx" \) ! -path "*/node_modules/*" | \
    xargs grep -ho "text-[a-zA-Z0-9/\-]\+" 2>/dev/null | sort | uniq -c | sort -rn | head -20 >> $OUTPUT_FILE

echo "" >> $OUTPUT_FILE
echo "Top 20 most used border classes:" >> $OUTPUT_FILE
find "$SEARCH_DIR" -type f \( -name "*.tsx" -o -name "*.jsx" \) ! -path "*/node_modules/*" | \
    xargs grep -ho "border-[a-zA-Z0-9/\-]\+" 2>/dev/null | sort | uniq -c | sort -rn | head -20 >> $OUTPUT_FILE

# Generate theme mapping guide
echo "" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "🎨 THEME VARIABLES MAPPING GUIDE" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
cat << 'EOF' >> $OUTPUT_FILE

Your Theme Variables:

🏠 BACKGROUNDS:
  bg-primary     → Main page background (#0A0C10 dark / #F8F9FC light)
  bg-secondary   → Card backgrounds (#14181F dark / #FFFFFF light)
  bg-tertiary    → Hover states, subtle backgrounds (#1E232B dark / #F1F4F9 light)
  bg-elevated    → Dropdowns, modals (#2A2F3A dark / #FFFFFF light)
  bg-surface     → Surface level 1 (#1A1E26 dark / #FFFFFF light)
  bg-surface-2   → Surface level 2 (#252B34 dark / #F8FAFE light)
  bg-inset       → Inset backgrounds (#0F1217 dark / #EFF2F6 light)

📝 TEXT:
  text-primary    → Primary text (white / #1A2634)
  text-secondary  → Secondary text (#CBD5E0 / #4A5568)
  text-tertiary   → Tertiary text (#A0B3C9 / #6B7A8F)
  text-muted      → Muted text (#7F8FA4 / #8F9EB0)
  text-inverse    → Inverse text (#1A2634 / #FFFFFF)
  text-disabled   → Disabled text (#4A5568 / #BFC8D6)

🖼️ BORDERS:
  border-light    → Light borders (#2A2F38 / #E9ECF0)
  border-medium   → Default borders (#363D48 / #DCE1E8)
  border-strong   → Strong borders (#414A58 / #C9D0D9)

🎯 STATUS COLORS:
  success-bg      → #1C2F23 / #E8F3E9
  success-text    → #9AE6B4 / #1E7B4C
  success-border  → #2F4A3A / #A3D8A7
  
  warning-bg      → #332A1C / #FEF3E2
  warning-text    → #FBD38D / #B45B0F
  warning-border  → #5A4A2A / #FFE4B8
  
  error-bg        → #321F22 / #FEF0F0
  error-text      → #FEB2B2 / #C73B3B
  error-border    → #5A2E33 / #FFC9C9
  
  info-bg         → #1C2A3F / #E8F0FE
  info-text       → #90CDF4 / #1A5F9C
  info-border     → #2A3F5A / #BAC8E0

🔥 FERRARI RED:
  ferrari-red     → #FF2800 (primary accent)
  ferrari-dark    → #CC2000 (hover states)
  ferrari-light   → #FF4D2E (highlights)
  ferrari-glow    → #FF6B4A (glow effects)

GRADIENTS:
  Use from-ferrari-red to-ferrari-dark for primary gradients
  Use from-primary to-secondary for subtle backgrounds

Skeleton Loading Colors:
  Light Theme:
    - bg-skeleton: #EFF2F6 (instead of gray-200)
    - animate-pulse: use bg-tertiary
  
  Dark Theme:
    - bg-skeleton: #252B34 (instead of gray-700)
    - animate-pulse: use bg-surface-2
EOF

# Find files with skeleton loaders
echo "" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "🦴 SKELETON LOADING COMPONENTS" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

find "$SEARCH_DIR" -type f \( -name "*.tsx" -o -name "*.jsx" \) ! -path "*/node_modules/*" | \
    xargs grep -l "animate-pulse\|skeleton" 2>/dev/null | while read -r file; do
    echo "📁 ${file#$SEARCH_DIR/}" >> $OUTPUT_FILE
    grep -n "animate-pulse\|skeleton\|bg-gray-\|bg-slate-" "$file" 2>/dev/null | head -5 >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
done

echo "" >> $OUTPUT_FILE
echo "==================================================" >> $OUTPUT_FILE
echo "✅ EXTRACTION COMPLETE" >> $OUTPUT_FILE
echo "Results saved to: $OUTPUT_FILE" >> $OUTPUT_FILE

# Print completion message
echo ""
echo "✅ Extraction complete! Results saved to: $OUTPUT_FILE"
echo ""
echo "To review the results:"
echo "  cat $OUTPUT_FILE"
echo "  less $OUTPUT_FILE"
echo "  open $OUTPUT_FILE (on macOS)"