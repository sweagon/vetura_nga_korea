// lib/staticManufacturers.ts

// List of manufacturer IDs prioritized for Kosovo market (based on actual market presence)
export const KEEP_MANUFACTURER_IDS = [
    // 🇩🇪 GERMAN CARS - Most popular in Kosovo (by far)
    147, // Volkswagen - THE most popular (Golf, Passat, Tiguan are everywhere)
    88,  // Mercedes-Benz - Extremely popular (status symbol)
    16,  // BMW - Extremely popular (3 Series, 5 Series)
    9,   // Audi - Very popular (A4, A6, Q5)
    102, // Opel - Very popular (Astra, Corsa - affordable German)

    // 🇫🇷 FRENCH CARS - Very popular for budget/value
    107, // Peugeot - Very popular (206, 307, Partner)
    28,  // Citroen - Very popular (C3, C4, Berlingo)
    117, // Renault - Very popular (Clio, Megane, Kangoo)
    123, // Renault Samsung - Korean Renaults (QM6, SM6)

    // 🇷🇴 ROMANIAN - Dacia is everywhere (budget king)
    31,  // Dacia - Extremely popular (Duster, Sandero, Logan)

    // 🇨🇿 CZECH - Skoda is very popular
    127, // Skoda - Very popular (Octavia, Fabia, Superb)

    // 🇪🇸 SPANISH - SEAT (VW group)
    126, // SEAT - Popular (Leon, Ibiza)

    // 🇬🇧 BRITISH LUXURY - Status symbols
    74,  // Land Rover - Very popular (Range Rover, Discovery)
    67,  // Jaguar - Popular

    // 🇮🇹 ITALIAN
    47,  // Fiat - Popular (Panda, 500, Doblo)
    3,   // Alfa Romeo - Niche but present

    // 🇯🇵 JAPANESE - Reliable, popular
    140, // Toyota - Very popular (Corolla, RAV4, Yaris)
    56,  // Honda - Popular (Civic, CR-V)
    99,  // Nissan - Popular (Qashqai, Juke, Micra)
    85,  // Mazda - Popular (3, 6, CX-5)
    95,  // Mitsubishi - Popular (Pajero, L200)
    133, // Suzuki - Popular (Swift, Vitara)
    132, // Subaru - Less common

    // 🇰🇷 KOREAN - Growing popularity
    58,  // Hyundai - Very popular (i30, Tucson, Santa Fe)
    70,  // Kia - Very popular (Sportage, Ceed, Picanto)
    131, // SsangYong - Popular SUVs (Rexton, Korando)

    // 🇺🇸 AMERICAN
    48,  // Ford - Popular (Focus, Fiesta, Transit)
    68,  // Jeep - Popular SUVs (Cherokee, Grand Cherokee)
    26,  // Chevrolet - Present (Spark, Cruze)

    // 🇸🇪 SWEDISH
    148, // Volvo - Popular for safety (XC90, V40)

    // 🇯🇵 JAPANESE LUXURY
    76,  // Lexus - Luxury
    60,  // Infiniti - Rare

    // 🇩🇪 GERMAN LUXURY/SPORTS
    110, // Porsche - Aspirational

    // 🇮🇹 ITALIAN LUXURY
    83,  // Maserati - Rare

    // 🇬🇧 BRITISH ULTRA LUXURY
    13,  // Bentley - Very rare
    118, // Rolls-Royce - Very rare
    8,   // Aston Martin - Very rare
    78,  // Lotus - Very rare

    // 🇮🇹 ITALIAN SUPERCARS
    72,  // Lamborghini - Very rare
    46,  // Ferrari - Very rare

    // 🇬🇧 BRITISH SUPERCARS
    86,  // McLaren - Very rare

    // 🇯🇵 JAPANESE LUXURY (continued)
    2,   // Acura - Very rare
    232, // Genesis - Rare

    // 🇺🇸 AMERICAN LUXURY
    21,  // Cadillac - Rare
    77,  // Lincoln - Rare

    // 🇩🇪 GERMAN COMPACT
    94,  // Mini - Niche
    128, // Smart - Niche
];

