class Dog {
    constructor(
        dog_id,
        breed = "unknown",
        weight = 10,
        age = 5,
        emotional_status = 5,
        activity_level = 5,
        latitude = 0,
        longitude = 0,
        after_walk_points = [],
        received_points_by_breed = [],
        vaccination_status = {},
        anti_tick = true
    ) {
        this.dog_id = dog_id || `dog_${Date.now()}`;
        this.breed = breed || "unknown";
        this.weight = weight || 10;
        this.age = age || 5;
        this.emotional_status = emotional_status || 5;
        this.activity_level = activity_level || 5;
        this.latitude = latitude || 0;
        this.longitude = longitude || 0;
        this.after_walk_points = after_walk_points || [];
        this.received_points_by_breed = received_points_by_breed || [];
        this.vaccination_status = vaccination_status || {};
        this.anti_tick = anti_tick !== undefined ? anti_tick : true;
        this.aggregated_experience = this._calculate_aggregated_experience();
    }

    _calculate_aggregated_experience() {
        const weight_emotional = 0.6;
        const weight_after_walk = 0.4;
        const average_points_by_breed = this.received_points_by_breed.length
            ? this.received_points_by_breed.reduce((a, b) => a + b, 0) / this.received_points_by_breed.length
            : 5;
        return weight_emotional * this.emotional_status + weight_after_walk * average_points_by_breed;
    }

    vaccination_similarity(other_dog) {
        const this_vaccines = Object.keys(this.vaccination_status || {});
        const other_vaccines = Object.keys(other_dog.vaccination_status || {});
        const total_vaccines = new Set([...this_vaccines, ...other_vaccines]).size;

        if (total_vaccines === 0) return 0.5;

        const matching_vaccines = this_vaccines.filter(
            vaccine => this.vaccination_status[vaccine] === other_dog.vaccination_status[vaccine]
        ).length;

        return matching_vaccines / total_vaccines;
    }

    calculate_similarity(other_dog) {
        const weights = {
            breed: 0.15,
            weight: 0.1,
            age: 0.1,
            emotional_status: 0.15,
            activity_level: 0.1,
            aggregated_experience: 0.15,
            vaccination_status: 0.2,
            anti_tick: 0.05,
        };

        const breed_similarity = (this.breed || "").toLowerCase() === (other_dog.breed || "").toLowerCase() ? 1 : 0.5;

        const weight_diff = Math.abs((this.weight || 0) - (other_dog.weight || 0));
        const age_diff = Math.abs((this.age || 0) - (other_dog.age || 0));
        const emotional_status_diff = Math.abs((this.emotional_status || 0) - (other_dog.emotional_status || 0));
        const activity_level_diff = Math.abs((this.activity_level || 0) - (other_dog.activity_level || 0));
        const experience_diff = Math.abs((this.aggregated_experience || 0) - (other_dog.aggregated_experience || 0));

        const max_weight = 50;
        const max_age = 15;
        const max_emotional_status = 10;
        const max_activity_level = 10;
        const max_experience = 10;

        const weight_similarity = 1 - weight_diff / max_weight || 0.5;
        const age_similarity = 1 - age_diff / max_age || 0.5;
        const emotional_status_similarity = 1 - emotional_status_diff / max_emotional_status || 0.5;
        const activity_level_similarity = 1 - activity_level_diff / max_activity_level || 0.5;
        const experience_similarity = 1 - experience_diff / max_experience || 0.5;

        const vaccination_similarity = this.vaccination_similarity(other_dog);

        const anti_tick_similarity = this.anti_tick === other_dog.anti_tick ? 1 : 0.5;

        return (
            weights.breed * breed_similarity +
            weights.weight * weight_similarity +
            weights.age * age_similarity +
            weights.emotional_status * emotional_status_similarity +
            weights.activity_level * activity_level_similarity +
            weights.aggregated_experience * experience_similarity +
            weights.vaccination_status * vaccination_similarity +
            weights.anti_tick * anti_tick_similarity
        );
    }
}

const calculate_geographic_distance = (dog1, dog2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    if (
        isNaN(dog1.latitude) || isNaN(dog1.longitude) ||
        isNaN(dog2.latitude) || isNaN(dog2.longitude) ||
        dog1.latitude < -90 || dog1.latitude > 90 ||
        dog2.latitude < -90 || dog2.latitude > 90 ||
        dog1.longitude < -180 || dog1.longitude > 180 ||
        dog2.longitude < -180 || dog2.longitude > 180
    ) {
        console.warn("Некорректные координаты у одной из собак:", {
            dog1: { latitude: dog1.latitude, longitude: dog1.longitude },
            dog2: { latitude: dog2.latitude, longitude: dog2.longitude },
        });
        return Infinity;
    }

    const lat1 = toRadians(dog1.latitude);
    const lon1 = toRadians(dog1.longitude);
    const lat2 = toRadians(dog2.latitude);
    const lon2 = toRadians(dog2.longitude);

    const R = 6371; 
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

const match_dogs = (target_dog, dogs, radius_km = 500) => {
    const matches = [];

    if (!target_dog || !Array.isArray(dogs)) {
        console.warn("Некорректные данные для match_dogs");
        return matches;
    }

    for (const dog of dogs) {
        if (dog.dog_id === target_dog.dog_id) continue;

        console.log("Dog1 (target_dog):", target_dog, "Dog2 (current dog):", dog);

        const distance = calculate_geographic_distance(
            { latitude: target_dog.latitude, longitude: target_dog.longitude },
            { latitude: dog.latitude, longitude: dog.longitude }
        );

        if (distance > radius_km) {
            console.warn(`Собака ${dog.name} вне радиуса: ${distance.toFixed(2)} км`);
            continue;
        }

        const similarity = target_dog.calculate_similarity(dog);
        if (isNaN(similarity)) {
            console.warn(`Схожесть не вычислена для ${dog.name}`);
            continue;
        }

        const similarity_percentage = Math.round(similarity * 100);

        if (similarity_percentage > 0) {
            matches.push({
                ...dog,
                similarity_percentage,
                distance_km: distance,
            });
        }
    }

    return matches.sort((a, b) => b.similarity_percentage - a.similarity_percentage);
};

module.exports = { Dog, calculate_geographic_distance, match_dogs };
