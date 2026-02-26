// components/matchmaker/MatchmakerWidget.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Sparkles, TrendingUp, RefreshCw, Car as CarIcon } from 'lucide-react';
import { UserPreferenceService } from '@/lib/matchmaker/UserPreferenceService';
import { SupabaseMatchmakerService } from '@/lib/matchmaker/supabase-service';
import CarCard from '../cars/CarCard';
import { type Car } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchmakerWidgetProps {
    cars: Car[];
}

export default function MatchmakerWidget({ cars }: MatchmakerWidgetProps) {
    const { data: session, status } = useSession();
    const [recommendations, setRecommendations] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const preferenceServiceRef = useRef(new UserPreferenceService());
    const [supabaseService] = useState(() => new SupabaseMatchmakerService(session?.user?.id));

    // Update recommendations based on current cars and preferences
    const updateRecommendations = useCallback(() => {
        if (!cars || cars.length === 0) {
            setRecommendations([]);
            return;
        }

        try {
            const topCars = preferenceServiceRef.current.getTopRecommendations(cars, 6);
            setRecommendations(topCars);

            if (topCars.length > 0) {
                console.log('🎯 Updated recommendations:', topCars.length);
            }
        } catch (error) {
            console.error('Error updating recommendations:', error);
            setRecommendations([]);
        }
    }, [cars]);

    // Update supabase service when session changes
    useEffect(() => {
        if (session?.user?.id) {
            (supabaseService as any).userId = session.user.id;
        }
    }, [session, supabaseService]);

    // Load user data from Supabase when logged in
    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (!session?.user?.id) {
                    // Guest: use localStorage
                    preferenceServiceRef.current.loadFromStorage('guest');
                    updateRecommendations();
                    setIsLoading(false);
                    return;
                }

                // Try to load from Supabase first
                try {
                    const [savedCars] = await Promise.all([
                        supabaseService.getSavedCars().catch(() => []),
                    ]);

                    // Initialize preference service with user ID
                    preferenceServiceRef.current.loadFromStorage(session.user.id);

                    // Track saved cars (these have higher weight)
                    savedCars.forEach((saved: any) => {
                        if (saved.car_data) {
                            preferenceServiceRef.current.trackCarSave(saved.car_data);
                        }
                    });

                    // Save to localStorage as backup
                    preferenceServiceRef.current.saveToStorage(session.user.id);
                } catch (error) {
                    console.error('Error loading Supabase data, falling back to localStorage:', error);
                    preferenceServiceRef.current.loadFromStorage(session.user.id);
                }

                updateRecommendations();
            } catch (error) {
                console.error('Error loading user data:', error);
                preferenceServiceRef.current.loadFromStorage('guest');
                updateRecommendations();
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [session, supabaseService, updateRecommendations]);

    // Set up real-time event listeners
    useEffect(() => {
        const handleCarView = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                try {
                    preferenceServiceRef.current.trackCarView(customEvent.detail);

                    if (session?.user?.id) {
                        supabaseService.trackCarView({
                            car_id: customEvent.detail.id,
                            make: customEvent.detail.make,
                            model: customEvent.detail.model,
                            year: customEvent.detail.year,
                            price: customEvent.detail.price,
                            fuelType: customEvent.detail.fuelType,
                            transmission: customEvent.detail.transmission,
                        }).catch(error => console.error('Error tracking view:', error));
                    }

                    preferenceServiceRef.current.saveToStorage(session?.user?.id || 'guest');
                    updateRecommendations();
                } catch (error) {
                    console.error('Error handling car view:', error);
                }
            }
        };

        const handleCarSave = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                try {
                    preferenceServiceRef.current.trackCarSave(customEvent.detail);
                    preferenceServiceRef.current.saveToStorage(session?.user?.id || 'guest');
                    updateRecommendations();
                } catch (error) {
                    console.error('Error handling car save:', error);
                }
            }
        };

        const handleCarUnsave = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                try {
                    preferenceServiceRef.current.removeCarPreference(customEvent.detail);
                    preferenceServiceRef.current.saveToStorage(session?.user?.id || 'guest');
                    updateRecommendations();
                } catch (error) {
                    console.error('Error handling car unsave:', error);
                }
            }
        };

        window.addEventListener('carView', handleCarView);
        window.addEventListener('carSave', handleCarSave);
        window.addEventListener('carUnsave', handleCarUnsave);

        return () => {
            window.removeEventListener('carView', handleCarView);
            window.removeEventListener('carSave', handleCarSave);
            window.removeEventListener('carUnsave', handleCarUnsave);
        };
    }, [session, supabaseService, updateRecommendations]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        try {
            preferenceServiceRef.current.loadFromStorage(session?.user?.id || 'guest');
            updateRecommendations();
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-primary">Rekomandime për ty</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-tertiary h-48 rounded-t-lg"></div>
                            <div className="bg-surface p-4 rounded-b-lg">
                                <div className="h-4 bg-tertiary rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-tertiary rounded w-1/2 mb-3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="text-center py-12 bg-secondary rounded-lg">
                <div className="w-20 h-20 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CarIcon size={32} className="text-ferrari-red" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Akoma pa preferenca</h3>
                <p className="text-secondary mb-6 max-w-md mx-auto">
                    Shfleto dhe ruaj disa makina për të marrë rekomandime të personalizuara
                </p>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="btn-secondary inline-flex items-center"
                >
                    <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Rifresko
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-ferrari-red/10 p-2 rounded-lg">
                        <TrendingUp className="text-ferrari-red" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Rekomandime për ty</h2>
                        <p className="text-secondary">
                            Bazuar në preferencat e tua, {recommendations.length} makina me përqindje të lartë
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 hover:bg-secondary rounded-full transition"
                        title="Rifresko rekomandimet"
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-ferrari-red' : 'text-muted'} />
                    </button>
                    <div className="bg-ferrari-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Matchmaker aktiv
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {recommendations.map((car, index) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="absolute top-4 right-4 z-10 bg-ferrari-red text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                {Math.min(Math.round((car as any).matchScore || 0), 100)}% Match
                            </div>
                            <CarCard car={car} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}