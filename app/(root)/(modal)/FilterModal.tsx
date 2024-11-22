import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Dimensions } from "react-native";
import { fetchDogBreeds } from "@/lib/fetchBreeds"; 

const screenHeight = Dimensions.get('window').height;

const FilterModal = ({ visible, toggleFilterModal, applyFilters, filters, handleFilterChange }) => {
  const [breeds, setBreeds] = useState([]);
  const [breedQuery, setBreedQuery] = useState('');
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState(filters?.breed || '');
  const [minAge, setMinAge] = useState(filters?.minAge || '');
  const [maxAge, setMaxAge] = useState(filters?.maxAge || '');
  const [activityLevel, setActivityLevel] = useState(filters?.activityLevel || null);
  const [emotionalStatus, setEmotionalStatus] = useState(filters?.emotionalStatus || null);
  const [vaccinationStatus, setVaccinationStatus] = useState(filters?.vaccinationStatus || null);

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

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    handleFilterChange('breed', breed);
    setBreedQuery('');
    setFilteredBreeds([]);
  };

  return visible ? (
    <View className="flex-1">
      <View
        className="absolute bottom-0 left-0 right-0 bg-white p-6"
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: screenHeight - 115,
          justifyContent: 'flex-start',
        }}
      >
        <TouchableOpacity
          onPress={() => setIsBreedFilterOpen(!isBreedFilterOpen)}
          className="bg-[#FFF7F2] rounded-xl h-[56px] justify-center items-center mt-4"
        >
          <Text className="text-black text-center">Порода собак</Text>
        </TouchableOpacity>

        {isBreedFilterOpen && (
          <View>
            <TextInput
              value={breedQuery || selectedBreed}
              onChangeText={handleBreedSearch}
              placeholder="Начните вводить породу"
              className="mb-2 border border-gray-400 rounded-lg p-2 "
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
          </View>
        )}

     
        <TouchableOpacity
          onPress={() => setIsAgeFilterOpen(!isAgeFilterOpen)}
          className="bg-[#FFF7F2] rounded-xl h-[56px] justify-center items-center mt-4"
        >
          <Text className="text-black text-center">Вік у роках</Text>
        </TouchableOpacity>

        {isAgeFilterOpen && (
          <View>
            <View className="flex-row justify-between items-center mt-4">
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

  
        <Text className="text-base mb-2">Рівень активності:</Text>
        <TextInput
          value={activityLevel}
          onChangeText={(text) => handleFilterChange('activityLevel', text)}
          placeholder="Активність (1-10)"
          keyboardType="numeric"
          className="border border-gray-400 rounded-lg p-2"
        />

   
        <Text className="text-base mb-2">Емоційний стан:</Text>
        <TextInput
          value={emotionalStatus}
          onChangeText={(text) => handleFilterChange('emotionalStatus', text)}
          placeholder="Емоційний стан (1-10)"
          keyboardType="numeric"
          className="border border-gray-400 rounded-lg p-2"
        />

      
        <Text className="text-base mb-2">Статус вакцинації:</Text>
        <TextInput
          value={vaccinationStatus}
          onChangeText={(text) => handleFilterChange('vaccinationStatus', text)}
          placeholder="Вакцинація (повна/часткова)"
          className="border border-gray-400 rounded-lg p-2"
        />

  
        <TouchableOpacity
          onPress={() => {
            applyFilters();
            toggleFilterModal();
          }}
          className="bg-[#FF6C22] rounded-full h-[56px] justify-center items-center mt-4"
        >
          <Text className="text-white text-center">Застосувати фільтри</Text>
        </TouchableOpacity>

      
        <TouchableOpacity
          onPress={toggleFilterModal}
          className="bg-[#FFF7F2] rounded-full h-[56px] justify-center items-center mt-4"
        >
          <Text className="text-black text-center">Закрити</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;
};

export default FilterModal;
