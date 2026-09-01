// components/cars/CarDetailTabs.tsx
'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/ConfigContext';
import type { Car, HistoryItem, HistoryContent } from '@/lib/api'; // Add these imports
import {
    Fuel,
    Gauge,
    Calendar,
    Shield,
    AlertCircle,
    Car as CarIcon,
    Award,
    FileText,
    Cpu,
    Wind,
    Droplets,
    Zap,
    Cog,
    Layers,
    Users,
    GaugeCircle,
    History,
    Settings,
    ClipboardCheck,
    CheckCircle,
    XCircle
} from 'lucide-react';
import {
    translateFuel,
    translateTransmission,
    translateColor,
    translateBodyType
} from '@/lib/translations';
import RecallAlert from './RecallAlert';
import InspectionReport from './InspectionReport';
import OptionList from './OptionList';
import HistoryTimeline from './HistoryTimeline';

// Define the accident type from the API
interface Accident {
    date: string;
    insuranceBenefit: number;
    laborCost: number;
    paintingCost: number;
    partCost: number;
    type: string;
}

// Define the insurance type
interface InsuranceV2 {
    accidentCnt: number;
    accidents: Accident[];
    myAccidentCnt: number;
    myAccidentCost: number;
    otherAccidentCnt: number;
    otherAccidentCost: number;
    totalLossCnt: number;
    floodTotalLossCnt: number;
    robberCnt: number;
    ownerChangeCnt: number;
}

// Define the details type
interface CarDetails {
    engine_volume?: number;
    badge?: string;
    description_ko?: string;
    description_en?: string;
    seats_count?: number;
    insurance_v2?: InsuranceV2;
    history?: HistoryItem[]; // Use imported type
    inspect_outer?: any[];
    first_registration?: {
        year: number;
        month: number;
        day: number;
    };
    options?: {
        choice: string[];
        etc: string[];
        standard: string[];
        tuning: string[];
        type: string;
    };
    original_price?: number;
}

// Extend the Lot type to include details
interface ExtendedLot {
    details?: CarDetails;
    odometer?: {
        km: number;
        mi: number;
    };
}

// Approximate exchange rate: 1 EUR = 1450 KRW (adjust as needed)
const KRW_TO_EUR = 1450;

interface CarDetailTabsProps {
    car: Car;
}

