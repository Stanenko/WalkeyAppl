import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import "../global.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const requestExpoPushToken = async (clerkId: string): Promise<void> => {
  try {
    if (!Device.isDevice) {
      console.warn("Push notifications не поддерживаются на эмуляторах.");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Пользователь не дал разрешение на уведомления.");
      return;
    }

    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Получен Expo Push Token:", pushToken);

    const API_URL = process.env.EXPO_PUBLIC_LOCAL_SERVER_URL;
    await fetch(`${API_URL}/api/save-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clerkId,
        pushToken,
      }),
    });

    console.log("Токен успешно отправлен на сервер");
  } catch (error) {
    console.error("Ошибка получения Push-токена:", error);
  }
};

const Home = () => {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    const API_URL = process.env.EXPO_PUBLIC_LOCAL_SERVER_URL;

    fetch(`${API_URL}/api/test`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => console.log("Server response:", data))
      .catch((error) => console.error("Error connecting to server:", error));

    if (userId) {
      requestExpoPushToken(userId);
    }
  }, [userId]);

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }
  return <Redirect href="/(auth)/welcome" />;
};

export default Home;
