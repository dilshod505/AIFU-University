import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  phoneNumber: string | null;
  token: string | null;
  user: Record<string, any> | null;
  setCredentials: (phoneNumber: string, token: string) => void;
  clearCredentials: () => void;
  setUser: (user: Record<string, any>) => void;
  logout: () => void;
}

const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      phoneNumber: null,
      token: null,
      user: null,
      setCredentials: (phoneNumber, token) =>
        set(() => ({
          phoneNumber,
          token,
        })),
      clearCredentials: () =>
        set(() => ({
          phoneNumber: null,
          token: null,
        })),
      setUser: (user: Record<string, any>) => set(() => ({ user })),
      logout: () => {
        set(() => ({
          phoneNumber: null,
          token: null,
          user: null,
        }));
        Cookies.remove("ar-book-token");
      },
    }),
    {
      name: "ar-books",
      partialize: (state) => ({
        phoneNumber: state.phoneNumber,
        token: state.token,
        user: state.user,
      }),
    },
  ),
);

export default useLayoutStore;
