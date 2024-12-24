import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddVaccinationModal from '@/app/(root)/(modal)/AddVaccinationModal';
import AddProtectionModal from '@/app/(root)/(modal)/AddProtectionModal';
import SterilizationToggle from '@/components/SterilizationToggle';
import { useUser } from '@clerk/clerk-expo';
import { icons } from '@/constants/svg';

type MedicalRecord = {
  id: number;
  name: string;
  lastDate: string | null;
  nextDate: string | null;
  type: 'vaccination' | 'protection';
};

const SERVER_URL = "https://ce95-93-200-239-96.ngrok-free.app";

const Doctor = () => {
  const [isSterilized, setIsSterilized] = useState(true);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [isInHeat, setIsInHeat] = useState(false);
  const [vaccinations, setVaccinations] = useState<MedicalRecord[]>([]);
  const [protections, setProtections] = useState<MedicalRecord[]>([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(true);
  const [loadingProtections, setLoadingProtections] = useState(true);
  const [isVaccinationModalVisible, setIsVaccinationModalVisible] = useState(false);
  const [isProtectionModalVisible, setIsProtectionModalVisible] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      fetchMedicalRecords('vaccination', setLoadingVaccinations, setVaccinations, user.id);
      fetchMedicalRecords('protection', setLoadingProtections, setProtections, user.id);
    }
  }, [user]);

  const fetchMedicalRecords = async (
    type: 'vaccination' | 'protection',
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setData: React.Dispatch<React.SetStateAction<MedicalRecord[]>>,
    clerkId: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/medical/records?type=${type}&clerkId=${clerkId}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type} records`);
  
      const rawData: Array<{ id: number; name: string; lastdate: string; nextdate: string; type: string }> =
        await response.json();
  
      console.log(`${type.toUpperCase()} raw data:`, rawData); // Вывод данных из API
  
      const formattedData = rawData.map(record => ({
        id: record.id,
        name: record.name || 'Unknown',
        lastDate: record.lastdate ? new Date(record.lastdate).toISOString() : null,
        nextDate: record.nextdate ? new Date(record.nextdate).toISOString() : null,
        type: record.type as 'vaccination' | 'protection',
      }));
  
      console.log(`${type.toUpperCase()} formatted data:`, formattedData); // Вывод отформатированных данных
  
      setData(formattedData);
    } catch (error) {
      console.error(`Error fetching ${type} records:`, error);
      Alert.alert('Ошибка', `Не удалось загрузить данные ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const addMedicalRecord = async (newRecord: {
    type: 'vaccination' | 'protection';
    name: string;
    lastDate: string;
    nextDate: string;
  }) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/medical/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRecord, clerkId: user?.id }),
      });

      if (!response.ok) throw new Error('Failed to add medical record');

      const data: MedicalRecord = await response.json();
      if (data.type === 'vaccination') {
        setVaccinations(prev => [...prev, data]);
      } else if (data.type === 'protection') {
        setProtections(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding medical record:', error);
      Alert.alert('Ошибка', 'Не удалось добавить запись');
    }
  };

  const renderMedicalRecordHeader = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
      <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'left' }}>Назва</Text>
      <Text style={{ width: 100, textAlign: 'center', fontWeight: 'bold' }}>Остання</Text>
      <Text style={{ width: 100, textAlign: 'center', fontWeight: 'bold' }}>Наступна</Text>
    </View>
  );

  const renderMedicalRecordItem = ({ item }: { item: MedicalRecord }) => {
    const formatDate = (date: string | null) => (date ? new Date(date).toLocaleDateString() : 'Нет данных');

    const nextDate = item.nextDate ? new Date(item.nextDate) : null;
    const diffInDays = nextDate ? (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) : null;

    const nextDateColor =
      diffInDays !== null
        ? diffInDays <= 30
          ? '#C92424'
          : diffInDays <= 60
            ? '#E58080'
            : 'black'
        : 'gray';

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
        <Text style={{ flex: 1, fontWeight: '500', textAlign: 'left' }}>{item.name}</Text>
        <Text style={{ width: 100, textAlign: 'center', color: 'gray' }}>{formatDate(item.lastDate)}</Text>
        <Text style={{ width: 100, textAlign: 'center', color: nextDateColor }}>{formatDate(item.nextDate)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 }}>Медичні дані</Text>
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
          keyExtractor={item => item.id.toString()}
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
                justifyContent: 'space-between',
                alignItems: 'center',
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
          keyExtractor={item => item.id.toString()}
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
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Додати захист</Text>
              <icons.GPlusIcon width={20} height={20} fill="#000000" />
            </TouchableOpacity>
          }
        />
      )}

      <AddProtectionModal
        isVisible={isProtectionModalVisible}
        onClose={() => setIsProtectionModalVisible(false)}
        onAddRecord={async (recordData: { type: string; name: string; lastDate: string; nextDate: string }) => {
          const formattedRecord = {
            ...recordData,
            type: recordData.type as 'vaccination' | 'protection',
          };
          await addMedicalRecord(formattedRecord);
        }}
      />

      <AddVaccinationModal
        isVisible={isVaccinationModalVisible}
        onClose={() => setIsVaccinationModalVisible(false)}
        onAddRecord={async (recordData: { type: string; name: string; lastDate: string; nextDate: string }) => {
          const formattedRecord = {
            ...recordData,
            type: recordData.type as 'vaccination' | 'protection',
          };
          await addMedicalRecord(formattedRecord);
        }}
      />
    </SafeAreaView>
  );
};

export default Doctor;
