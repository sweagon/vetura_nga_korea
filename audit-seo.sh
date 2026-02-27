#!/bin/bash

# SEO & Meta Audit Script
echo "🔍 SEO & META AUDIT REPORT"
echo "=========================="
echo ""

# Check for robots.txt
echo "📄 ROBOTS.TXT"
if [ -f "public/robots.txt" ]; then
    echo "✅ robots.txt exists"
    echo "   Content:"
    cat public/robots.txt | sed 's/^/   /'
else
    echo "❌ robots.txt MISSING"
fi
echo ""

# Check for sitemap.xml
echo "🗺️ SITEMAP"
if [ -f "public/sitemap.xml" ] || [ -f "app/sitemap.ts" ] || [ -f "app/sitemap.xml/route.ts" ]; then
    echo "✅ Sitemap configured"
    if [ -f "app/sitemap.ts" ]; then
        echo "   Using: app/sitemap.ts (dynamic)"
    fi
else
    echo "❌ Sitemap MISSING"
fi
echo ""

# Check for manifest.json
echo "📱 MANIFEST"
if [ -f "public/manifest.json" ]; then
    echo "✅ manifest.json exists"
    # Check required fields
    NAME=$(grep -o '"name":"[^"]*"' public/manifest.json | head -1)
    SHORT_NAME=$(grep -o '"short_name":"[^"]*"' public/manifest.json | head -1)
    THEME_COLOR=$(grep -o '"theme_color":"[^"]*"' public/manifest.json | head -1)
    echo "   $NAME"
    echo "   $SHORT_NAME"
    echo "   Theme: $THEME_COLOR"
else
    echo "❌ manifest.json MISSING"
fi
echo ""

# Check for favicon
echo "🖼️ FAVICON"
FAVICON_COUNT=$(find public -name "favicon*" -o -name "icon*" -o -name "apple-icon*" | wc -l)
if [ $FAVICON_COUNT -gt 0 ]; then
    echo "✅ Favicon files found: $FAVICON_COUNT"
    find public -name "favicon*" -o -name "icon*" -o -name "apple-icon*" | sed 's/^/   /'
else
    echo "❌ No favicon files found"
fi
echo ""

# Check for Open Graph images
echo "🖼️ OPEN GRAPH IMAGES"
OG_COUNT=$(find public -name "og-image*" -o -name "social*" -o -name "share*" | wc -l)
if [ $OG_COUNT -gt 0 ]; then
    echo "✅ Open Graph images found: $OG_COUNT"
    find public -name "og-image*" -o -name "social*" -o -name "share*" | sed 's/^/   /'
else
    echo "❌ No Open Graph images found"
fi
echo ""

# Check layout.tsx for metadata
echo "🏗️ LAYOUT METADATA"
if [ -f "app/layout.tsx" ]; then
    echo "✅ layout.tsx exists"
    
    # Check for metadata export
    if grep -q "export const metadata" app/layout.tsx; then
        echo "   ✅ metadata export found"
        
        # Extract metadata fields
        TITLE=$(grep -A10 "export const metadata" app/layout.tsx | grep -o 'title:.*' | head -1)
        DESC=$(grep -A10 "export const metadata" app/layout.tsx | grep -o 'description:.*' | head -1)
        echo "   Title: $TITLE"
        echo "   Description: $DESC"
    else
        echo "   ❌ No metadata export found in layout.tsx"
    fi
else
    echo "❌ layout.tsx MISSING"
fi
echo ""

# Check page metadata
echo "📄 PAGE-SPECIFIC METADATA"
PAGES_WITH_METADATA=0
TOTAL_PAGES=0

for page in app/**/page.tsx; do
    TOTAL_PAGES=$((TOTAL_PAGES + 1))
    if grep -q "export const metadata" "$page" || grep -q "generateMetadata" "$page"; then
        PAGES_WITH_METADATA=$((PAGES_WITH_METADATA + 1))
        echo "   ✅ $(basename $(dirname $page)) has metadata"
    else
        echo "   ❌ $(basename $(dirname $page)) MISSING metadata"
    fi
done
echo "   Pages with metadata: $PAGES_WITH_METADATA/$TOTAL_PAGES"
echo ""

# Check for structured data
echo "📊 STRUCTURED DATA"
STRUCTURED_FILES=$(find components -name "*StructuredData*" -o -name "*Schema*" | wc -l)
if [ $STRUCTURED_FILES -gt 0 ]; then
    echo "✅ Structured data components found: $STRUCTURED_FILES"
    find components -name "*StructuredData*" -o -name "*Schema*" | sed 's/^/   /'
else
    echo "❌ No structured data components found"
fi
echo ""

# Check for meta tags component
echo "🏷️ META TAGS COMPONENT"
if [ -f "components/seo/MetaTags.tsx" ]; then
    echo "✅ MetaTags component exists"
else
    echo "❌ MetaTags component MISSING"
fi
echo ""

# Generate report
echo "=========================="
echo "📊 SUMMARY"
echo "=========================="
echo ""
echo "Missing Items:"
echo "-------------"
[ ! -f "public/robots.txt" ] && echo "❌ robots.txt"
[ ! -f "public/manifest.json" ] && echo "❌ manifest.json"
[ $FAVICON_COUNT -eq 0 ] && echo "❌ Favicon files"
[ $OG_COUNT -eq 0 ] && echo "❌ Open Graph images"
[ $STRUCTURED_FILES -eq 0 ] && echo "❌ Structured data"
[ $PAGES_WITH_METADATA -ne $TOTAL_PAGES ] && echo "❌ Some pages missing metadata"
[ ! -f "components/seo/MetaTags.tsx" ] && echo "❌ MetaTags component"

echo ""
echo "✅ Audit complete! Run: chmod +x audit-seo.sh && ./audit-seo.sh"