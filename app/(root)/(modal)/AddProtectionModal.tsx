import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const screenHeight = Dimensions.get('window').height;

const AddProtectionModal = ({ isVisible, onClose, onAddRecord }) => {
  const [name, setName] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');

  const predefinedProtections = [
    'Сімпаріка +',
    'Сімпаріка Тріо',
    'Бравекто',
    'НексГард',
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);

    if (lastDate && isValidDate(lastDate)) {
      const lastDateObj = new Date(lastDate);
      const nextDateObj = new Date(lastDateObj);
  
      switch (period) {
        case '1':
          nextDateObj.setMonth(lastDateObj.getMonth() + 1);
          break;
        case '3':
          nextDateObj.setMonth(lastDateObj.getMonth() + 3);
          break;
        case '6':
          nextDateObj.setMonth(lastDateObj.getMonth() + 6);
          break;
        case '12':
          nextDateObj.setFullYear(lastDateObj.getFullYear() + 1);
          break;
        default:
          break;
      }
  
      setNextDate(nextDateObj.toISOString().split('T')[0]);
    }
  };
  
  const isValidDate = (dateString) => {
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
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: screenHeight * 0.8,
        }}>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end' }}>
            <Text style={{ fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Новий захист</Text>

          <Text style={{ marginBottom: 5 }}>Назва</Text>
          <View style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            marginBottom: 15,
          }}>
            <Picker
              selectedValue={name}
              onValueChange={(itemValue) => setName(itemValue)}
            >
              <Picker.Item label="Виберіть назву захисту" value="" />
              {predefinedProtections.map((protection) => (
                <Picker.Item key={protection} label={protection} value={protection} />
              ))}
            </Picker>
          </View>

          <Text style={{ marginBottom: 5 }}>Дата</Text>
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
              marginBottom: 15,
            }}
          />

          <Text style={{ marginBottom: 10 }}>Наступне вживання захисту</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {['1', '3', '6', '12'].map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => handlePeriodChange(period)}
                style={{
                  backgroundColor: selectedPeriod === period ? '#FF6C22' : '#E5E5E5',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginHorizontal: 5,
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  color: selectedPeriod === period ? 'white' : 'black',
                  fontWeight: 'bold',
                }}>
                  {`За ${period === '12' ? 'рік' : `${period} місяців`}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ marginBottom: 5 }}>Або дата наступного вживання</Text>
          <TextInput
            placeholder="MM/DD/YYYY"
            value={nextDate}
            onChangeText={setNextDate}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 10,
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            onPress={handleAddRecord}
            style={{
              backgroundColor: '#FF6C22',
              borderRadius: 10,
              padding: 15,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Додати</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddProtectionModal;
