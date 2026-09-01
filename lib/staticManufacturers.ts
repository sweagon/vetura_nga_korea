// lib/staticManufacturers.ts
// Kosovo-market manufacturer priority, keyed by the EXACT string IDs used by the
// live external API (api.bestautomarket.com). Manufacturer/model filtering uses
// these string IDs, not numeric IDs.

// Kosovo market priority order (based on actual popularity).
// Names MUST match the live API's manufacturer "id"/"name" strings.
export const KOSOVO_MANUFACTURER_ORDER = [
    // TIER 1: German cars (most popular)
    'Volkswagen',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Opel',

    // TIER 2: French & Budget European
    'Peugeot',
    'Citroen DS',
    'Renault',
    'Renault Korea (Samsung)',
    'Dacia',
    'Skoda',
    'SEAT',

    // TIER 3: British Luxury
    'Land Rover',
    'Jaguar',

    // TIER 4: Italian
    'Fiat',
    'Alfa Romeo',

    // TIER 5: Japanese
    'Toyota',
    'Honda',
    'Nissan',
    'Mazda',
    'Mitsubishi',
    'Suzuki',
    'Subaru',

    // TIER 6: Korean
    'Hyundai',
    'Kia',
    'KG Mobility (SsangYong)',

    // TIER 7: American
    'Ford',
    'Jeep',
    'Chevrolet (GM Daewoo)',
    'Chevrolet',

    // TIER 8: Swedish
    'Volvo',

    // TIER 9: Japanese Luxury
    'Lexus',
    'Infiniti',

    // TIER 10: German Luxury
    'Porsche',
    'Maybach',

    // TIER 11: Italian Luxury
    'Maserati',

    // TIER 12: British Ultra Luxury
    'Bentley',
    'Rolls-Royce',
    'Aston Martin',
    'Lotus',

    // TIER 13: Italian Supercars
    'Lamborghini',
    'Ferrari',

    // TIER 14: British Supercars
    'McLaren',

    // TIER 15: Japanese/American Luxury
    'Acura',
    'Genesis',
    'Cadillac',
    'Lincoln',

    // TIER 16: Niche
    'MINI',
    'smart',

    // Additional brands present in the API
    'Tesla',
    'BYD',
    'Polestar',
    'Dodge',
    'GMC',
    'Hummer',
    'Geely',
    'Chrysler',
    'Saab',
    'Xinyuan',
    'Dongfeng Sokon',
    'INEOS',
    'DFSK',
    'Mitsuoka',
    'Daihatsu',
    'Baic Yinxiang',
    'Others',
    'Other (domestic)',
    'Other (imported)',
    'etc',
];

// Display-name aliases for brands whose API name is verbose.
export const MANUFACTURER_ALIASES: Record<string, string> = {
    'Renault Korea (Samsung)': 'Renault Samsung',
    'KG Mobility (SsangYong)': 'SsangYong',
    'Chevrolet (GM Daewoo)': 'Chevrolet (GM Daewoo)',
    'MINI': 'Mini',
    'smart': 'Smart',
    'Citroen DS': 'Citroën',
};

export function getManufacturerDisplayName(apiName: string): string {
    return MANUFACTURER_ALIASES[apiName] || apiName;
}

