import { Ride } from "@/types/type";
import { View, Text } from "react-native";

const RideCard = ({ ride }: { ride: Ride }) => (
    <View>
        <Text>{ride.otherDog.first_name}</Text>
    </View>
);

export default RideCard;