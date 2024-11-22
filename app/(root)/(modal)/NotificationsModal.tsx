import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { icons } from "@/constants/svg";

// Кастомный чекбокс
const CustomCheckBox = ({ label, value, onValueChange }) => (
  <TouchableOpacity
    style={styles.checkBoxContainer}
    onPress={() => onValueChange(!value)}
  >
    <MaterialIcons
      name={value ? "check-box" : "check-box-outline-blank"}
      size={24}
      color={value ? "#FF6C22" : "#767577"}
    />
    <Text style={styles.checkBoxLabel}>{label}</Text>
  </TouchableOpacity>
);

const NotificationsModal = ({ isVisible, onClose }) => {
  const [toggleState1, setToggleState1] = useState(false);
  const [toggleState2, setToggleState2] = useState(false);
  const [checkBoxState1, setCheckBoxState1] = useState(false);
  const [checkBoxState2, setCheckBoxState2] = useState(false);
  const [checkBoxState3, setCheckBoxState3] = useState(false);
  const [checkBoxState4, setCheckBoxState4] = useState(false);

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <icons.ArrowLeft width={24} height={24} style={{ color: "#000" }} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Повідомлення</Text>

            {/* Переключатели */}
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>
                Запит дружби{"\n"}
                <Text style={styles.settingDescription}>
                  Увімкнення дозволяє отримувати нові запити дружби.
                </Text>
              </Text>
              <Switch
                value={toggleState1}
                onValueChange={setToggleState1}
                trackColor={{ false: "#767577", true: "#FF6C22" }}
                thumbColor={toggleState1 ? "#FF6C22" : "#f4f3f4"}
              />
            </View>

            <View style={styles.setting}>
              <Text style={styles.settingLabel}>
                Сповіщення про друзів, які зараз гуляють{"\n"}
                <Text style={styles.settingDescription}>
                  Сповіщення приходять, коли друзі знаходяться поруч.
                </Text>
              </Text>
              <Switch
                value={toggleState2}
                onValueChange={setToggleState2}
                trackColor={{ false: "#767577", true: "#FF6C22" }}
                thumbColor={toggleState2 ? "#FF6C22" : "#f4f3f4"}
              />
            </View>

            {/* Чекбоксы */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Сповіщення про небезпеку поблизу
              </Text>
              <CustomCheckBox
                label="Агресивні собаки"
                value={checkBoxState1}
                onValueChange={setCheckBoxState1}
              />
              <CustomCheckBox
                label="Закриті зони або небезпечні умови (сайти)"
                value={checkBoxState2}
                onValueChange={setCheckBoxState2}
              />
              <CustomCheckBox
                label="Місця з великою кількістю людей"
                value={checkBoxState3}
                onValueChange={setCheckBoxState3}
              />
              <CustomCheckBox
                label="Діти з тваринами"
                value={checkBoxState4}
                onValueChange={setCheckBoxState4}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  closeButton: {
    position: "absolute",
    top: 78,
    left: 34,
    zIndex: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 120,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FFCDB4",
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    marginTop: 10, // Отступ сверху для текста
  },
  settingDescription: {
    fontSize: 14,
    color: "#767577",
    marginTop: 5, // Отступ сверху для описания
  },
  section: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#FFCDB4",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 15, 
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkBoxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
});

export default NotificationsModal;
