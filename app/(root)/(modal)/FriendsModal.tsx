import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { icons } from "@/constants/svg";

interface FriendsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface User {
  image: string;
  name: string;
}

const SERVER_URL = "https://7d72-93-200-239-96.ngrok-free.app";

const FriendsModal: React.FC<FriendsModalProps> = ({ isVisible, onClose }) => {
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const searchUserByCode = async () => {
    if (!uniqueCode.trim()) {
      Alert.alert("Помилка", "Введіть унікальний код користувача");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/user?uniqueCode=${uniqueCode}`);
      if (response.ok) {
        const data: User = await response.json();
        setFoundUser(data);
      } else {
        setFoundUser(null);
        Alert.alert("Помилка", "Користувача не знайдено");
      }
    } catch (error) {
      console.error("Помилка пошуку користувача:", error);
      Alert.alert("Помилка", "Не вдалося виконати пошук");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const payload = {
        senderId: "CURRENT_USER_ID", 
        receiverCode: uniqueCode,
      };
  
      const response = await fetch(`${SERVER_URL}/api/friends/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.warn("Ошибка сервера:", errorMessage);
        Alert.alert("Ошибка", "Не удалось отправить запрос на дружбу");
        return;
      }
  
      Alert.alert("Успех", "Запрос на дружбу отправлен");
      resetModalState();
    } catch (error) {
      console.error("Ошибка отправки запроса на дружбу:", error);
      Alert.alert("Ошибка", "Не удалось отправить запрос на дружбу. Проверьте подключение к сети.");
    }
  };
  
  const resetModalState = () => {
    setIsAddFriendModalVisible(false);
    setUniqueCode("");
    setFoundUser(null);
  };  

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
              Друзі
            </Text>
          </View>

          <View
            style={{
              position: "absolute",
              left: 38,
              top: 170,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setIsAddFriendModalVisible(true)}
              style={{
                backgroundColor: "#FFE5D8",
                borderRadius: 50,
                width: 80,
                height: 80,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <icons.GPlusIcon width={40} height={40} fill="#FF6C22" />
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 8,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Додати
            </Text>
          </View>

          <Modal
            visible={isAddFriendModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsAddFriendModalVisible(false)}
          >
            <Pressable
              style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center" }}
              onPress={() => setIsAddFriendModalVisible(false)}
            >
              <View
                style={{
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 20,
                  alignSelf: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Поиск друга</Text>
                <TextInput
                  value={uniqueCode}
                  onChangeText={setUniqueCode}
                  placeholder="Введіть унікальний код користувача"
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 20,
                  }}
                />
                <TouchableOpacity
                  onPress={searchUserByCode}
                  style={{
                    backgroundColor: "#FF6C22",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>Найти</Text>
                </TouchableOpacity>

                {loading && <ActivityIndicator size="large" color="#FF6C22" style={{ marginTop: 20 }} />}

                {foundUser && (
                  <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Image
                      source={{ uri: foundUser.image || "https://via.placeholder.com/150" }}
                      style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
                    />
                    <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>{foundUser.name}</Text>
                    <TouchableOpacity
                      onPress={sendFriendRequest}
                      style={{
                        backgroundColor: "#FF6C22",
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>Запросить дружбу</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Pressable>
          </Modal>
        </View>
      </Pressable>
    </Modal>
  );
};

export default FriendsModal;
