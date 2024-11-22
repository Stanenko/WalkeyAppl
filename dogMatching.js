// Класс Dog
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

    // Расчет совокупного опыта
    _calculate_aggregated_experience() {
        const weight_emotional = 0.6;
        const weight_after_walk = 0.4;
        const average_points_by_breed = this.received_points_by_breed.length
            ? this.received_points_by_breed.reduce((a, b) => a + b, 0) / this.received_points_by_breed.length
            : 5; // Значение по умолчанию
        return weight_emotional * this.emotional_status + weight_after_walk * average_points_by_breed;
    }

    // Расчет схожести прививок
    vaccination_similarity(other_dog) {
        const this_vaccines = Object.keys(this.vaccination_status);
        const other_vaccines = Object.keys(other_dog.vaccination_status);
        const total_vaccines = new Set([...this_vaccines, ...other_vaccines]).size;

        if (total_vaccines === 0) return 0.5; // Если прививок нет, возвращаем 50% схожести

        const matching_vaccines = this_vaccines.filter(
            vaccine => this.vaccination_status[vaccine] === other_dog.vaccination_status[vaccine]
        ).length;

        return matching_vaccines / total_vaccines;
    }

    // Расчет общей схожести
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

        // Схожесть породы
        const breed_similarity = this.breed.toLowerCase() === other_dog.breed.toLowerCase() ? 1 : 0.5;

        // Разница по числовым параметрам
        const weight_diff = Math.abs(this.weight - other_dog.weight);
        const age_diff = Math.abs(this.age - other_dog.age);
        const emotional_status_diff = Math.abs(this.emotional_status - other_dog.emotional_status);
        const activity_level_diff = Math.abs(this.activity_level - other_dog.activity_level);
        const experience_diff = Math.abs(this.aggregated_experience - other_dog.aggregated_experience);

        // Нормализация разницы
        const max_weight = 50; // Максимальный вес
        const max_age = 15; // Максимальный возраст
        const max_emotional_status = 10; // Шкала 1-10
        const max_activity_level = 10; // Шкала 1-10
        const max_experience = 10; // Шкала 1-10

        const weight_similarity = 1 - weight_diff / max_weight;
        const age_similarity = 1 - age_diff / max_age;
        const emotional_status_similarity = 1 - emotional_status_diff / max_emotional_status;
        const activity_level_similarity = 1 - activity_level_diff / max_activity_level;
        const experience_similarity = 1 - experience_diff / max_experience;

        // Схожесть прививок
        const vaccination_similarity = this.vaccination_similarity(other_dog);

        // Защита от клещей
        const anti_tick_similarity = this.anti_tick === other_dog.anti_tick ? 1 : 0.5;

        // Итоговая схожесть
        return (
            weights.breed * breed_similarity +
            weights.weight * (weight_similarity || 0.5) +
            weights.age * (age_similarity || 0.5) +
            weights.emotional_status * (emotional_status_similarity || 0.5) +
            weights.activity_level * (activity_level_similarity || 0.5) +
            weights.aggregated_experience * (experience_similarity || 0.5) +
            weights.vaccination_status * vaccination_similarity +
            weights.anti_tick * anti_tick_similarity
        );
    }
}

// Расчет географической дистанции
const calculate_geographic_distance = (dog1, dog2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const lat1 = toRadians(dog1.latitude);
    const lon1 = toRadians(dog1.longitude);
    const lat2 = toRadians(dog2.latitude);
    const lon2 = toRadians(dog2.longitude);

    const R = 6371; // Радиус Земли
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Дистанция в километрах
};

// Подбор собак по радиусу и метчингу
const match_dogs = (target_dog, dogs, radius_km = 500) => {
    const matches = [];
  
    for (const dog of dogs) {
      if (dog.dog_id === target_dog.dog_id) continue;
  
      const distance = calculate_geographic_distance(target_dog, dog);
  
      const similarity = target_dog.calculate_similarity(dog);
      const similarity_percentage = Math.round(similarity * 100);
  
      // Добавляем всех собак с метчингом выше 20%
      if (similarity_percentage > 20) {
        matches.push({
          ...dog,
          similarity_percentage,
          distance_km: distance
        });
      }
    }
  
  
    return matches.sort((a, b) => b.similarity_percentage - a.similarity_percentage);
  };
  

module.exports = {
    Dog,
    calculate_geographic_distance,
    match_dogs
};
