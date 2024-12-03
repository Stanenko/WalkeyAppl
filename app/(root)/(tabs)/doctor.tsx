import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddVaccinationModal from '@/app/(root)/(modal)/AddVaccinationModal';
import SterilizationToggle from '@/components/SterilizationToggle';
import { useUser } from "@clerk/clerk-expo";

type MedicalRecord = {
  id: number;
  name: string;
  lastDate: string;
  nextDate: string;
  type: 'vaccination' | 'protection';
};

const SERVER_URL = "http://192.168.0.18:3000";

const Doctor = () => {
  const [isSterilized, setIsSterilized] = useState(true);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [isInHeat, setIsInHeat] = useState(false);
  const [vaccinations, setVaccinations] = useState<MedicalRecord[]>([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(true);
  const [isVaccinationModalVisible, setIsVaccinationModalVisible] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      fetchMedicalRecords('vaccination', setLoadingVaccinations, setVaccinations, user.id);
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

      const data: MedicalRecord[] = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching ${type} records:`, error);
      Alert.alert('Ошибка', `Не удалось загрузить данные ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const addMedicalRecord = async (newRecord: { type: 'vaccination' | 'protection'; name: string; lastDate: string; nextDate: string }) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/medical/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRecord, clerkId: user?.id }),
      });
  
      if (!response.ok) throw new Error('Failed to add medical record');
  
      const data: MedicalRecord = await response.json();
      setVaccinations((prev) => [...prev, data]);
    } catch (error) {
      console.error('Error adding medical record:', error);
      Alert.alert('Ошибка', 'Не удалось добавить запись');
    }
  };
  

  const renderMedicalRecordItem = ({ item }: { item: MedicalRecord }) => {
    const nextDate = new Date(item.nextDate);
    const diffInDays = (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    const nextDateColor = diffInDays <= 30 ? '#C92424' : diffInDays <= 60 ? '#E58080' : 'black';

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
        <Text style={{ flex: 1, fontWeight: '500' }}>{item.name}</Text>
        <Text style={{ width: 100, textAlign: 'center', color: 'gray' }}>
          {new Date(item.lastDate).toLocaleDateString()}
        </Text>
        <Text style={{ width: 100, textAlign: 'center', color: nextDateColor }}>
          {new Date(item.nextDate).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 }}>Медичні дані</Text>
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
          data={vaccinations}
          renderItem={renderMedicalRecordItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      <AddVaccinationModal
        isVisible={isVaccinationModalVisible}
        onClose={() => setIsVaccinationModalVisible(false)}
        onAddRecord={addMedicalRecord}
      />
    </SafeAreaView>
  );
};

export default Doctor;
