import { fetchCars } from '@/lib/api';
import CarCard from '@/components/cars/CarCard';
import Link from 'next/link';

// Priority brands for Kosovo
const PRIORITY_BRANDS = [
    'Mercedes', 'BMW', 'Audi', 'Volkswagen',
    'Renault', 'Peugeot', 'Opel', 'Ford',
    'Hyundai', 'Kia'
];

export default async function KosovoMarketPage() {
    // 1. FIRST: Try to get German cars (what people really want)
    const germanQueries = await Promise.all([
        fetchCars({ make: 'Mercedes-Benz', sort: 'price_asc', limit: 15, minPrice: 2000, maxPrice: 25000 }),
        fetchCars({ make: 'BMW', sort: 'price_asc', limit: 15, minPrice: 2000, maxPrice: 25000 }),
        fetchCars({ make: 'Audi', sort: 'price_asc', limit: 15, minPrice: 2000, maxPrice: 25000 }),
        fetchCars({ make: 'Volkswagen', sort: 'price_asc', limit: 15, minPrice: 2000, maxPrice: 25000 }),
    ]);

    // 2. THEN: Get French/European
    const europeanQueries = await Promise.all([
        fetchCars({ make: 'Renault', sort: 'price_asc', limit: 8, minPrice: 2000, maxPrice: 15000 }),
        fetchCars({ make: 'Peugeot', sort: 'price_asc', limit: 8, minPrice: 2000, maxPrice: 15000 }),
        fetchCars({ make: 'Opel', sort: 'price_asc', limit: 8, minPrice: 2000, maxPrice: 15000 }),
        fetchCars({ make: 'Ford', sort: 'price_asc', limit: 8, minPrice: 2000, maxPrice: 15000 }),
    ]);

    // 3. FINALLY: Get Korean popular models
    const koreanQueries = await Promise.all([
        fetchCars({ make: 'Hyundai', sort: 'price_asc', limit: 8, minPrice: 2000, maxPrice: 15000 }),
        fetchCars({ make: 'Kia', sort: 'price_asc', limit: 8, minPrice: 2000, maxPrice: 15000 }),
    ]);

    // Combine all results
    const allGerman = germanQueries.flatMap(q => q?.cars || []);
    const allEuropean = europeanQueries.flatMap(q => q?.cars || []);
    const allKorean = koreanQueries.flatMap(q => q?.cars || []);

    // Score function for Kosovo market
    const scoreCar = (car: any) => {
        let score = 0;
        const brand = car.make || '';
        const model = car.model || '';
        const fullName = `${brand} ${model}`.toLowerCase();

        // Brand score - German premium gets highest
        if (brand.includes('Mercedes')) score += 100;
        else if (brand.includes('BMW')) score += 98;
        else if (brand.includes('Audi')) score += 96;
        else if (brand.includes('Volkswagen')) score += 90;
        else if (brand.includes('Porsche')) score += 95;

        // Other European brands
        else if (brand.includes('Renault')) score += 70;
        else if (brand.includes('Peugeot')) score += 68;
        else if (brand.includes('Opel')) score += 65;
        else if (brand.includes('Ford')) score += 63;
        else if (brand.includes('Fiat')) score += 60;

        // Korean brands
        else if (brand.includes('Hyundai')) score += 55;
        else if (brand.includes('Kia')) score += 53;

        // Everything else
        else score += 30;

        // Model popularity boost
        const popularModels: Record<string, string[]> = {
            'audi': ['a4', 'a6', 'q5', 'a3', 'q7'],
            'bmw': ['3', '5', 'x3', 'x5', '1', 'x1'],
            'mercedes': ['c', 'e', 'glc', 'gle', 'a'],
            'volkswagen': ['golf', 'passat', 'tiguan', 'polo', 'touran']
        };

        for (const [b, models] of Object.entries(popularModels)) {
            if (brand.toLowerCase().includes(b)) {
                models.forEach(m => {
                    if (fullName.includes(m)) score += 30;
                });
            }
        }

        // FUEL TYPE - Diesel is king in Kosovo
        if (car.fuelType === 'Diesel') score += 60;
        else if (car.fuelType === 'Gasoline') score += 30;

        // AGE - newer is better
        const age = new Date().getFullYear() - car.year;
        if (age <= 3) score += 50;
        else if (age <= 5) score += 45;
        else if (age <= 8) score += 35;
        else if (age <= 10) score += 25;
        else if (age <= 15) score += 15;

        // PRICE - sweet spot for Kosovo
        if (car.price < 5000) score += 40; // Great deal
        else if (car.price < 8000) score += 35;
        else if (car.price < 10000) score += 30;
        else if (car.price < 15000) score += 20;
        else if (car.price < 20000) score += 10;

        // MILEAGE - lower is better
        if (car.mileage < 50000) score += 40;
        else if (car.mileage < 100000) score += 30;
        else if (car.mileage < 150000) score += 20;
        else if (car.mileage < 200000) score += 10;

        // Filter out unwanted Korean domestic models
        const excludeKeywords = ['ray', 'morning', 'twizy', 'k5', 'k7', 'k8', 'k9', 'mohave'];
        const shouldExclude = excludeKeywords.some(k => fullName.includes(k));
        if (shouldExclude) score = -1000;

        return score;
    };

    // Score and combine all cars
    const allCars = [...allGerman, ...allEuropean, ...allKorean]
        .map(car => ({ ...car, kosovoScore: scoreCar(car) }))
        .filter(car => car.kosovoScore > 0)
        .sort((a, b) => b.kosovoScore - a.kosovoScore);

    // Separate into categories
    const germanCars = allCars.filter(c =>
        ['Mercedes', 'BMW', 'Audi', 'Volkswagen', 'Porsche'].some(b => c.make?.includes(b))
    ).slice(0, 8);

    const topPicks = allCars.slice(0, 8);

    const dieselCars = allCars.filter(c =>
        c.fuelType === 'Diesel' && c.price < 10000 && c.kosovoScore > 150
    ).slice(0, 6);

    const affordableCars = allCars.filter(c =>
        c.price < 7000 && c.kosovoScore > 100
    ).slice(0, 6);

    return (
        <div className="container-custom py-12">
            {/* Hero Section */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-3">
                    🇽🇰 Makina për Tregun Kosovar
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Makinat më të kërkuara në Kosovë - të gatshme për import nga Korea
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {germanCars.length}
                    </div>
                    <div className="text-sm">Gjermane</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {allCars.filter(c => c.fuelType === 'Diesel').length}
                    </div>
                    <div className="text-sm">Diesel</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {allCars.filter(c => c.year > 2018).length}
                    </div>
                    <div className="text-sm">2019+</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {allCars.filter(c => c.price < 8000).length}
                    </div>
                    <div className="text-sm">Nën €8,000</div>
                </div>
            </div>

            {/* German Cars - Priority #1 */}
            {germanCars.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center">
                            <span className="bg-primary text-white px-4 py-1 rounded-full text-sm mr-3">🇩🇪 GJERMANE</span>
                            Mercedes, BMW, Audi, VW
                        </h2>
                        <Link href="/cars?make=BMW&make=Audi&make=Mercedes&make=Volkswagen"
                            className="text-ferrari-red hover:underline text-sm">
                            Shiko të gjitha →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {germanCars.map((car: any) => (
                            <div key={car.id} className="relative">
                                <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                                    {Math.round(car.kosovoScore)}% Përputhje
                                </div>
                                <CarCard car={car} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Picks - Best overall */}
            {topPicks.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center">
                            <span className="bg-ferrari-red text-white px-4 py-1 rounded-full text-sm mr-3">⭐ TOP 8</span>
                            Ofertat më të mira
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topPicks.map((car: any) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                </div>
            )}

            {/* Diesel Specials */}
            {dieselCars.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center">
                            <span className="bg-primary text-white px-4 py-1 rounded-full text-sm mr-3">⛽ DIESEL</span>
                            Oferta Diesel nën €10,000
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dieselCars.map((car: any) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                </div>
            )}

            {/* Affordable Options */}
            {affordableCars.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center">
                            <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm mr-3">💶 BUXHET</span>
                            Makina nën €7,000
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {affordableCars.map((car: any) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-r from-ferrari-red to-ferrari-dark text-white rounded-lg p-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-3">Interesuar për ndonjë makinë?</h3>
                    <p className="mb-6">Na kontaktoni për më shumë informacion dhe llogaritje të kostos totale</p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <a href="tel:+38345255388" className="bg-surface text-ferrari-red px-6 py-3 rounded-lg font-semibold hover:bg-secondary">
                            📞 +383 45 528 033
                        </a>
                        <a href="mailto:ma.webagency@outlook.com" className="bg-surface text-ferrari-red px-6 py-3 rounded-lg font-semibold hover:bg-secondary">
                            ✉️ ma.webagency@outlook.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}