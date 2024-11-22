import React, { useRef, useState } from "react";
import { View, Text, PanResponder, Animated } from "react-native";

interface CustomSliderProps {
  minValue?: number;
  maxValue?: number;
  step?: number;
  onValueChange?: (minValue: number, maxValue: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  minValue = 1,
  maxValue = 12,
  step = 1,
  onValueChange,
}) => {
  const sliderWidth = 250;
  const panMin = useRef(new Animated.Value(0)).current;
  const panMax = useRef(new Animated.Value(sliderWidth)).current;
  const [currentMinValue, setCurrentMinValue] = useState(minValue);
  const [currentMaxValue, setCurrentMaxValue] = useState(maxValue);

  const panMinValue = useRef(0); 
  const panMaxValue = useRef(sliderWidth); 

  const calculateValue = (position: number) => {
    const ratio = position / sliderWidth;
    return Math.round(ratio * (maxValue - minValue)) + minValue;
  };

  const panResponderMin = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newValue = Math.min(
          Math.max(gestureState.dx, 0),
          panMaxValue.current - 40
        );
        panMinValue.current = newValue; 
        const calculatedValue = calculateValue(newValue);

        Animated.timing(panMin, {
          toValue: newValue,
          duration: 0,
          useNativeDriver: false,
        }).start();

        setCurrentMinValue(calculatedValue);

        if (onValueChange) {
          onValueChange(calculatedValue, currentMaxValue);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const panResponderMax = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newValue = Math.max(
          Math.min(gestureState.dx + panMinValue.current, sliderWidth),
          panMinValue.current + 40
        );
        panMaxValue.current = newValue; 
        const calculatedValue = calculateValue(newValue);

        Animated.timing(panMax, {
          toValue: newValue,
          duration: 0,
          useNativeDriver: false,
        }).start();

        setCurrentMaxValue(calculatedValue);

        if (onValueChange) {
          onValueChange(currentMinValue, calculatedValue);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>
        Вік: від {currentMinValue} до {currentMaxValue} років
      </Text>
      <View
        style={{
          height: 4,
          backgroundColor: "#ddd",
          width: sliderWidth,
          borderRadius: 2,
          position: "relative",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            backgroundColor: "#FF6C22",
            height: 4,
            left: panMin,
            width: Animated.subtract(panMax, panMin),
            borderRadius: 2,
          }}
        />
        <Animated.View
          {...panResponderMin.panHandlers}
          style={{
            transform: [{ translateX: panMin }],
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FF6C22",
            position: "absolute",
            top: -18,
          }}
        />
        <Animated.View
          {...panResponderMax.panHandlers}
          style={{
            transform: [{ translateX: panMax }],
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FF6C22",
            position: "absolute",
            top: -18,
          }}
        />
      </View>
    </View>
  );
};

export default CustomSlider;
