import DropDownPicker, { DropDownPickerProps } from "react-native-dropdown-picker";

type CustomDropDownPickerProps<T extends string | number | boolean> = DropDownPickerProps<T> & {
  placeholder?: string;
};

const CustomDropDownPicker = <T extends string | number | boolean>({
  placeholder = "Выберите значение",
  searchable = false, // Разрешение на ввод текста
  searchPlaceholder = "Введите текст", // Плейсхолдер для поиска
  searchTextInputProps = {}, // Дополнительные свойства для поля ввода
  ...props
}: CustomDropDownPickerProps<T>) => {
  return (
    <DropDownPicker
      placeholder={placeholder}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      searchTextInputProps={searchTextInputProps}
      {...props}
      style={{
        backgroundColor: "white",
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
      }}
      placeholderStyle={{
        color: "gray",
        fontSize: 18,
      }}
      dropDownContainerStyle={{
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "white",
      }}
    />
  );
};

export default CustomDropDownPicker;
