import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import { icons } from "@/constants/svg";

const SERVER_URL = "https://walkey-production.up.railway.app";


interface Notification {
  id: string;
  receiver_id: string;
  title: string;
  body: string;
  created_at: string;
}

interface HomeNotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HomeNotificationModal: React.FC<HomeNotificationModalProps> = ({
  isVisible,
  onClose,
}) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    if (!user?.id) {
      console.error("User ID is not available");
      return;
    }

    const url = `${SERVER_URL}/api/notifications?receiverId=${user.id}`;

    try {
      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (response.ok) {
        const data: Notification[] = await response.json();
        console.log("Fetched notifications:", data);

        setNotifications(data);
        console.log("Notifications state updated:", data);
      } else {
        const errorText = await response.text();
        console.error("Error fetching notifications:", errorText);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      console.log("Modal is visible. Starting to fetch notifications...");
      fetchNotifications();
    } else {
      console.log("Modal is not visible. Skipping fetch.");
    }
  }, [isVisible, user]);

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              position: "relative",
              marginTop: 75,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                left: 30,
              }}
              onPress={() => navigation.goBack()}
            >
              <icons.ArrowLeft width={24} height={24} style={{ color: "#000" }} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Повідомлення
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {notifications.length === 0 ? (
  <Text
    style={{
      color: "gray",
      textAlign: "center",
    }}
  >
    У вас пока что нет уведомлений
  </Text>
) : (
  <View>
    {notifications.map((notification, index) => (
      <Text key={index} style={{ color: "black", marginBottom: 10 }}>
        {JSON.stringify(notification, null, 2)}
      </Text>
    ))}
  </View>
)}

          </View>
        </View>
      </View>
    </Modal>
  );
};

export default HomeNotificationModal;
