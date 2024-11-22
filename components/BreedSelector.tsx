import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";


interface BreedSelectorProps {
  items: { label: string; value: string }[]; 
  placeholder: string;
  value: string; 
  onChangeValue: (value: string) => void; 
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  items,
  placeholder,
  value,
  onChangeValue,
}) => {
  const [inputValue, setInputValue] = useState(value || ""); 
  const [filteredItems, setFilteredItems] = useState(items); 
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (inputValue) {
   
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
  
      <TextInput
        value={inputValue}
        placeholder={placeholder}
        placeholderTextColor="gray"
        onChangeText={(text) => {
          setInputValue(text);
          setIsOpen(true);
          onChangeValue && onChangeValue(text);
        }}
        onFocus={() => setIsOpen(true)} 
        style={styles.input}
      />

  
      {isOpen && (
        <View style={styles.dropDown}>
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropDownItem}
                onPress={() => {
                  setInputValue(item.label); 
                  setIsOpen(false); 
                  onChangeValue(item.value); 
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
    maxHeight: 200, 
    shadowColor: "#000", 
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 8, 
  },
  flatList: {
    flexGrow: 0, 
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
