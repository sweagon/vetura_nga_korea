// lib/matchmaker/UserPreferenceService.ts
export interface UserPreference {
    makes: Map<string, number>;
    models: Map<string, number>;
    years: {
        min: number;
        max: number;
        weights: Map<number, number>;
    };
    priceRange: {
        min: number;
        max: number;
        preferredPrice: number;
    };
    fuelTypes: Map<string, number>;
    transmissions: Map<string, number>;
    features: Map<string, number>;
}

export class UserPreferenceService {
    private preferences: UserPreference;
    private readonly DECAY_FACTOR = 0.95;
    private readonly VIEW_WEIGHT = 1.0;
    private readonly SAVE_WEIGHT = 3.0;

    constructor() {
        this.preferences = {
            makes: new Map(),
            models: new Map(),
            years: { min: 0, max: 0, weights: new Map() },
            priceRange: { min: Infinity, max: 0, preferredPrice: 0 },
            fuelTypes: new Map(),
            transmissions: new Map(),
            features: new Map()
        };
    }

    trackCarView(car: any) {
        if (!car) return;
        try {
            this.updatePreference('makes', car.make, this.VIEW_WEIGHT);
            this.updatePreference('models', `${car.make}:${car.model}`, this.VIEW_WEIGHT);
            this.updateYearPreference(car.year, this.VIEW_WEIGHT);
            this.updatePricePreference(car.price);
            this.updatePreference('fuelTypes', car.fuelType, this.VIEW_WEIGHT);
            this.updatePreference('transmissions', car.transmission, this.VIEW_WEIGHT);

            if (car.description) {
                const features = this.extractFeatures(car.description);
                features.forEach(feature =>
                    this.updatePreference('features', feature, this.VIEW_WEIGHT * 0.5)
                );
            }
        } catch (error) {
            console.error('Error tracking car view:', error);
        }
    }

    trackCarSave(car: any) {
        if (!car) return;
        try {
            this.updatePreference('makes', car.make, this.SAVE_WEIGHT);
            this.updatePreference('models', `${car.make}:${car.model}`, this.SAVE_WEIGHT);
            this.updateYearPreference(car.year, this.SAVE_WEIGHT);
            this.updatePricePreference(car.price);
            this.updatePreference('fuelTypes', car.fuelType, this.SAVE_WEIGHT);
            this.updatePreference('transmissions', car.transmission, this.SAVE_WEIGHT);
        } catch (error) {
            console.error('Error tracking car save:', error);
        }
    }

    private updatePreference(
        category: keyof UserPreference,
        key: string,
        weight: number
    ) {
        if (!key) return;
        const map = this.preferences[category] as Map<string, number>;
        if (map) {
            const currentWeight = map.get(key) || 0;
            map.set(key, currentWeight + weight);
            this.applyDecay(map);
        }
    }

    private updateYearPreference(year: number, weight: number) {
        if (!year) return;
        const currentWeight = this.preferences.years.weights.get(year) || 0;
        this.preferences.years.weights.set(year, currentWeight + weight);

        this.preferences.years.min = Math.min(this.preferences.years.min, year);
        this.preferences.years.max = Math.max(this.preferences.years.max, year);
    }

    private updatePricePreference(price: number) {
        if (!price) return;
        this.preferences.priceRange.min = Math.min(this.preferences.priceRange.min, price);
        this.preferences.priceRange.max = Math.max(this.preferences.priceRange.max, price);

        const totalViews = Array.from(this.preferences.makes.values())
            .reduce((sum, w) => sum + w, 0);

        if (totalViews > 0) {
            const currentAvg = this.preferences.priceRange.preferredPrice;
            const newAvg = (currentAvg * (totalViews - 1) + price) / totalViews;
            this.preferences.priceRange.preferredPrice = newAvg;
        } else {
            this.preferences.priceRange.preferredPrice = price;
        }
    }

