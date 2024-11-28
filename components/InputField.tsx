import { KeyboardAvoidingView, TouchableWithoutFeedback, View, Text, Image, TextInput, Keyboard } from "react-native";
import { useState } from "react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  icon?: JSX.Element | number;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  textContentType?: "none" | "URL" | "addressCity" | "addressCityAndState" | "addressState" | "countryName" | "creditCardNumber" | "emailAddress" | "familyName" | "fullStreetAddress" | "givenName" | "jobTitle" | "location" | "middleName" | "name" | "namePrefix" | "nameSuffix" | "nickname" | "organizationName" | "postalCode" | "streetAddressLine1" | "streetAddressLine2" | "sublocality" | "telephoneNumber" | "username" | "password";
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  secureTextEntry = false,
  textContentType,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerBorderStyle = isFocused
  ? "border-black border-2"
  : "border-neutral-100";


  return (
    <KeyboardAvoidingView behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          {/* Label */}
          <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
            {label}
          </Text>

          {/* Input container */}
          <View
            className={`flex flex-row items-center relative bg-neutral-100 rounded-md border ${
              isFocused ? "border-black border-2" : "border-neutral-100"
            } ${containerStyle}`}
          >
            {/* Icon */}
            {icon && (
              <Image
                source={typeof icon === "number" ? icon : undefined}
                style={typeof icon === "number" ? undefined : {}}
                className={`w-6 h-6 ml-4 ${iconStyle}`}
              />
            )}
            {/* Text Input */}
            <TextInput
              className={`rounded-md p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}
              textContentType="emailAddress"
              autoComplete="email" 
              textContentType={textContentType}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              selectionColor="black"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
