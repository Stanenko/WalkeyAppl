import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { icons } from "@/constants/svg";

const HomeNotificationModal = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <icons.ArrowLeft width={24} height={24} style={{ color: "#000" }} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-4">Повідомлення</Text>
      </View>

      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-center">У вас поки що ще немає повідомлень</Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeNotificationModal;