    private applyDecay(map: Map<string, number>) {
        for (const [key, value] of map.entries()) {
            const newValue = value * this.DECAY_FACTOR;
            if (newValue < 0.1) {
                map.delete(key);
            } else {
                map.set(key, newValue);
            }
        }
    }

    private extractFeatures(description: string): string[] {
        if (!description) return [];

        const commonFeatures = [
            'Panoramic roof', 'Leather seats', 'Navigation', 'Backup camera',
            'Heated seats', 'Bluetooth', 'Sunroof', 'Alloy wheels'
        ];

        return commonFeatures.filter(feature =>
            description.toLowerCase().includes(feature.toLowerCase())
        );
    }

    calculateMatchScore(car: any): number {
        if (!car) return 0;

        let score = 0;
        let totalWeight = 0;

        // Make match (30% of score)
        const makeWeight = this.preferences.makes.get(car.make) || 0;
        if (makeWeight > 0) {
            score += Math.min(makeWeight / 10, 0.3);
            totalWeight += 0.3;
        }

        // Model match (20% of score)
        const modelKey = `${car.make}:${car.model}`;
        const modelWeight = this.preferences.models.get(modelKey) || 0;
        if (modelWeight > 0) {
            score += Math.min(modelWeight / 10, 0.2);
            totalWeight += 0.2;
        }

        // Year match (15% of score)
        const yearWeight = this.preferences.years.weights.get(car.year) || 0;
        if (yearWeight > 0) {
            score += Math.min(yearWeight / 10, 0.15);
            totalWeight += 0.15;
        }

        // Price match (15% of score)
        const preferredPrice = this.preferences.priceRange.preferredPrice;
        if (preferredPrice > 0 && car.price) {
            const priceDiff = Math.abs(car.price - preferredPrice) / preferredPrice;
            const priceScore = Math.max(0, 1 - Math.min(priceDiff, 1));
            score += priceScore * 0.15;
            totalWeight += 0.15;
        }

        // Fuel type match (10% of score)
        const fuelWeight = this.preferences.fuelTypes.get(car.fuelType) || 0;
        if (fuelWeight > 0) {
            score += Math.min(fuelWeight / 10, 0.1);
            totalWeight += 0.1;
        }

        // Transmission match (10% of score)
        const transWeight = this.preferences.transmissions.get(car.transmission) || 0;
        if (transWeight > 0) {
            score += Math.min(transWeight / 10, 0.1);
            totalWeight += 0.1;
        }

        // Return percentage (0-100)
        return totalWeight > 0 ? Math.min(Math.round((score / totalWeight) * 100), 100) : 0;
    }

