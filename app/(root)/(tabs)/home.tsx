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
import CreateWalkModal from "@/app/(root)/(modal)/CreateWalkModal";
import * as Clipboard from 'expo-clipboard';
import { useToggleStore } from "@/store/toggleStore";
import useFetchDogs from "@/hooks/useFetchDogs";

const SERVER_URL = "https://7d72-93-200-239-96.ngrok-free.app";

const fetchDataFromAPI = async (url: string, errorMessage: string): Promise<any> => {
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

const calculateDaysUntil = (nextDate: string | undefined): number | null => {
  if (!nextDate) return null;
  const today = new Date();
  const targetDate = new Date(nextDate);

  if (isNaN(targetDate.getTime())) {
    console.error("Некорректная дата:", nextDate);
    return null;
  }

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface ReminderCardProps {
  item: {
    id: number;
    title: string;
    subtitle?: string;
    date?: string;
    nextDate?: string;
    description?: string;
    backgroundColor: string;
  };
  onPress: () => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ item, onPress }) => {
  const daysUntilNext: number | null = item.nextDate ? calculateDaysUntil(item.nextDate) : null;

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
          <Text className="font-bold text-black">Через {daysUntilNext} днів</Text>
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

interface DogInterface {
  dog_id?: string;
  name?: string;
  gender?: "male" | "female" | undefined;
  breed?: string;
  distance?: number;
  similarity_percentage?: number;
  [key: string]: any;
}

interface DogListProps {
  dogs: DogInterface[];
  onDogSelect: (dog: DogInterface) => void;
}

const DogList: React.FC<DogListProps> = ({ dogs, onDogSelect }) => {
  const navigation = useNavigation();

  if (dogs.length === 0) {
    return (
      <View style={{ marginTop: 50 }} className="flex items-center justify-center">
        <TouchableOpacity onPress={() => navigation.navigate('map' as never)}>
          <Text className="text-gray-500 font-bold text-center mb-2">
            Поки що поряд з вами ніхто не гуляє
          </Text>
          <Text className="text-[#FF6C22] font-bold text-center">
            Подивитися на мапі
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView horizontal className="mt-3" showsHorizontalScrollIndicator={false}>
      {dogs.map((dog: DogInterface, index: number) => (
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
            source={dog.image ? { uri: dog.image } : images.OtherDogs}
            style={{
              width: 80,
              height: "100%",
              borderRadius: 12,
              marginRight: 10,
            }}
          />
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>
                {dog.name || "Без имени"}
              </Text>
              {dog.gender === "male" ? (
                <icons.MaleIcon width={18} height={18} color="black" />
              ) : (
                <icons.FemaleIcon width={22} height={22} color="black" />
              )}
            </View>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
              {dog.breed || "Не указано"}
            </Text>
            <Text style={{ fontSize: 12, color: "#FF6C22", fontWeight: "bold", marginTop: 6 }}>
              {dog.distance ? `${Math.round(dog.distance)} м` : "Расстояние неизвестно"}
            </Text>
            <Text className="text-orange-500 font-bold text-xs mt-1">
              {dog.similarity_percentage || 0}% метч
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};


interface SliderComponentProps {
  clerkId: string;
}

interface Slide {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string;
  backgroundColor: string;
  icon?: (props: { width: number; height: number; fill?: string }) => JSX.Element;
  date?: string;
  nextDate?: string;
  daysUntilNext?: number | null;
}

const SliderComponent: React.FC<SliderComponentProps> = ({ clerkId }) => {
  const navigation = useNavigation();

  const [slidesData, setSlidesData] = useState<Slide[]>([]);

  const formatDateToUkrainian = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("uk-UA", options);
  };

  const calculateDaysUntil = (nextDate: string): number | null => {
    if (!nextDate) return null;
    const today = new Date();
    const targetDate = new Date(nextDate);

    if (isNaN(targetDate.getTime())) {
      console.error("Некорректная дата:", nextDate);
      return null;
    }

    const diffTime = targetDate.getTime() - today.getTime();
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

        let vaccinationData = vaccinationResponse.ok
          ? await vaccinationResponse.json()
          : [];
        let protectionData = protectionResponse.ok
          ? await protectionResponse.json()
          : [];

        const today = new Date();

        vaccinationData = vaccinationData.filter((item: { nextdate: string }) => new Date(item.nextdate) >= today);
        protectionData = protectionData.filter((item: { nextdate: string }) => new Date(item.nextdate) >= today);
        console.log("Protection data before filtering:", protectionData);


        const slides: Slide[] = [];

        if (vaccinationData.length > 0) {
          const nearestVaccination = vaccinationData.reduce((prev: Slide, curr: Slide) => {
            const prevDate = new Date(prev.nextDate || 0);
            const currDate = new Date(curr.nextDate || 0);
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
          const nearestProtection = protectionData.reduce((z, curr) => {
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
        renderItem={({ item }: { item: Slide }) => (
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
            {item.daysUntilNext != null && item.daysUntilNext > 0 && (
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

const Home = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const wasToggledOn = useRef(false);
  const [userName, setUserName] = useState('Байт');
  const [gender, setGender] = useState('male');
  const [birthDate, setBirthDate] = useState('');
  const isToggled = useToggleStore((state) => state.isToggled);
  const setIsToggled = useToggleStore((state) => state.setIsToggled);
  const [image, setImage] = useState(null);
  const { dogs, loading } = useFetchDogs(user || null, SERVER_URL);
  const [breed, setBreed] = useState("Не dказано");
  const [uniqueCode, setUniqueCode] = useState("Не вказано");
  const [selectedDog, setSelectedDog] = useState<DogInterface | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({ isVisible: false, message: '' });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isWalkModalVisible, setWalkModalVisible] = useState(false);

  useEffect(() => {
    console.log("Clerk ID:", user?.id);
  }, [user]);

  const showNotification = (text: string) => {
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

  const onDogSelect = (dog: DogInterface) => {
    setSelectedDog({
      image: dog.image || null,
      name: dog.name || "Без имени",
      similarity_percentage: dog.similarity_percentage || 0,
      status: dog.status || "вдома",
      gender: dog.gender || "unknown",
      breed: dog.breed || "Не указано",
      age: dog.age || 0, 
      walkingPlace: dog.walkingPlace || "Не указано",
    });
    setModalVisible(true); 
  };
  
  const fetchUserData = async () => {
    if (!user || !user.id) return;
  
    try {
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
    } catch (error) {
      console.error("Error fetching user or dog data:", error);
    }
  };
  


  const formatUniqueCode = (code: string | undefined): string => {
    if (!code) return "0000 0000 0000 0000";
    return code.replace(/(.{4})/g, "$1 ").trim();
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await Clipboard.setStringAsync(text);
      console.log('ID скопирован:', text);
    } catch (error) {
      console.error('Ошибка копирования в буфер обмена:', error);
    }
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
      try {
        const userData = await fetchDataFromAPI(
          `${SERVER_URL}/api/user?clerkId=${user?.id}`,
          "Error fetching user data"
        );
  
        if (userData) {
          setUserName(userData.name || "Без имени");
          setBreed(userData.breed || "Не указано");
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };
  
    if (user?.id) {
      fetchInitialData();
    }
  }, [user?.id]);
  

  useEffect(() => {
    console.log("Current dogs state:", dogs);
  }, [dogs]);

  useEffect(() => {
    console.log("Current dogs state:", dogs);
  }, [dogs]);


  useEffect(() => {
    if (!isToggled && wasToggledOn.current) {
      navigation.navigate('WalkEndScreen');
    }
  
    wasToggledOn.current = isToggled;
  }, [isToggled, navigation]);

  const toggleSwitch = () => {
    setIsToggled(!isToggled);
  };
  

  console.log("Собаки после расчета метчинга:", dogs);



  const formatBirthDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
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
          <icons.WalkeyIcon width={22} height={22} />
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
              <icons.BellIcon width={22} height={22} />
            </TouchableOpacity>


          </View>
        </View>


        <View className="bg-[#FFF7F2] rounded-2xl p-5 mt-6">
          <View className="flex-row items-center ml-[2px]">
            <Image
              source={image ? { uri: image } : images.YourDog}
              style={{ width: 80, height: 80, borderRadius: 12 }}
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
              <icons.CalendarIcon width={16} height={16} />
              <Text className="ml-2 text-xs">{formatBirthDate(birthDate)}</Text>
            </View>

            <View className="flex-row items-center">
              <icons.ActiveIcon width={16} height={16} />
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
            onPress={() => setWalkModalVisible(true)} 
          >
            <Text className="text-center font-bold">
              {isToggled ? "Покликати нових друзів" : "Створити прогулянку"}
            </Text>
          </TouchableOpacity>

          <CreateWalkModal
            isVisible={isWalkModalVisible}
            onClose={() => setWalkModalVisible(false)} 
          />
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
            <icons.PenIcon width={22} height={22} />
          </View>
          <View style={{ marginTop: 13 }}>
            <SliderComponent clerkId={user?.id || ''} />
          </View>
        </View>


        <View className="mt-5">
          <Text className="font-bold text-[18px] mr-2">Хто поруч на прогулянці?</Text>
            <DogList
              dogs={dogs}
              onDogSelect={onDogSelect} 
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
