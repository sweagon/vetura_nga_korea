// components/cars/HistoryTimeline.tsx
'use client';

import { useState } from 'react';
import { Calendar, User, Car, Settings, AlertCircle, FileText, Check } from 'lucide-react';
import type { HistoryItem } from '@/lib/api';

interface HistoryTimelineProps {
    history?: HistoryItem[];
    ownerCount?: number;
}

export default function HistoryTimeline({ history, ownerCount }: HistoryTimelineProps) {
    const [expanded, setExpanded] = useState(false);

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-6 bg-surface-2/30 rounded-lg">
                <Calendar className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-muted text-sm">Nuk ka të dhëna për historikun</p>
            </div>
        );
    }

    // Sort by date (newest first)
    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
    });

    const getIcon = (flag: string) => {
        switch (flag) {
            case 'DEALER':
                return <User size={16} className="text-blue-500" />;
            case 'CORPORATION':
                return <Car size={16} className="text-purple-500" />;
            case 'Recall required':
                return <AlertCircle size={16} className="text-red-500" />;
            case 'Recall completed':
                return <Check size={16} className="text-green-500" />;
            default:
                return <FileText size={16} className="text-orange-500" />;
        }
    };

    const getFlagText = (flag: string) => {
        switch (flag) {
            case 'DEALER':
                return 'Blerje nga tregtari';
            case 'CORPORATION':
                return 'Blerje nga kompania';
            case 'Recall required':
                return 'Rikallim i hapur';
            case 'Recall completed':
                return 'Rikallim i përfunduar';
            default:
                return flag;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-primary">
                    Historiku i plotë ({history.length} ngjarje)
                </h3>
                {ownerCount !== undefined && (
                    <span className="text-xs bg-surface-2 px-2 py-1 rounded-full">
                        {ownerCount} pronarë
                    </span>
                )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {sortedHistory.slice(0, expanded ? undefined : 5).map((item, index) => (
                    <div key={index} className="relative pl-4 border-l-2 border-orange-500/30">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        </div>

                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-medium text-orange-500">{item.date}</span>
                        </div>

                        <div className="space-y-2">
                            {item.content.map((content, idx) => (
                                <div key={idx} className="bg-surface-2/50 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        {content.flag && (
                                            <div className="shrink-0 mt-0.5">
                                                {getIcon(content.flag)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-primary">{content.title}</p>
                                            {content.sub && (
                                                <p className="text-xs text-secondary mt-0.5">{content.sub}</p>
                                            )}
                                            {content.mileage && (
                                                <p className="text-xs text-muted mt-1">
                                                    Kilometrazha: {parseInt(content.mileage).toLocaleString()} km
                                                </p>
                                            )}
                                            {content.maintenance_company && (
                                                <p className="text-xs text-muted">
                                                    Shërbimi: {content.maintenance_company}
                                                </p>
                                            )}
                                            {content.flag && (
                                                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-surface-3 rounded-full">
                                                    {getFlagText(content.flag)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {history.length > 5 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full text-center text-sm text-orange-500 hover:text-orange-600 py-2"
                >
                    {expanded ? 'Shfaq më pak' : `Shfaq të gjitha (${history.length})`}
                </button>
            )}
        </div>
    );
}