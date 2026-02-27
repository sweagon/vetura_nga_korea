#!/bin/bash

# Script: migrate-colors.sh
# Description: Comprehensive color migration for ALL theme variables
# Usage: ./migrate-colors.sh [--dry-run] [--verbose]

set -e

# Configuration
DRY_RUN=false
VERBOSE=false
BACKUP_DIR="./color-migration-backup-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./color-migration-log-$(date +%Y%m%d_%H%M%S).txt"

# Parse arguments
for arg in "$@"; do
    if [ "$arg" == "--dry-run" ]; then
        DRY_RUN=true
        echo "🔍 DRY RUN MODE - No files will be modified"
    fi
    if [ "$arg" == "--verbose" ]; then
        VERBOSE=true
        echo "📢 VERBOSE MODE - Detailed output"
    fi
done

# Initialize log
echo "Color Migration Log - $(date)" > "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"

# All directories to scan
TARGET_DIRS=(
    "./components"
    "./app"
    "./hooks"
    "./contexts"
    "./lib"
)

# ==========================================
# COMPLETE COLOR MAPPINGS
# ==========================================

# Background colors
declare -A BG_MAP=(
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
)

# Text colors
declare -A TEXT_MAP=(
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
)

# Border colors
declare -A BORDER_MAP=(
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
)

# Status colors
declare -A STATUS_MAP=(
    ["bg-green-50"]="bg-success-bg"
    ["bg-green-100"]="bg-success-bg"
    ["text-green-500"]="text-success-text"
    ["text-green-600"]="text-success-text"
    ["border-green-200"]="border-success-border"
    ["bg-red-50"]="bg-error-bg"
    ["bg-red-100"]="bg-error-bg"
    ["text-red-500"]="text-error-text"
    ["text-red-600"]="text-error-text"
    ["border-red-200"]="border-error-border"
    ["bg-yellow-50"]="bg-warning-bg"
    ["bg-yellow-100"]="bg-warning-bg"
    ["text-yellow-500"]="text-warning-text"
    ["border-yellow-200"]="border-warning-border"
    ["bg-blue-50"]="bg-info-bg"
    ["bg-blue-100"]="bg-info-bg"
    ["text-blue-500"]="text-info-text"
    ["border-blue-200"]="border-info-border"
)

# Gradient colors
declare -A GRADIENT_MAP=(
    ["from-gray-50"]="from-surface"
    ["from-gray-100"]="from-surface"
    ["from-gray-200"]="from-surface-2"
    ["from-gray-300"]="from-tertiary"
    ["from-gray-400"]="from-tertiary"
    ["from-gray-500"]="from-elevated"
    ["from-gray-600"]="from-elevated"
    ["from-gray-700"]="from-primary"
    ["from-gray-800"]="from-primary"
    ["from-gray-900"]="from-primary"
    ["to-gray-50"]="to-surface"
    ["to-gray-100"]="to-surface"
    ["to-gray-200"]="to-surface-2"
    ["to-gray-300"]="to-tertiary"
    ["to-gray-400"]="to-tertiary"
    ["to-gray-500"]="to-elevated"
    ["to-gray-600"]="to-elevated"
    ["to-gray-700"]="to-primary"
    ["to-gray-800"]="to-primary"
    ["to-gray-900"]="to-primary"
)

# Hover states
declare -A HOVER_MAP=(
    ["hover:bg-gray-50"]="hover:bg-surface"
    ["hover:bg-gray-100"]="hover:bg-surface"
    ["hover:bg-gray-200"]="hover:bg-surface-2"
    ["hover:bg-gray-300"]="hover:bg-tertiary"
    ["hover:text-gray-500"]="hover:text-secondary"
    ["hover:text-gray-600"]="hover:text-secondary"
    ["hover:text-gray-700"]="hover:text-primary"
    ["hover:border-gray-200"]="hover:border-light"
    ["hover:border-gray-300"]="hover:border-medium"
)

# Focus states
declare -A FOCUS_MAP=(
    ["focus:border-gray-300"]="focus:border-medium"
    ["focus:ring-gray-200"]="focus:ring-medium"
)

# ==========================================
# PROCESSING FUNCTIONS
# ==========================================

process_file() {
    local file=$1
    local content=$(cat "$file")
    local original="$content"
    local changes=false

    # Apply all mappings
    for old in "${!BG_MAP[@]}"; do
        new="${BG_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    for old in "${!TEXT_MAP[@]}"; do
        new="${TEXT_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    for old in "${!BORDER_MAP[@]}"; do
        new="${BORDER_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    for old in "${!STATUS_MAP[@]}"; do
        new="${STATUS_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    for old in "${!GRADIENT_MAP[@]}"; do
        new="${GRADIENT_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    for old in "${!HOVER_MAP[@]}"; do
        new="${HOVER_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    for old in "${!FOCUS_MAP[@]}"; do
        new="${FOCUS_MAP[$old]}"
        if [[ "$content" == *"$old"* ]]; then
            content=${content//$old/$new}
            changes=true
        fi
    done

    # Write changes
    if [ "$changes" = true ]; then
        if [ "$DRY_RUN" = false ]; then
            echo "$content" > "$file"
            echo "✅ Updated: $file"
            echo "Updated: $file" >> "$LOG_FILE"
        else
            echo "🔍 Would update: $file"
            echo "Would update: $file" >> "$LOG_FILE"
        fi
    fi
}

# ==========================================
# MAIN EXECUTION
# ==========================================

main() {
    echo "🎨 Color Migration Tool"
    echo "=========================================="
    
    # Create backup
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$BACKUP_DIR"
        echo "📦 Backup directory: $BACKUP_DIR"
    fi
    
    # Process directories
    for dir in "${TARGET_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo "📁 Scanning: $dir"
            find "$dir" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) -print0 | while IFS= read -r -d '' file; do
                process_file "$file"
            done
        fi
    done
    
    echo ""
    echo "✅ Complete!"
    echo "📝 Log: $LOG_FILE"
    
    if [ "$DRY_RUN" = true ]; then
        echo "🔍 DRY RUN - No files modified"
    else
        echo "📦 Backup: $BACKUP_DIR"
    fi
}

# Run main
main