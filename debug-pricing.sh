#!/bin/bash

echo "🔍 DEBUGGING PRICE CALCULATION"
echo "==============================="

# 1. Check current config values
echo ""
echo "📋 CURRENT CONFIG VALUES:"
echo "-------------------------"
grep -A 5 -B 5 "shippingCost" lib/ConfigContext.tsx | grep -E "(shippingCost|shippingToPristina|markupPercentage|minimumMarkup|suv|default)" | head -10

# 2. Check if SUV pricing is enabled
echo ""
echo "🚙 SUV CONFIGURATION:"
echo "--------------------"
grep -A 10 -B 5 "suv" lib/ConfigContext.tsx | grep -E "(enabled|shippingCost|markupPercentage)" | head -10

# 3. Check what vehicle types are being detected
echo ""
echo "🔧 VEHICLE TYPE DETECTION in CarDetailClient.tsx:"
echo "-------------------------------------------------"
grep -A 15 -B 5 "vehicleType" components/cars/CarDetailClient.tsx | grep -E "(body_type|vehicleType|effectiveVehicleType|hasTypeConfig)" | head -20

# 4. Check the actual price calculation formula
echo ""
echo "🧮 PRICE CALCULATION FORMULA:"
echo "-----------------------------"
grep -A 20 -B 5 "calculateFinalPrice" lib/ConfigContext.tsx | grep -E "(return|basePrice|shippingCost|markupAmount|finalPrice)" | head -20