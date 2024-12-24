import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { icons } from "@/constants/svg";

interface SubscriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isVisible, onClose }) => {
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
              Підписка
            </Text>
          </View>

          <View style={[styles.content, { marginTop: 20 }]}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              План підписки
            </Text>

            <View style={styles.planBox}>
              <Text style={styles.planTitle}>Безкоштовний план</Text>
              <Text style={styles.planPrice}>₴0 / місяць</Text>
              <Text style={styles.planDescription}>
                Базовий доступ до основних функцій додатку для вашого песика
              </Text>
              <View style={styles.planFeatures}>
                <Text style={styles.feature}>• Відстеження прогулянок</Text>
                <Text style={styles.feature}>• Сповіщення про друзів поблизу</Text>
                <Text style={styles.feature}>• Нагадування про вакцинації та медикаменти</Text>
                <Text style={styles.feature}>• Відстеження прогулянок</Text>
                <Text style={styles.feature}>• Одна пропозиція прогулянки на тиждень</Text>
                <Text style={styles.feature}>• Можливість додавати до 3 друзів</Text>
                <Text style={styles.feature}>• Метчинг на основі відстані</Text>
              </View>
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
  planBox: {
    borderWidth: 4,
    borderColor: "#FFD8C0",
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#FFF8F4",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6C22",
    marginBottom: 15,
  },
  planDescription: {
    fontSize: 14,
    color: "#8F8686",
    marginBottom: 30,
  },
  planFeatures: {
    marginTop: 10,
  },
  feature: {
    fontSize: 16,
    color: "#000",
    marginBottom: 10,
  },
});

export default SubscriptionModal;
