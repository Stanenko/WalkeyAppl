import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, PersistStorage } from "zustand/middleware";

interface MatchingStore {
  matchingData: Record<string, number>;
  setMatching: (dogId: string, percentage: number) => void;
  resetMatching: () => void;
}

const zustandStorage: PersistStorage<MatchingStore> = {
  getItem: async (name) => {
    const item = await AsyncStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useMatchingStore = create<MatchingStore>()(
  persist(
    (set) => ({
      matchingData: {},

      setMatching: (dogId, percentage) =>
        set((state) => ({
          matchingData: { ...state.matchingData, [dogId]: percentage },
        })),

      resetMatching: () => set({ matchingData: {} }),
    }),
    {
      name: "matching-storage",
      storage: zustandStorage,
    }
  )
);
