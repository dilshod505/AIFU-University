"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/models/axios";
import { useTranslations } from "next-intl";
import useLayoutStore from "@/store/layout-store";

const AuthProvider = ({
  children,
  role,
}: {
  children: ReactNode;
  role?: string;
}) => {
  const t = useTranslations();
  const { setUser, user } = useLayoutStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const check = async () => {
      setIsLoading(true);
      try {
        const res = await api.post("/admin/auth/me");
        if (res.status === 200 || res.status === 201) {
          const userData = res.data.data;
          setUser(userData);

          if (
            role &&
            userData.role.toString().toUpperCase() !== role.toUpperCase()
          ) {
            router.push(
              `/${userData.role.toLowerCase().replace("_", "-")}/dashboard`,
            );
          }
        } else {
          router.push("/login");
        }
        setIsLoading(false);
      } catch (e: any) {
        router.push("/login");
        setIsLoading(false);
      }
    };

    check();
  }, [role, router, setUser]);

  if (isLoading) {
    return (
      <div className="absolute bg-white top-0 left-0 z-50 flex justify-center items-center h-screen w-full gap-3  ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        <p className="ml-2 text-black">{t("loading")}...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
