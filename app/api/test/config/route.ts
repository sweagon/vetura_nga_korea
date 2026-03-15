import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/configServer';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const basePrice = parseInt(url.searchParams.get('price') || '50000');
        const vehicleType = url.searchParams.get('type') || 'sedan';

        const config = await getConfig();

        // Simulate calculateFinalPrice
        let shipping = config.shippingCost;
        let usedType = 'default';

        if (vehicleType && config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes]) {
            const typeConfig = config.vehicleTypes[vehicleType as keyof typeof config.vehicleTypes];
            if (typeConfig?.enabled) {
                shipping = typeConfig.shippingCost;
                usedType = vehicleType;
            }
        }

        const pristinaShipping = config.shippingToPristina;
        const finalPrice = basePrice + shipping + pristinaShipping;

        return NextResponse.json({
            config: {
                defaultShipping: config.shippingCost,
                pristinaShipping: config.shippingToPristina,
                vehicleTypes: config.vehicleTypes
            },
            calculation: {
                basePrice,
                vehicleType,
                usedType,
                shippingUsed: shipping,
                pristinaShipping,
                finalPrice,
                formula: `${basePrice} + ${shipping} + ${pristinaShipping} = ${finalPrice}`
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return NextResponse.json({ error: 'Test failed' }, { status: 500 });
    }
}