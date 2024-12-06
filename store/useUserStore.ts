import { create } from "zustand";
import { UserStore } from "@/types/type";

export const useUserStore = create<UserStore>((set) => ({
    userData: null,
    setUserData: (data) =>
        set({
            userData: data,
        }),

    dogsData: [],
    setDogsData: (dogs) =>
        set({
            dogsData: dogs,
        }),
}));
