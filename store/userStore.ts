import { create } from "zustand";

interface UserState {
  userData: {
    clerkId?: string;
    name?: string;
    email?: string;
    birth_date?: string;
    unique_code?: string;
    image?: string;
    breed?: string;
  };
  setUserData: (data: Partial<UserState["userData"]>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userData: {}, 
  setUserData: (data) =>
    set((state) => ({ userData: { ...state.userData, ...data } })),
}));