    getTopRecommendations(cars: any[], limit: number = 10): any[] {
        if (!Array.isArray(cars) || cars.length === 0) {
            return [];
        }

        const scoredCars = cars.map(car => {
            const score = this.calculateMatchScore(car);
            return {
                ...car,
                matchScore: score
            };
        });

        return scoredCars
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    saveToStorage(userId: string) {
        if (!userId) return;

        try {
            const data = {
                makes: Array.from(this.preferences.makes.entries()),
                models: Array.from(this.preferences.models.entries()),
                years: {
                    min: this.preferences.years.min,
                    max: this.preferences.years.max,
                    weights: Array.from(this.preferences.years.weights.entries())
                },
                priceRange: this.preferences.priceRange,
                fuelTypes: Array.from(this.preferences.fuelTypes.entries()),
                transmissions: Array.from(this.preferences.transmissions.entries()),
                features: Array.from(this.preferences.features.entries())
            };

            localStorage.setItem(`preferences_${userId}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    loadFromStorage(userId: string) {
        if (!userId) return;

        try {
            const saved = localStorage.getItem(`preferences_${userId}`);
            if (saved) {
                const data = JSON.parse(saved);
                this.preferences = {
                    makes: new Map(data.makes || []),
                    models: new Map(data.models || []),
                    years: {
                        min: data.years?.min || 0,
                        max: data.years?.max || 0,
                        weights: new Map(data.years?.weights || [])
                    },
                    priceRange: data.priceRange || { min: Infinity, max: 0, preferredPrice: 0 },
                    fuelTypes: new Map(data.fuelTypes || []),
                    transmissions: new Map(data.transmissions || []),
                    features: new Map(data.features || [])
                };
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    removeCarPreference(car: any) {
        if (!car) return;

        try {
            // Decrease weights instead of just removing
            const currentMakeWeight = this.preferences.makes.get(car.make) || 0;
            if (currentMakeWeight > 0) {
                const newWeight = Math.max(0, currentMakeWeight - this.SAVE_WEIGHT);
                if (newWeight === 0) {
                    this.preferences.makes.delete(car.make);
                } else {
                    this.preferences.makes.set(car.make, newWeight);
                }
            }

            // Remove model preference
            const modelKey = `${car.make}:${car.model}`;
            const currentModelWeight = this.preferences.models.get(modelKey) || 0;
            if (currentModelWeight > 0) {
                const newWeight = Math.max(0, currentModelWeight - this.SAVE_WEIGHT);
                if (newWeight === 0) {
                    this.preferences.models.delete(modelKey);
                } else {
                    this.preferences.models.set(modelKey, newWeight);
                }
            }

            // Remove year preference
            const currentYearWeight = this.preferences.years.weights.get(car.year) || 0;
            if (currentYearWeight > 0) {
                const newWeight = Math.max(0, currentYearWeight - this.SAVE_WEIGHT);
                if (newWeight === 0) {
                    this.preferences.years.weights.delete(car.year);
                } else {
                    this.preferences.years.weights.set(car.year, newWeight);
                }
            }

            // Update year min/max if needed
            if (this.preferences.years.weights.size === 0) {
                this.preferences.years.min = 0;
                this.preferences.years.max = 0;
            } else {
                this.preferences.years.min = Math.min(...Array.from(this.preferences.years.weights.keys()));
                this.preferences.years.max = Math.max(...Array.from(this.preferences.years.weights.keys()));
            }

            // Remove fuel type preference
            const currentFuelWeight = this.preferences.fuelTypes.get(car.fuelType) || 0;
            if (currentFuelWeight > 0) {
                const newWeight = Math.max(0, currentFuelWeight - this.SAVE_WEIGHT);
                if (newWeight === 0) {
                    this.preferences.fuelTypes.delete(car.fuelType);
                } else {
                    this.preferences.fuelTypes.set(car.fuelType, newWeight);
                }
            }

            // Remove transmission preference
            const currentTransWeight = this.preferences.transmissions.get(car.transmission) || 0;
            if (currentTransWeight > 0) {
                const newWeight = Math.max(0, currentTransWeight - this.SAVE_WEIGHT);
                if (newWeight === 0) {
                    this.preferences.transmissions.delete(car.transmission);
                } else {
                    this.preferences.transmissions.set(car.transmission, newWeight);
                }
            }

            // Reset price range if no makes left
            if (this.preferences.makes.size === 0) {
                this.preferences.priceRange = { min: Infinity, max: 0, preferredPrice: 0 };
            }

            this.applyDecayToAll();
        } catch (error) {
            console.error('Error removing car preference:', error);
        }
    }

    private applyDecayToAll() {
        this.applyDecay(this.preferences.makes);
        this.applyDecay(this.preferences.models);
        this.applyDecay(this.preferences.fuelTypes);
        this.applyDecay(this.preferences.transmissions);
        this.applyDecay(this.preferences.features);

        // Apply decay to year weights
        for (const [year, weight] of this.preferences.years.weights.entries()) {
            const newWeight = weight * this.DECAY_FACTOR;
            if (newWeight < 0.1) {
                this.preferences.years.weights.delete(year);
            } else {
                this.preferences.years.weights.set(year, newWeight);
            }
        }
    }
}