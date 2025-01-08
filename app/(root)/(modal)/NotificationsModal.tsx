import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { icons } from "@/constants/svg";

interface CustomCheckBoxProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

const CustomCheckBox: React.FC<CustomCheckBoxProps> = ({ label, value, onValueChange }) => (
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

interface NotificationsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isVisible, onClose }) => {
  const [toggleState1, setToggleState1] = useState<boolean>(false);
  const [toggleState2, setToggleState2] = useState<boolean>(false);
  const [checkBoxState1, setCheckBoxState1] = useState<boolean>(false);
  const [checkBoxState2, setCheckBoxState2] = useState<boolean>(false);
  const [checkBoxState3, setCheckBoxState3] = useState<boolean>(false);
  const [checkBoxState4, setCheckBoxState4] = useState<boolean>(false);

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
              Повідомлення
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.scrollContainer, { marginTop: 50 }]}
          >
            <View style={styles.content}>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    marginTop: 10,
  },
  settingDescription: {
    fontSize: 14,
    color: "#767577",
    marginTop: 5,
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
