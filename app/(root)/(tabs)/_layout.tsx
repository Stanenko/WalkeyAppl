import { Tabs } from "expo-router";
import { createStackNavigator } from '@react-navigation/stack';
import WalkEndScreen from '@/app/(root)/(modal)/WalkEndScreen';
import { View } from "react-native";
import { icons } from "@/constants/svg"; 

const Stack = createStackNavigator();

const TabIcon = ({
  IconComponent, 
  focused,
}: {
    IconComponent: React.FC<{ width: number; height: number; fill: string; style?: object }>;
    focused: boolean;
}) => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
    <IconComponent
      style={{
        transform: [{ translateY: focused ? -1 : 0 }],
      }}
      width={28}
      height={28}
      fill={focused ? 'black' : 'gray'}
    />
    {focused && <View style={{ width: 8, height: 8, backgroundColor: 'black', borderRadius: 4, marginTop: 4 }} />}
  </View>
);

const TabsLayout = () => (
  <Tabs
    initialRouteName="home"
    screenOptions={{
      tabBarActiveTintColor: "#FBFBFB",
      tabBarShowLabel: false,
      tabBarStyle: {
        borderRadius: 50,
        paddingBottom: 10,
        height: 80,
        backgroundColor: "#FBFBFB",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
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
  </Stack.Navigator>
);

export default Layout;
