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

interface AddProtectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddRecord: (recordData: { type: string; name: string; lastDate: string; nextDate: string }) => Promise<void>;
}

const AddProtectionModal: React.FC<AddProtectionModalProps> = ({ isVisible, onClose, onAddRecord }) => {
  const [name, setName] = useState<string>('');
  const [lastDate, setLastDate] = useState<string>('');
  const [nextDate, setNextDate] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);

    if (lastDate && isValidDate(lastDate)) {
      const [month, day, year] = lastDate.split('/').map(Number);
      const lastDateObj = new Date(year, month - 1, day);

      if (isNaN(lastDateObj.getTime())) {
        console.error('Некорректная дата:', lastDate);
        return;
      }

      const nextDateObj = new Date(lastDateObj);

      switch (period) {
        case '1':
          nextDateObj.setMonth(nextDateObj.getMonth() + 1);
          break;
        case '3':
          nextDateObj.setMonth(nextDateObj.getMonth() + 3);
          break;
        case '6':
          nextDateObj.setMonth(nextDateObj.getMonth() + 6);
          break;
        case '12':
          nextDateObj.setFullYear(nextDateObj.getFullYear() + 1);
          break;
        default:
          break;
      }

      setNextDate(nextDateObj.toISOString().split('T')[0]);
    } else {
      console.error('Дата не задана или некорректна:', lastDate);
    }
  };

  const isValidDate = (dateString: string) => {
    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) return false;

    const [month, day, year] = dateParts.map(Number);
    if (!month || !day || !year) return false;

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const handleAddRecord = async () => {
    if (!name || !lastDate || !nextDate) {
      Alert.alert('Помилка', 'Будь ласка, заповніть усі поля');
      return;
    }

    const recordData = { type: 'protection', name, lastDate, nextDate };
    try {
      console.log('Дані для додавання:', recordData);
      await onAddRecord(recordData);
      onClose();
      setName('');
      setLastDate('');
      setNextDate('');
      setSelectedPeriod('1');
    } catch (error) {
      console.error('Error in handleAddRecord:', error);
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
              >Новий захист</Text>
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
                placeholder="Введіть назву захисту"
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
                onChangeText={(date) => {
                  setLastDate(date);
                  handlePeriodChange(selectedPeriod);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 10,
                }}
              />
            </View>

            <View style={{ marginBottom: 25 }}>
              <Text style={{ marginBottom: 15 }}>Наступне вживання захисту</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[ 
                  { period: '1', label: 'За 1 місяць' },
                  { period: '3', label: 'За 3 місяці' },
                  { period: '6', label: 'За 6 місяців' },
                  { period: '12', label: 'За рік' },
                ].map(({ period, label }) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => handlePeriodChange(period)}
                    style={{
                      backgroundColor: selectedPeriod === period ? '#FF6C22' : '#F9F7F7',
                      padding: 10,
                      borderRadius: 8,
                      flex: 1,
                      marginHorizontal: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: selectedPeriod === period ? 'white' : '#8D8989',
                        fontWeight: 'bold',
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 25 }}>
              <Text style={{ marginBottom: 10 }}>Або дата наступного вживання</Text>
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

export default AddProtectionModal;
