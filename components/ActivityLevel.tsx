import React from "react";
import { View, Text } from "react-native";

const ActivityLevel = ({ activity }: { activity: number }) => {

  const getBarsAndText = (activity: number) => {
    if (activity <= 20) return { bars: 1, text: "Неактивний" };
    if (activity <= 40) return { bars: 2, text: "Мало активний" };
    if (activity <= 60) return { bars: 3, text: "Активний" };
    if (activity <= 80) return { bars: 4, text: "Активний" };
    return { bars: 5, text: "Дуже активний" };
  };

  const { bars, text } = getBarsAndText(activity);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flexDirection: "row", marginRight: 8 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 24,
              marginHorizontal: 2,
              backgroundColor: index < bars ? "black" : "#d3d3d3",
              borderRadius: 4,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 14, fontWeight: "bold" }}>{text}</Text>
    </View>
  );
};

export default ActivityLevel;
