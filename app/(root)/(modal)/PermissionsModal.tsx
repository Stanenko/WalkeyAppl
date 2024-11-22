import React, { useState } from 'react';
import { Modal, View, Text, Switch, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import * as Location from 'expo-location'; // Для работы с локацией
import { Camera } from 'expo-camera'; // Для работы с камерой
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants/svg'; // Импорт иконок

const PermissionsModal = ({ isVisible, onClose }) => {
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  const handleLocationPermission = async (value) => {
    try {
      if (value) {
        // Запрос разрешения
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          Alert.alert('Локація', 'Доступ до локації надано.');
        } else {
          setLocationPermission(false);
          Alert.alert('Локація', 'Доступ до локації відхилено.');
        }
      } else {
        // Отключение разрешения — предложить открыть настройки вручную
        setLocationPermission(false);
        Alert.alert(
          'Локація',
          'Щоб відключити дозвіл на місцезнаходження, перейдіть до налаштувань пристрою вручну.',
          [
            { text: 'Відкрити налаштування', onPress: () => Linking.openSettings() },
            { text: 'Скасувати', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося опрацювати дозвіл до локації.');
      console.error('Location permission error:', error);
    }
  };

  const handleCameraPermission = async (value) => {
    try {
      if (value) {
        // Запрос разрешения
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
          setCameraPermission(true);
          Alert.alert('Камера', 'Доступ до камери надано.');
        } else {
          setCameraPermission(false);
          Alert.alert('Камера', 'Доступ до камери відхилено.');
        }
      } else {
        // Отключение разрешения — предложить открыть настройки вручную
        setCameraPermission(false);
        Alert.alert(
          'Камера',
          'Щоб відключити дозвіл на використання камери, перейдіть до налаштувань пристрою вручну.',
          [
            { text: 'Відкрити налаштування', onPress: () => Linking.openSettings() },
            { text: 'Скасувати', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося опрацювати дозвіл на використання камери.');
      console.error('Camera permission error:', error);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <icons.ArrowLeft width={24} height={24} style={{ color: '#000' }} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Дозволи</Text>

          {/* Локация */}
          <View style={styles.permissionItem}>
            <Text style={styles.permissionLabel}>
              Дозволити відслідковувати місцезнаходження для пропозицій прогулянок та сповіщень про друзів поблизу.
            </Text>
            <Switch
              value={locationPermission}
              onValueChange={handleLocationPermission}
              trackColor={{ false: '#767577', true: '#FF6C22' }}
              thumbColor={locationPermission ? '#FF6C22' : '#f4f3f4'}
            />
          </View>

          {/* Камера */}
          <View style={styles.permissionItem}>
            <Text style={styles.permissionLabel}>
              Дозволити доступ до камери для відстеження емоційного стану песика.
            </Text>
            <Switch
              value={cameraPermission}
              onValueChange={handleCameraPermission}
              trackColor={{ false: '#767577', true: '#FF6C22' }}
              thumbColor={cameraPermission ? '#FF6C22' : '#f4f3f4'}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 78,
    left: 34,
    zIndex: 10,
  },
  content: {
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDB4',
  },
  permissionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },
});

export default PermissionsModal;
