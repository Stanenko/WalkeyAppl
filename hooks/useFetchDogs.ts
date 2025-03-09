import { useEffect, useState } from "react";
import { Dog, match_dogs } from "@/dogMatching";
import { useMatchingStore } from "@/store/matchingStore";

const SERVER_URL = "https://walkey-production.up.railway.app";

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
  name: string;
  weight: number;
  age: number;
  emotional_status: number;
  activity_level: number;
  latitude: number;
  longitude: number;
  similarity_percentage: number;
  status?: string;
}

const useFetchDogs = (user: UserResource | null, SERVER_URL: string) => {
  const [dogs, setDogs] = useState<DogInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { setMatching } = useMatchingStore(); 

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
          console.log("userResponse:", userResponse.status, await userResponse.text());
          console.log("userLocationResponse:", userLocationResponse.status, await userLocationResponse.text());
          console.log("dogsResponse:", dogsResponse.status, await dogsResponse.text());
          return;
        }

        const userData: UserResource = await userResponse.json();
        const userLocationData = await userLocationResponse.json();
        const dogsData: DogInterface[] = await dogsResponse.json();

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

        const allDogs = dogsData.map((dog, index) => ({
          ...dog,
          dog_id: dog.dog_id || `generated_${index}`,
          name: dog.name || "Без имени", 
          similarity_percentage: dog.similarity_percentage ?? 0,
          latitude: parseFloat(dog.latitude?.toString() || "0"),
          longitude: parseFloat(dog.longitude?.toString() || "0"),
          status: dog.status ?? "вдома",
        }));

        const matchedDogs = match_dogs(myDog, allDogs, 500);
        matchedDogs.forEach((dog) => {
          if (dog.dog_id && typeof dog.dog_id === "string") {
            setMatching(dog.dog_id, dog.similarity_percentage);
          } else {
            console.warn(`Собака ${dog.name} не имеет корректного dog_id, пропускаем`);
          }
        });

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
