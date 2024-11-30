import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';
import '../global.css';

const Home = () => {

    useEffect(() => {
        const API_URL = process.env.EXPO_PUBLIC_LOCAL_SERVER_URL;
    
        fetch(`${API_URL}/api/test`, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((data) => console.log("Server response:", data))
          .catch((error) => console.error("Error connecting to server:", error));
      }, []);
    
    const { isSignedIn } = useAuth()
  
    if (isSignedIn) {
      return <Redirect href="/(root)/(tabs)/home" />
    }
    return <Redirect href="/(auth)/welcome" />; 
  };
  
  export default Home;
  