import { View, Switch, Image, Text, Button, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { icons } from "@/constants/svg";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { Linking } from "react-native";
import { images } from "@/constants/index";
import { useLocationStore } from "@/store/index";
import { useUser } from "@clerk/clerk-expo";
import FilterModal from "@/app/(root)/(modal)/FilterModal";
import DogProfileModal from "@/app/(root)/(modal)/DogProfile";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import { useToggleStore } from "@/store/toggleStore";
import { useMatchingStore } from "@/store/matchingStore";
import useFetchDogs from "@/hooks/useFetchDogs";

const SERVER_URL = "https://walkey-production.up.railway.app";

interface DogInterface {
  dog_id: string;
  name: string;
  breed: string;
  gender: "male" | "female";
  age: number | null;
  latitude: number;
  longitude: number;
  image?: string;
  similarity_percentage?: number;
  status?: string;
}

type UpdateLocationParams = {
  latitude: number;
  longitude: number;
  clerkId: string;
};

type Filters = Record<string, string>;

const updateLocation = async ({ latitude, longitude, clerkId }: UpdateLocationParams): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${SERVER_URL}/api/user/location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clerkId, latitude, longitude }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Ошибка обновления локации:", errorData);
      throw new Error(errorData.error || "Ошибка сервера");
    }

    console.log("Локация успешно обновлена!");
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("Запрос был прерван из-за тайм-аута.");
    } else {
      console.error("Ошибка обновления локации:", error);
    }
  }
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 5000
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const fetchOtherUsersLocations = async (clerkId: string, filters: Filters = {}): Promise<DogInterface[]> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "gender") {
        queryParams.append(key, value);
      }
    });

    if (filters.gender && filters.gender !== "all") {
      filters.gender.split(",").forEach((g) => queryParams.append("gender", g));
    }

    const response = await fetchWithTimeout(`${SERVER_URL}/api/users/locations?clerkId=${clerkId}&${queryParams}`, {});

    if (!response.ok) {
      throw new Error("Ошибка получения данных пользователей");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Ошибка получения данных других пользователей:", error.message || error);
    return [];
  }
};