export default function CarDetailTabs({ car }: CarDetailTabsProps) {
    const { formatPrice } = useConfig();
    const [activeTab, setActiveTab] = useState<'specs' | 'model' | 'insurance' | 'history' | 'inspection' | 'recalls' | 'options'>('specs');

    // Cast the lot to our extended type
    const lot = car.lots?.[0] as ExtendedLot | undefined;
    const details = lot?.details;

    // Rich data from the provider's encar_details payload
    const encarFull = car.encar_details?.full;
    const accidentHistory = car.encar_details?.accident_history;
    const insuranceHistory = accidentHistory?.insuranceHistory;
    const inspectionReport = encarFull?.inspection_report;
    const equipment = encarFull?.equipment;
    const condition = car.condition || encarFull?.condition;
    const listing = car.listing || encarFull?.listing;

    // Extract recalls from history - now using imported types
    const recalls = (details?.history?.filter((item: HistoryItem) =>
        item.content?.some((content: HistoryContent) =>
            content.title?.includes('Recall') ||
            content.flag?.includes('Recall')
        )
    ) || []) as HistoryItem[];

    const hasOpenRecalls = recalls.some((recall: HistoryItem) =>
        recall.content?.some((c: HistoryContent) => c.flag === 'Recall required' || c.title?.includes('Recall required'))
    );

    const ownerCount = insuranceHistory?.ownerChanges?.length ?? details?.insurance_v2?.ownerChangeCnt ?? condition?.owners ?? 0;

    // Equipment/options: prefer rich {code,name} pairs from encar_details.full.equipment
    const optionGroups: {
        standard: (string | { code: string; name: string })[];
        choice: (string | { code: string; name: string })[];
        tuning: (string | { code: string; name: string })[];
        etc: (string | { code: string; name: string })[];
    } = {
        standard: equipment?.groups?.standard ?? details?.options?.standard ?? [],
        choice: equipment?.groups?.choice ?? details?.options?.choice ?? [],
        tuning: equipment?.groups?.tuning ?? details?.options?.tuning ?? [],
        etc: equipment?.groups?.etc ?? details?.options?.etc ?? [],
    };
    const totalOptions = optionGroups.standard.length + optionGroups.choice.length + optionGroups.tuning.length + optionGroups.etc.length;

    // Convert KRW to EUR
    const convertKRWtoEUR = (krwAmount: number): number => {
        if (!krwAmount) return 0;
        return Math.round(krwAmount / KRW_TO_EUR);
    };

    // Get engine details from the car data
    const getEngineDetails = () => {
        const engineVolume = details?.engine_volume;
        const hp = car.hp;
        const engineName = car.engine?.name;
        const fuel = car.fuel?.name;
        const transmission = car.transmission?.name;
        const cylinders = car.cylinders;

        return {
            volume: engineVolume ? `${engineVolume} cc` : 'N/A',
            hp: hp ? `${hp} HP` : 'N/A',
            engineCode: engineName || 'N/A',
            fuel: fuel ? translateFuel(fuel) : 'N/A',
            transmission: transmission ? translateTransmission(transmission) : 'N/A',
            cylinders: cylinders ? `${cylinders} cilindra` : 'N/A'
        };
    };

    // Get model details
    const getModelDetails = () => {
        const badge = details?.badge;
        const generation = car.generation?.name;
        const bodyType = car.body_type?.name;
        const year = car.year;
        const manufacturer = car.manufacturer?.name;
        const model = car.model?.name;
        const title = car.title;
        const color = car.color?.name;
        const firstReg = details?.first_registration;
        const firstRegStr = encarFull?.first_registered
            ? new Date(encarFull.first_registered).toISOString().slice(0, 10)
            : null;

        return {
            fullName: title || 'N/A',
            manufacturer: manufacturer || 'N/A',
            model: model || 'N/A',
            generation: generation || 'N/A',
            badge: badge || 'N/A',
            bodyType: bodyType ? translateBodyType(bodyType) : 'N/A',
            year: year || 'N/A',
            color: color ? translateColor(color) : 'N/A',
            vin: car.vin || 'N/A',
            firstRegDate: firstReg ? `${firstReg.year}-${firstReg.month}-${firstReg.day}` : firstRegStr
        };
    };

    // Get insurance details with converted amounts
    const getInsuranceDetails = () => {
        const insurance = details?.insurance_v2;

        // Prefer the rich accident_history.insuranceHistory payload
        if (accidentHistory?.insuranceHistory) {
            const ih = accidentHistory.insuranceHistory;
            const hasData = ih.totalIncidents || ih.ownIncidents || ih.otherIncidents || ih.claims?.length;

            const accidents = (ih.claims || []).map(claim => ({
                date: claim.date || 'N/A',
                insuranceBenefit: Math.round(claim.total_eur || 0),
                partCost: Math.round((claim.parts_krw || 0) / KRW_TO_EUR),
                laborCost: Math.round((claim.labour_krw || 0) / KRW_TO_EUR),
                paintingCost: Math.round((claim.paint_krw || 0) / KRW_TO_EUR),
                type: claim.kind === 'mine' ? '1' : claim.kind === 'other' ? '3' : '4'
            }));

            return {
                hasData: !!hasData,
                accidentCount: ih.totalIncidents || 0,
                myAccidentCount: ih.ownIncidents || 0,
                myAccidentCost: Math.round((ih.ownDamageKrw || 0) / KRW_TO_EUR),
                otherAccidentCount: ih.otherIncidents || 0,
                otherAccidentCost: Math.round((ih.otherPartyKrw || 0) / KRW_TO_EUR),
                totalLossCount: ih.totalLoss ? 1 : 0,
                floodTotalLossCount: 0,
                robberCount: 0,
                ownerChangeCount: ih.ownerChanges?.length || 0,
                accidents,
                flags: accidentHistory.flags
            };
        }

        if (!insurance) {
            return {
                hasData: false,
                accidentCount: 0,
                myAccidentCount: 0,
                otherAccidentCount: 0,
                myAccidentCost: 0,
                otherAccidentCost: 0,
                totalLossCount: 0,
                floodTotalLossCount: 0,
                robberCount: 0,
                ownerChangeCount: 0,
                accidents: [],
                flags: accidentHistory?.flags
            };
        }

        return {
            hasData: true,
            accidentCount: insurance.accidentCnt || 0,
            myAccidentCount: insurance.myAccidentCnt || 0,
            myAccidentCost: convertKRWtoEUR(insurance.myAccidentCost || 0),
            otherAccidentCount: insurance.otherAccidentCnt || 0,
            otherAccidentCost: convertKRWtoEUR(insurance.otherAccidentCost || 0),
            totalLossCount: insurance.totalLossCnt || 0,
            floodTotalLossCount: insurance.floodTotalLossCnt || 0,
            robberCount: insurance.robberCnt || 0,
            ownerChangeCount: insurance.ownerChangeCnt || 0,
            accidents: (insurance.accidents || []).map((acc: Accident) => ({
                ...acc,
                insuranceBenefit: convertKRWtoEUR(acc.insuranceBenefit || 0),
                partCost: convertKRWtoEUR(acc.partCost || 0),
                laborCost: convertKRWtoEUR(acc.laborCost || 0),
                paintingCost: convertKRWtoEUR(acc.paintingCost || 0)
            })),
            flags: accidentHistory?.flags
        };
    };

    // Get full specifications
    const getFullSpecs = () => {
        return {
            // Basic Info
            year: car.year,
            vin: car.vin || 'N/A',
            mileage: lot?.odometer?.km ? `${lot.odometer.km.toLocaleString()} km` : 'N/A',

            // Engine & Performance
            engineVolume: details?.engine_volume ? `${details.engine_volume} cc` : (encarFull?.displacement ? `${encarFull.displacement} cc` : 'N/A'),
            horsepower: car.hp ? `${car.hp} HP` : 'N/A',
            engineCode: car.engine?.name || 'N/A',
            fuel: car.fuel?.name ? translateFuel(car.fuel.name) : 'N/A',
            transmission: car.transmission?.name ? translateTransmission(car.transmission.name) : 'N/A',
            cylinders: car.cylinders ? `${car.cylinders} cilindra` : 'N/A',

            // Dimensions & Capacity
            seats: details?.seats_count ? `${details.seats_count} ulëse` : (encarFull?.seats ? `${encarFull.seats} ulëse` : 'N/A'),

            // Exterior
            color: car.color?.name ? translateColor(car.color.name) : 'N/A',
            bodyType: car.body_type?.name ? translateBodyType(car.body_type.name) : 'N/A',

            // Additional
            driveWheel: car.drive_wheel?.name || 'N/A',
            vehicleType: car.vehicle_type?.name || 'N/A',
        };
    };

    const engine = getEngineDetails();
    const modelDetails = getModelDetails();
    const insurance = getInsuranceDetails();
    const fullSpecs = getFullSpecs();

    return (
        <div className="bg-surface-2 rounded-xl border border-light/20 overflow-hidden">
            {/* Recall Alert - Show prominently if there are open recalls */}
            {hasOpenRecalls && <RecallAlert recalls={recalls} />}

            {/* Tab Headers */}
            <div className="flex flex-wrap border-b border-light/20">
                <button
                    onClick={() => setActiveTab('specs')}
                    className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative
                        ${activeTab === 'specs'
                            ? 'bg-orange-500 text-white'
                            : 'text-muted hover:text-primary hover:bg-surface-3/30'
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <FileText size={16} />
                        <span>Specifikime</span>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('model')}
                    className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative
                        ${activeTab === 'model'
                            ? 'bg-orange-500 text-white'
                            : 'text-muted hover:text-primary hover:bg-surface-3/30'
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <CarIcon size={16} />
                        <span>Tipi</span>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('insurance')}
                    className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative
                        ${activeTab === 'insurance'
                            ? 'bg-orange-500 text-white'
                            : 'text-muted hover:text-primary hover:bg-surface-3/30'
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Shield size={16} />
                        <span>Sigurimi</span>
                        {insurance.accidentCount > 0 && (
                            <span className={`
                                ml-1 px-1.5 py-0.5 text-xs rounded-full
                                ${activeTab === 'insurance'
                                    ? 'bg-white text-orange-500'
                                    : 'bg-orange-500/20 text-orange-500'
                                }
                            `}>
                                {insurance.accidentCount}
                            </span>
                        )}
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative
                        ${activeTab === 'history'
                            ? 'bg-orange-500 text-white'
                            : 'text-muted hover:text-primary hover:bg-surface-3/30'
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <History size={16} />
                        <span>Historiku</span>
                        {ownerCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-surface-3 text-muted">
                                {ownerCount}
                            </span>
                        )}
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('inspection')}
                    className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative
                        ${activeTab === 'inspection'
                            ? 'bg-orange-500 text-white'
                            : 'text-muted hover:text-primary hover:bg-surface-3/30'
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <ClipboardCheck size={16} />
                        <span>Inspektimi</span>
                        {inspectionReport ? (
                            (inspectionReport.panels?.length ?? 0) + (inspectionReport.mechanical_flagged?.length ?? 0) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-surface-3 text-muted">
                                {(inspectionReport.panels?.length ?? 0) + (inspectionReport.mechanical_flagged?.length ?? 0)}
                            </span>
                            )
                        ) : details?.inspect_outer && details.inspect_outer.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-500">
                                {details.inspect_outer.length}
                            </span>
                        )}
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('options')}
                    className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative
                        ${activeTab === 'options'
                            ? 'bg-orange-500 text-white'
                            : 'text-muted hover:text-primary hover:bg-surface-3/30'
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Settings size={16} />
                        <span>Opsionet</span>
                        {totalOptions > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-surface-3 text-muted">
                                {totalOptions}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-5">
                {/* Full Specifications Tab */}
                {activeTab === 'specs' && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
                            <FileText className="text-orange-500" size={20} />
                            Specifikime të Plota
                        </h3>

                        <div className="space-y-4">
                            {/* Basic Info Section */}
                            <div>
                                <h4 className="text-sm font-medium text-primary mb-2 border-b border-light/20 pb-1">Informacioni Bazë</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <SpecItem icon={<Calendar size={14} />} label="Viti" value={fullSpecs.year.toString()} />
                                    <SpecItem icon={<Gauge size={14} />} label="Kilometrazha" value={fullSpecs.mileage} />
                                    <SpecItem icon={<Users size={14} />} label="Ulëse" value={fullSpecs.seats} />
                                </div>
                            </div>

                            {/* Engine & Performance Section */}
                            <div>
                                <h4 className="text-sm font-medium text-primary mb-2 border-b border-light/20 pb-1">Motori & Performanca</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <SpecItem icon={<Cog size={14} />} label="Vëllimi" value={fullSpecs.engineVolume} />
                                    <SpecItem icon={<GaugeCircle size={14} />} label="Fuqia" value={fullSpecs.horsepower} />
                                    <SpecItem icon={<Fuel size={14} />} label="Karburanti" value={fullSpecs.fuel} />
                                    <SpecItem icon={<Zap size={14} />} label="Transmisioni" value={fullSpecs.transmission} />
                                    <SpecItem icon={<Layers size={14} />} label="Cilindrat" value={fullSpecs.cylinders} />
                                    <SpecItem icon={<Cpu size={14} />} label="Kodi i Motorit" value={fullSpecs.engineCode} />
                                </div>
                            </div>

                            {/* Exterior Section */}
                            <div>
                                <h4 className="text-sm font-medium text-primary mb-2 border-b border-light/20 pb-1">Eksterieri</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <SpecItem icon={<Droplets size={14} />} label="Ngjyra" value={fullSpecs.color} />
                                    <SpecItem icon={<CarIcon size={14} />} label="Tipi" value={fullSpecs.bodyType} />
                                    <SpecItem icon={<Wind size={14} />} label="Lëvizja" value={fullSpecs.driveWheel} />
                                    <SpecItem icon={<FileText size={14} />} label="VIN" value={fullSpecs.vin} colSpan={2} />
                                </div>
                            </div>

                            {/* First Registration */}
                            {modelDetails.firstRegDate && (
                                <div className="bg-surface-3/30 rounded-lg p-3">
                                    <span className="text-xs text-muted">Regjistrimi i parë:</span>
                                    <span className="text-sm font-medium text-primary ml-2">{modelDetails.firstRegDate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Model Tab */}
                {activeTab === 'model' && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
                            <CarIcon className="text-orange-500" size={20} />
                            Detajet e Modelit
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <SpecItem
                                icon={<CarIcon size={16} />}
                                label="Emri i Plotë"
                                value={modelDetails.fullName}
                                colSpan={2}
                            />

                            <SpecItem
                                icon={<Award size={16} />}
                                label="Prodhuesi"
                                value={modelDetails.manufacturer}
                            />

                            <SpecItem
                                icon={<FileText size={16} />}
                                label="Modeli"
                                value={modelDetails.model}
                            />

                            {modelDetails.generation !== 'N/A' && (
                                <SpecItem
                                    icon={<Layers size={16} />}
                                    label="Gjenerata"
                                    value={modelDetails.generation}
                                />
                            )}

                            {modelDetails.badge !== 'N/A' && (
                                <SpecItem
                                    icon={<Award size={16} />}
                                    label="Badge"
                                    value={modelDetails.badge}
                                />
                            )}

                            <SpecItem
                                icon={<CarIcon size={16} />}
                                label="Tipi i Karrocerisë"
                                value={modelDetails.bodyType}
                            />

                            <SpecItem
                                icon={<Calendar size={16} />}
                                label="Viti"
                                value={modelDetails.year.toString()}
                            />

                            <SpecItem
                                icon={<Droplets size={16} />}
                                label="Ngjyra"
                                value={modelDetails.color}
                            />

                            <SpecItem
                                icon={<FileText size={16} />}
                                label="VIN"
                                value={modelDetails.vin}
                                colSpan={2}
                            />
                        </div>
                    </div>
                )}

                {/* Insurance Tab */}
                {activeTab === 'insurance' && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
                            <Shield className="text-orange-500" size={20} />
                            Historiku i Sigurimit
                        </h3>

                        {!insurance.hasData ? (
                            <div className="text-center py-6 bg-surface-3/30 rounded-lg">
                                <Shield className="w-8 h-8 text-muted mx-auto mb-2" />
                                <p className="text-muted text-sm">Nuk ka të dhëna për sigurimin</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Insurance Summary */}
                                <div className="grid grid-cols-2 gap-3">
                                    <SpecItem
                                        icon={<AlertCircle size={16} />}
                                        label="Gjithsej Aksidente"
                                        value={insurance.accidentCount.toString()}
                                        highlight={insurance.accidentCount > 0}
                                    />

                                    <SpecItem
                                        icon={<AlertCircle size={16} />}
                                        label="Aksidente të Mia"
                                        value={insurance.myAccidentCount.toString()}
                                        highlight={insurance.myAccidentCount > 0}
                                    />

                                    <SpecItem
                                        icon={<AlertCircle size={16} />}
                                        label="Aksidente nga Të Tjerë"
                                        value={insurance.otherAccidentCount.toString()}
                                        highlight={insurance.otherAccidentCount > 0}
                                    />

                                    <SpecItem
                                        icon={<Users size={16} />}
                                        label="Ndërrim Pronësie"
                                        value={insurance.ownerChangeCount.toString()}
                                    />
                                </div>

                                {/* Cost Summary */}
                                {(insurance.myAccidentCost > 0 || insurance.otherAccidentCost > 0) && (
                                    <div className="bg-surface-3/30 rounded-lg p-3">
                                        <h4 className="text-xs font-medium text-primary mb-2">Kostot e Aksidenteve</h4>
                                        <div className="space-y-1 text-xs">
                                            {insurance.myAccidentCost > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted">Kosto nga aksidentet e mia:</span>
                                                    <span className="text-orange-500 font-medium">{formatPrice(insurance.myAccidentCost)}</span>
                                                </div>
                                            )}
                                            {insurance.otherAccidentCost > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted">Kosto nga aksidentet e të tjerëve:</span>
                                                    <span className="text-orange-500 font-medium">{formatPrice(insurance.otherAccidentCost)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Warning Indicators */}
                                {(
                                    insurance.totalLossCount > 0 ||
                                    insurance.floodTotalLossCount > 0 ||
                                    insurance.robberCount > 0 ||
                                    insurance.flags?.writeOff ||
                                    insurance.flags?.flood ||
                                    insurance.flags?.stolen ||
                                    insurance.flags?.encumbered
                                ) && (
                                    <div className="bg-error-bg border border-error-border rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-error-text shrink-0 mt-0.5" />
                                            <div className="text-sm text-error-text">
                                                {insurance.totalLossCount > 0 && <div>• Total Loss: {insurance.totalLossCount}</div>}
                                                {insurance.floodTotalLossCount > 0 && <div>• Dëmtime nga Përmbytja: {insurance.floodTotalLossCount}</div>}
                                                {insurance.robberCount > 0 && <div>• Vjedhje: {insurance.robberCount}</div>}
                                                {insurance.flags?.writeOff && <div>• E shkruar si humbje totale (write-off)</div>}
                                                {insurance.flags?.flood && <div>• Dëmtim nga përmbytja (flood)</div>}
                                                {insurance.flags?.stolen && <div>• E vjedhur më parë</div>}
                                                {insurance.flags?.encumbered && <div>• E lënë si peng / e ngarkuar</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Accident List */}
                                {insurance.accidents && insurance.accidents.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-primary mb-2">Aksidentet e Regjistruara</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                            {insurance.accidents.map((accident: Accident, index: number) => (
                                                <div key={index} className="bg-surface-3/30 rounded-lg p-3 text-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-muted">Data: {accident.date || 'N/A'}</span>
                                                        <span className={`
                                                            px-2 py-0.5 rounded-full text-xs
                                                            ${accident.type === '1' ? 'bg-error-bg text-error-text' :
                                                                accident.type === '2' ? 'bg-warning-bg text-warning-text' :
                                                                    'bg-info-bg text-info-text'}
                                                        `}>
                                                            {accident.type === '1' ? 'Me fajin tim' :
                                                                accident.type === '2' ? 'Dëmtim i makinës time' :
                                                                    accident.type === '3' ? 'Shkaktuar nga tjetri' : 'Tjetër'}
                                                        </span>
                                                    </div>
                                                    {accident.insuranceBenefit > 0 && (
                                                        <div className="text-xs text-muted">
                                                            Përfitimi: {formatPrice(accident.insuranceBenefit)}
                                                        </div>
                                                    )}
                                                    {(accident.partCost > 0 || accident.laborCost > 0 || accident.paintingCost > 0) && (
                                                        <div className="mt-1 text-xs text-muted">
                                                            {accident.partCost > 0 && <span>Pjesë: {formatPrice(accident.partCost)} </span>}
                                                            {accident.laborCost > 0 && <span>Punë: {formatPrice(accident.laborCost)} </span>}
                                                            {accident.paintingCost > 0 && <span>Lyera: {formatPrice(accident.paintingCost)}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
                            <History className="text-orange-500" size={20} />
                            Historiku i Automjetit
                        </h3>
                        <HistoryTimeline history={details?.history} ownerCount={ownerCount} />
                    </div>
                )}

                {/* Inspection Tab */}
                {activeTab === 'inspection' && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
                            <ClipboardCheck className="text-orange-500" size={20} />
                            Raporti i Inspektimit
                        </h3>

                        {inspectionReport && inspectionReport.available && (
                            <>
                                {/* Inspection summary */}
                                <div className="grid grid-cols-2 gap-3">
                                    <SpecItem
                                        icon={inspectionReport.accident ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                        label="Dëmtime nga aksidenti"
                                        value={inspectionReport.accident ? 'Po' : 'Jo'}
                                        highlight={inspectionReport.accident}
                                    />
                                    <SpecItem
                                        icon={inspectionReport.simple_repair ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                        label="Riparime të thjeshta"
                                        value={inspectionReport.simple_repair ? 'Po' : 'Jo'}
                                        highlight={inspectionReport.simple_repair}
                                    />
                                    <SpecItem
                                        icon={<AlertCircle size={16} />}
                                        label="Pllaka të dëmtuara"
                                        value={String(inspectionReport.panels?.length || 0)}
                                        highlight={(inspectionReport.panels?.length || 0) > 0}
                                    />
                                    <SpecItem
                                        icon={<AlertCircle size={16} />}
                                        label="Pllaka strukturore"
                                        value={String(inspectionReport.panels_structural || 0)}
                                        highlight={(inspectionReport.panels_structural || 0) > 0}
                                    />
                                </div>

                                {/* mechanical check */}
                                {inspectionReport.mechanical_checked > 0 && (
                                    <div className={`
                                        rounded-lg p-3 text-sm
                                        ${inspectionReport.mechanical_all_clear
                                            ? 'bg-success-bg border border-success-border text-success-text'
                                            : 'bg-warning-bg border border-warning-border text-warning-text'
                                        }
                                    `}>
                                        <div className="flex items-center gap-2">
                                            {inspectionReport.mechanical_all_clear
                                                ? <CheckCircle size={16} />
                                                : <AlertCircle size={16} />}
                                            <span className="font-medium">
                                                Pjesa mekanike: {inspectionReport.mechanical_all_clear ? 'e pastër' : 'ka devijime'}
                                            </span>
                                            <span className="ml-auto text-xs">
                                                {inspectionReport.mechanical_checked} kontrollime
                                            </span>
                                        </div>
                                        {inspectionReport.mechanical_flagged?.length > 0 && (
                                            <ul className="mt-2 space-y-1 list-disc pl-5 text-xs">
                                                {inspectionReport.mechanical_flagged.map((flag: any, i: number) => (
                                                    <li key={i}>{typeof flag === 'string' ? flag : JSON.stringify(flag)}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {inspectionReport.filed_on && (
                                    <p className="text-xs text-muted">
                                        Inspektimi i kryer më: {inspectionReport.filed_on}
                                    </p>
                                )}
                            </>
                        )}

                        {(!inspectionReport || !inspectionReport.available) && details?.inspect_outer && (
                            <InspectionReport inspections={details.inspect_outer} />
                        )}

                        {(!inspectionReport || !inspectionReport.available) && (!details?.inspect_outer || details.inspect_outer.length === 0) && (
                            <div className="text-center py-6 bg-surface-3/30 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-success-text mx-auto mb-2" />
                                <p className="text-muted text-sm">Nuk ka dëmtime të raportuara nga inspektimi</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Options Tab */}
                {activeTab === 'options' && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-medium text-primary mb-3 flex items-center gap-2">
                            <Settings className="text-orange-500" size={20} />
                            Opsionet dhe Pajisjet
                        </h3>

                        <div className="space-y-3">
                            {optionGroups.standard.length > 0 && (
                                <OptionList
                                    options={optionGroups.standard}
                                    title="Pajisjet Standarde"
                                />
                            )}

                            {optionGroups.choice.length > 0 && (
                                <OptionList
                                    options={optionGroups.choice}
                                    title="Opsionet e Zgjedhura"
                                />
                            )}

                            {optionGroups.tuning.length > 0 && (
                                <OptionList
                                    options={optionGroups.tuning}
                                    title="Tuning / Modifikime"
                                />
                            )}

                            {optionGroups.etc.length > 0 && (
                                <OptionList
                                    options={optionGroups.etc}
                                    title="Të Tjera"
                                />
                            )}

                            {totalOptions === 0 && (
                                <div className="text-center py-6 bg-surface-3/30 rounded-lg">
                                    <Settings className="w-8 h-8 text-muted mx-auto mb-2" />
                                    <p className="text-muted text-sm">Nuk ka të dhëna për opsionet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper component for consistent spec items
function SpecItem({
    icon,
    label,
    value,
    colSpan = 1,
    highlight = false
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    colSpan?: number;
    highlight?: boolean;
}) {
    return (
        <div className={`
            bg-surface-3/30 rounded-lg p-3
            ${colSpan === 2 ? 'col-span-2' : ''}
            ${highlight ? 'border border-orange-primary/30' : ''}
        `}>
            <div className="flex items-center gap-2 text-xs text-muted mb-1">
                <span className="text-orange-500">{icon}</span>
                <span>{label}</span>
            </div>
            <div className={`
                text-sm font-medium
                ${highlight ? 'text-orange-500' : 'text-primary'}
            `}>
                {value}
            </div>
        </div>
    );
}