// components/cars/RecallAlert.tsx
'use client';

import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { HistoryItem } from '@/lib/api';

interface RecallAlertProps {
    recalls: HistoryItem[];
}

export default function RecallAlert({ recalls }: RecallAlertProps) {
    const [expanded, setExpanded] = useState(false);

    if (!recalls || recalls.length === 0) return null;

    // Filter only open recalls (not completed)
    const openRecalls = recalls.filter(recall =>
        (recall.content || []).some(c => c.flag === 'Recall required' || c.title?.includes('Recall required'))
    );

    if (openRecalls.length === 0) return null;

    return (
        <div className="mb-6 p-4 bg-error-bg border border-error-border rounded-lg">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-text shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-error-text">
                            ⚠️ Rikallime të Hapura ({openRecalls.length})
                        </h3>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-sm text-error-text hover:underline flex items-center gap-1"
                        >
                            {expanded ? 'Më pak' : 'Më shumë'}
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    {expanded && (
                        <div className="mt-3 space-y-3">
                            {openRecalls.map((recall, index) => (
                                <div key={index} className="bg-error-bg/50 p-3 rounded-lg border border-error-border">
                                    {(recall.content || []).map((content, idx) => (
                                        <div key={idx}>
                                            <p className="font-medium text-error-text">{content.title}</p>
                                            {content.Defect_details && (
                                                <p className="text-sm text-error-text/80 mt-1">
                                                    {content.Defect_details.replace(/<[^>]*>/g, '')}
                                                </p>
                                            )}
                                            {content.Correction_method && (
                                                <p className="text-sm text-error-text/80 mt-1">
                                                    <span className="font-medium">Korrektimi:</span>{' '}
                                                    {content.Correction_method.replace(/<[^>]*>/g, '')}
                                                </p>
                                            )}
                                            {content.target_device && (
                                                <p className="text-sm text-error-text/80 mt-1">
                                                    <span className="font-medium">Pajisja:</span> {content.target_device}
                                                </p>
                                            )}
                                            {content.Recall_Post_Date && (
                                                <p className="text-xs text-error-text/60 mt-2">
                                                    Data e rikallimit: {content.Recall_Post_Date}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}