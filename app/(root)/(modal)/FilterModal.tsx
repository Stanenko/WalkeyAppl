import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Dimensions, Modal } from "react-native";
import { fetchDogBreeds } from "@/lib/fetchBreeds"; 
import { SafeAreaView } from "react-native-safe-area-context";

const screenHeight = Dimensions.get('window').height;

const FilterModal = ({ visible, toggleFilterModal, applyFilters, filters, handleFilterChange }) => {
  const [breeds, setBreeds] = useState([]);
  const [breedQuery, setBreedQuery] = useState('');
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState(filters?.breed || '');
  const [minAge, setMinAge] = useState(filters?.minAge || '');
  const [maxAge, setMaxAge] = useState(filters?.maxAge || '');
  const [excludedBreedQuery, setExcludedBreedQuery] = useState('');
  const [excludedBreed, setExcludedBreed] = useState(filters?.excludedBreed || ''); 
  const [activityLevel, setActivityLevel] = useState(filters?.activityLevel || null);
  const [emotionalStatus, setEmotionalStatus] = useState(filters?.emotionalStatus || null);
  const [vaccinationStatus, setVaccinationStatus] = useState(filters?.vaccinationStatus || null);
  const [gender, setGender] = useState(filters?.gender || '');

  const [isBreedFilterOpen, setIsBreedFilterOpen] = useState(false);
  const [isAgeFilterOpen, setIsAgeFilterOpen] = useState(false);


  useEffect(() => {
    const loadBreeds = async () => {
      const breedList = await fetchDogBreeds();
      setBreeds(breedList);
      setFilteredBreeds(breedList);
    };
    loadBreeds();
  }, []);

  const handleBreedSearch = (text) => {
    setBreedQuery(text);
    const filtered = breeds.filter(breed =>
      breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filtered);
  };

  const handleExcludedBreedSearch = (text) => {
    setExcludedBreedQuery(text);
    const filtered = breeds.filter(breed =>
      breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filtered);
  };

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    handleFilterChange('breed', breed);
    setBreedQuery('');
    setFilteredBreeds([]);
  };

  const handleExcludedBreedSelect = (breed) => {
    setExcludedBreed(breed);
    handleFilterChange('excludedBreed', breed);
    setExcludedBreedQuery('');
    setFilteredBreeds([]);
  };

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
    handleFilterChange('gender', selectedGender);
  };  

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
    <SafeAreaView className="flex-1">
       <View className="p-4 mt-4">
          <Text className="text-center text-xl font-bold">Фільтрувати</Text>
        </View>
      <View
        className="bg-white p-6"
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: screenHeight - 115,
          justifyContent: 'flex-start',
        }}
      >
        <TouchableOpacity
          onPress={() => setIsBreedFilterOpen(!isBreedFilterOpen)}
          className="bg-[#FFE5D8] rounded-xl h-[50px] justify-center items-center mt-4 mb-2"
        >
          <Text className="text-black text-center">Порода собак</Text>
        </TouchableOpacity>

        {isBreedFilterOpen && (
          <View>
            <TextInput
              value={breedQuery || selectedBreed}
              onChangeText={handleBreedSearch}
              placeholder="Почніть вводити породу"
              className="border border-gray-400 rounded-lg p-2 "
            />
            {breedQuery.length > 0 && (
              <FlatList
                data={filteredBreeds}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleBreedSelect(item)}
                    className="p-2 border-b border-gray-200"
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 150 }}
              />
            )}

<Text className="text-black mt-4 mb-4">Показати всі окрім породи:</Text>
              <TextInput
                value={excludedBreedQuery || excludedBreed}
                onChangeText={handleExcludedBreedSearch}
                placeholder="Введіть породу для виключення"
                className="border border-gray-400 rounded-lg p-2 mb-4"
              />
              {excludedBreedQuery.length > 0 && (
                <FlatList
                  data={filteredBreeds}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleExcludedBreedSelect(item)}
                      className="p-2 border-b border-gray-200"
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 150 }}
                />
              )}
          </View>
        )}

     
        <TouchableOpacity
          onPress={() => setIsAgeFilterOpen(!isAgeFilterOpen)}
          className="bg-[#FFE5D8] rounded-xl h-[50px] justify-center items-center mt-4 mb-6"
        >
          <Text className="text-black text-center">Вік у роках</Text>
        </TouchableOpacity>

        {isAgeFilterOpen && (
          <View>
            <View className="flex-row justify-between items-center mb-6">
              <Text>Від</Text>
              <TextInput
                value={minAge.toString()}
                onChangeText={text => {
                  setMinAge(text);
                  handleFilterChange('minAge', text);
                }}
                keyboardType="numeric"
                className="border border-gray-400 rounded-lg p-2 w-24"
                placeholder="Вік від"
              />
              <Text>до</Text>
              <TextInput
                value={maxAge.toString()}
                onChangeText={text => {
                  setMaxAge(text);
                  handleFilterChange('maxAge', text);
                }}
                keyboardType="numeric"
                className="border border-gray-400 rounded-lg p-2 w-24"
                placeholder="Вік до"
              />
            </View>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-base mb-4">Пол собак:</Text>
          <View className="flex-row justify-around items-center">
            <TouchableOpacity
              onPress={() => handleGenderChange('male')}
              className={`flex-row items-center justify-center rounded-full px-4 py-2 ${gender === 'male' ? 'bg-[#FF6C22]' : 'bg-[#FFE5D8]'}`}
            >
              <Text className={`text-center ${gender === 'male' ? 'text-white' : 'text-black'}`}>Хлопчик</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleGenderChange('female')}
              className={`flex-row items-center justify-center rounded-full px-4 py-2 ${gender === 'female' ? 'bg-[#FF6C22]' : 'bg-[#FFE5D8]'}`}
            >
              <Text className={`text-center ${gender === 'female' ? 'text-white' : 'text-black'}`}>Дівчинка</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleGenderChange('')}
              className={`flex-row items-center justify-center rounded-full px-4 py-2 ${gender === '' ? 'bg-[#FF6C22]' : 'bg-[#FFE5D8]'}`}
            >
              <Text className={`text-center ${gender === '' ? 'text-white' : 'text-black'}`}>Обидва</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-base mb-2">Рівень активності:</Text>
        <TextInput
          value={activityLevel}
          onChangeText={(text) => handleFilterChange('activityLevel', text)}
          placeholder="Активність (1-10)"
          keyboardType="numeric"
          className="border border-gray-400 rounded-lg p-2 mb-4"
        />
      
        <Text className="text-base mb-2">Статус вакцинації:</Text>
        <TextInput
          value={vaccinationStatus}
          onChangeText={(text) => handleFilterChange('vaccinationStatus', text)}
          placeholder="Вакцинація (повна/часткова)"
          className="border border-gray-400 rounded-lg p-2 mb-4"
        />

  
        <TouchableOpacity
          onPress={() => {
            applyFilters();
            toggleFilterModal();
          }}
          className="bg-[#FF6C22] rounded-full h-[50px] justify-center items-center mt-4"
        >
          <Text className="text-white text-center">Застосувати фільтри</Text>
        </TouchableOpacity>

      
        <TouchableOpacity
          onPress={toggleFilterModal}
          className="bg-[#FFE5D8] rounded-full h-[50px] justify-center items-center mt-4"
        >
          <Text className="text-black text-center">Закрити</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;
