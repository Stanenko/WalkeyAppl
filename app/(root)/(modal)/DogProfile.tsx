import React from 'react';
import { View, Text, Image, Modal, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { images } from '@/constants/index';
import { icons } from '@/constants/svg';

const DogProfileModal = ({ isVisible, onClose, dog }) => {
  if (!dog) return null;

  const screenHeight = Dimensions.get('window').height;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Блок з зображенням */}
        <Image source={images.OtherDogs} style={styles.backgroundImage} />

         <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <icons.ArrowLeft width={24} height={24} style={styles.backIcon} />
        </TouchableOpacity>

        {/* Біла плашка з інформацією */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.dogName}>{dog.name || 'Ім\'я'}</Text>
            <Text style={styles.matchPercentage}>{dog.matchPercentage || 0}% метч</Text>
          </View>

          <View style={styles.statusRow}>
  <Text style={styles.statusLabel}>Статус</Text>
  <View style={styles.statusContainer}>
    <icons.HomeIcons width={24} height={24} style={styles.statusIcon} />
    <Text style={styles.statusText}>{dog.status || 'вдома'}</Text>
  </View>
</View>


          {/* Блок з інформацією в один ряд */}
          <View style={styles.rowInfo}>
            <View style={styles.rowItem}>
              <Text style={styles.icon}>♂️</Text>
              <Text style={styles.rowText}>Хлопчик</Text>
            </View>
            <View style={[styles.rowItem, styles.centerItem]}>
              <Text style={styles.rowText}>{dog.breed || 'Лабрадор'}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowText}>{dog.age + ' місяців' || '5 років 3 місяці'}</Text>
            </View>
          </View>

          {/* Розділююча лінія */}
          <View style={styles.separator} />

          {/* Блок "Зазвичай гуляє" */}
          <View style={styles.walkingRow}>
            <Text style={styles.walkingTitle}>Зазвичай гуляє:</Text>
            <Text style={styles.walkingAddress}>
              {dog.walkingPlace || 'біля вул. Ружинська'}
            </Text>
          </View>

          {/* Кнопка "Подружитись" з іконкою лапки */}
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
    top: 40, // Відступ від верхнього краю (налаштуйте під ваш макет)
    left: 20, // Відступ зліва
    zIndex: 10, // Високий індекс для перекриття
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  statusIcon: {
    marginRight: 5,
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
  pawIcon: {
    marginRight: 8,
    color: 'white',
  },
  orangeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
});

export default DogProfileModal;
