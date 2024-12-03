import { View, Switch, Image, Text, Button, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { icons } from "@/constants/svg";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { Linking } from "react-native";
import { images } from "@/constants/index";
import { useLocationStore } from "@/store/index";
import { useUser } from "@clerk/clerk-expo";
import FilterModal from "@/app/(root)/(modal)/FilterModal";
import DogProfileModal from "@/app/(root)/(modal)/DogProfile";
import { getServerUrl } from "@/utils/getServerUrl";
import HeaderBar from "@/components/HeaderBar";


const SERVER_URL = "http://192.168.0.18:3000";


const updateLocation = async (latitude, longitude, clerkId) => {
    const controller = new AbortController(); 
    const timeoutId = setTimeout(() => controller.abort(), 10000);


  
    try {
      const response = await fetch(`${SERVER_URL}/api/user/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: clerkId,
          latitude: latitude,
          longitude: longitude,
        }),
        signal: controller.signal, 
      });
  
      clearTimeout(timeoutId); 
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка обновления локации:", errorData);
        throw new Error(errorData.error || "Ошибка сервера");
      }
  
      console.log("Локация успешно обновлена!");
    } catch (error) {
      clearTimeout(timeoutId); 
      if (error.name === "AbortError") {
        console.error("Запрос был прерван из-за тайм-аута.");
      } else {
        console.error("Ошибка обновления локации:", error);
      }
    }
  };
  
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
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

const fetchOtherUsersLocations = async (clerkId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetchWithTimeout(
        `${SERVER_URL}/api/users/locations?clerkId=${clerkId}&${queryParams}`,
        {},
        5000
      );
      const users = await response.json();
  
   
      if (users.length > 0) {
        const myDog = users.find(user => user.clerk_id === clerkId);
        const otherDogs = users.filter(user => user.clerk_id !== clerkId);
  
        if (myDog) {
        
          const matchedDogs = match_dogs(myDog, otherDogs, 500); 
          return matchedDogs.map((match) => {
            const baseDogData = otherDogs.find((dog) => dog.dog_id === match.dog_id) || {};
            return {
              ...baseDogData,
              similarity_percentage: match.similarity_percentage,
            };
          });
        }
      }
  
      return users;
    } catch (error) {
      console.error("Error fetching other users locations:", error);
      return [];
    }
  };
  

const Map = () => {
  const { userLatitude, userLongitude, setUserLocation } = useLocationStore();
  const [isToggled, setIsToggled] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useUser();
  const [userName, setUserName] = useState("Байт");
  const [loading, setLoading] = useState(true);
  const [otherUsersLocations, setOtherUsersLocations] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  const openDogProfile = (dog) => {
    console.log("Opening Dog Profile:", dog); 
    setSelectedDog(dog);
    setIsModalVisible(true);
  };

  const closeDogProfile = () => {
    setSelectedDog(null);
    setIsModalVisible(false);
  };

  const applyFilters = async () => {
    toggleFilterModal();
    if (user && user.id) {
      const filteredUsers = await fetchOtherUsersLocations(user.id, filters);
      if (filteredUsers.length === 0) {
        Alert.alert("Результатов не найдено", "Попробуйте изменить фильтры");
        setOtherUsersLocations([]);
      } else {
        setOtherUsersLocations(filteredUsers);
        setFiltersApplied(true);
      }
    }
  };

  const resetFilters = async () => {
    setFilters({});
    setFiltersApplied(false);

    if (user && user.id) {
      try {
        const response = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`);
        const data = await response.json();
        setOtherUsersLocations(data);
      } catch (error) {
        console.error("Ошибка при сбросе фильтров:", error);
        Alert.alert("Ошибка", "Не удалось сбросить фильтры");
      }
    }
  };

  const fetchAllUsers = async () => {
    if (user && user.id) {
      try {
        const response = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`);
        const data = await response.json();
        setOtherUsersLocations(data);
      } catch (error) {
        console.error("Ошибка при получении всех пользователей:", error);
      }
    }
  };

  const toggleSwitch = () => setIsToggled(!isToggled);

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

  useEffect(() => {
    toggleConnectionListener();

    if (!isConnected) return;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Доступ до розташування було відхилено");
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

        let userLocation = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          address: "Ваша адреса",
        });

        if (user && userLocation.coords.latitude && userLocation.coords.longitude) {
          updateLocation(userLocation.coords.latitude, userLocation.coords.longitude, user.id);
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
        <icons.WalkeyIcon />
        <View className="flex-row items-center ml-auto">
          <Text className="ml-2 text-sm font-semibold">{userName} зараз </Text>
          <Text className="text-sm font-semibold">{isToggled ? "гуляє" : "вдома"}</Text>
          <Switch
        value={isToggled}
        onValueChange={toggleSwitch}
        thumbColor={isToggled ? '#F15F15' : '#f4f3f4'}
        trackColor={{ false: '#FED9C6', true: '#FED9C6' }}
        className="ml-2"
        style={{ marginRight: 12, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
      />
        </View>
      </View>

      {userLatitude && userLongitude ? (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          mapType="mutedStandard"
          showsPointsOfInterest={false}
          showsCompass={false}
          initialRegion={{
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
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
                <Image source={images.YourDog} style={{ width: 64, height: 64, borderRadius: 32 }} />
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

            return (
              <Marker
                key={key}
                coordinate={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude),
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
                      source={images.YourDog}
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                    />
                  </View>
                  <Text style={{ marginTop: 4, fontWeight: "bold" }}>{location.name}</Text>
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
        className="absolute bg-white rounded-full shadow-lg flex flex-row justify-center items-center w-[180px]"
        style={{
          top: 150,
          right: 35,
        }}
      >
        <icons.FilterIcon className="pr-2" />
        <Text className="text-center text-black text-[14px] pl-2">Фільтрувати</Text>
      </TouchableOpacity>

      {filtersApplied && (
        <TouchableOpacity
          onPress={resetFilters}
          className="absolute bg-red-500 rounded-full shadow-lg flex flex-row justify-center items-center w-[180px] h-[35px]"
          style={{
            top: 200,
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
