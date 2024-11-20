import {TextInputProps, TouchableOpacityProps} from "react-native";

declare interface OtherDog {
    other_dog_id: number;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    other_dog_image_url: string;
    rating: number;
}

declare interface MarkerData {
    latitude: number;
    longitude: number;
    id: number;
    title: string;
    profile_image_url: string;
    other_dog_image_url: string;
    rating: number;
    first_name: string;
    last_name: string;
    time?: number;
}

declare interface MapProps {
    destinationLatitude?: number;
    destinationLongitude?: number;
    onOtherDogTimesCalculated?: (otherDogsWithTimes: MarkerData[]) => void;
    selectedOtherDog?: number | null;
    onMapReady?: () => void;
}

declare interface Ride {
    origin_address: string;
    destination_address: string;
    origin_latitude: number;
    origin_longitude: number;
    destination_latitude: number;
    destination_longitude: number;
    ride_time: number;
    other_dog_id: number;
    user_email: string;
    created_at: string;
    otherDog: {
        first_name: string;
        last_name: string;
    };
}

declare interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
}

declare interface GoogleInputProps {
    icon?: string;
    initialLocation?: string;
    containerStyle?: string;
    textInputBackgroundColor?: string;
    handlePress: ({
                      latitude,
                      longitude,
                      address,
                  }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
}

declare interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: any;
    secureTextEntry?: boolean;
    labelStyle?: string;
    containerStyle?: string;
    inputStyle?: string;
    iconStyle?: string;
    className?: string;
}

declare interface LocationStore {
    userLatitude: number | null;
    userLongitude: number | null;
    userAddress: string | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
    destinationAddress: string | null;
    setUserLocation: ({
                          latitude,
                          longitude,
                          address,
                      }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
    setDestinationLocation: ({
                                 latitude,
                                 longitude,
                                 address,
                             }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
}

declare interface OtherDogStore {
    drivers: MarkerData[];
    selectedOtherDog: number | null;
    setSelectedOtherDog: (driverId: number) => void;
    setOtherDogs: (drivers: MarkerData[]) => void;
    clearSelectedOtherDog: () => void;
}

declare interface OtherDogCardProps {
    item: MarkerData;
    selected: number;
    setSelected: () => void;
}