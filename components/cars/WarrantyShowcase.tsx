'use client';

interface WarrantyShowcaseProps {
    warranty: {
        bodyMonth?: number | null;
        bodyMileage?: number | null;
        transmissionMonth?: number | null;
        transmissionMileage?: number | null;
    } | null;
}

export default function WarrantyShowcase({ warranty }: WarrantyShowcaseProps) {
    // Safe checks with optional chaining and nullish coalescing
    const hasBodyWarranty = (warranty?.bodyMonth ?? 0) > 0;
    const hasTransmissionWarranty = (warranty?.transmissionMonth ?? 0) > 0;

    if (!hasBodyWarranty && !hasTransmissionWarranty) return null;

    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-success-bg0 rounded-full animate-pulse"></span>
                Garanci e përfshirë
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {hasBodyWarranty && (
                    <div className="bg-surface p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-secondary">Motori</p>
                        <p className="font-bold text-success-text">{warranty?.bodyMonth} muaj</p>
                        {(warranty?.bodyMileage ?? 0) > 0 && (
                            <p className="text-xs text-muted">
                                deri {warranty?.bodyMileage?.toLocaleString()} km
                            </p>
                        )}
                    </div>
                )}
                {hasTransmissionWarranty && (
                    <div className="bg-surface p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-secondary">Transmisioni</p>
                        <p className="font-bold text-success-text">{warranty?.transmissionMonth} muaj</p>
                        {(warranty?.transmissionMileage ?? 0) > 0 && (
                            <p className="text-xs text-muted">
                                deri {warranty?.transmissionMileage?.toLocaleString()} km
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
