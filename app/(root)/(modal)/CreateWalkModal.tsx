import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import { useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { icons } from "@/constants/svg"; 

const SERVER_URL = "https://ce95-93-200-239-96.ngrok-free.app";

interface Walk {
  id: number;
  date: string;
  time: string;
  location_latitude: number;
  location_longitude: number;
}

interface CreateWalkModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CreateWalkModal: React.FC<CreateWalkModalProps> = ({ isVisible, onClose }) => {
  const { user } = useUser();
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 0, 
    longitude: 0,
  });  
  const [mapVisible, setMapVisible] = useState(false);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Помилка", "Доступ до місцезнаходження відхилено.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    };

    if (mapVisible) {
      getUserLocation();
    }
  }, [mapVisible]);

  const fetchWalks = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/walks?clerkId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setWalks(data);
      } else {
        console.error("Error fetching walks:", await response.text());
        setWalks([]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const saveWalkToDB = async () => {
    if (!date || !time || !location) {
      Alert.alert("Помилка", "Будь ласка, заповніть усі поля.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/api/walks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user?.id,
          date: date.toISOString().split("T")[0],
          time: time.toISOString().split("T")[1],
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (response.ok) {
        fetchWalks();
      } else {
        const errorData = await response.text();
        console.error("Помилка сервера:", errorData);
        Alert.alert("Помилка", "Не вдалося зберегти прогулянку.");
      }
    } catch (error) {
      console.error("Помилка:", error);
      Alert.alert("Помилка", "Сталася помилка під час збереження.");
    } finally {
      setLoading(false);
    }
  };

  const deleteWalk = async (walkId: number) => {
    if (!user?.id) {
      Alert.alert("Помилка", "Користувач не автентифікований.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/walks/${walkId}?clerkId=${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchWalks();
      } else {
        const errorData = await response.json();
        Alert.alert("Помилка", errorData.error || "Не вдалося видалити прогулянку.");
      }
    } catch (error) {
      console.error("Помилка:", error);
      Alert.alert("Помилка", "Сталася помилка під час видалення.");
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchWalks();
    }
  }, [isVisible]);

  const formatDateTime = (dateString: string, timeString: string) => {
    if (!dateString || !timeString) return "Неверная дата/время";
    try {
      const [hour, minute] = timeString.split(":");
      const date = new Date(dateString);
      date.setHours(Number(hour), Number(minute));
      return `${date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return "Неверная дата/время";
    }
  };

  const sortedWalks = [...walks].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateA - dateB;
  });

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center" }}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 15,
            marginHorizontal: 20,
            alignItems: "center",
          }}
          onPress={() => {}}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>Створити прогулянку</Text>

          <Text style={{ fontSize: 16, marginBottom: 10 }}>Оберіть дату:</Text>
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            minimumDate={today} 
            onChange={(event, selectedDate) => setDate(selectedDate || date)}
          />

          <Text style={{ fontSize: 16, marginTop: 20, marginBottom: 10 }}>Оберіть час:</Text>
          <DateTimePicker
            value={time || new Date()}
            mode="time"
            display="default"
            minimumDate={
              date?.toDateString() === today.toDateString() ? today : undefined
            } 
            onChange={(event, selectedTime) => setTime(selectedTime || time)}
          />

          <TouchableOpacity
            onPress={() => setMapVisible(true)}
            style={{
              backgroundColor: "#FFE5D8",
              paddingVertical: 10,
              borderRadius: 10,
                marginTop: 20,
                width: 340,
                alignSelf: "center", 
            }}
          >
            <Text style={{ color: "#FF6C22", fontWeight: "bold", textAlign: "center" }}>Вибрати місце на мапі</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={saveWalkToDB}
            style={{
                backgroundColor: "#FF6C22",
                paddingVertical: 13,
                borderRadius: 40,
                marginTop: 15,
                width: 340,
                alignSelf: "center", 
            }}
            >
            <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                {loading ? "Зберігається..." : "Зберегти прогулянку"}
            </Text>
            </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 15 }}>
            <Text style={{ color: "#FF6C22", fontWeight: "bold" }}>Скасувати</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 30, marginBottom: 10 }}>
            Заплановані прогулянки:
          </Text>
          {sortedWalks.length === 0 ? (
            <Text style={{ fontSize: 14, fontStyle: "italic", color: "gray" }}>
              Поки що запланованих прогулянок немає
            </Text>
          ) : (
            <FlatList
            data={sortedWalks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View
                style={{
                    backgroundColor: "#FFE5D8",
                    padding: 5,
                    paddingLeft: 15,
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: 340, 
                    alignSelf: "center", 
                }}
                >
                <Text
                    style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    textAlign: "left",
                    }}
                >
                    {formatDateTime(item.date, item.time)}
                </Text>
                <TouchableOpacity onPress={() => deleteWalk(item.id)}>
                    <Text style={{ fontWeight: "bold", paddingRight: 10, fontSize: 24, color: "#FF6C22" }}>−</Text>
                </TouchableOpacity>
                </View>
            )}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {mapVisible && (
        <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
          <View style={{ flex: 1 }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: location?.latitude || 56.0,
                longitude: location?.longitude || 12.7,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) =>
                setLocation({
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                })
              }
            >
              {location && (
                <Marker coordinate={location}>
                  <icons.PawIcon width={40} height={40} />
                </Marker>
              )}
            </MapView>
            <TouchableOpacity
            onPress={() => setMapVisible(false)}
            style={{
                position: "absolute",
                bottom: 50,
                left: "50%",
                transform: [{ translateX: -90 }], 
                backgroundColor: "#FF6C22",
                padding: 10,
                borderRadius: 10,
                width: 180, 
            }}
            >
            <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Зберегти місце</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

export default CreateWalkModal;
