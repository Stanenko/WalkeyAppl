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
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { icons } from "@/constants/svg";

const SERVER_URL = "https://799d-93-200-239-96.ngrok-free.app";

interface GeneralModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const GeneralModal: React.FC<GeneralModalProps> = ({ isVisible, onClose }) => {
  const { user } = useUser();
  const [birthDate, setBirthDate] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Байт"); 
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;
      try {
        const response = await fetch(`${SERVER_URL}/api/user?clerkId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setBirthDate(data.birth_date || "");
          setImage(data.image || "https://via.placeholder.com/150");
          setUserName(data.name || "Байт");
          setEmail(data.email || null);
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
      const selectedImageUri = pickerResult.assets?.[0]?.uri;
      if (selectedImageUri) {
        setImage(selectedImageUri);
        uploadImageToDB(selectedImageUri);
      }
    }
  };

  const uploadImageToDB = async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append("clerkId", user?.id || "");
      formData.append("image", {
        uri: imageUri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as unknown as Blob);

      const response = await fetch(`${SERVER_URL}/api/user/image`, {
        method: "PATCH",
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
                  }}
                />
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
              <Text style={{ marginTop: 8, fontSize: 18, fontWeight: "bold" }}>
                {userName}
              </Text>
              <Text style={{ color: "#6B7280" }}>мопс</Text>
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
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default GeneralModal;
