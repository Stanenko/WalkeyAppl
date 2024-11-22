import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/svg"; 
import { getServerUrl } from "@/utils/getServerUrl";


const GeneralModal = ({ isVisible, onClose }) => {
  const { user } = useUser();
  const [birthDate, setBirthDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;
      try {
        const response = await fetch(`${getServerUrl()}/api/user?clerkId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setBirthDate(data.birth_date || "");
          setImage(data.image || "https://via.placeholder.com/150"); 
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

  const updateBirthDate = async (newDate) => {
    try {
      const response = await fetch(`${getServerUrl()}/api/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          birthDate: newDate,
        }),
      });
  
      if (response.ok) {
        console.log("Дата рождения обновлена!");
        setBirthDate(newDate);
      } else {
        const errorData = await response.text(); 
        console.error("Ошибка сервера при обновлении даты рождения:", errorData);
      }
    } catch (error) {
      console.error("Ошибка при обновлении даты рождения:", error);
    }
  };
  

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Нет доступа", "Пожалуйста, дайте доступ к галерее.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!pickerResult.canceled) {
      const selectedImageUri = pickerResult.assets[0].uri;
      setImage(selectedImageUri);
      uploadImageToDB(selectedImageUri);
    }
  };

  const uploadImageToDB = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("clerkId", user.id);
      formData.append("image", {
        uri: imageUri,
        name: "profile.jpg",
        type: "image/jpeg",
      });
  
      const response = await fetch(`${getServerUrl()}/api/user/image`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      });
  
      if (response.ok) {
        console.log("Фото успешно обновлено!");
      } else {
        const errorData = await response.text();
        console.error("Ошибка при обновлении фото:", errorData);
      }
    } catch (error) {
      console.error("Ошибка при загрузке фото:", error);
    }
  };
  

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#FF6C22" />
      </View>
    );
  }

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <SafeAreaView className="flex-1 bg-white">

        <TouchableOpacity
            style={{ position: "absolute", top: 78, left: 34, zIndex: 10 }}
            onPress={onClose}
            >
            <icons.ArrowLeft width={24} height={24} style={{ color: "#000" }} />
        </TouchableOpacity>


     
        <View style={{ padding: 20, marginTop: 90 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Загальне</Text>

     
          <View className="items-center mt-4">
            <View className="relative">
              <Image source={{ uri: image }} className="w-24 h-24 rounded-full" />
              <TouchableOpacity
                onPress={selectImage}
                style={{
                  position: "absolute",
                  bottom: -5,
                  right: -5,
                  backgroundColor: "#FFF",
                  borderRadius: 50,
                  padding: 5,
                  elevation: 5,
                }}
              >
                <icons.CameraIcon width={24} height={24} color="#FF6C22" />
              </TouchableOpacity>
            </View>
            <Text className="mt-2 text-lg font-bold">{user?.fullName || "Байт"}</Text>
            <Text className="text-gray-500">мопс</Text>
          </View>

     
          <View className="mt-6">
            <Text className="text-sm font-bold">Дата народження</Text>
            <DateTimePicker
              value={birthDate ? new Date(birthDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || new Date(birthDate);
                setBirthDate(currentDate.toISOString().split("T")[0]);
                updateBirthDate(currentDate.toISOString().split("T")[0]);
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GeneralModal;
