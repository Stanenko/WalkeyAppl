import { useEffect, useState } from "react";
import { Dog, match_dogs } from "@/dogMatching";

const SERVER_URL = "https://7d72-93-200-239-96.ngrok-free.app"; 

interface UserResource {
  id: string;
  breed?: string;
  weight?: number;
  age?: number;
  emotional_status?: number;
  activity_level?: number;
  latitude?: number;
  longitude?: number;
  after_walk_points?: string[];
  received_points_by_breed?: string[];
  vaccination_status?: object;
  anti_tick?: boolean;
}

interface DogInterface {
  dog_id: string;
  breed: string;
  weight: number;
  age: number;
  emotional_status: number;
  activity_level: number;
  latitude: number;
  longitude: number;
  similarity_percentage: number;
}

const useFetchDogs = (user: UserResource | null, SERVER_URL: string) => {
  const [dogs, setDogs] = useState<DogInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user?.id;

        if (!userId) {
          console.error("User ID is not defined");
          return;
        }

        const [userResponse, userLocationResponse, dogsResponse] = await Promise.all([
          fetch(`${SERVER_URL}/api/user?clerkId=${userId}`),
          fetch(`${SERVER_URL}/api/user/location?clerkId=${userId}`),
          fetch(`${SERVER_URL}/api/users/locations?clerkId=${userId}`),
        ]);

        if (!userResponse.ok || !userLocationResponse.ok || !dogsResponse.ok) {
            console.error("Ошибка запросов к API");
            console.log("Статус userResponse:", userResponse.status, await userResponse.text());
            console.log("Статус userLocationResponse:", userLocationResponse.status, await userLocationResponse.text());
            console.log("Статус dogsResponse:", dogsResponse.status, await dogsResponse.text());
            return;
          }
          

        const userData: UserResource = await userResponse.json();
        const userLocationData = await userLocationResponse.json();
        const dogsData: DogInterface[] = await dogsResponse.json();

        console.log("Местоположение пользователя из API:", {
          latitude: userLocationData.latitude,
          longitude: userLocationData.longitude,
        });

        const myDog = new Dog(
          userId,
          userData.breed || "unknown",
          userData.weight || 10,
          userData.age || 5,
          userData.emotional_status || 5,
          userData.activity_level || 5,
          parseFloat(userLocationData.latitude),
          parseFloat(userLocationData.longitude),
          userData.after_walk_points || [],
          userData.received_points_by_breed || [],
          userData.vaccination_status || {},
          userData.anti_tick !== undefined ? userData.anti_tick : true
        );

        console.log("Данные пользователя:", myDog);

        const allDogs = dogsData.map((dog: DogInterface, index: number) => ({
          ...dog,
          dog_id: dog.dog_id || `generated_${index}`,
          similarity_percentage: 0,
          latitude: parseFloat(dog.latitude.toString()),
          longitude: parseFloat(dog.longitude.toString()),
        }));

        console.log(
          "Координаты собак до фильтрации:",
          allDogs.map((dog) => ({
            name: dog.breed,
            latitude: dog.latitude,
            longitude: dog.longitude,
          }))
        );

        const matchedDogs = match_dogs(myDog, allDogs, 500);
        console.log("Совпадения собак:", matchedDogs);

        setDogs(matchedDogs);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, SERVER_URL]);

  return { dogs, loading };
};

export default useFetchDogs;
