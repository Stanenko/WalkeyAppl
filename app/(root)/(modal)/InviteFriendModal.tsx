import React, { useState } from "react";
import { Modal, TextInput, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/svg";

const SERVER_URL = "http://192.168.0.134:3000";

interface InviteFriendModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isVisible, onClose }) => {
  const [friendName, setFriendName] = useState<string>("");
  const [friendEmail, setFriendEmail] = useState<string>("");

  const handleInvite = async () => {
    if (!friendEmail || !friendName) {
      Alert.alert("Помилка", "Будь ласка, заповніть усі поля.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: friendEmail }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        Alert.alert("Помилка", "Щось пішло не так: " + errorText);
        return;
      }

      const data = await response.json();
      if (data.exists) {
        Alert.alert("Упс...", "Здається, ваш друг вже зареєстрований.");
      } else {
        await fetch(`${SERVER_URL}/api/send-invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: friendEmail,
            message: `Ваш друг ${friendName} хоче запросити вас доєднатися до додатку Walkey. Ось посилання: https://walkey.com`,
          }),
        });
        Alert.alert("Запрошення надіслано!", `Ваш друг ${friendName} отримав запрошення.`);
        onClose();
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      Alert.alert("Помилка", "Не вдалося надіслати запрошення. Спробуйте пізніше.");
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: "white", padding: 24 }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24 }}
          onPress={onClose}
        >
          <icons.ArrowLeft width={24} height={24} style={{ color: "black" }} />
        </TouchableOpacity>

        <View style={{ marginTop: 64 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 }}>Запросити друга</Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontSize: 16, color: "black" }}>Як звати друга?</Text>
            <TextInput
              style={{ padding: 16, borderWidth: 1, borderRadius: 8, borderColor: "#ccc" }}
              placeholder="Ім'я друга"
              value={friendName}
              onChangeText={setFriendName}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontSize: 16, color: "black" }}>Email друга</Text>
            <TextInput
              style={{ padding: 16, borderWidth: 1, borderRadius: 8, borderColor: "#ccc" }}
              placeholder="friend@example.com"
              value={friendEmail}
              onChangeText={setFriendEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={{ backgroundColor: "#FFE5D1", padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <Text style={{ color: "#FF6C22", fontWeight: "bold", textAlign: "center" }}>
              Запроси 10 друзів і отримай місяць Premium безкоштовно!
            </Text>
            <Text style={{ color: "#FF9A55", textAlign: "center", fontSize: 12, marginTop: 8 }}>
              * Безкоштовні місяці сумуються. Тобто, 120 запрошених друзів дають рік безкоштовно.
            </Text>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: "#FF6C22", padding: 16, borderRadius: 8 }}
            onPress={handleInvite}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Запросити</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InviteFriendModal;
