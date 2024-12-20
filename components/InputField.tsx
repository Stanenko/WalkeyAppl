import { KeyboardAvoidingView, TouchableWithoutFeedback, View, Text, Image, TextInput, Keyboard } from "react-native";
import { useState } from "react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  icon?: JSX.Element | number;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  textContentType?: TextInput["props"]["textContentType"];
  keyboardType?: TextInput["props"]["keyboardType"];
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
  autoComplete?: TextInput["props"]["autoComplete"];
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
  keyboardType,
  autoCapitalize,
  autoComplete,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <KeyboardAvoidingView behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
            {label}
          </Text>

          <View
            className={`flex flex-row items-center relative bg-neutral-100 rounded-md border ${
              isFocused ? "border-black border-2" : "border-neutral-100"
            } ${containerStyle}`}
          >
            {icon && (
              <Image
                source={typeof icon === "number" ? icon : undefined}
                style={typeof icon === "number" ? undefined : {}}
                className={`w-6 h-6 ml-4 ${iconStyle}`}
              />
            )}
            <TextInput
              className={`rounded-md p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}
              autoComplete={autoComplete}
              textContentType={textContentType}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
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
