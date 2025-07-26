import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  email: string | null;
  token: string | null;
  user: Record<string, any> | null;
  setCredentials: (email: string, token: string) => void;
  clearCredentials: () => void;
  setUser: (user: Record<string, any>) => void;
  logout: () => void;
}

const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      email: null,
      token: null,
      user: null,
      setCredentials: (email, token) =>
        set(() => ({
          email,
          token,
        })),
      clearCredentials: () =>
        set(() => ({
          email: null,
          token: null,
        })),
      setUser: (user: Record<string, any>) => set(() => ({ user })),
      logout: () => {
        set(() => ({
          email: null,
          token: null,
          user: null,
        }));
        Cookies.remove("aifu-token");
      },
    }),
    {
      name: "aifu-token",
      partialize: (state) => ({
        email: state.email,
        token: state.token,
        user: state.user,
      }),
    },
  ),
);

export default useLayoutStore;
