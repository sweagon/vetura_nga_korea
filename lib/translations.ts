// lib/translations.ts
// English to Albanian translations for car-related terms

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
};

// Helper function to translate manufacturer names
export function translateManufacturer(manufacturer: string): string {
    return manufacturerTranslations[manufacturer] || manufacturer;
}

// Helper to get sorted and translated manufacturers
export function getTranslatedManufacturers(manufacturers: Array<{ id: number; name: string }>): Array<{ id: number; original: string; translated: string }> {
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