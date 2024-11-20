import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { images } from "@/constants/index";

const screenHeight = Dimensions.get('window').height;

const WalkEndScreen = () => {
  const navigation = useNavigation();
  const [backgroundVisible, setBackgroundVisible] = useState(false);  

  useEffect(() => {
    const timer = setTimeout(() => {
      setBackgroundVisible(true);
    }, 220);

    return () => clearTimeout(timer);  
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {backgroundVisible && (
        <View style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)' 
        }} 
        />
      )}

      <View 
        className="absolute bottom-0 left-0 right-0 bg-white p-6" 
        style={{ 
          borderTopLeftRadius: 30, 
          borderTopRightRadius: 30, 
          height: screenHeight - 115,
          justifyContent: 'flex-start',
        }}
      >
        <View className="items-center mt-7">
          <Text className="text-xl font-bold">Байт закінчив прогулянку!</Text>

          <Image source={images.welcomeLogo} className="w-[150px] h-[150px] mb-8 mt-[130px]" />

          <Text className="text-center text-gray-600 max-w-[250px]">
            Схоже, він ні з ким не побачився :( {'\n'} Скористайтесь метчингом наступного разу для покращення прогулянки.
          </Text>      
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute bottom-[45px] bg-black rounded-full h-[56px] justify-center items-center left-0 right-0 mx-[25px]"
        >
          <Text className="text-white text-center">Добре</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalkEndScreen;
