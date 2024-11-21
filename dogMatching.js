// Определяем класс Dog
class Dog {
    constructor(
        dog_id,
        breed,
        weight,
        age,
        emotional_status,
        activity_level,
        latitude,
        longitude,
        after_walk_points = [],
        received_points_by_breed = [],
        vaccination_status,
        anti_tick = true
    ) {
        this.dog_id = dog_id;
        this.breed = breed;
        this.weight = weight;
        this.age = age;
        this.emotional_status = emotional_status;
        this.activity_level = activity_level;
        this.latitude = latitude;
        this.longitude = longitude;
        this.after_walk_points = after_walk_points;
        this.received_points_by_breed = received_points_by_breed;
        this.vaccination_status = vaccination_status;
        this.anti_tick = anti_tick;
        this.aggregated_experience = this._calculate_aggregated_experience();
    }

    // Метод для расчета совокупного опыта
    _calculate_aggregated_experience() {
        const weight_emotional = 0.6;
        const weight_after_walk = 0.4;
        const average_points_by_breed = this.received_points_by_breed.length
            ? this.received_points_by_breed.reduce((a, b) => a + b, 0) / this.received_points_by_breed.length
            : 0;
        return weight_emotional * this.emotional_status + weight_after_walk * average_points_by_breed;
    }

    // Метод для расчета схожести прививок
    vaccination_similarity(other_dog) {
        const matching_vaccines = Object.keys(this.vaccination_status).filter(
            vaccine => this.vaccination_status[vaccine] === other_dog.vaccination_status[vaccine]
        ).length;
        return matching_vaccines / Object.keys(this.vaccination_status).length;
    }

    // Метод для расчета общей схожести с другой собакой
    calculate_similarity(other_dog) {
        const weights = {
            breed: 0.15,
            weight: 0.1,
            age: 0.1,
            emotional_status: 0.15,
            activity_level: 0.1,
            aggregated_experience: 0.15,
            vaccination_status: 0.2,
            anti_tick: 0.05
        };

        // Breed similarity (1 if same breed, 0 if different)
        const breed_similarity = this.breed === other_dog.breed ? 1 : 0;

        // Euclidean distance for numerical parameters
        const weight_diff = Math.abs(this.weight - other_dog.weight);
        const age_diff = Math.abs(this.age - other_dog.age);
        const emotional_status_diff = Math.abs(this.emotional_status - other_dog.emotional_status);
        const activity_level_diff = Math.abs(this.activity_level - other_dog.activity_level);
        const experience_diff = Math.abs(this.aggregated_experience - other_dog.aggregated_experience);

        // Normalize the differences
        const max_weight = 50;  // Максимальный вес в кг
        const max_age = 15;     // Максимальный возраст в годах
        const max_emotional_status = 10; // Шкала 1-10
        const max_activity_level = 10; // Шкала 1-10
        const max_experience = 10;  // Шкала 1-10

        const weight_similarity = 1 - (weight_diff / max_weight);
        const age_similarity = 1 - (age_diff / max_age);
        const emotional_status_similarity = 1 - (emotional_status_diff / max_emotional_status);
        const activity_level_similarity = 1 - (activity_level_diff / max_activity_level);
        const experience_similarity = 1 - (experience_diff / max_experience);

        // Vaccination similarity
        const vaccination_similarity = this.vaccination_similarity(other_dog);

        // Anti-tick similarity
        const anti_tick_similarity = this.anti_tick === other_dog.anti_tick ? 1 : 0;

        // Total similarity
        const total_similarity = (
            weights.breed * breed_similarity +
            weights.weight * weight_similarity +
            weights.age * age_similarity +
            weights.emotional_status * emotional_status_similarity +
            weights.activity_level * activity_level_similarity +
            weights.aggregated_experience * experience_similarity +
            weights.vaccination_status * vaccination_similarity +
            weights.anti_tick * anti_tick_similarity
        );

        return total_similarity;
    }
}

// Функция для расчета географической дистанции с использованием Haversine
const calculate_geographic_distance = (dog1, dog2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const lat1 = toRadians(dog1.latitude);
    const lon1 = toRadians(dog1.longitude);
    const lat2 = toRadians(dog2.latitude);
    const lon2 = toRadians(dog2.longitude);

    const R = 6371; // Радиус Земли в километрах
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // Возвращаем дистанцию в километрах
};

// Функция для подбора собак по радиусу и расчету схожести
const match_dogs = (target_dog, dogs, radius_km) => {
    const matches = [];
    for (const dog of dogs) {
        if (dog.dog_id === target_dog.dog_id) continue;

        // Calculate geographic distance
        const distance = calculate_geographic_distance(target_dog, dog);
        if (distance <= radius_km) {
            // Calculate similarity
            const similarity = target_dog.calculate_similarity(dog);
            const similarity_percentage = Math.round(similarity * 100);
            matches.push({ dog_id: dog.dog_id, similarity_percentage, distance_km: distance });
        }
    }
    // Сортируем результаты по убыванию схожести
    return matches.sort((a, b) => b.similarity_percentage - a.similarity_percentage);
};

// Пример форматирования вывода результатов
const format_matches_output = (target_dog, matched_dogs) => {
    const formatted_output = `Dog_${target_dog.dog_id} best matches with: `;
    const match_strings = matched_dogs.map(match => `Dog_${match.dog_id} (${match.similarity_percentage}%, ${match.distance_km.toFixed(2)} km)`);
    return formatted_output + match_strings.join(', ');
};

module.exports = {
    Dog,
    calculate_geographic_distance,
    match_dogs,
    format_matches_output
};
