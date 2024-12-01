import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, Animated, TouchableOpacity, Switch, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel'; 
import { useUser } from '@clerk/clerk-expo';
import { icons } from "@/constants/svg";
import { images } from "@/constants/index";
import { useNavigation } from '@react-navigation/native';
import DogProfileModal from "@/app/(root)/(modal)/DogProfile";
import { Dog, match_dogs, calculate_geographic_distance } from "@/dogMatching";
import { getServerUrl } from "@/utils/getServerUrl";
import HomeNotificationModal from "@/app/(root)/(modal)/HomeNotificationModal";
import * as Clipboard from 'expo-clipboard';



const SERVER_URL = "http://192.168.0.18:3000";

const fetchDataFromAPI = async (url, errorMessage) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error(errorMessage, error);
      return null;
    }
  };  

const windowWidth = Dimensions.get('window').width;

const slideHeight = 200; 

const data = [
  {
    id: 1,
    title: "Вакцинація",
    subtitle: "Вакцина від сказу / Комплексна вакцина",
    date: "Остання вакцина: 10 березня 2023",
    nextDate: "Наступна вакцина: 10 березня 2024",
    description: "Не забудьте підготувати медичну картку та взяти з собою всі необхідні документи на вакцинацію",
    backgroundColor: "#E8F3F9"
  },
  {
    id: 2,
    title: "Ліки",
    subtitle: "Протиглистовий засіб",
    date: "Останній прийом: 8 жовтня 2023",
    nextDate: "Наступний прийом: 10 жовтня 2024",
    description: "Налаштуйте автоматичне нагадування до наступного прийому",
    backgroundColor: "#E5EFE5" 
  }
];

const calculateDaysUntil = (nextDate) => {
    if (!nextDate) return null; 
    const today = new Date();
    const targetDate = new Date(nextDate);

    if (isNaN(targetDate)) {
        console.error("Некорректная дата:", nextDate);
        return null;
    }

    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


const ReminderCard = ({ item, onPress }) => {
    const daysUntilNext = item.nextDate ? calculateDaysUntil(item.nextDate) : null;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="relative rounded-2xl p-4"
            style={{
                width: windowWidth - 40,
                height: slideHeight,
                backgroundColor: item.backgroundColor,
            }}
        >
      
            {daysUntilNext !== null && (
                <View className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-md">
                    <Text className="font-bold text-black">
                        Через {daysUntilNext} днів
                    </Text>
                </View>
            )}

            <Text className="font-bold">{item.title}</Text>
            {item.subtitle && <Text className="mt-2">{item.subtitle}</Text>}
            {item.date && <Text className="mt-1">{item.date}</Text>}
            {item.nextDate && <Text>{item.nextDate}</Text>}
            {item.description && <Text className="mt-2">{item.description}</Text>}
        </TouchableOpacity>
    );
};


const DogCard = ({ dog, onPress }) => (
  <TouchableOpacity
    key={dog.dog_id}
    onPress={onPress}
    className="bg-[#FFF7F2] rounded-lg p-4"
    style={{
      width: 240,
      height: 130,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 10,
    }}
  >
    <Image
      source={images.OtherDogs}
      defaultSource={images.OtherDogs}
      style={{
        width: 80,
        height: "100%",
        borderRadius: 12,
        marginRight: 10,
      }}
    />

    <View style={{ flex: 1, justifyContent: "space-between" }}>
        <Text className="font-bold text-black text-sm">
            {dog.name || "Без имени"} {dog.gender === "male" ? "♂️" : "♀️"}
        </Text>
      <Text className="text-gray-500 text-xs">{dog.breed || "Не указано"}</Text>
      <Text className="text-orange-500 font-bold text-xs">
        {dog.similarity_percentage || 0}% метч
      </Text>
    </View>
  </TouchableOpacity>
);


const DogList = ({ dogs, onDogSelect }) => (
    <ScrollView
        horizontal
        className="mt-3"
        showsHorizontalScrollIndicator={false} 
    >
        {dogs.map((dog, index) => (
            <TouchableOpacity
                key={dog.dog_id || `${dog.name}_${index}`}
                onPress={() => onDogSelect(dog)}
                className="bg-[#FFF7F2] rounded-lg p-4"
                style={{
                    width: 240,
                    height: 130,
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                }}
            >
                <Image
                    source={images.OtherDogs}
                    defaultSource={images.OtherDogs}
                    style={{
                        width: 80,
                        height: "100%",
                        borderRadius: 12,
                        marginRight: 10,
                    }}
                />
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <Text className="font-bold text-black text-sm">
                        {dog.name || "Без имени"} {dog.gender === "male" ? "♂️" : "♀️"}
                    </Text>
                    <Text className="text-gray-500 text-xs">{dog.breed || "Не указано"}</Text>
                    <Text className="text-orange-500 font-bold text-xs">
                        {dog.similarity_percentage || 0}% метч
                    </Text>
                </View>
            </TouchableOpacity>
        ))}
    </ScrollView>
);



