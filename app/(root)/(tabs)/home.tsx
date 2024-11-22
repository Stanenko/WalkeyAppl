import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel'; 
import { useUser } from '@clerk/clerk-expo';
import { icons } from "@/constants/svg";
import { images } from "@/constants/index";
import { useNavigation } from '@react-navigation/native';

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return; 

      try {
        const response = await fetch(`http://192.168.0.29:3000/api/user?clerkId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name); 
          setGender(data.gender); 
          setBirthDate(data.birth_date); 
          setImage(data.image || 'https://via.placeholder.com/150');
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!isToggled && wasToggledOn.current) {
      navigation.navigate('WalkEndScreen');
    }

    wasToggledOn.current = isToggled;
  }, [isToggled]);

  const toggleSwitch = () => setIsToggled(!isToggled);


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

        {/* Pet Profile */}
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

        {/* Buttons */}
        <View className="mt-5">
          <TouchableOpacity className="bg-[#FF6C22] py-3 p-4 rounded-full flex-row justify-center items-center">
            <Text className="text-center text-white font-bold mr-2">
              {isToggled ? 'Знайти нових друзів' : 'Почати прогулянку'}
            </Text>
            <icons.WhitePawIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity className="bg-[#FFE5D8] py-3 p-4 rounded-full mt-3">
            <Text className="text-center font-bold">
              {isToggled ? 'Покликати нових друзів' : 'Створити прогулянку'}
            </Text>
          </TouchableOpacity>
        </View>


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

        {/* Friends */}
        <View className="mt-5">
          <Text className="font-bold">Хто поруч на прогулянці?</Text>
          <ScrollView horizontal className="mt-3">

            <View className="bg-gray-100 rounded-lg p-3 mr-3">
              <Image
                source={{ uri: 'https://example/friend1' }} 
                className="w-16 h-16 rounded-full"
              />
              <Text>Піксі</Text>
            </View>

            <View className="bg-gray-100 rounded-lg p-3 mr-3">
              <Image
                source={{ uri: 'https://example/friend2' }} 
                className="w-16 h-16 rounded-full"
              />
              <Text>Кай</Text>
            </View>

            <View className="bg-gray-100 rounded-lg p-3">
              <Image
                source={{ uri: 'https://example/friend3' }} 
                className="w-16 h-16 rounded-full"
              />
              <Text>Каспер</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
