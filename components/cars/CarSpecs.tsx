import {
    Calendar, Gauge, Fuel, Settings,
    Droplets, Users, Palette, Wind,
    Zap, Thermometer, Cog, Shield
} from 'lucide-react';

interface CarSpecsProps {
    car: any;
}

export default function CarSpecs({ car }: CarSpecsProps) {
    const specs = [
        { icon: Calendar, label: 'Viti i prodhimit', value: car.year },
        { icon: Gauge, label: 'Kilometrazha', value: `${car.mileage?.toLocaleString()} km` },
        { icon: Fuel, label: 'Karburanti', value: car.fuelType === 'Diesel' ? 'Naftë' : car.fuelType === 'Gasoline' ? 'Benzinë' : car.fuelType },
        { icon: Settings, label: 'Transmisioni', value: car.transmission === 'Automatic' ? 'Automatik' : 'Manuel' },
        { icon: Cog, label: 'Lëvizja', value: car.drivetrain === 'FWD' ? 'Para' : car.drivetrain === 'RWD' ? 'Pasme' : '4x4' },
        { icon: Droplets, label: 'Kubikazha', value: car.displacement ? `${car.displacement} cm³` : 'N/A' },
        { icon: Users, label: 'Vendet', value: car.seatCount || 'N/A' },
        { icon: Palette, label: 'Ngjyra e jashtme', value: car.exteriorColor || 'N/A' },
        { icon: Wind, label: 'Ngjyra e brendshme', value: car.interiorColor || 'N/A' },
        { icon: Zap, label: 'Fuqia', value: car.engineDetails || 'N/A' },
    ];

    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Specifikimet teknike</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specs.map((spec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-secondary rounded-lg">
                        <spec.icon className="text-ferrari-red mt-1 flex-shrink-0" size={18} />
                        <div>
                            <p className="text-xs text-secondary">{spec.label}</p>
                            <p className="font-medium">{spec.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
