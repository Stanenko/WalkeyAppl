import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser, useClerk } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { icons } from "@/constants/svg";
import { useNavigation } from "@react-navigation/native";
import { uploadImageToFirebase } from "@/utils/firebaseStorageUtils";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router } from "expo-router"; 

const SERVER_URL = "https://walkey-production.up.railway.app";

type RootStackParamList = {
  welcome: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "welcome">; 

interface GeneralModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const GeneralModal: React.FC<GeneralModalProps> = ({ isVisible, onClose }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [birthDate, setBirthDate] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Байт");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const [breed, setBreed] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;
  
      try {
        const response = await fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`);
        const data = await response.json();
        console.log("Полученные данные пользователя:", data);
  
        setUserName(data.name);
        setEmail(data.email);
        setBreed(data.breed);
        
        if (data.image) {
          setImage(data.image);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [user]);  

  const updateBirthDate = async (newDate: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user?.id,
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

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Нет доступа к галерее!", "Пожалуйста, предоставьте доступ.");
      return;
    }
  
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  
    if (!pickerResult.canceled) {
      const imageUri = pickerResult.assets[0].uri;
      
      setImage(imageUri);
  
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
        formData.append("clerkId", user?.id || "");
  
        const response = await fetch(`${SERVER_URL}/api/upload`, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log("Фото загружено");
  
          setImage(result.url);
          Alert.alert("Успешно", "Фото успешно загружено!");
        } else {
          const errorText = await response.text();
          console.error("Ошибка сервера при загрузке изображения:", errorText);
          Alert.alert("Ошибка", "Не удалось загрузить фото на сервер.");
        }
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
        Alert.alert("Ошибка", "Произошла ошибка при загрузке фото.");
      }
    }
  };  
   
  const handleSignOut = async () => {
    setShowSignOutConfirmation(false);
    try {
      await signOut();
  
      router.replace("/(auth)/welcome"); 
      
      setTimeout(() => {
        onClose(); 
      }, 100);
    } catch (error) {
      console.error("Ошибка при выходе из профиля:", error);
    }
  };
  
  const handleDeleteProfile = async () => {
    setShowDeleteConfirmation(false);
    try {
      const response = await fetch(`${SERVER_URL}/api/user?clerkId=${user?.id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка удаления: ${errorText}`);
      }
  
      console.log("Профиль удален");
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Ошибка при удалении профиля:", error);
      Alert.alert("Помилка", "Не вдалося видалити профіль.");
    }
  };
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#FF6C22" />
      </View>
    );
  }

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onPress={onClose}
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
              onPress={onClose}
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
              Загальне
            </Text>
          </View>

          <View style={{ padding: 20 }}>
          <View style={{ alignItems: "center", marginTop: 20 }}>
  <View style={{ position: "relative" }}>
    <Image
      source={{ uri: image || "https://via.placeholder.com/150" }}
      style={{
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "lightgray", 
      }}
    />
    <TouchableOpacity
      onPress={handleImageUpload}
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
  <Text style={{ marginTop: 8, fontSize: 18, fontWeight: "bold" }}>
    {userName}
  </Text>
  <Text style={{ color: "#6B7280" }}>{breed}</Text>
</View>


            <View style={{ marginTop: 40 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>Дата народження</Text>
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 5 }}>
                <DateTimePicker
                  style={{ marginLeft: -20 }}
                  value={birthDate ? new Date(birthDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || new Date(birthDate);
                    const formattedDate = currentDate.toISOString().split("T")[0];
                    setBirthDate(formattedDate);
                    updateBirthDate(formattedDate);
                  }}
                  textColor="#5E5E5E"
                />
              </View>
            </View>

            <View style={{ marginTop: 30 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>Електронна пошта</Text>
              <View
                style={{
                  padding: 15,
                  backgroundColor: "#F0F0F0",
                  borderRadius: 10,
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16, color: "#000000" }}>
                  {email || "Додати електронну пошту"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                marginTop: 40,
                padding: 15,
                backgroundColor: "#FF6C22",
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={() => setShowSignOutConfirmation(true)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Вийти з профіля</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 15,
                padding: 15,
                alignItems: "center",
                width: "100%", 
              }}
              onPress={() => setShowDeleteConfirmation(true)}
            >
              <Text
                style={{
                  color: "red",
                  fontWeight: "bold",
                  textDecorationLine: "underline",
                  fontSize: 16,
                }}
              >
                Видалити профіль
              </Text>
            </TouchableOpacity>


            {showSignOutConfirmation && (
              <Modal transparent={true} animationType="fade">
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <View
                    style={{
                      width: 300,
                      padding: 20,
                      backgroundColor: "white",
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
                      Ви справді бажаєте вийти?
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#FF6C22",
                          padding: 10,
                          borderRadius: 5,
                          marginHorizontal: 10,
                        }}
                        onPress={handleSignOut}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>Так</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#F0F0F0",
                          padding: 10,
                          borderRadius: 5,
                          marginHorizontal: 10,
                        }}
                        onPress={() => setShowSignOutConfirmation(false)}
                      >
                        <Text style={{ fontWeight: "bold" }}>Ні</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}

            {showDeleteConfirmation && (
              <Modal transparent={true} animationType="fade">
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                  <View style={{ width: 300, padding: 20, backgroundColor: "white", borderRadius: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
                      Ви впевнені, що хочете видалити профіль?
                    </Text>
                    <TouchableOpacity
                      style={{ backgroundColor: "red", padding: 10, borderRadius: 5, marginBottom: 10 }}
                      onPress={handleDeleteProfile}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>Так, видалити</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 10, borderRadius: 5 }}
                      onPress={() => setShowDeleteConfirmation(false)}
                    >
                      <Text style={{ fontWeight: "bold" }}>Скасувати</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default GeneralModal;  
