// lib/translations.ts
// English to Albanian translations for car-related terms

import { STATIC_MANUFACTURERS } from './staticManufacturers';

export const manufacturerTranslations: Record<string, string> = {
    'Maserati': 'Maserati',
    'BMW': 'BMW',
    'Audi': 'Audi',
    'Mercedes-Benz': 'Mercedes-Benz',
    'Volkswagen': 'Volkswagen',
    'Hyundai': 'Hyundai',
    'Kia': 'Kia',
    'Genesis': 'Genesis',
    'Renault': 'Renault',
    'Chevrolet': 'Chevrolet',
    'Ford': 'Ford',
    'Toyota': 'Toyota',
    'Honda': 'Honda',
    'Nissan': 'Nissan',
    'Mazda': 'Mazda',
    'Mitsubishi': 'Mitsubishi',
    'Subaru': 'Subaru',
    'Jeep': 'Jeep',
    'Land Rover': 'Land Rover',
    'Jaguar': 'Jaguar',
    'Volvo': 'Volvo',
    'Porsche': 'Porsche',
    'Ferrari': 'Ferrari',
    'Lamborghini': 'Lamborghini',
    'Bentley': 'Bentley',
    'Rolls-Royce': 'Rolls-Royce',
    'Aston Martin': 'Aston Martin',
    'McLaren': 'McLaren',
    'Fiat': 'Fiat',
    'Opel': 'Opel',
    'Peugeot': 'Peugeot',
    'Citroen': 'Citroen',
    'Dacia': 'Dacia',
    'Seat': 'Seat',
    'Skoda': 'Skoda',
    'SsangYong': 'SsangYong',
    'Renault Samsung': 'Renault Samsung',
    'Alfa Romeo': 'Alfa Romeo',
    'Lotus': 'Lotus',
    'Smart': 'Smart',
    'Mini': 'Mini',
    'Infiniti': 'Infiniti',
    'Acura': 'Acura',
    'Cadillac': 'Cadillac',
    'Lincoln': 'Lincoln',
    'Suzuki': 'Suzuki',
    'Citroën': 'Citroën',
    'Maybach': 'Maybach',
    'Tesla': 'Tesla',
    'BYD': 'BYD',
    'Polestar': 'Polestar',
    // API names
    'Citroen DS': 'Citroën',
    'Renault Korea (Samsung)': 'Renault Samsung',
    'KG Mobility (SsangYong)': 'SsangYong',
    'Chevrolet (GM Daewoo)': 'Chevrolet (GM Daewoo)',
    'MINI': 'Mini',
    'smart': 'Smart',
    // Removed duplicate SsangYong entry
};

export const fuelTranslations: Record<string, string> = {
    'diesel': 'Naftë',
    'petrol': 'Benzinë',
    'gasoline': 'Benzinë',
    'electric': 'Elektrik',
    'hybrid': 'Hibrid',
    'lpg': 'LPG',
    'cng': 'CNG',
};

export const transmissionTranslations: Record<string, string> = {
    'automatic': 'Automatik',
    'manual': 'Manuel',
    'cvt': 'CVT',
    'semi-automatic': 'Gjysmë-automatik',
};

export const colorTranslations: Record<string, string> = {
    'black': 'Zi',
    'white': 'Bardhë',
    'silver': 'Argjend',
    'gray': 'Gri',
    'grey': 'Gri',
    'blue': 'Kaltër',
    'red': 'Kuq',
    'green': 'Gjelbër',
    'brown': 'Kafe',
    'beige': 'Bezhë',
    'yellow': 'Verdhë',
    'orange': 'Portokalli',
    'purple': 'Vjollcë',
    'gold': 'Arë',
};

export const bodyTypeTranslations: Record<string, string> = {
    'sedan': 'Sedan',
    'suv': 'SUV',
    'coupe': 'Kupe',
    'hatchback': 'Hatchback',
    'wagon': 'Kombi',
    'convertible': 'Kabriolet',
    'van': 'Furgon',
    'pickup': 'Pickup',
    'sport_car': 'Makinë Sportive',
    'sport': 'Makinë Sportive',
};

// Helper function to translate manufacturer names
export function translateManufacturer(manufacturer: string): string {
    return manufacturerTranslations[manufacturer] || manufacturer;
}

// Get static manufacturers with translations (returns format for CustomSelect)
export function getStaticManufacturers() {
    return STATIC_MANUFACTURERS.map(m => ({
        value: m.id.toString(),
        label: m.translated
    }));
}

// Helper to get sorted and translated manufacturers from API data
export function getTranslatedManufacturers(manufacturers: Array<{ id: string; name: string }>): Array<{ id: string; original: string; translated: string }> {
    return manufacturers
        .map(m => ({
            id: m.id,
            original: m.name,
            translated: translateManufacturer(m.name)
        }))
        .sort((a, b) => a.translated.localeCompare(b.translated));
}

// Helper to translate fuel types
export function translateFuel(fuel: string): string {
    return fuelTranslations[fuel.toLowerCase()] || fuel;
}

// Helper to translate transmission
export function translateTransmission(trans: string): string {
    return transmissionTranslations[trans.toLowerCase()] || trans;
}

// Helper to translate color
export function translateColor(color: string): string {
    return colorTranslations[color.toLowerCase()] || color;
}

// Helper to translate body type
export function translateBodyType(bodyType: string): string {
    return bodyTypeTranslations[bodyType.toLowerCase()] || bodyType;
}