const SliderComponent = ({ clerkId }) => {
    const navigation = useNavigation(); 

    const [slidesData, setSlidesData] = useState([]);

    const formatDateToUkrainian = (dateString) => {
        const options = {
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        return new Date(dateString).toLocaleDateString("uk-UA", options);
    };

    const calculateDaysUntil = (nextDate) => {
        if (!nextDate) return null;
        const today = new Date();
        const targetDate = new Date(nextDate);
        if (isNaN(targetDate)) {
            console.error("Некоректна дата:", nextDate);
            return null;
        }
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const vaccinationResponse = await fetch(
                    `${SERVER_URL}/api/vaccinations?clerkId=${clerkId}`
                );
                const protectionResponse = await fetch(
                    `${SERVER_URL}/api/medical/records?clerkId=${clerkId}&type=protection`
                );

                const vaccinationData = vaccinationResponse.ok
                    ? await vaccinationResponse.json()
                    : [];
                const protectionData = protectionResponse.ok
                    ? await protectionResponse.json()
                    : [];

                const slides = [];

                if (vaccinationData.length > 0) {
                    const nearestVaccination = vaccinationData.reduce((prev, curr) => {
                        const prevDate = new Date(prev.nextdate);
                        const currDate = new Date(curr.nextdate);
                        return currDate < prevDate ? curr : prev;
                    });
                    slides.push({
                        id: "vaccination",
                        type: "vaccination",
                        title: "Вакцинація",
                        subtitle: `Назва вакцинації: ${nearestVaccination.name}`,
                        date: `Остання вакцина: ${formatDateToUkrainian(nearestVaccination.lastdate)}`,
                        nextDate: `Наступна вакцина: ${formatDateToUkrainian(nearestVaccination.nextdate)}`,
                        description:
                            "Не забудьте підготувати медичну картку та взяти з собою всі необхідні документи на вакцинацію",
                        backgroundColor: "#E8F3F9",
                        daysUntilNext: calculateDaysUntil(nearestVaccination.nextdate),
                    });
                } else {
                    slides.push({
                        id: "no-vaccination",
                        type: "vaccination",
                        title: "Вакцинація",
                        subtitle: null,
                        description: "У вашого песика поки ще немає жодної інформації о вакцинаціях",
                        backgroundColor: "#E8F3F9",
                        icon: icons.GPlusIcon,
                    });
                }

                if (protectionData.length > 0) {
                    const nearestProtection = protectionData.reduce((prev, curr) => {
                        const prevDate = new Date(prev.nextdate);
                        const currDate = new Date(curr.nextdate);
                        return currDate < prevDate ? curr : prev;
                    });
                    slides.push({
                        id: "protection",
                        type: "protection",
                        title: "Ліки",
                        subtitle: nearestProtection.name,
                        date: `Останній прийом: ${formatDateToUkrainian(nearestProtection.lastdate)}`,
                        nextDate: `Наступний прийом: ${formatDateToUkrainian(nearestProtection.nextdate)}`,
                        description: "Налаштуйте автоматичне нагадування до наступного прийому",
                        backgroundColor: "#E5EFE5",
                        daysUntilNext: calculateDaysUntil(nearestProtection.nextdate),
                    });
                } else {
                    slides.push({
                        id: "no-protection",
                        type: "protection",
                        title: "Ліки",
                        subtitle: null,
                        description: "У вашого песика поки ще немає жодної інформації о ліках",
                        backgroundColor: "#E5EFE5",
                        icon: icons.GPlusIcon,
                    });
                }

                setSlidesData(slides);
            } catch (error) {
                console.error("Помилка завантаження даних:", error);
            }
        };

        fetchData();
    }, [clerkId]);

    if (slidesData.length === 0) {
        return <ActivityIndicator size="large" color="#FF6C22" />;
    }

    return (
        <View>
            <Carousel
                loop={false}
                width={windowWidth}
                height={slideHeight}
                autoPlay={false}
                data={slidesData}
                scrollAnimationDuration={1000}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate("doctor")}
                        className="rounded-2xl p-4"
                        style={{
                            width: windowWidth - 40,
                            backgroundColor: item.backgroundColor,
                            height: slideHeight,
                            paddingTop: 20,
                            paddingBottom: 20,
                            borderRadius: 25,
                        }}
                    >
                        {item.daysUntilNext !== null && item.daysUntilNext > 0 && (
                            <View className="absolute top-6 right-6 bg-white rounded-full px-3 py-1">
                                <Text className="font-bold text-black">
                                    Через {item.daysUntilNext} днів
                                </Text>
                            </View>
                        )}
                        <Text className="font-bold text-xl">{item.title}</Text>
                        {item.subtitle && (
                            <Text className="mt-2 font-bold">{item.subtitle}</Text>
                        )}
                        {item.date && <Text className="mt-2">{item.date}</Text>}
                        {item.nextDate && <Text>{item.nextDate}</Text>}
                        {item.description && <Text className="mt-4">{item.description}</Text>}
                        {item.icon && (
                            <View className="flex-row items-center mt-4">
                                <Text className="font-bold mr-2">Додати</Text>
                                <item.icon fill="black" width={30} height={30} />
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};





const formatDateToUkrainian = (dateString) => {
    const options = {
        day: 'numeric',  
        month: 'long', 
        year: 'numeric', 
    };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
};

const Home = () => {
  const { user } = useUser(); 
  const navigation = useNavigation();
  const wasToggledOn = useRef(false);
  const [userName, setUserName] = useState('Байт'); 
  const [gender, setGender] = useState('male'); 
  const [birthDate, setBirthDate] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isToggled, setIsToggled] = useState(false);
  const [image, setImage] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [breed, setBreed] = useState("Не dказано");
  const [uniqueCode, setUniqueCode] = useState("Не вказано");
  const [selectedDog, setSelectedDog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ isVisible: false, message: '' });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log("Clerk ID:", user?.id);
}, [user]);

