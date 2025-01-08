import { create } from "zustand";
import { StateCreator } from "zustand";

interface ToggleState {
  isToggled: boolean;
  setIsToggled: (value: boolean) => void;
}

const toggleState: StateCreator<ToggleState> = (set) => ({
  isToggled: false,
  setIsToggled: (value: boolean) => set({ isToggled: value }),
});

export const useToggleStore = create<ToggleState>(toggleState);
