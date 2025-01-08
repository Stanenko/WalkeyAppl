import React from 'react';
import { View, Text, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { images } from '@/constants/index';
import { icons } from '@/constants/svg';

interface Dog {
  image?: string; 
  name?: string;
  similarity_percentage?: number;
  status?: string;
  gender?: 'male' | 'female';
  breed?: string;
  age?: number;
  walkingPlace?: string;
}

interface DogProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  dog: Dog | null;
}

const DogProfileModal: React.FC<DogProfileModalProps> = ({ isVisible, onClose, dog }) => {
  if (!dog) return null;

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
              {dog.similarity_percentage !== undefined
                ? `${dog.similarity_percentage}% метч`
                : 'Нет данных'}
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

          <View style={styles.walkingRow}>
            <Text style={styles.walkingTitle}>Зазвичай гуляє:</Text>
            <Text style={styles.walkingAddress}>
              {dog.walkingPlace || 'біля вул. Ружинська'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.orangeButton, { marginTop: 10 }]}
            onPress={() => console.log('Подружитись pressed')}
          >
            <Text style={styles.orangeButtonText}>Подружитись</Text>
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
    height: '75%',
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
    height: 320,
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
  statusText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
});

export default DogProfileModal;
