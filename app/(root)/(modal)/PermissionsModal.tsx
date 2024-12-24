import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { icons } from "@/constants/svg";

interface PermissionsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ isVisible, onClose }) => {
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);

  const handleLocationPermission = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission(true);
          Alert.alert("Локація", "Доступ до локації надано.");
        } else {
          setLocationPermission(false);
          Alert.alert("Локація", "Доступ до локації відхилено.");
        }
      } else {
        setLocationPermission(false);
        Alert.alert(
          "Локація",
          "Щоб відключити дозвіл на місцезнаходження, перейдіть до налаштувань пристрою вручну.",
          [
            { text: "Відкрити налаштування", onPress: () => Linking.openSettings() },
            { text: "Скасувати", style: "cancel" },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося опрацювати дозвіл до локації.");
      console.error("Location permission error:", error);
    }
  };

  const handleCameraPermission = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === "granted") {
          setCameraPermission(true);
          Alert.alert("Камера", "Доступ до камери надано.");
        } else {
          setCameraPermission(false);
          Alert.alert("Камера", "Доступ до камери відхилено.");
        }
      } else {
        setCameraPermission(false);
        Alert.alert(
          "Камера",
          "Щоб відключити дозвіл на використання камери, перейдіть до налаштувань пристрою вручну.",
          [
            { text: "Відкрити налаштування", onPress: () => Linking.openSettings() },
            { text: "Скасувати", style: "cancel" },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося опрацювати дозвіл на використання камери.");
      console.error("Camera permission error:", error);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            paddingHorizontal: 20,
          }}
        >
          {/* Шапка */}
          <View
            style={{
              position: "relative",
              marginTop: 75, // Отступ сверху для шапки
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
              Дозволи
            </Text>
          </View>

          <View style={[styles.content, { marginTop: 30 }]}>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>
                Дозволити відслідковувати місцезнаходження для пропозицій прогулянок та сповіщень про друзів поблизу.
              </Text>
              <Switch
                value={locationPermission}
                onValueChange={handleLocationPermission}
                trackColor={{ false: "#767577", true: "#FF6C22" }}
                thumbColor={locationPermission ? "#FF6C22" : "#f4f3f4"}
              />
            </View>

            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>
                Дозволити доступ до камери для відстеження емоційного стану песика.
              </Text>
              <Switch
                value={cameraPermission}
                onValueChange={handleCameraPermission}
                trackColor={{ false: "#767577", true: "#FF6C22" }}
                thumbColor={cameraPermission ? "#FF6C22" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FFCDB4",
  },
  permissionLabel: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    marginRight: 10,
  },
});

export default PermissionsModal;
