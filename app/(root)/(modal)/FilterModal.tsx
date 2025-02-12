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
    excludedBreed?: string;
    gender?: string;
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
  const [excludedBreedQuery, setExcludedBreedQuery] = useState<string>("");
  const [selectedBreed, setSelectedBreed] = useState<string>(filters?.breed || "");
  const [excludedBreed, setExcludedBreed] = useState<string>(filters?.excludedBreed || "");
  const [minAge, setMinAge] = useState<string>(filters?.minAge || "");
  const [maxAge, setMaxAge] = useState<string>(filters?.maxAge || "");
  const [activityLevel, setActivityLevel] = useState<string>(
    filters?.activityLevel || ""
  );
  const [vaccinationStatus, setVaccinationStatus] = useState<string>(
    filters?.vaccinationStatus || ""
  );

  const [isBreedFilterOpen, setIsBreedFilterOpen] = useState<boolean>(false);
  const [isAgeFilterOpen, setIsAgeFilterOpen] = useState<boolean>(false);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<{ male: boolean; female: boolean }>({
    male: false,
    female: false,
  });
  

  useEffect(() => {
    const loadBreeds = async () => {
      const breedList: string[] = await fetchDogBreeds();
      setBreeds(breedList);
      setFilteredBreeds(breedList);
    };
    loadBreeds();
  }, []);

  useEffect(() => {
    const allEmpty = !filters.breed && !filters.excludedBreed
      && !filters.minAge && !filters.maxAge
      && !filters.activityLevel && !filters.vaccinationStatus
      && !filters.gender;
  
    if (allEmpty) {
      setBreedQuery("");
      setExcludedBreedQuery("");
      setSelectedBreed("");
      setExcludedBreed("");
      setMinAge("");
      setMaxAge("");
      setActivityLevel("");
      setVaccinationStatus("");
      setGenderFilter({ male: false, female: false });
    }
  }, [filters]);
  
  const resetGenderFilter = () => {
    setGenderFilter({ male: false, female: false }); 
    handleFilterChange("gender", ""); 
  };
  

  const handleBreedSearch = (text: string) => {
    setBreedQuery(text);

    if (!text) {
      setSelectedBreed("");
      handleFilterChange("breed", "");
      setFilteredBreeds(breeds);
      return;
    }
    const filtered = breeds.filter((breed) =>
      breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filtered);
  };

  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    setBreedQuery(breed);
    handleFilterChange("breed", breed);
    setFilteredBreeds([]);
  };

  const handleExcludedBreedSearch = (text: string) => {
    setExcludedBreedQuery(text);

    if (!text) {
      setExcludedBreed("");
      handleFilterChange("excludedBreed", "");
      setFilteredBreeds(breeds);
      return;
    }
    const filtered = breeds.filter((breed) =>
      breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filtered);
  };

  const handleExcludedBreedSelect = (breed: string) => {
    setExcludedBreed(breed);
    setExcludedBreedQuery(breed);
    handleFilterChange("excludedBreed", breed);
    setFilteredBreeds([]);
  };

  const handleActivityLevelChange = (text: string) => {
    setActivityLevel(text); 
    handleFilterChange("activityLevel", text);
  };

  const handleVaccinationStatusChange = (text: string) => {
    setVaccinationStatus(text);
    handleFilterChange("vaccinationStatus", text);
  };

  const handleGenderChange = (gender: "male" | "female") => {
    setGenderFilter((prev) => {
      const updatedGender = { ...prev, [gender]: !prev[gender] };
  
      const selectedGenders = Object.entries(updatedGender)
        .filter(([_, value]) => value)
        .map(([key]) => key);
  
      if (selectedGenders.length === 2) {
        handleFilterChange("gender", "all"); 
      } else {
        handleFilterChange("gender", selectedGenders.length ? selectedGenders.join(",") : "");
      }
  
      return updatedGender;
    });
  };  
   
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            position: "relative",
            marginTop: 75,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center" }}>
            Фільтрувати
          </Text>
        </View>

        <View style={{ padding: 20, marginTop: 15 }}>
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
            <Text style={{ color: "black", textAlign: "center" }}>
              Порода собак
            </Text>
          </TouchableOpacity>

          {isBreedFilterOpen && (
            <View>
              <TextInput
                value={breedQuery}
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
                value={excludedBreedQuery}
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
            <Text style={{ color: "black", textAlign: "center" }}>
              Вік у роках
            </Text>
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

<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
  <Text style={{ marginRight: 30 }}>Стать:</Text>

  <TouchableOpacity onPress={() => handleGenderChange("male")} style={{ flexDirection: "row", alignItems: "center", marginRight: 30 }}>
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "gray",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: genderFilter.male ? "#FF6C22" : "white",
      }}
    />
    <Text style={{ marginLeft: 8 }}>Хлопчик</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => handleGenderChange("female")} style={{ flexDirection: "row", alignItems: "center" }}>
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "gray",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: genderFilter.female ? "#FF6C22" : "white",
      }}
    />
    <Text style={{ marginLeft: 8 }}>Дівчинка</Text>
  </TouchableOpacity>
</View>


          <Text style={{ marginBottom: 10 }}>Рівень активності:</Text>
          <TextInput
            value={activityLevel}
            onChangeText={handleActivityLevelChange}
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

          <Text style={{ marginBottom: 10 }}>Статус вакцинації:</Text>
          <TextInput
            value={vaccinationStatus}
            onChangeText={handleVaccinationStatusChange}
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
            onPress={async () => {
              await applyFilters();
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
            <Text style={{ color: "white", textAlign: "center" }}>
              Застосувати фільтри
            </Text>
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
