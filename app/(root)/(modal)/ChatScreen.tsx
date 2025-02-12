import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation, useRoute } from "@react-navigation/native";

const SERVER_URL = "http://192.168.0.18:3000";

const ChatScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, receiverId } = route.params as { chatId: string; receiverId: string };

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/messages/${chatId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
      }
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(`${SERVER_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          sender_id: user?.id,
          receiver_id: receiverId,
          text: newMessage,
        }),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <FlatList data={messages} keyExtractor={(item) => item.message_id} renderItem={({ item }) => (
        <Text>{item.text}</Text>
      )}/>
      <TextInput value={newMessage} onChangeText={setNewMessage} placeholder="Введите сообщение..." />
      <TouchableOpacity onPress={sendMessage}><Text>Отправить</Text></TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
