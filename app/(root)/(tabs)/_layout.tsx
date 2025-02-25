import { Tabs } from "expo-router";
import { createStackNavigator } from '@react-navigation/stack';
import WalkEndScreen from '@/app/(root)/(modal)/WalkEndScreen';
import HomeNotificationModal from '@/app/(root)/(modal)/HomeNotificationModal';
import ChatScreen from '@/app/(root)/(modal)/ChatScreen';
import { RouteProp } from "@react-navigation/native";

import { View } from "react-native";
import { icons } from "@/constants/svg";

type RootStackParamList = {
  Tabs: undefined;
  WalkEndScreen: undefined;
  HomeNotificationModal: undefined;
  ChatScreen: { chatId: string; receiverId: string };
};

const Stack = createStackNavigator<RootStackParamList>();


const TabIcon = ({
    IconComponent,
    focused,
  }: {
    IconComponent: React.FC<{ width: number; height: number; fill: string; style?: object }>;
    focused: boolean;
  }) => {
    const defaultFill = IconComponent === icons.HomeIcon ? '#FFF7F2' : '#FFE5D8';
  
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <IconComponent
          style={{
            transform: [{ translateY: focused ? -1 : 0 }],
          }}
          width={28}
          height={28}
          fill={focused ? '#FF6C22' : defaultFill}
        />
        {focused && <View style={{ width: 8, height: 8, backgroundColor: '#FF6C22', borderRadius: 4, marginTop: 4 }} />}
      </View>
    );
  };
  
const TabsLayout = () => (
  <Tabs
    initialRouteName="home"
    screenOptions={{
      tabBarActiveTintColor: "#FF6C22",
      tabBarShowLabel: false,
      tabBarStyle: {
        borderRadius: 50,
        paddingBottom: 5,
        paddingTop: 10,
        height: 80,
        backgroundColor: "#FFF7F2",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        boxShadow: "#A0522D",
        elevation: 5,
      },
    }}
  >
    <Tabs.Screen
      name="home"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.HomeIcon} />
        ),
        tabBarItemStyle: {
          paddingLeft: 20,
        },
      }}
    />
    <Tabs.Screen
      name="map"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.MapIcon} />
        ),
      }}
    />
    <Tabs.Screen
      name="doctor"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.DoctorIcon} />
        ),
      }}
    />
    <Tabs.Screen
      name="emotions"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.EmotionsIcon} />
        ),
        tabBarItemStyle: {
          paddingRight: 20,
        },
      }}
    />
  </Tabs>
);

const Layout = () => (
  <Stack.Navigator> 

    <Stack.Screen 
      name="Tabs" 
      component={TabsLayout} 
      options={{ headerShown: false }} 
    />
    
    <Stack.Screen
      name="WalkEndScreen"
      component={WalkEndScreen}
      options={{
        headerShown: false, 
        presentation: 'transparentModal', 
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateY: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.height, 0],
                }),
              },
            ],
          },
        }),
      }} 
    />

    <Stack.Screen
    name="HomeNotificationModal"
    component={HomeNotificationModal}
    options={{
        headerShown: false,
        presentation: 'transparentModal', 
        cardStyle: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    }}
    />

<Stack.Screen
  name="ChatScreen"
  component={ChatScreen}
  options={{
    headerShown: false, 
    presentation: 'modal', 
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    }),
  }} 
/>


  </Stack.Navigator>
);

export default Layout;
