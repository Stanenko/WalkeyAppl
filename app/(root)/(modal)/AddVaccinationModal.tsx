import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;

interface AddVaccinationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddRecord: (recordData: { type: 'vaccination' | 'protection'; name: string; lastDate: string; nextDate: string }) => Promise<void>;
}


const AddVaccinationModal: React.FC<AddVaccinationModalProps> = ({ isVisible, onClose, onAddRecord }) => {
  const [type] = useState<'vaccination' | 'protection'>('vaccination');
  const [name, setName] = useState<string>('');
  const [lastDate, setLastDate] = useState<string>('');
  const [nextDate, setNextDate] = useState<string>('');

  const handleAddRecord = async () => {
    if (!name || !lastDate || !nextDate) {
      Alert.alert('Помилка', 'Будь ласка, заповніть усі поля');
      return;
    }

    const recordData = { type, name, lastDate, nextDate };
    try {
      console.log('Дані для додавання:', recordData);
      await onAddRecord(recordData); 
      onClose();
      setName('');
      setLastDate('');
      setNextDate('');
    } catch (error) {
      console.error('Помилка в handleAddRecord:', error);
      Alert.alert('Помилка', 'Не вдалося додати запис');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              height: screenHeight * 0.7,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 45,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  flex: 1,
                }}
              >Нова вакцинація</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ position: 'absolute', right: 0 }}
              >
                <Text style={{ fontSize: 18, color: '#AFAAAA' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 25 }}>
              <Text style={{ marginBottom: 10 }}>Назва</Text>
              <TextInput
                placeholder="Введіть назву"
                value={name}
                onChangeText={setName}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>

            <View style={{ marginBottom: 25 }}>
              <Text style={{ marginBottom: 10 }}>Дата</Text>
              <TextInput
                placeholder="MM/DD/YYYY"
                value={lastDate}
                onChangeText={setLastDate}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>

            <View style={{ marginBottom: 25 }}>
              <Text style={{ marginBottom: 10 }}>Наступна дата</Text>
              <TextInput
                placeholder="MM/DD/YYYY"
                value={nextDate}
                onChangeText={setNextDate}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={handleAddRecord}
                style={{
                  backgroundColor: '#FF6C22',
                  borderRadius: 30,
                  padding: 15,
                  alignItems: 'center',
                  marginBottom: 40,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Додати</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddVaccinationModal;