const showNotification = (text) => {
  setNotification({ isVisible: true, message: text });
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();

  setTimeout(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNotification({ isVisible: false, message: '' }));
  }, 3000);
};

const fetchUserData = async () => {
    if (!user || !user.id) return;
  
    const userData = await fetchDataFromAPI(
      `${SERVER_URL}/api/user?clerkId=${user.id}`,
      "Error fetching user data"
    );
  
    const dogData = await fetchDataFromAPI(
      `${SERVER_URL}/api/dogs/user?clerkId=${user.id}`,
      "Error fetching dog data"
    );
  
    if (userData) {
      setUserName(userData.name || "Без имени");
      setGender(userData.gender || "unknown");
      setBirthDate(userData.birth_date || "");
      setImage(userData.image || "https://via.placeholder.com/150");
      setUniqueCode(userData.unique_code || "Не вказано");
    }
  
    if (dogData && dogData.length > 0) {
      setBreed(dogData[0].breed || "Не вказано");
    } else {
      setBreed("Не вказано");
    }
  
    setLoading(false);
  };
  

const formatUniqueCode = (code) => {
    if (!code) return "0000 0000 0000 0000"; 
    return code.replace(/(.{4})/g, "$1 ").trim(); 
  };

  const copyToClipboard = (text) => {
    Clipboard.setStringAsync(text);
    showNotification('ID скопійован');
  };
  

const onRefresh = async () => {
    try {
        setRefreshing(true); 
        await fetchUserData();
    } catch (error) {
        console.error("Error reload", error);
    } finally {
        setRefreshing(false); 
    }
};

useEffect(() => {
    const fetchInitialData = async () => {
      await fetchUserData();
      await fetchDogsNearby();
    };
  
    fetchInitialData();
  }, [user]);
  

