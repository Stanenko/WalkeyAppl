import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddVaccinationModal from '@/app/(root)/(modal)/AddVaccinationModal';
import AddProtectionModal from '@/app/(root)/(modal)/AddProtectionModal';
import SterilizationToggle from '@/components/SterilizationToggle';
import { getServerUrl } from "@/utils/getServerUrl";
import { useUser } from "@clerk/clerk-expo";
import { icons } from "@/constants/svg";

const SERVER_URL = "http://192.168.0.18:3000";

const Doctor = () => {
  const [isSterilized, setIsSterilized] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  const [protections, setProtections] = useState([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(true);
  const [loadingProtections, setLoadingProtections] = useState(false);
  const [isInHeat, setIsInHeat] = useState(false);
  const [gender, setGender] = useState('female'); 
  const { user } = useUser();
  const [isVaccinationModalVisible, setIsVaccinationModalVisible] = useState(false);
  const [isProtectionModalVisible, setIsProtectionModalVisible] = useState(false);
 

  useEffect(() => {
    if (user && user.id) {
      fetchMedicalRecords('vaccination', setLoadingVaccinations, setVaccinations, user.id);
      fetchMedicalRecords('protection', setLoadingProtections, setProtections, user.id);
    }
  }, [user]);
  
  const fetchMedicalRecords = async (type, setLoading, setData, clerkId) => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/medical/records?type=${type}&clerkId=${clerkId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} records`);
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        throw new Error(`${type} records should be an array`);
      }
  

      const formattedData = data.map(record => ({
        id: record.id,
        name: record.name,
        lastDate: record.lastdate, 
        nextDate: record.nextdate, 
        type: record.type,
      }));
  
      setData(formattedData);
    } catch (error) {
      console.error(`Error fetching ${type} records:`, error);
      Alert.alert('Ошибка', `Не удалось загрузить данные ${type}`);
    } finally {
      setLoading(false);
    }
  };
  

  const addMedicalRecord = async (newRecord) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/medical/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...newRecord, clerkId: user.id}),
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

  const renderMedicalRecordHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          flex: 1,
          marginRight: 10,
          fontWeight: 'bold',
          textAlign: 'left',
        }}
      >
        Назва
      </Text>
      <Text
        style={{
          width: 100,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Остання
      </Text>
      <Text
        style={{
          width: 100,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Наступна
      </Text>
    </View>
  );

  const renderMedicalRecordItem = ({ item }) => {
    if (!item || !item.name || !item.lastDate || !item.nextDate) {
      console.warn('Invalid item data:', item);
      return null;
    }

    const today = new Date();
    const nextDate = new Date(item.nextDate);
    const diffInDays = (nextDate - today) / (1000 * 60 * 60 * 24);
  
    let nextDateColor = 'black';
    if (diffInDays <= 30) {
      nextDateColor = '#C92424'; 
    } else if (diffInDays <= 60) {
      nextDateColor = '#E58080'; 
    }
  
    return (
      <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          flex: 1,
          marginRight: 10,
          fontWeight: '500',
          textAlign: 'left',
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text
        style={{
          width: 100,
          textAlign: 'center',
          fontWeight: '400',
          color: 'gray',
          flexShrink: 1,
        }}
      >
        {new Date(item.lastDate).toLocaleDateString()}
      </Text>
      <Text
        style={{
          width: 100,
          textAlign: 'center',
          fontWeight: '500',
          color: nextDateColor,
          flexShrink: 1,
        }}
      >
        {new Date(item.nextDate).toLocaleDateString()}
      </Text>
    </View>
  );
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Медичні дані</Text>
      </View>

      <SterilizationToggle
        isSterilized={isSterilized}
        setIsSterilized={setIsSterilized}
        gender={gender}
        isInHeat={isInHeat}
        setIsInHeat={setIsInHeat}
      />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Вакцинації</Text>
      {loadingVaccinations ? (
        <ActivityIndicator size="large" color="#FF6C22" />
      ) : (
        <FlatList
          ListHeaderComponent={renderMedicalRecordHeader}
          data={vaccinations}
          renderItem={renderMedicalRecordItem}
          keyExtractor={(item) => item.id.toString()}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => setIsVaccinationModalVisible(true)}
              style={{
                marginTop: 10,
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: '#F6F6F6',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Додати вакцинацію</Text>
              <icons.GPlusIcon width={20} height={20} fill="#000000" />
            </TouchableOpacity>
          }
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Захист</Text>
      {loadingProtections ? (
        <ActivityIndicator size="large" color="#FF6C22" />
      ) : (
        <FlatList
          ListHeaderComponent={renderMedicalRecordHeader}
          data={protections}
          renderItem={renderMedicalRecordItem}
          keyExtractor={(item) => item.id.toString()}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => setIsProtectionModalVisible(true)}
              style={{
                marginTop: 10,
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: '#F6F6F6',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Додати захист</Text>
              <icons.GPlusIcon width={20} height={20} fill="#000000" />
            </TouchableOpacity>
          }
        />
      )}

      <AddVaccinationModal
        isVisible={isVaccinationModalVisible}
        onClose={() => setIsVaccinationModalVisible(false)}
        onAddRecord={addMedicalRecord}
      />
      <AddProtectionModal
        isVisible={isProtectionModalVisible}
        onClose={() => setIsProtectionModalVisible(false)}
        onAddRecord={addMedicalRecord}
      />
    </SafeAreaView>
  );
};

export default Doctor;
