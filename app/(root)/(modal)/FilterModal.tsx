import React, { useState, useEffect } from "react";
import {
  Modal,
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
  const [excludedBreedQuery, setExcludedBreedQuery] = useState<string>("");
  const [excludedBreed, setExcludedBreed] = useState<string>("");

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

  const handleExcludedBreedSearch = (text: string) => {
    setExcludedBreedQuery(text);
    const filtered = breeds.filter((breed) =>
      breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filtered);
  };

  const handleExcludedBreedSelect = (breed: string) => {
    setExcludedBreed(breed);
    handleFilterChange("excludedBreed", breed);
    setExcludedBreedQuery("");
    setFilteredBreeds([]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        {/* Шапка */}
        <View
          style={{
            position: "relative",
            marginTop: 75, // Отступ сверху для шапки
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Фільтрувати
          </Text>
        </View>

        <View
          style={{
            padding: 20,
            marginTop: 15,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsBreedFilterOpen(!isBreedFilterOpen)}
            style={{
              backgroundColor: "#FFE5D8",
              borderRadius: 16,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "black", textAlign: "center" }}>Порода собак</Text>
          </TouchableOpacity>

          {isBreedFilterOpen && (
            <View>
              <TextInput
                value={breedQuery || selectedBreed}
                onChangeText={handleBreedSearch}
                placeholder="Почніть вводити породу"
                style={{
                  borderWidth: 1,
                  borderColor: "gray",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 10,
                }}
              />
              {breedQuery.length > 0 && (
                <FlatList
                  data={filteredBreeds}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleBreedSelect(item)}
                      style={{
                        padding: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: "#ddd",
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 150 }}
                />
              )}
              <Text style={{ color: "black", marginTop: 10, marginBottom: 10 }}>
                Показати всі окрім породи:
              </Text>
              <TextInput
                value={excludedBreedQuery || excludedBreed}
                onChangeText={handleExcludedBreedSearch}
                placeholder="Введіть породу для виключення"
                style={{
                  borderWidth: 1,
                  borderColor: "gray",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 10,
                }}
              />
              {excludedBreedQuery.length > 0 && (
                <FlatList
                  data={filteredBreeds}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleExcludedBreedSelect(item)}
                      style={{
                        padding: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: "#ddd",
                      }}
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
            style={{
              backgroundColor: "#FFE5D8",
              borderRadius: 16,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "black", textAlign: "center" }}>Вік у роках</Text>
          </TouchableOpacity>

          {isAgeFilterOpen && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text>Від</Text>
                <TextInput
                  value={minAge}
                  onChangeText={(text) => {
                    setMinAge(text);
                    handleFilterChange("minAge", text);
                  }}
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    borderRadius: 8,
                    padding: 8,
                    width: 80,
                  }}
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
                  style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    borderRadius: 8,
                    padding: 8,
                    width: 80,
                  }}
                  placeholder="Вік до"
                />
              </View>
            </View>
          )}

          <Text style={{ marginBottom: 10 }}>Рівень активності:</Text>
          <TextInput
            value={activityLevel}
            onChangeText={(text) => handleFilterChange("activityLevel", text)}
            placeholder="Активність (1-10)"
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 8,
              padding: 8,
              marginBottom: 10,
            }}
          />

          <Text style={{ marginBottom: 10 }}>Емоційний стан:</Text>
          <TextInput
            value={emotionalStatus}
            onChangeText={(text) => handleFilterChange("emotionalStatus", text)}
            placeholder="Емоційний стан (1-10)"
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 8,
              padding: 8,
              marginBottom: 10,
            }}
          />

          <Text style={{ marginBottom: 10 }}>Статус вакцинації:</Text>
          <TextInput
            value={vaccinationStatus}
            onChangeText={(text) =>
              handleFilterChange("vaccinationStatus", text)
            }
            placeholder="Вакцинація (повна/часткова)"
            style={{
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 8,
              padding: 8,
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            onPress={() => {
              applyFilters();
              toggleFilterModal();
            }}
            style={{
              backgroundColor: "#FF6C22",
              borderRadius: 24,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Застосувати фільтри</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFilterModal}
            style={{
              backgroundColor: "#FFE5D8",
              borderRadius: 24,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "black", textAlign: "center" }}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
