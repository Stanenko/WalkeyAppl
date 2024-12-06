import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, Dispatch, SetStateAction } from "react";
import "react-native-reanimated";

import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/auth";
import { useUserStore } from "@/store/useUserStore";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  const { setUserData, setDogsData } = useUserStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AppContent setUserData={setUserData} setDogsData={setDogsData} />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

type AppContentProps = {
  setUserData: Dispatch<SetStateAction<any>>;
  setDogsData: Dispatch<SetStateAction<any>>;
};

function AppContent({ setUserData, setDogsData }: AppContentProps) {
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;

      try {
        const SERVER_URL = "http://192.168.0.18:3000";

        const userResponse = await fetch(
          `${SERVER_URL}/api/user?clerkId=${user.id}`
        );
        const userData = await userResponse.json();
        setUserData(userData);

        const dogsResponse = await fetch(
          `${SERVER_URL}/api/users/locations?clerkId=${user.id}`
        );
        const dogsData = await dogsResponse.json();
        setDogsData(dogsData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(root)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
