"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Person } from "./birth";

/** 마지막으로 입력한 내 정보와 궁합 상대. 이 기기(localStorage)에만 저장한다. */
interface ProfileState {
  me: Person | null;
  partner: Person | null;
  setMe: (p: Person) => void;
  setPartner: (p: Person) => void;
  clear: () => void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      me: null,
      partner: null,
      setMe: (me) => set({ me }),
      setPartner: (partner) => set({ partner }),
      clear: () => set({ me: null, partner: null }),
    }),
    { name: "mukyeon-profile", storage: createJSONStorage(() => localStorage) },
  ),
);
