import { Shield, Clock, Gauge } from 'lucide-react';

interface WarrantyInfoProps {
    warranty?: {
        bodyMonth?: number | null;
        bodyMileage?: number | null;
        transmissionMonth?: number | null;
        transmissionMileage?: number | null;
    } | null;
}

export default function WarrantyInfo({ warranty }: WarrantyInfoProps) {
    // Safe checks with optional chaining and nullish coalescing
    const hasBodyWarranty = (warranty?.bodyMonth ?? 0) > 0;
    const hasTransmissionWarranty = (warranty?.transmissionMonth ?? 0) > 0;
    const hasAnyWarranty = hasBodyWarranty || hasTransmissionWarranty;

    if (!warranty || !hasAnyWarranty) {
        return (
            <div className="bg-surface rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-2 flex items-center">
                    <Shield size={18} className="mr-2 text-ferrari-red" />
                    Garancia
                </h3>
                <p className="text-sm text-secondary">
                    Kontaktoni shitësin për informacion rreth garancisë.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="font-bold mb-4 flex items-center">
                <Shield size={18} className="mr-2 text-ferrari-red" />
                Garancia
            </h3>

            <div className="space-y-3">
                {/* Body/Engine Warranty */}
                {hasBodyWarranty && (
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Shield size={16} className="text-ferrari-red" />
                            <span className="font-medium">Motori</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <span className="flex items-center text-secondary">
                                <Clock size={14} className="mr-1" />
                                {warranty.bodyMonth} muaj
                            </span>
                            {(warranty.bodyMileage ?? 0) > 0 && (
                                <span className="flex items-center text-secondary">
                                    <Gauge size={14} className="mr-1" />
                                    {warranty.bodyMileage?.toLocaleString()} km
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Transmission Warranty */}
                {hasTransmissionWarranty && (
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Shield size={16} className="text-ferrari-red" />
                            <span className="font-medium">Transmisioni</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <span className="flex items-center text-secondary">
                                <Clock size={14} className="mr-1" />
                                {warranty.transmissionMonth} muaj
                            </span>
                            {(warranty.transmissionMileage ?? 0) > 0 && (
                                <span className="flex items-center text-secondary">
                                    <Gauge size={14} className="mr-1" />
                                    {warranty.transmissionMileage?.toLocaleString()} km
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Warranty Note */}
            <div className="mt-4 pt-4 border-t border-theme">
                <p className="text-xs text-secondary">
                    * Garancia vlen sipas kushteve të shitësit në Kore
                </p>
            </div>
        </div>
    );
}
