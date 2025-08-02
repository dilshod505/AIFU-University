"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import useLayoutStore from "@/store/layout-store";
import { api } from "@/components/models/axios";

const AuthProvider = ({
  children,
  role,
}: {
  children: ReactNode;
  role?: string;
}) => {
  const { setUser } = useLayoutStore();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.post("/auth/me");
        if (res.status === 200 || res.status === 201) {
          setUser(res.data);
        } else {
          router.push("/login");
        }
      } catch (e: any) {
        console.log(e);
        if (e.response.status !== 200 || e.response.status !== 201) {
          router.push("/login");
        }
      }
    };

    check();
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
