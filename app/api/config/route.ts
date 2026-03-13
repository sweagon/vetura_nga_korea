// app/api/config/route.ts
import { NextResponse } from 'next/server';

// Default config (same as in Context)
const defaultConfig = {
    shippingCost: 3500,
    markupPercentage: 15,
    minimumMarkup: 1000,
    contactEmail: 'blerart@outlook.com',
    contactPhone: '+383 49 195 414',
    siteName: 'Vetura Korea Kosovë',
    currency: 'EUR'
};

export async function GET() {
    // In a real app, you might fetch this from a database
    // For now, return default config
    return NextResponse.json(defaultConfig);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Here you would save to a database
        // For now, just return success

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to save config' },
            { status: 500 }
        );
    }
}