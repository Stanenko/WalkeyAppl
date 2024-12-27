import React, { useState, useEffect } from "react";
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
  const [medicalPermission, setMedicalPermission] = useState<boolean>(false);

  // Проверка текущих разрешений при открытии модального окна
  useEffect(() => {
    if (isVisible) {
      checkPermissions();
    }
  }, [isVisible]);

  const checkPermissions = async () => {
    try {
      // Проверка разрешений на локацию
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status === "granted");

      // Проверка разрешений на камеру
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === "granted");
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  const handleLocationPermission = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission(true);
        } else {
          Alert.alert(
            "Локація",
            "Щоб увімкнути дозвіл на місцезнаходження, перейдіть до налаштувань пристрою вручну.",
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
    } else {
      setLocationPermission(false);
      Alert.alert(
        "Локація",
        "Щоб вимкнути дозвіл на місцезнаходження, перейдіть до налаштувань пристрою вручну.",
        [
          { text: "Відкрити налаштування", onPress: () => Linking.openSettings() },
          { text: "Скасувати", style: "cancel" },
        ]
      );
    }
  };

  const handleCameraPermission = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === "granted") {
          setCameraPermission(true);
        } else {
          Alert.alert(
            "Камера",
            "Щоб увімкнути дозвіл на використання камери, перейдіть до налаштувань пристрою вручну.",
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
    } else {
      setCameraPermission(false);
      Alert.alert(
        "Камера",
        "Щоб вимкнути дозвіл на використання камери, перейдіть до налаштувань пристрою вручну.",
        [
          { text: "Відкрити налаштування", onPress: () => Linking.openSettings() },
          { text: "Скасувати", style: "cancel" },
        ]
      );
    }
  };

  const handleMedicalPermission = (value: boolean) => {
    if (value) {
      setMedicalPermission(true);
      Alert.alert("Медична історія", "Доступ до медичної історії надано.");
    } else {
      setMedicalPermission(false);
      Alert.alert(
        "Медична історія",
        "Щоб увімкнути дозвіл на доступ до медичної історії, перейдіть до налаштувань пристрою вручну.",
        [
          { text: "Відкрити налаштування", onPress: () => Linking.openSettings() },
          { text: "Скасувати", style: "cancel" },
        ]
      );
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
              Дозволи
            </Text>
          </View>

          <View style={[styles.content, { marginTop: 35 }]}>
            <View style={styles.permissionItem}>
              <View style={styles.permissionRow}>
                <Text style={styles.permissionMainText}>
                  Дозволити відслідковувати місцезнаходження для пропозицій прогулянок та сповіщень про друзів поблизу.
                </Text>
                <Switch
                  value={locationPermission}
                  onValueChange={handleLocationPermission}
                  thumbColor={locationPermission ? "#F15F15" : "#f4f3f4"}
                  trackColor={{ false: "#FED9C6", true: "#FED9C6" }}
                  style={{ alignSelf: "center" }}
                />
              </View>
              <Text style={styles.permissionSubText}>
                Гео-трекінг дозволяє нам пропонувати найкращі маршрути для прогулянок і сповіщати про друзів, які гуляють поруч.
              </Text>
            </View>

            <View style={styles.permissionItem}>
              <View style={styles.permissionRow}>
                <Text style={styles.permissionMainText}>
                  Дозволити доступ до камери для відстеження емоційного стану песика.
                </Text>
                <Switch
                  value={cameraPermission}
                  onValueChange={handleCameraPermission}
                  thumbColor={cameraPermission ? "#F15F15" : "#f4f3f4"}
                  trackColor={{ false: "#FED9C6", true: "#FED9C6" }}
                  style={{ alignSelf: "center" }}
                />
              </View>
              <Text style={styles.permissionSubText}>
                Фото, зроблені під час прогулянки, допомагають визначити емоційний стан вашого песика.
              </Text>
            </View>

            <View style={styles.permissionItem}>
              <View style={styles.permissionRow}>
                <Text style={styles.permissionMainText}>
                  Дозволити доступ до медичної історії для відстеження вакцинацій і медичних нагадувань.
                </Text>
                <Switch
                  value={medicalPermission}
                  onValueChange={handleMedicalPermission}
                  thumbColor={medicalPermission ? "#F15F15" : "#f4f3f4"}
                  trackColor={{ false: "#FED9C6", true: "#FED9C6" }}
                  style={{ alignSelf: "center" }}
                />
              </View>
              <Text style={styles.permissionSubText}>
                Це дозволить відстежувати всі планові вакцинації вашого песика та нагадувати про необхідні медичні процедури.
              </Text>
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
    marginBottom: 20,
    paddingVertical: 10,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  permissionMainText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    flex: 1,
  },
  permissionSubText: {
    fontSize: 14,
    color: "#BDBBBB",
  },
});

export default PermissionsModal;
