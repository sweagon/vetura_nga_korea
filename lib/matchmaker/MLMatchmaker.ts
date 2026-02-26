interface CarFeatures {
    make: string;
    model: string;
    year: number;
    price: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    features: string[];
}

interface UserProfile {
    viewedCars: CarFeatures[];
    savedCars: CarFeatures[];
    searchQueries: string[];
    preferredMakes: Map<string, number>;
    preferredPriceRange: { min: number; max: number; avg: number };
}

export class MLMatchmaker {
    private userProfile: UserProfile;
    private readonly SIMILARITY_THRESHOLD = 0.7;

    constructor() {
        this.userProfile = {
            viewedCars: [],
            savedCars: [],
            searchQueries: [],
            preferredMakes: new Map(),
            preferredPriceRange: { min: Infinity, max: 0, avg: 0 }
        };
    }

    // Calculate cosine similarity between two feature vectors
    private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

        return dotProduct / (mag1 * mag2);
    }

    // Convert car to feature vector
    private carToFeatureVector(car: CarFeatures): number[] {
        const features: number[] = [];

        // One-hot encode make (simplified - in production use proper encoding)
        features.push(this.userProfile.preferredMakes.get(car.make) || 0);

        // Normalize year (0-1 scale)
        const yearNormalized = (car.year - 2000) / 30;
        features.push(yearNormalized);

        // Normalize price (0-1 scale)
        const priceNormalized = car.price / 100000;
        features.push(priceNormalized);

        // Fuel type encoding
        features.push(car.fuelType === 'Diesel' ? 1 : 0);
        features.push(car.fuelType === 'Gasoline' ? 1 : 0);
        features.push(car.fuelType === 'Electric' ? 1 : 0);

        // Transmission encoding
        features.push(car.transmission === 'Automatic' ? 1 : 0);

        // Normalize mileage
        const mileageNormalized = car.mileage / 300000;
        features.push(mileageNormalized);

        return features;
    }

    // Find similar cars based on user history
    findSimilarCars(cars: CarFeatures[], targetCar: CarFeatures): CarFeatures[] {
        const targetVector = this.carToFeatureVector(targetCar);

        const similarities = cars.map(car => ({
            car,
            similarity: this.calculateCosineSimilarity(
                targetVector,
                this.carToFeatureVector(car)
            )
        }));

        return similarities
            .filter(s => s.similarity > this.SIMILARITY_THRESHOLD)
            .sort((a, b) => b.similarity - a.similarity)
            .map(s => s.car);
    }

    // Get personalized recommendations
    getRecommendations(availableCars: CarFeatures[], limit: number = 10): CarFeatures[] {
        if (this.userProfile.savedCars.length === 0 && this.userProfile.viewedCars.length === 0) {
            return availableCars.slice(0, limit);
        }

        // Combine saved and viewed cars as reference points
        const referenceCars = [
            ...this.userProfile.savedCars,
            ...this.userProfile.viewedCars.slice(0, 5)
        ];

        // Get recommendations based on each reference car
        const allRecommendations = new Map<string, { car: CarFeatures, score: number }>();

        referenceCars.forEach((referenceCar, index) => {
            const weight = index < this.userProfile.savedCars.length ? 3 : 1; // Saved cars weighted more
            const similar = this.findSimilarCars(availableCars, referenceCar);

            similar.forEach(car => {
                const existing = allRecommendations.get(car.make + car.model + car.year);
                if (existing) {
                    existing.score += weight;
                } else {
                    allRecommendations.set(car.make + car.model + car.year, { car, score: weight });
                }
            });
        });

        // Sort by score and return top results
        return Array.from(allRecommendations.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.car);
    }

    // Update user profile based on interaction
    updateProfile(car: CarFeatures, action: 'view' | 'save' | 'search') {
        switch (action) {
            case 'view':
                this.userProfile.viewedCars.unshift(car);
                if (this.userProfile.viewedCars.length > 20) {
                    this.userProfile.viewedCars.pop();
                }
                break;

            case 'save':
                this.userProfile.savedCars.unshift(car);
                if (this.userProfile.savedCars.length > 10) {
                    this.userProfile.savedCars.pop();
                }
                break;
        }

        // Update preferred makes
        const currentMakeCount = this.userProfile.preferredMakes.get(car.make) || 0;
        this.userProfile.preferredMakes.set(car.make, currentMakeCount + 1);

        // Update preferred price range
        this.userProfile.preferredPriceRange.min = Math.min(
            this.userProfile.preferredPriceRange.min,
            car.price
        );
        this.userProfile.preferredPriceRange.max = Math.max(
            this.userProfile.preferredPriceRange.max,
            car.price
        );

        // Update average price
        const totalCars = this.userProfile.viewedCars.length + this.userProfile.savedCars.length;
        const currentAvg = this.userProfile.preferredPriceRange.avg;
        this.userProfile.preferredPriceRange.avg =
            (currentAvg * (totalCars - 1) + car.price) / totalCars;
    }

    // Get match percentage for a car
    getMatchPercentage(car: CarFeatures): number {
        if (this.userProfile.savedCars.length === 0 && this.userProfile.viewedCars.length === 0) {
            return 50; // Default when no history
        }

        const similarToSaved = this.userProfile.savedCars.some(saved =>
            this.calculateCosineSimilarity(
                this.carToFeatureVector(car),
                this.carToFeatureVector(saved)
            ) > this.SIMILARITY_THRESHOLD
        );

        if (similarToSaved) return 95;

        const similarToViewed = this.userProfile.viewedCars.some(viewed =>
            this.calculateCosineSimilarity(
                this.carToFeatureVector(car),
                this.carToFeatureVector(viewed)
            ) > this.SIMILARITY_THRESHOLD
        );

        if (similarToViewed) return 75;

        // Check if within preferred price range
        const priceRange = this.userProfile.preferredPriceRange;
        if (priceRange.avg > 0) {
            const priceDiff = Math.abs(car.price - priceRange.avg) / priceRange.avg;
            if (priceDiff < 0.2) return 65;
        }

        // Check if make is preferred
        if (this.userProfile.preferredMakes.has(car.make)) {
            return 60;
        }

        return 45;
    }
}