const Map = () => {
  const { userLatitude, userLongitude, setUserLocation } = useLocationStore();
  const isToggled = useToggleStore((state) => state.isToggled);
  const setIsToggled = useToggleStore((state) => state.setIsToggled);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const { user } = useUser();
  const [userName, setUserName] = useState<string>("Байт");
  const [loading, setLoading] = useState<boolean>(true);
  const [otherUsersLocations, setOtherUsersLocations] = useState<any[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({});
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
  const [selectedDog, setSelectedDog] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [showMarkerLabels, setShowMarkerLabels] = useState(true);
  const { dogs, loading: dogsLoading } = useFetchDogs(user || null, SERVER_URL);
  const [mapKey, setMapKey] = useState(0);


  const handleFilterChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  
  const { setMatching } = useMatchingStore();

  const openDogProfile = (dog: any) => {
    if (!dog.dog_id) {
      console.warn("У собаки нет `dog_id`, проверяем на соответствие существующим данным.");
      const foundDog = dogs.find(d => d.name === dog.name);
      if (foundDog) {
        dog.dog_id = foundDog.dog_id; 
      } else {
        console.warn("`dog_id` не найден, используем временный.");
        dog.dog_id = `temp_${Date.now()}`;
      }
    }
  
    const { matchingData } = useMatchingStore.getState();
  
    const similarity = matchingData[dog.dog_id] ?? dog.similarity_percentage ?? 0;
  
    setSelectedDog({
      ...dog,
      similarity_percentage: similarity,
    });
  
    setIsModalVisible(true);
  };  
  
 
  const closeDogProfile = () => {
    setSelectedDog(null);
    setIsModalVisible(false);
  };

  const THRESHOLD = 0.02;

 
const handleRegionChange = (region: Region) => {
  if (region.latitudeDelta > THRESHOLD) {
      setCurrentRegion(region); 
      setShowMarkerLabels(region.latitudeDelta <= THRESHOLD);
  } else {
    setShowMarkerLabels(true);
    setMapKey((prevKey) => prevKey + 1); 
  }
};

const forceUpdateMap = () => {
  setOtherUsersLocations((prev) => [...prev]); 
};

useEffect(() => {
  fetchOtherUsersWithFilters();
}, []); 

const fetchOtherUsersWithFilters = async () => {
  if (!user || !user.id) return;

  try {
    setLoading(true);
    const queryParams = new URLSearchParams(filters).toString();
    const queryString = queryParams ? `&${queryParams}` : "";

    const response = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}${queryString}`);
    const data = await response.json();

    data.forEach((dog: any) => {
      if (dog.dog_id && dog.similarity_percentage !== undefined) {
        setMatching(dog.dog_id, dog.similarity_percentage);
      }
    });

    setOtherUsersLocations(data);
    forceUpdateMap();
  } catch (error) {
    console.error("Ошибка загрузки пользователей:", error);
  } finally {
    setLoading(false);
  }
};


const applyFilters = async () => {
  if (!user || !user.id) return;

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value && value.trim() !== "")
  );

  try {
    let filteredUsers = await fetchOtherUsersLocations(user.id, activeFilters);

    if (filteredUsers.length === 0) {
      Alert.alert("Результатів не знайдено", "Спробуйте змінити фільтри");
      setOtherUsersLocations([]);
    } else {
      setOtherUsersLocations(filteredUsers);
      setFiltersApplied(true);
    }
  } catch (error) {
    console.error("Ошибка загрузки пользователей:", error);
  }
};

  const resetFilters = async () => {
    setFilters({});
    setFiltersApplied(false);
    handleFilterChange("gender", "");
  
    if (user && user.id) {
      try {
        const response = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`);
        const data = await response.json();
        setOtherUsersLocations(data);
      } catch (error) {
        console.error("Помилка при скиданні фільтрів:", error);
        Alert.alert("Помилка", "Не вдалося скинути фільтри");
      }
    }
  };
  

  const toggleSwitch = () => {
    setIsToggled(!isToggled); 
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;

      try {
        const response = await fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const toggleConnectionListener = () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  };

  const fetchUserImage = async (clerkId: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/user?clerkId=${clerkId}`);
      const data = await response.json();
      return data.image || null;
    } catch (error) {
      console.error("Ошибка загрузки изображения пользователя:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user?.id || userImage) return;
    fetchUserImage(user.id).then(setUserImage);
  }, [user?.id]);  
  
  useEffect(() => {
    if (!user?.id) return;
  
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`);
        const data = await response.json();
        setOtherUsersLocations(data);
      } catch (error) {
        console.error("Ошибка загрузки пользователей после сброса фильтра:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (!filtersApplied) {
      fetchUsers();
    }
  }, [filtersApplied]);

  
  useEffect(() => {
    toggleConnectionListener();

    if (!isConnected) return;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Розташування вимкнено",
            "Для роботи додатку потрібно увімкнути GPS у налаштуваннях.",
            [{ text: "Відкрити налаштування", onPress: () => Linking.openSettings() }]
          );
          return;
        }        

        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (lastKnownLocation) {
          setUserLocation({
            latitude: lastKnownLocation.coords.latitude,
            longitude: lastKnownLocation.coords.longitude,
            address: "Последний известный адрес",
          });
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          address: "Ваша адреса",
        });

        if (user && userLocation.coords.latitude && userLocation.coords.longitude) {
          updateLocation({ latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude, clerkId: user.id });
        }

        if (user && user.id) {
          const locations = await fetchOtherUsersLocations(user.id);
          setOtherUsersLocations(locations);
        }
      } catch (error) {
        console.error("Помилка при отриманні розташування", error);
        setErrorMsg("Помилка при отриманні розташування");
      }
    })();
  }, [setUserLocation, isConnected]);

  if (errorMsg) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>{errorMsg}</Text>
        <Button title="Відкрити налаштування" onPress={() => Linking.openSettings()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-5">
        <icons.WalkeyIcon width={22} height={22}/>
        <View className="flex-row items-center ml-auto">
          <Text className="ml-2 text-sm font-semibold">{userName} зараз </Text>
          <View className="relative">
              <Text className="text-sm font-semibold">{isToggled ? 'гуляє' : 'вдома'}</Text>
              <View className="absolute left-0 right-0 bg-black" style={{ height: 2, bottom: -1 }} />
            </View>
          <Switch
            value={isToggled}
            onValueChange={toggleSwitch}
            thumbColor={isToggled ? "#F15F15" : "#f4f3f4"}
            trackColor={{ false: "#FED9C6", true: "#FED9C6" }}
            className="ml-2"
            style={{ marginRight: 12, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      {userLatitude && userLongitude ? (
        <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        mapType="mutedStandard"
        showsPointsOfInterest={false}
        showsCompass={false}
        initialRegion={currentRegion || { 
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={handleRegionChange}
      >
      
          <Marker coordinate={{ latitude: userLatitude, longitude: userLongitude }}>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                borderWidth: 7,
                borderColor: "#FF6C22",
                borderRadius: 50,
              }}
            >
            <Image
              source={
                userImage
                  ? { uri: userImage } 
                  : images.YourDog 
              }
              style={{ width: 64, height: 64, borderRadius: 32 }}
            />

            </View>
            <Text style={{ marginTop: 4, fontWeight: "bold" }}>{userName}</Text>
          </View>
        </Marker>

         {otherUsersLocations.map((location, index) => {
  const key = `${location.name}-${location.latitude}-${location.longitude}`;

  if (!location.latitude || !location.longitude) {
    console.error(`Invalid coordinates for user: ${location.name}`);
    return null;
  }

  const borderColor = location.gender === "female" ? "#FC6FCC" : "#40B3F4";
  if (!location.latitude || !location.longitude || isNaN(parseFloat(location.latitude.toString())) || isNaN(parseFloat(location.longitude.toString()))) {
    console.error(`Invalid coordinates for dog_id: ${location.dog_id}`, location);
    return null;
  }
  
  return (
    <Marker
      key={`dog-${index}-${location.latitude}-${location.longitude}`} 
      coordinate={{
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      }}
      onPress={() => openDogProfile(location)}
    >
  
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            borderWidth: 7,
            borderColor: borderColor,
            borderRadius: 50,
          }}
        >
          <Image
            source={location.image 
              ? { uri: location.image } 
              : images.YourDog}
            style={{ width: 64, height: 64, borderRadius: 32 }}
          />
        </View>
        {/* Змінила від */}
        {showMarkerLabels && (
                <Text style={{ marginTop: 4, fontWeight: "bold" }}>
                  {location.name}
                </Text>
              )}
      </View>
    </Marker>
  );
})}
        </MapView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text>{errorMsg || "Одержання розташування..."}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={toggleFilterModal}
        className="absolute bg-white rounded-full shadow-lg flex flex-row justify-center items-center w-[180px] h-[25px]"
        style={{
          top: 150,
          right: 35,
        }}
      >
        <icons.FilterIcon width={24} height={24} style={{ paddingRight: 8 }} />
        <Text className="text-center text-black text-[14px] pl-2">Фільтрувати</Text>
      </TouchableOpacity>

      {filtersApplied && (
        <TouchableOpacity
          onPress={resetFilters}
          className="absolute bg-red-500 rounded-full shadow-lg flex flex-row justify-center items-center w-[180px] h-[25px]"
          style={{
            top: 190,
            right: 35,
          }}
        >
          <Text className="text-center text-white text-[14px]">Скинути фільтр</Text>
        </TouchableOpacity>
      )}

      <FilterModal
        visible={filterModalVisible}
        toggleFilterModal={toggleFilterModal}
        applyFilters={applyFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
      />

      <DogProfileModal
        isVisible={isModalVisible}
        onClose={closeDogProfile}
        dog={selectedDog}
      />
    </SafeAreaView>
  );
};

export default Map;
