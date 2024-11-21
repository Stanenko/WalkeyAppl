import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

// Описание типов для props
interface BreedSelectorProps {
  items: { label: string; value: string }[]; // Список элементов
  placeholder: string; // Плейсхолдер
  value: string; // Текущее значение
  onChangeValue: (value: string) => void; // Callback при изменении
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  items,
  placeholder,
  value,
  onChangeValue,
}) => {
  const [inputValue, setInputValue] = useState(value || ""); // Поле ввода
  const [filteredItems, setFilteredItems] = useState(items); // Отфильтрованные данные
  const [isOpen, setIsOpen] = useState(false); // Открытие списка

  useEffect(() => {
    if (inputValue) {
      // Фильтрация элементов на основе ввода
      const filtered = items.filter((item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [inputValue, items]);

  return (
    <View style={styles.container}>
      {/* Поле ввода */}
      <TextInput
        value={inputValue}
        placeholder={placeholder}
        placeholderTextColor="gray"
        onChangeText={(text) => {
          setInputValue(text);
          setIsOpen(true); // Открываем список при вводе
          onChangeValue && onChangeValue(text);
        }}
        onFocus={() => setIsOpen(true)} // Открываем список при фокусе
        style={styles.input}
      />

      {/* Выпадающий список */}
      {isOpen && (
        <View style={styles.dropDown}>
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropDownItem}
                onPress={() => {
                  setInputValue(item.label); // Устанавливаем выбранный элемент
                  setIsOpen(false); // Закрываем список
                  onChangeValue(item.value); // Передаем значение родителю
                }}
              >
                <Text style={styles.dropDownText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.flatList}
          />
        </View>
      )}
    </View>
  );
};

export default BreedSelector;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  input: {
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    color: "black",
  },
  dropDown: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    zIndex: 10,
    maxHeight: 200, // Максимальная высота выпадающего списка
    shadowColor: "#000", // Цвет тени
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 8, // Для тени на Android
  },
  flatList: {
    flexGrow: 0, // Позволяет ограничивать высоту FlatList
  },
  dropDownItem: {
    padding: 10,
    //borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  dropDownText: {
    fontSize: 16,
    color: "black",
  },
});
