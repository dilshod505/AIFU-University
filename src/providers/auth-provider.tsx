"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import useLayoutStore from "@/store/layout-store";
import { api } from "@/components/models/axios";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setUser } = useLayoutStore();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const res = await api.post("/auth/me");
      console.log(res);
      if (res.status === 200 || res.status === 201) {
        setUser(res.data);
      } else {
        router.push("/login");
      }
    };

    check();
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
