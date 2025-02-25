import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/svg";
import { useUser } from "@clerk/clerk-expo";
import GeneralModal from "@/app/(root)/(modal)/GeneralModal";
import PermissionsModal from "@/app/(root)/(modal)/PermissionsModal";
import NotificationsModal from "@/app/(root)/(modal)/NotificationsModal";
import InviteFriendModal from "@/app/(root)/(modal)/InviteFriendModal";
import FriendsModal from "@/app/(root)/(modal)/FriendsModal";
import SubscriptionModal from "@/app/(root)/(modal)/SubscriptionModal";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || "http://192.168.0.18:3000";


interface ProfileItem {
  label: string;
  icon?: React.ComponentType<{ width: number; height: number; color?: string; style?: object }>;
  onPress?: () => void;
  rightIcon?: React.ComponentType<{ width: number; height: number; style?: object }>;
}

const Emotions = () => {
  const { user } = useUser();
  const [userName, setUserName] = useState("Байт");
  const [loading, setLoading] = useState(true);
  const [isGeneralModalVisible, setIsGeneralModalVisible] = useState(false);
  const [isPermissionsModalVisible, setIsPermissionsModalVisible] = useState(false);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isAddPetModalVisible, setIsAddPetModalVisible] = useState(false);
  const [isFriendsModalVisible, setIsFriendsModalVisible] = useState(false);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;

      try {
        const response = await fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name || "Ім'я не вказано");
        } else {
          console.error("Ошибка сервера:", data.error);
        }
      } catch (error) {
        console.error("Ошибка при запросе данных пользователя:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const profileItems: ProfileItem[] = [
    { label: "Загальне", icon: icons.GMainIcon, onPress: () => setIsGeneralModalVisible(true) },
    { label: "Друзі", icon: icons.GRiendIcon, onPress: () => setIsFriendsModalVisible(true) },
    { label: "Медичні дані", icon: icons.GMedIcon },
    { label: "Повідомлення", icon: icons.GMessageIcon, onPress: () => setIsNotificationsModalVisible(true) },
  ];

  const privacyItems: ProfileItem[] = [
    { label: "Дозволи", icon: icons.GPermissionIcon, onPress: () => setIsPermissionsModalVisible(true) },
    { label: "Підписка", icon: icons.GDollarIcon, onPress: () => setIsSubscriptionModalVisible(true) },
  ];

  const otherItems: ProfileItem[] = [
    { label: "Додати свого песика", rightIcon: icons.GPlusIcon },
    { label: "Запросити друга", rightIcon: icons.GInviteIcon, onPress: () => setIsInviteModalVisible(true) },
  ];

  const renderSection = (items: ProfileItem[], isGrouped = true) => (
    <View
      style={{
        borderRadius: isGrouped ? 16 : 0,
        overflow: isGrouped ? "hidden" : "visible",
        marginTop: 10,
        width: 380,
        alignSelf: "center",
      }}
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            className="flex-row items-center justify-between px-4 py-4"
            style={{
              backgroundColor: "#FFF7F2",
              borderTopLeftRadius: isFirst && isGrouped ? 16 : 0,
              borderTopRightRadius: isFirst && isGrouped ? 16 : 0,
              borderBottomLeftRadius: isLast && isGrouped ? 16 : 0,
              borderBottomRightRadius: isLast && isGrouped ? 16 : 0,
              borderBottomWidth: isLast && isGrouped ? 0 : 1,
              borderBottomColor: "#FFCDB4",
            }}
          >
            <View className="flex-row items-center">
              {item.icon && (
                <item.icon
                  width={24}
                  height={24}
                  color="#FFCDB4"
                  style={{ marginRight: 15 }}
                />
              )}
              <Text className="ml-3 text-black font-medium">{item.label}</Text>
            </View>
            {icons.GRightIcon && (
              <icons.GRightIcon
                width={24}
                height={24}
                style={{ marginLeft: 12 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSectionCustom = (items: ProfileItem[]) => (
    <View className="mt-3 space-y-3">
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          className="flex-row items-center justify-between px-4 py-4"
          style={{
            backgroundColor: "#FFF7F2",
            borderRadius: 16,
            width: 380,
            alignSelf: "center",
            marginBottom: 10,
          }}
        >
          <View className="flex-row items-center">
            {item.icon && (
              <item.icon
                width={24}
                height={24}
                color="#FFCDB4"
                style={{ marginRight: 15 }}
              />
            )}
            <Text className="ml-3 text-black font-medium">{item.label}</Text>
          </View>
          {item.rightIcon && (
            <item.rightIcon
              width={24}
              height={24}
              style={{ marginLeft: 12 }}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-center px-4 py-3 mt-2">
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Налаштування</Text>
          <Text style={{ marginTop: 10 }} className="text-md text-gray-500 text-center">
            {userName}
          </Text>
        </View>
      </View>

      <ScrollView>
        <GeneralModal
          isVisible={isGeneralModalVisible}
          onClose={() => setIsGeneralModalVisible(false)}
        />

        <PermissionsModal
          isVisible={isPermissionsModalVisible}
          onClose={() => setIsPermissionsModalVisible(false)}
        />

        <NotificationsModal
          isVisible={isNotificationsModalVisible}
          onClose={() => setIsNotificationsModalVisible(false)}
        />

        <InviteFriendModal
          isVisible={isInviteModalVisible}
          onClose={() => setIsInviteModalVisible(false)}
        />

        <FriendsModal 
          isVisible={isFriendsModalVisible} 
          onClose={() => setIsFriendsModalVisible(false)} 
        />

        <SubscriptionModal
          isVisible={isSubscriptionModalVisible}
          onClose={() => setIsSubscriptionModalVisible(false)}
        />

        <View className="px-10 mt-6">
          <Text style={{ fontSize: 18 }} className="text-black font-bold text-base mb-2">Профіль</Text>
          {renderSection(profileItems)}
        </View>

        <View className="px-10 mt-6">
          <Text style={{ fontSize: 18 }} className="text-black font-bold text-base mb-2">Приватність</Text>
          {renderSection(privacyItems)}
        </View>

        <View className="px-10 mt-6">
          <Text style={{ fontSize: 18 }} className="text-black font-bold text-base mb-2">Інше</Text>
          {renderSectionCustom(otherItems)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Emotions;