// Kosovo market priority order (based on actual popularity)
export const KOSOVO_MANUFACTURER_ORDER = [
    // TIER 1: German cars (most popular)
    'Volkswagen',      // #1 - Golf, Passat, Tiguan everywhere
    'Mercedes-Benz',   // #2 - Status symbol, E-Class, C-Class
    'BMW',             // #3 - 3 Series, 5 Series, X5
    'Audi',            // #4 - A4, A6, Q5, Q7
    'Opel',            // #5 - Astra, Corsa (affordable German)

    // TIER 2: French & Budget European
    'Peugeot',         // #6 - 206, 307, Partner (very common)
    'Citroen',         // #7 - C3, C4, Berlingo (very common)
    'Renault',         // #8 - Clio, Megane, Kangoo (very common)
    'Renault Samsung', // #9 - Korean Renaults (common)
    'Dacia',           // #10 - Duster, Sandero, Logan (extremely popular for budget)
    'Skoda',           // #11 - Octavia, Fabia (very popular)
    'SEAT',            // #12 - Leon, Ibiza (popular)

    // TIER 3: British Luxury
    'Land Rover',      // #13 - Range Rover (status symbol)
    'Jaguar',          // #14 - Luxury

    // TIER 4: Italian
    'Fiat',            // #15 - Panda, 500, Doblo (common)
    'Alfa Romeo',      // #16 - Niche

    // TIER 5: Japanese
    'Toyota',          // #17 - Corolla, RAV4 (very popular)
    'Honda',           // #18 - Civic, CR-V (popular)
    'Nissan',          // #19 - Qashqai, Juke (very popular)
    'Mazda',           // #20 - 3, 6, CX-5 (popular)
    'Mitsubishi',      // #21 - Pajero, L200 (popular SUVs/trucks)
    'Suzuki',          // #22 - Swift, Vitara (popular small cars)
    'Subaru',          // #23 - Less common

    // TIER 6: Korean
    'Hyundai',         // #24 - i30, Tucson, Santa Fe (very popular)
    'Kia',             // #25 - Sportage, Ceed, Picanto (very popular)
    'SsangYong',       // #26 - Rexton, Korando (popular SUVs)

    // TIER 7: American
    'Ford',            // #27 - Focus, Fiesta, Transit (popular)
    'Jeep',            // #28 - Cherokee, Grand Cherokee (popular SUVs)
    'Chevrolet',       // #29 - Spark, Cruze (present)

    // TIER 8: Swedish
    'Volvo',           // #30 - XC90, V40 (popular for safety)

    // TIER 9: Japanese Luxury
    'Lexus',           // #31 - Luxury
    'Infiniti',        // #32 - Rare

    // TIER 10: German Luxury
    'Porsche',         // #33 - Aspirational

    // TIER 11: Italian Luxury
    'Maserati',        // #34 - Rare

    // TIER 12: British Ultra Luxury
    'Bentley',         // #35 - Very rare
    'Rolls-Royce',     // #36 - Very rare
    'Aston Martin',    // #37 - Very rare
    'Lotus',           // #38 - Very rare

    // TIER 13: Italian Supercars
    'Lamborghini',     // #39 - Very rare
    'Ferrari',         // #40 - Very rare

    // TIER 14: British Supercars
    'McLaren',         // #41 - Very rare

    // TIER 15: Japanese/American Luxury
    'Acura',           // #42 - Very rare
    'Genesis',         // #43 - Rare
    'Cadillac',        // #44 - Rare
    'Lincoln',         // #45 - Rare

    // TIER 16: Niche
    'Mini',            // #46 - Niche
    'Smart'            // #47 - Niche
];

