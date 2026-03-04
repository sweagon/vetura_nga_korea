// lib/staticManufacturers.ts

// List of manufacturer IDs to keep (from your data)
export const KEEP_MANUFACTURER_IDS = [
    88,  // Mercedes-Benz
    16,  // BMW
    9,   // Audi
    110, // Porsche
    76,  // Lexus
    148, // Volvo
    74,  // Land Rover
    67,  // Jaguar
    21,  // Cadillac
    77,  // Lincoln
    60,  // Infiniti
    2,   // Acura
    232, // Genesis
    83,  // Maserati
    13,  // Bentley
    118, // Rolls-Royce
    72,  // Lamborghini
    46,  // Ferrari
    8,   // Aston Martin
    86,  // McLaren
    78,  // Lotus
    147, // Volkswagen
    102, // Opel
    107, // Peugeot
    28,  // Citroen
    117, // Renault
    47,  // Fiat
    3,   // Alfa Romeo
    126, // SEAT
    127, // Skoda
    31,  // Dacia
    140, // Toyota
    56,  // Honda
    99,  // Nissan
    85,  // Mazda
    95,  // Mitsubishi
    132, // Subaru
    133, // Suzuki
    58,  // Hyundai
    70,  // Kia
    131, // SsangYong
    26,  // Chevrolet
    48,  // Ford
    68,  // Jeep
    94,  // Mini
    128, // Smart
    123, // Renault Samsung
];

// Optional: Create a manual list if you want to hardcode them
export const STATIC_MANUFACTURERS = [
    { id: 88, name: 'Mercedes-Benz', translated: 'Mercedes-Benz' },
    { id: 16, name: 'BMW', translated: 'BMW' },
    { id: 9, name: 'Audi', translated: 'Audi' },
    { id: 110, name: 'Porsche', translated: 'Porsche' },
    { id: 76, name: 'Lexus', translated: 'Lexus' },
    { id: 148, name: 'Volvo', translated: 'Volvo' },
    { id: 74, name: 'Land Rover', translated: 'Land Rover' },
    { id: 67, name: 'Jaguar', translated: 'Jaguar' },
    { id: 21, name: 'Cadillac', translated: 'Cadillac' },
    { id: 77, name: 'Lincoln', translated: 'Lincoln' },
    { id: 60, name: 'Infiniti', translated: 'Infiniti' },
    { id: 2, name: 'Acura', translated: 'Acura' },
    { id: 232, name: 'Genesis', translated: 'Genesis' },
    { id: 83, name: 'Maserati', translated: 'Maserati' },
    { id: 13, name: 'Bentley', translated: 'Bentley' },
    { id: 118, name: 'Rolls-Royce', translated: 'Rolls-Royce' },
    { id: 72, name: 'Lamborghini', translated: 'Lamborghini' },
    { id: 46, name: 'Ferrari', translated: 'Ferrari' },
    { id: 8, name: 'Aston Martin', translated: 'Aston Martin' },
    { id: 86, name: 'McLaren', translated: 'McLaren' },
    { id: 78, name: 'Lotus', translated: 'Lotus' },
    { id: 147, name: 'Volkswagen', translated: 'Volkswagen' },
    { id: 102, name: 'Opel', translated: 'Opel' },
    { id: 107, name: 'Peugeot', translated: 'Peugeot' },
    { id: 28, name: 'Citroen', translated: 'Citroen' },
    { id: 117, name: 'Renault', translated: 'Renault' },
    { id: 47, name: 'Fiat', translated: 'Fiat' },
    { id: 3, name: 'Alfa Romeo', translated: 'Alfa Romeo' },
    { id: 126, name: 'SEAT', translated: 'SEAT' },
    { id: 127, name: 'Skoda', translated: 'Skoda' },
    { id: 31, name: 'Dacia', translated: 'Dacia' },
    { id: 140, name: 'Toyota', translated: 'Toyota' },
    { id: 56, name: 'Honda', translated: 'Honda' },
    { id: 99, name: 'Nissan', translated: 'Nissan' },
    { id: 85, name: 'Mazda', translated: 'Mazda' },
    { id: 95, name: 'Mitsubishi', translated: 'Mitsubishi' },
    { id: 132, name: 'Subaru', translated: 'Subaru' },
    { id: 133, name: 'Suzuki', translated: 'Suzuki' },
    { id: 58, name: 'Hyundai', translated: 'Hyundai' },
    { id: 70, name: 'Kia', translated: 'Kia' },
    { id: 131, name: 'SsangYong', translated: 'SsangYong' },
    { id: 26, name: 'Chevrolet', translated: 'Chevrolet' },
    { id: 48, name: 'Ford', translated: 'Ford' },
    { id: 68, name: 'Jeep', translated: 'Jeep' },
    { id: 94, name: 'Mini', translated: 'Mini' },
    { id: 128, name: 'Smart', translated: 'Smart' },
    { id: 123, name: 'Renault Samsung', translated: 'Renault Samsung' },
];

// Function to filter manufacturers
export function filterManufacturers(manufacturers: Array<{ id: number; name: string }>) {
    return manufacturers.filter(m => KEEP_MANUFACTURER_IDS.includes(m.id));
}