// components/cars/InspectionReport.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import type { InspectItem } from '@/lib/api';

interface InspectionReportProps {
    inspections?: InspectItem[];
}

export default function InspectionReport({ inspections }: InspectionReportProps) {
    const [expanded, setExpanded] = useState(false);

    if (!inspections || inspections.length === 0) {
        return (
            <div className="bg-surface-2 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-secondary">Nuk ka dëmtime të raportuara nga inspektimi i jashtëm</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                    <AlertCircle className="text-orange-500" size={16} />
                    Dëmtimet e jashtme ({inspections.length})
                </h3>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-muted hover:text-primary flex items-center gap-1"
                >
                    {expanded ? 'Më pak' : 'Shiko të gjitha'}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            <div className="space-y-2">
                {inspections.slice(0, expanded ? undefined : 3).map((item, index) => (
                    <div key={index} className="bg-surface-3/30 rounded-lg p-3 border border-light/10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-primary">{item.type.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {item.attributes.map((attr, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full"
                                        >
                                            {attr.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                {item.statusTypes.map((status, idx) => (
                                    <span
                                        key={idx}
                                        className={`text-xs px-2 py-0.5 rounded-full ${status.title.includes('replacement')
                                                ? 'bg-orange-500/10 text-orange-500'
                                                : status.title.includes('repair')
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-gray-500/10 text-gray-500'
                                            }`}
                                    >
                                        {status.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {inspections.length > 3 && !expanded && (
                <p className="text-xs text-muted text-center">
                    +{inspections.length - 3} dëmtime të tjera
                </p>
            )}
        </div>
    );
}