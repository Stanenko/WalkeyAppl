import React, { useState } from "react";
import { Modal, TextInput, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/svg";

const SERVER_URL = "http://192.168.0.18:3000";

const InviteFriendModal = ({ isVisible, onClose }) => {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

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
      if (response.ok) {
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
      } else {
        Alert.alert("Помилка", data.message || "Щось пішло не так.");
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      Alert.alert("Помилка", "Не вдалося надіслати запрошення. Спробуйте пізніше.");
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <SafeAreaView className="flex-1 bg-white p-6">
        <TouchableOpacity className="absolute top-6 left-6" onPress={onClose}>
          <icons.ArrowLeft width={24} height={24} className="text-black" />
        </TouchableOpacity>

        <View className="mt-16">
          <Text className="text-2xl font-bold text-center mb-6">Запросити друга</Text>

          <View className="mb-4">
            <Text className="mb-2 text-black text-base">Як звати друга?</Text>
            <TextInput
              className="p-4 border rounded-lg border-gray-300"
              placeholder="Ім'я друга"
              value={friendName}
              onChangeText={setFriendName}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-black text-base">Email друга</Text>
            <TextInput
              className="p-4 border rounded-lg border-gray-300"
              placeholder="friend@example.com"
              value={friendEmail}
              onChangeText={setFriendEmail}
              keyboardType="email-address"
            />
          </View>

          <View className="bg-orange-100 p-4 rounded-lg mb-6">
            <Text className="text-orange-600 font-bold text-center">
              Запроси 10 друзів і отримай місяць Premium безкоштовно!
            </Text>
            <Text className="text-orange-400 text-center text-sm mt-2">
              * Безкоштовні місяці сумуються. Тобто, 120 запрошених друзів дають рік безкоштовно.
            </Text>
          </View>

          <TouchableOpacity
            className="bg-orange-500 py-4 rounded-lg"
            onPress={handleInvite}
          >
            <Text className="text-white text-center font-bold">Запросити</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InviteFriendModal;
