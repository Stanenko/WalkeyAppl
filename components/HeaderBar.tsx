import React from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { icons } from "@/constants/svg";

const HeaderBar = ({
  userName,
  isToggled,
  toggleSwitch,
  onNotificationPress,
}: {
  userName: string;
  isToggled: boolean;
  toggleSwitch: () => void;
  onNotificationPress: () => void;
}) => {
  return (
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
  );
};

export default HeaderBar;
