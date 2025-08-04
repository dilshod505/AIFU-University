"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function HydrationLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="absolute bg-white top-0 left-0 z-50 flex justify-center items-center h-screen w-full gap-3  ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        <p className="ml-2 text-black">{t("loading")}...</p>
      </div>
    );
  }

  return <>{children}</>;
}
