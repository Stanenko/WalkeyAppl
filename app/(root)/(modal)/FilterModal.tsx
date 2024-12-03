import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import { fetchDogBreeds } from "@/lib/fetchBreeds";

const screenHeight = Dimensions.get("window").height;

interface FilterModalProps {
  visible: boolean;
  toggleFilterModal: () => void;
  applyFilters: () => void;
  filters: {
    breed?: string;
    minAge?: string;
    maxAge?: string;
    activityLevel?: string;
    emotionalStatus?: string;
    vaccinationStatus?: string;
  };
  handleFilterChange: (key: string, value: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  toggleFilterModal,
  applyFilters,
  filters,
  handleFilterChange,
}) => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [breedQuery, setBreedQuery] = useState<string>("");
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>(
    filters?.breed || ""
  );
  const [minAge, setMinAge] = useState<string>(filters?.minAge || "");
  const [maxAge, setMaxAge] = useState<string>(filters?.maxAge || "");
  const [activityLevel, setActivityLevel] = useState<string>(
    filters?.activityLevel || ""
  );
  const [emotionalStatus, setEmotionalStatus] = useState<string>(
    filters?.emotionalStatus || ""
  );
  const [vaccinationStatus, setVaccinationStatus] = useState<string>(
    filters?.vaccinationStatus || ""
  );

  const [isBreedFilterOpen, setIsBreedFilterOpen] = useState<boolean>(false);
  const [isAgeFilterOpen, setIsAgeFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadBreeds = async () => {
      const breedList: string[] = await fetchDogBreeds();
      setBreeds(breedList);
      setFilteredBreeds(breedList);
    };
    loadBreeds();
  }, []);

  const handleBreedSearch = (text: string) => {
    setBreedQuery(text);
    const filtered = breeds.filter((breed) =>
      breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filtered);
  };

  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    handleFilterChange("breed", breed);
    setBreedQuery("");
    setFilteredBreeds([]);
  };

  return visible ? (
    <View className="flex-1">
      <View
        className="bg-white p-6"
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: screenHeight - 115,
          justifyContent: "flex-start",
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
                value={minAge}
                onChangeText={(text) => {
                  setMinAge(text);
                  handleFilterChange("minAge", text);
                }}
                keyboardType="numeric"
                className="border border-gray-400 rounded-lg p-2 w-24"
                placeholder="Вік від"
              />
              <Text>до</Text>
              <TextInput
                value={maxAge}
                onChangeText={(text) => {
                  setMaxAge(text);
                  handleFilterChange("maxAge", text);
                }}
                keyboardType="numeric"
                className="border border-gray-400 rounded-lg p-2 w-24"
                placeholder="Вік до"
              />
            </View>
          </View>
        )}

        {/* Інші фільтри */}
        <Text className="text-base mb-2">Рівень активності:</Text>
        <TextInput
          value={activityLevel}
          onChangeText={(text) => handleFilterChange("activityLevel", text)}
          placeholder="Активність (1-10)"
          keyboardType="numeric"
          className="border border-gray-400 rounded-lg p-2"
        />

        <Text className="text-base mb-2">Емоційний стан:</Text>
        <TextInput
          value={emotionalStatus}
          onChangeText={(text) => handleFilterChange("emotionalStatus", text)}
          placeholder="Емоційний стан (1-10)"
          keyboardType="numeric"
          className="border border-gray-400 rounded-lg p-2"
        />

        <Text className="text-base mb-2">Статус вакцинації:</Text>
        <TextInput
          value={vaccinationStatus}
          onChangeText={(text) => handleFilterChange("vaccinationStatus", text)}
          placeholder="Вакцинація (повна/часткова)"
          className="border border-gray-400 rounded-lg p-2 mb-4"
        />

        {/* Кнопки */}
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
