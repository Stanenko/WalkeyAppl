import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel'; 
import { useUser } from '@clerk/clerk-expo';
import { icons } from "@/constants/svg";
import { images } from "@/constants/index";
import { useNavigation } from '@react-navigation/native';
import DogProfileModal from "@/app/(root)/(modal)/DogProfile";
import { Dog, match_dogs, calculate_geographic_distance } from "@/dogMatching";
import { getServerUrl } from "@/utils/getServerUrl";

const SERVER_URL = "http://192.168.0.18:3000";

const windowWidth = Dimensions.get('window').width;

const slideHeight = 200; 

const data = [
  {
    id: 1,
    title: "Вакцинація",
    subtitle: "Вакцина від сказу / Комплексна вакцина",
    date: "Остання вакцина: 10 березня 2023",
    nextDate: "Наступна вакцина: 10 березня 2024",
    description: "Не забувайте підготувати медичну картку та взяти з собою всі необхідні документи на вакцинацію.",
    backgroundColor: "#E8F3F9"
  },
  {
    id: 2,
    title: "Ліки",
    subtitle: "Протиглистовий засіб",
    date: "Останній прийом: 8 жовтня 2023",
    nextDate: "Наступний прийом: 10 жовтня 2024",
    description: "Налаштуйте автоматичне нагадування до наступного прийому.",
    backgroundColor: "#E5EFE5" 
  }
];

const ReminderCard = ({ item }) => {
  return (
    <View 
      className="rounded-2xl p-4"
      style={{ 
        width: windowWidth - 40, 
        backgroundColor: item.backgroundColor,
        borderRadius: 20,
        height: slideHeight,
      
      }}
    >
      <Text className="font-bold">{item.title}</Text>
      <Text className="mt-2">{item.subtitle}</Text>
      <Text className="mt-1">{item.date}</Text>
      <Text>{item.nextDate}</Text>
      <Text className="mt-2">{item.description}</Text>
      {item.daysLeft && <Text className="mt-2 text-[#FF6C22] font-bold">{item.daysLeft}</Text>}
    </View>
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
    <ScrollView horizontal className="mt-3">
      {dogs.map((dog, index) => (
        <DogCard
          key={dog.dog_id || `${dog.name}_${index}`}
          dog={dog}
          onPress={() => onDogSelect(dog)}
        />
      ))}
    </ScrollView>
  );
  
  
  
  

  

const SliderComponent = () => {
  return (
    <View>
      <Carousel
        loop={false}
        width={windowWidth}
        height={slideHeight}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => <ReminderCard item={item} />}
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
  const [loading, setLoading] = useState(true);
  const [isToggled, setIsToggled] = useState(false);
  const [image, setImage] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);


useEffect(() => {
  const fetchUserData = async () => {
    if (!user || !user.id) return;

    console.log("Fetching user data...");
    try {
      const response = await fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`);
      console.log("Response status for user data:", response.status);

      const data = await response.json();
      console.log("User data response:", data);

      if (response.ok) {
        setUserName(data.name || "Без имени");
        setGender(data.gender || "unknown");
        setBirthDate(data.birth_date || "");
        setImage(data.image || "https://via.placeholder.com/150");
      } else {
        console.error("Error fetching user data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [user]);

useEffect(() => {
    console.log("Current dogs state:", dogs);
  }, [dogs]);
  
// Получение данных о собаках поблизости
useEffect(() => {
  const fetchDogsNearby = async () => {
    if (!user || !user.id) return;

    console.log("Fetching nearby dogs...");
    try {
      const response = await fetch(`${SERVER_URL}/api/users/locations?clerkId=${user.id}`);
      console.log("Response status for nearby dogs:", response.status);

      const data = await response.json();
      console.log("Nearby dogs data response:", data);

      if (response.ok) {
        setDogs(data);
      } else {
        console.error("Error fetching nearby dogs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching nearby dogs:", error);
    }
  };

  fetchDogsNearby();
}, [user]);

// Получение данных о собаках и расчёт метчинга
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
      <ScrollView className="flex-1 p-5">

        {/* Header */}
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
              trackColor={{ false: '#767577', true: '#FED9C6' }}
              className="ml-2"
              style={{ marginRight: 12, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
            />
            <icons.BellIcon />
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
                <Text className="text-sm text-gray-600">Мопс</Text>
                <Text className="text-sm text-gray-600">ID: 1234 5667 8890 1232</Text>
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
            <SliderComponent />
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
    </SafeAreaView>
  );
};

export default Home;
