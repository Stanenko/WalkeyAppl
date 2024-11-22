import React, { useState, useEffect } from "react";
import DropDownPicker, { DropDownPickerProps } from "react-native-dropdown-picker";

type CustomDropDownPickerProps<T extends string | number | boolean> = DropDownPickerProps<T> & {
  placeholder?: string;
  searchable?: boolean; 
};

const CustomDropDownPicker = <T extends string | number | boolean>({
  placeholder = "Выберите значение",
  searchable = false, 
  ...props
}: CustomDropDownPickerProps<T>) => {
  const [inputValue, setInputValue] = useState(""); 
  const [filteredItems, setFilteredItems] = useState(props.items || []); 


  useEffect(() => {
    if (searchable) {
      const lowerCaseInput = inputValue.toLowerCase();
      setFilteredItems(
        (props.items || []).filter((item) =>
          item.label.toLowerCase().includes(lowerCaseInput)
        )
      );
    }
  }, [inputValue, props.items, searchable]);

  return (
    <DropDownPicker
      placeholder={placeholder}
      maxHeight={200}
      style={{
        backgroundColor: "transparent",
        borderColor: "transparent",
        paddingHorizontal: 10,
        borderWidth: 0,
      }}
      placeholderStyle={{
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "left",
      }}
      textStyle={{
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
      }}
      dropDownContainerStyle={{
        borderWidth: 0,
        backgroundColor: "white",
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
      }}
      listItemLabelStyle={{
        fontSize: 18,
        fontWeight: "400",
        paddingVertical: 10,
      }}
      selectedItemContainerStyle={{
        backgroundColor: "#f0f0f0",
      }}
      arrowIconStyle={{
        width: 20,
        height: 20,
      }}
      arrowIconContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
      showTickIcon={false}
      {...props}
      items={searchable ? filteredItems : props.items} 
      searchTextInputProps={
        searchable
          ? {
              style: {
                height: "100%",
                color: "black",
                fontSize: 18,
                paddingHorizontal: 10,
              },
              value: inputValue,
              placeholder: placeholder,
              placeholderTextColor: "gray",
              onChangeText: setInputValue, 
            }
          : undefined
      }
    />
  );
};

export default CustomDropDownPicker;