// Reordered STATIC_MANUFACTURERS with Kosovo market priorities
export const STATIC_MANUFACTURERS = [
    // TIER 1: German cars (most popular)
    { id: 147, name: 'Volkswagen', translated: 'Volkswagen' },
    { id: 88, name: 'Mercedes-Benz', translated: 'Mercedes-Benz' },
    { id: 16, name: 'BMW', translated: 'BMW' },
    { id: 9, name: 'Audi', translated: 'Audi' },
    { id: 102, name: 'Opel', translated: 'Opel' },

    // TIER 2: French & Budget European
    { id: 107, name: 'Peugeot', translated: 'Peugeot' },
    { id: 28, name: 'Citroen', translated: 'Citroen' },
    { id: 117, name: 'Renault', translated: 'Renault' },
    { id: 123, name: 'Renault Samsung', translated: 'Renault Samsung' },
    { id: 31, name: 'Dacia', translated: 'Dacia' },
    { id: 127, name: 'Skoda', translated: 'Skoda' },
    { id: 126, name: 'SEAT', translated: 'SEAT' },

    // TIER 3: British Luxury
    { id: 74, name: 'Land Rover', translated: 'Land Rover' },
    { id: 67, name: 'Jaguar', translated: 'Jaguar' },

    // TIER 4: Italian
    { id: 47, name: 'Fiat', translated: 'Fiat' },
    { id: 3, name: 'Alfa Romeo', translated: 'Alfa Romeo' },

    // TIER 5: Japanese
    { id: 140, name: 'Toyota', translated: 'Toyota' },
    { id: 56, name: 'Honda', translated: 'Honda' },
    { id: 99, name: 'Nissan', translated: 'Nissan' },
    { id: 85, name: 'Mazda', translated: 'Mazda' },
    { id: 95, name: 'Mitsubishi', translated: 'Mitsubishi' },
    { id: 133, name: 'Suzuki', translated: 'Suzuki' },
    { id: 132, name: 'Subaru', translated: 'Subaru' },

    // TIER 6: Korean
    { id: 58, name: 'Hyundai', translated: 'Hyundai' },
    { id: 70, name: 'Kia', translated: 'Kia' },
    { id: 131, name: 'SsangYong', translated: 'SsangYong' },

    // TIER 7: American
    { id: 48, name: 'Ford', translated: 'Ford' },
    { id: 68, name: 'Jeep', translated: 'Jeep' },
    { id: 26, name: 'Chevrolet', translated: 'Chevrolet' },

    // TIER 8: Swedish
    { id: 148, name: 'Volvo', translated: 'Volvo' },

    // TIER 9: Japanese Luxury
    { id: 76, name: 'Lexus', translated: 'Lexus' },
    { id: 60, name: 'Infiniti', translated: 'Infiniti' },

    // TIER 10: German Luxury
    { id: 110, name: 'Porsche', translated: 'Porsche' },

    // TIER 11: Italian Luxury
    { id: 83, name: 'Maserati', translated: 'Maserati' },

    // TIER 12: British Ultra Luxury
    { id: 13, name: 'Bentley', translated: 'Bentley' },
    { id: 118, name: 'Rolls-Royce', translated: 'Rolls-Royce' },
    { id: 8, name: 'Aston Martin', translated: 'Aston Martin' },
    { id: 78, name: 'Lotus', translated: 'Lotus' },

    // TIER 13: Italian Supercars
    { id: 72, name: 'Lamborghini', translated: 'Lamborghini' },
    { id: 46, name: 'Ferrari', translated: 'Ferrari' },

    // TIER 14: British Supercars
    { id: 86, name: 'McLaren', translated: 'McLaren' },

    // TIER 15: Japanese/American Luxury
    { id: 2, name: 'Acura', translated: 'Acura' },
    { id: 232, name: 'Genesis', translated: 'Genesis' },
    { id: 21, name: 'Cadillac', translated: 'Cadillac' },
    { id: 77, name: 'Lincoln', translated: 'Lincoln' },

    // TIER 16: Niche
    { id: 94, name: 'Mini', translated: 'Mini' },
    { id: 128, name: 'Smart', translated: 'Smart' },
];

// Function to filter manufacturers
export function filterManufacturers(manufacturers: Array<{ id: number; name: string }>) {
    return manufacturers.filter(m => KEEP_MANUFACTURER_IDS.includes(m.id));
}