// Kosovo-priority subset of manufacturers that exist in the live API.
// id = exact API string ID (used for filtering), translated = display name.
export const STATIC_MANUFACTURERS = [
    { id: 'Volkswagen', name: 'Volkswagen', translated: 'Volkswagen' },
    { id: 'Mercedes-Benz', name: 'Mercedes-Benz', translated: 'Mercedes-Benz' },
    { id: 'BMW', name: 'BMW', translated: 'BMW' },
    { id: 'Audi', name: 'Audi', translated: 'Audi' },
    { id: 'Opel', name: 'Opel', translated: 'Opel' },
    { id: 'Peugeot', name: 'Peugeot', translated: 'Peugeot' },
    { id: 'Citroen DS', name: 'Citroen DS', translated: 'Citroën' },
    { id: 'Renault', name: 'Renault', translated: 'Renault' },
    { id: 'Renault Korea (Samsung)', name: 'Renault Korea (Samsung)', translated: 'Renault Samsung' },
    { id: 'Dacia', name: 'Dacia', translated: 'Dacia' },
    { id: 'Skoda', name: 'Skoda', translated: 'Skoda' },
    { id: 'SEAT', name: 'SEAT', translated: 'SEAT' },
    { id: 'Land Rover', name: 'Land Rover', translated: 'Land Rover' },
    { id: 'Jaguar', name: 'Jaguar', translated: 'Jaguar' },
    { id: 'Fiat', name: 'Fiat', translated: 'Fiat' },
    { id: 'Alfa Romeo', name: 'Alfa Romeo', translated: 'Alfa Romeo' },
    { id: 'Toyota', name: 'Toyota', translated: 'Toyota' },
    { id: 'Honda', name: 'Honda', translated: 'Honda' },
    { id: 'Nissan', name: 'Nissan', translated: 'Nissan' },
    { id: 'Mazda', name: 'Mazda', translated: 'Mazda' },
    { id: 'Mitsubishi', name: 'Mitsubishi', translated: 'Mitsubishi' },
    { id: 'Suzuki', name: 'Suzuki', translated: 'Suzuki' },
    { id: 'Subaru', name: 'Subaru', translated: 'Subaru' },
    { id: 'Hyundai', name: 'Hyundai', translated: 'Hyundai' },
    { id: 'Kia', name: 'Kia', translated: 'Kia' },
    { id: 'KG Mobility (SsangYong)', name: 'KG Mobility (SsangYong)', translated: 'SsangYong' },
    { id: 'Ford', name: 'Ford', translated: 'Ford' },
    { id: 'Jeep', name: 'Jeep', translated: 'Jeep' },
    { id: 'Chevrolet (GM Daewoo)', name: 'Chevrolet (GM Daewoo)', translated: 'Chevrolet (GM Daewoo)' },
    { id: 'Chevrolet', name: 'Chevrolet', translated: 'Chevrolet' },
    { id: 'Volvo', name: 'Volvo', translated: 'Volvo' },
    { id: 'Lexus', name: 'Lexus', translated: 'Lexus' },
    { id: 'Infiniti', name: 'Infiniti', translated: 'Infiniti' },
    { id: 'Porsche', name: 'Porsche', translated: 'Porsche' },
    { id: 'Maybach', name: 'Maybach', translated: 'Maybach' },
    { id: 'Maserati', name: 'Maserati', translated: 'Maserati' },
    { id: 'Bentley', name: 'Bentley', translated: 'Bentley' },
    { id: 'Rolls-Royce', name: 'Rolls-Royce', translated: 'Rolls-Royce' },
    { id: 'Aston Martin', name: 'Aston Martin', translated: 'Aston Martin' },
    { id: 'Lotus', name: 'Lotus', translated: 'Lotus' },
    { id: 'Lamborghini', name: 'Lamborghini', translated: 'Lamborghini' },
    { id: 'Ferrari', name: 'Ferrari', translated: 'Ferrari' },
    { id: 'McLaren', name: 'McLaren', translated: 'McLaren' },
    { id: 'Acura', name: 'Acura', translated: 'Acura' },
    { id: 'Genesis', name: 'Genesis', translated: 'Genesis' },
    { id: 'Cadillac', name: 'Cadillac', translated: 'Cadillac' },
    { id: 'Lincoln', name: 'Lincoln', translated: 'Lincoln' },
    { id: 'MINI', name: 'MINI', translated: 'Mini' },
    { id: 'smart', name: 'smart', translated: 'Smart' },
    { id: 'Tesla', name: 'Tesla', translated: 'Tesla' },
    { id: 'BYD', name: 'BYD', translated: 'BYD' },
    { id: 'Polestar', name: 'Polestar', translated: 'Polestar' },
];
