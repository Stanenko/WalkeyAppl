import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddVaccinationModal from '@/app/(root)/(modal)/AddVaccinationModal';
import SterilizationToggle from '@/components/SterilizationToggle';


const Doctor = () => {
  const [isSterilized, setIsSterilized] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  const [protections, setProtections] = useState([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(true);
  const [loadingProtections, setLoadingProtections] = useState(false);
  const [isInHeat, setIsInHeat] = useState(false);
  const [gender, setGender] = useState('female'); 

  useEffect(() => {
    fetchMedicalRecords('vaccination', setLoadingVaccinations, setVaccinations);
  }, []);

  const fetchMedicalRecords = async (type, setLoading, setData) => {
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.29:3000/api/medical/records?type=${type}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} records`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`${type} records should be an array`);
      }

      setData(data);
    } catch (error) {
      console.error(`Error fetching ${type} records:`, error);
      Alert.alert('Ошибка', `Не удалось загрузить данные ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const addMedicalRecord = async (newRecord) => {
    try {
      const response = await fetch('http://192.168.0.29:3000/api/medical/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error('Failed to add medical record');
      }

      const data = await response.json();
      if (!data || !data.id || !data.name || !data.lastdate || !data.nextdate) {
        throw new Error('Invalid response data from server');
      }

      const formattedRecord = {
        id: data.id,
        name: data.name,
        lastDate: data.lastdate,
        nextDate: data.nextdate,
        type: data.type,
      };

      if (formattedRecord.type === 'vaccination') {
        setVaccinations((prev) => [...prev, formattedRecord]);
      } else if (formattedRecord.type === 'protection') {
        setProtections((prev) => [...prev, formattedRecord]);
      }
    } catch (error) {
      console.error('Error adding medical record:', error);
      Alert.alert('Ошибка', 'Не удалось добавить запись');
    }
  };

  const renderMedicalRecordItem = ({ item }) => {
    if (!item || !item.name || !item.lastDate || !item.nextDate) {
      console.warn('Invalid item data:', item);
      return null;
    }

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
        <Text style={{ width: '40%' }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ width: 60, color: 'gray', textAlign: 'center' }} numberOfLines={1}>
          {new Date(item.lastDate).toLocaleDateString()}
        </Text>
        <Text
          style={{
            width: 60,
            textAlign: 'center',
            color: new Date(item.nextDate) < new Date(new Date().setMonth(new Date().getMonth() + 1)) ? 'red' : 'black',
          }}
          numberOfLines={1}
        >
          {new Date(item.nextDate).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
   <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, marginBottom: 30 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Медичні дані</Text>
</View>


      <SterilizationToggle
        isSterilized={isSterilized}
        setIsSterilized={setIsSterilized}
        gender="female" 
        isInHeat={isInHeat}
        setIsInHeat={setIsInHeat}
    />


      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Вакцинації</Text>
      {loadingVaccinations ? (
        <ActivityIndicator size="large" color="#FF6C22" />
      ) : (
        <FlatList
          data={vaccinations}
          renderItem={renderMedicalRecordItem}
          keyExtractor={(item) => item.id.toString()}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={{ marginTop: 10, padding: 10, backgroundColor: '#E5E5E5', borderRadius: 10 }}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Додати вакцинацію</Text>
            </TouchableOpacity>
          }
        />
      )}

      <AddVaccinationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddRecord={addMedicalRecord}
      />
    </SafeAreaView>
  );
};

export default Doctor;
