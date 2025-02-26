import React from 'react';
import { View, Text, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { images } from '@/constants/index';
import { icons } from '@/constants/svg';
import { useMatchingStore } from "@/store/matchingStore";
import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useRouter } from "expo-router";

const SERVER_URL = "https://walkey-production.up.railway.app";

type RootStackParamList = {
  ChatScreen: { chatId: string; receiverId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, "ChatScreen">;

interface Dog {
  dog_id?: string; 
  clerk_id?: string; 
  unique_code?: string; 
  image?: string; 
  name?: string;
  similarity_percentage?: number;
  status?: string;
  gender?: 'male' | 'female';
  breed?: string;
  age?: number;
  walkingPlace?: string;
  castrated?: boolean;
  in_heat?: boolean; 
}

interface DogProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  dog: Dog | null;
}

const DogProfileModal: React.FC<DogProfileModalProps> = ({ isVisible, onClose, dog }) => {

  if (!dog) return null;


  const { user } = useUser();
  const navigation = useNavigation<NavigationProp>();
  const router = useRouter();

  const handleFriendRequest = async () => {
  
    if (!user?.id || !dog?.clerk_id) {
      console.error("Ошибка: user1_id или user2_id отсутствует!");
      return;
    }
  
    try {
      const response = await fetch(`${SERVER_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user1_id: user?.id,
          user2_id: dog.clerk_id,
        }),
      });
  
      const data = await response.json();
  
      if (data.chatId) {
        onClose(); 
        setTimeout(() => { 
          router.push({
            pathname: "/(root)/(modal)/ChatScreen",
            params: {
              chatId: data.chatId,
              receiverId: dog.clerk_id,
            },
          });
        }, 300); 
      }
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
    }
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Image
          source={dog.image ? { uri: dog.image } : images.OtherDogs}
          style={styles.backgroundImage}
        />

        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <icons.ArrowLeft width={24} height={24} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.dogName}>{dog.name || 'Ім\'я'}</Text>
            <Text style={styles.matchPercentage}>
                {typeof dog.similarity_percentage === "number"
                ? `${dog.similarity_percentage}% метч`
                : "Нет данных"}
          </Text>
          </View>

          <View style={styles.statusContainerWrapper}>
            <Text style={styles.statusLabel}>Статус</Text>
            <View style={styles.statusContainer}>
              <icons.HomeIcons width={24} height={24} style={styles.statusIcon} />
              <Text style={styles.statusText}>{dog.status || 'вдома'}</Text>
            </View>
          </View>

          <View style={styles.rowInfo}>
            <View style={styles.rowItem}>
              <Text style={styles.icon}>
                {dog.gender === 'male' ? '♂️' : '♀️'}
              </Text>
              <Text style={styles.rowText}>
                {dog.gender === 'male' ? 'Хлопчик' : 'Дівчинка'}
              </Text>
            </View>
            <View style={[styles.rowItem, styles.centerItem]}>
              <Text style={styles.rowText}>{dog.breed || 'Лабрадор'}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowText}>
                {dog.age ? `${dog.age} місяців` : '5 років 3 місяці'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.medicalStatusContainer}>
  <View style={styles.medicalStatusRow}>
    <Text style={styles.medTitle}>Медичний статус:</Text>
    <View style={[styles.statusBox]}>
      <Text style={styles.statusText}>
        {dog.gender === 'male'
          ? (dog.castrated ? 'кастрований' : 'не кастрований')
          : (dog.castrated ? 'стерилізована' : dog.in_heat ? 'течка зараз' : 'немає течки')}
      </Text>
    </View>
  </View>
</View>


          <View style={styles.walkingRow}>
            <Text style={styles.walkingTitle}>Зазвичай гуляє:</Text>
            <Text style={styles.walkingAddress}>
              {dog.walkingPlace || 'біля вул. Ружинська'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.orangeButton, { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }]}
            onPress={handleFriendRequest}
          >
            <Text style={[styles.orangeButtonText, { marginRight: 8 }]}>Подружитись</Text>
            <icons.WhitePawIcon width={24} height={24} />
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 30,
  },
  backIcon: {
    color: 'white',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 370,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  matchPercentage: {
    fontSize: 18,
    color: '#FF6C22',
    textAlign: 'right',
  },
  statusContainerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    marginRight: 8,
    color: '#FF6C22',
  },
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 5,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#FFE5D8',
    marginVertical: 15,
  },
  walkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walkingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginRight: 5,
  },
  medTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginRight: 5,
    marginBottom: 10,
  },
  walkingAddress: {
    fontSize: 16,
    color: '#666',
  },
  orangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6C22',
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 10,
  },
  orangeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicalStatusContainer: {
    marginBottom: 15,
  },
  medicalStatusRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginTop: 5,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  statusBox: {
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 25,
  }, 
});

export default DogProfileModal;