useEffect(() => {
    console.log("Current dogs state:", dogs);
  }, [dogs]);
  

  useEffect(() => {
    const fetchDogsNearby = async () => {
      if (!user || !user.id) return;
  
      console.log("Fetching dogs nearby...");
      const startTime = Date.now();
  
      try {

        const userResponse = await fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`);
        console.log("Response status for user data:", userResponse.status);
  
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          console.error("Error fetching user data:", errorData.error);
          return;
        }
  
        const userData = await userResponse.json();
        console.log("User data response:", userData);
  
        const myDog = new Dog(
          user.id,
          userData.breed || "unknown", 
          userData.weight || 10, 
          userData.age || 5, 
          userData.emotional_status || 5, 
          userData.activity_level || 5, 
          parseFloat(userData.latitude) || 56.0,
          parseFloat(userData.longitude) || 12.7, 
          userData.after_walk_points || [],
          userData.received_points_by_breed || [], 
          userData.vaccination_status || {}, 
          userData.anti_tick !== undefined ? userData.anti_tick : true 
        );
  
        console.log("MyDog object:", myDog);
  
        const dogsResponse = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`);
        console.log("Response status for nearby dogs:", dogsResponse.status);
  
        if (!dogsResponse.ok) {
          const errorDogsData = await dogsResponse.json();
          console.error("Error fetching nearby dogs:", errorDogsData.error);
          return;
        }
  
        const dogsData = await dogsResponse.json();
        console.log("Nearby dogs data response:", dogsData);
  
        const allDogs = dogsData.map((dog, index) => ({
          ...dog,
          dog_id: dog.dog_id || `generated_${index}`,
          latitude: parseFloat(dog.latitude),
          longitude: parseFloat(dog.longitude),
          similarity_percentage: 0,
        }));
  
        console.log("All dogs:", allDogs);
  
        const matchedDogs = match_dogs(myDog, allDogs, 500); 
        console.log("Matched dogs:", matchedDogs);
  
        setDogs(matchedDogs);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("Time for fetchDogsNearby:", Date.now() - startTime, "ms");
      }
    };
  
    fetchDogsNearby();
  }, [user]);
  
useEffect(() => {
    const fetchData = async () => {
        try {
            const [userResponse, dogsResponse] = await Promise.all([
                fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`),
                fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`),
            ]);
    
            if (!userResponse.ok || !dogsResponse.ok) {
                console.error("Ошибка запросов к API");
                return;
            }
    
            const userData = await userResponse.json();
            const dogsData = await dogsResponse.json();
    
            console.log("Координаты пользователя из API:", {
                latitude: userData.latitude,
                longitude: userData.longitude,
            });
    
            const myDog = new Dog(
                userData.id,
                userData.breed || "unknown",
                userData.weight || 10,
                userData.age || 5,
                userData.emotional_status || 5,
                userData.activity_level || 5,
                parseFloat(userData.latitude) || 56.0,
                parseFloat(userData.longitude) || 12.7,
                userData.after_walk_points || [],
                userData.received_points_by_breed || [],
                userData.vaccination_status || {},
                userData.anti_tick !== undefined ? userData.anti_tick : true
            );
    
            console.log("Координаты пользователя:", {
                latitude: myDog.latitude,
                longitude: myDog.longitude,
            });
    
            const allDogs = dogsData.map((dog, index) => ({
                ...dog,
                dog_id: dog.dog_id || `generated_${index}`,
                similarity_percentage: 0,
                latitude: parseFloat(dog.latitude),
                longitude: parseFloat(dog.longitude),
            }));
    
            console.log("Координаты собак до фильтрации:", allDogs.map(dog => ({
                name: dog.name,
                latitude: dog.latitude,
                longitude: dog.longitude,
            })));
    
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
  }, [user]);
  
  
  useEffect(() => {
    console.log("Current dogs state:", dogs);
  }, [dogs]);
  

  useEffect(() => {
    if (!isToggled && wasToggledOn.current) {
      navigation.navigate('WalkEndScreen');
    }

    wasToggledOn.current = isToggled;
  }, [isToggled]);

  const toggleSwitch = () => setIsToggled(!isToggled);
  
  console.log("Собаки после расчета метчинга:", dogs);

  

  const formatBirthDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('uk-UA', options); 
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#FF6C22" />
      </View>
    ); 
  }


  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-5"
      refreshControl={
        <RefreshControl
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={['#FF6C22']}
          tintColor="#FF6C22" 
          />
        }
      >

        <View className="flex-row justify-between items-center">
          <icons.WalkeyIcon />
          <View className="flex-row items-center ml-auto">
            <Text className="ml-2 text-sm font-semibold">
              {userName} зараз{' '}
            </Text>
            <View className="relative">
              <Text className="text-sm font-semibold">{isToggled ? 'гуляє' : 'вдома'}</Text>
              <View className="absolute left-0 right-0 bg-black" style={{ height: 2, bottom: -1 }} />
            </View>
            <Switch
              value={isToggled}
              onValueChange={toggleSwitch}
              thumbColor={isToggled ? '#F15F15' : '#f4f3f4'}
              trackColor={{ false: '#FED9C6', true: '#FED9C6' }}
              className="ml-2"
              style={{ marginRight: 12, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
            />
           <TouchableOpacity
            onPress={() => {
                console.log("Bell icon clicked");
                navigation.navigate('HomeNotificationModal');
            }}
            >
            <icons.BellIcon />
            </TouchableOpacity>


          </View>
        </View>

     
        <View className="bg-[#FFF7F2] rounded-2xl p-5 mt-6">
          <View className="flex-row items-center ml-[2px]">
            <Image
              source={images.YourDog}
              className="w-20 h-20 rounded-2xl"
            />
            <View className="ml-[28px]">
                <Text className="text-lg font-bold">{userName}</Text> 
                <Text className="text-sm text-gray-600">{breed}</Text>
                <TouchableOpacity
                className="bg-white p-1 rounded-md flex-row items-center mt-2"
                onPress={() => {
                    copyToClipboard(uniqueCode);
                    showNotification('ID скопійован');
                }}
                >
                <Text className="text-base text-black">
                    ID: {formatUniqueCode(uniqueCode)}
                </Text>
                <View className="ml-2 bg-white p-1 rounded">
                    <icons.CopyIcon width={16} height={16} />
                </View>
                </TouchableOpacity>
            </View>
          </View>

          <View className="h-[3px] bg-[#FFCDB5] my-3" />

          <View className="flex-row justify-between mt-2">

            <View className="flex-row items-center">
              {gender === 'male' ? (
                <icons.MaleIcon width={16} height={16} color="black" />
              ) : (
                <icons.FemaleIcon width={16} height={16} color="black" />
              )}
              <Text className="ml-2 text-xs">{gender === 'male' ? 'Хлопчик' : 'Дівчинка'}</Text>
            </View>

            <View className="flex-row items-center">
              <icons.CalendarIcon width={16} height={16} color="black" />
              <Text className="ml-2 text-xs">{formatBirthDate(birthDate)}</Text>
            </View>

            <View className="flex-row items-center">
              <icons.ActiveIcon width={16} height={16} color="black" />
              <Text className="ml-2 text-xs">Активний</Text>
            </View>

          </View>
        </View>

       
        <View className="mt-5">
  <TouchableOpacity
    className="bg-[#FF6C22] py-3 p-4 rounded-full flex-row justify-center items-center"
    onPress={() => {
      if (isToggled) {

        navigation.navigate('map');
      } else {
 
        setIsToggled(true);
      }
    }}
  >
    <Text className="text-center text-white font-bold mr-2">
      {isToggled ? "Знайти нових друзів" : "Почати прогулянку"}
    </Text>
    <icons.WhitePawIcon width={24} height={24} />
  </TouchableOpacity>

  <TouchableOpacity
    className="bg-[#FFE5D8] py-3 p-4 rounded-full mt-3"
    onPress={() => {
      console.log("Створити прогулянку натиснута");
    }}
  >
    <Text className="text-center font-bold">
      {isToggled ? "Покликати нових друзів" : "Створити прогулянку"}
    </Text>
  </TouchableOpacity>
</View>;



        {/*<View className="flex-row justify-between mt-5">
            <View className="bg-gray-100 rounded-lg p-4 flex-1 mr-2">
              <Text className="font-bold">Емоції {userName}</Text>
              <Text>Щасливий 95%</Text>
            </View>
            <View className="bg-gray-100 rounded-lg p-4 flex-1 ml-2">
              <Text className="font-bold">Соціалізація {userName}</Text>
              <Text>Дружелюбний 57%</Text>
            </View>
          </View>*/}

 
        <View className="mt-5">
          <View className="flex-row items-center">
            <Text className="font-bold text-[18px] mr-2">Нагадування</Text>
            <icons.PenIcon />
          </View>
          <View style={{ marginTop: 13 }}>
            <SliderComponent clerkId={user?.id}/>
          </View>
        </View>

     
<View className="mt-5">
    <Text className="font-bold text-[18px] mr-2">Хто поруч на прогулянці?</Text>
    <DogList
    dogs={dogs}
    onDogSelect={(dog) => {
        setSelectedDog(dog);
        setModalVisible(true);
  }}
/>

</View>

{selectedDog && (
  <DogProfileModal
    isVisible={modalVisible}
    onClose={() => setModalVisible(false)}
    dog={selectedDog}
  />
)}


      </ScrollView>

      {notification.isVisible && (
        <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute top-12 left-5 right-5 bg-orange-500 p-4 rounded-lg shadow-lg"
        >
        <Text className="text-white font-bold text-center">{notification.message}</Text>
        </Animated.View>
    )}
    </SafeAreaView>
  );
};

export default Home;
