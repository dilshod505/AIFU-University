import React from "react";
import FullScreen from "@/components/widgets/full-screen";
import ThemeSwitcher from "@/components/widgets/theme-switcher";
import ChangeLanguage from "@/components/widgets/change-language";
import { Luxurious_Roman } from "next/dist/compiled/@next/font/dist/google";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="cont flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
        <div className="flex justify-center items-center gap-3">
          <h1 className={`text-2xl font-semibold py-5`}>AIFU</h1>
        </div>
        <div className="flex justify-center items-center gap-2">
          <FullScreen />
          <ThemeSwitcher />
          <ChangeLanguage />
        </div>
      </header>
      {children}
    </>
  );
};

export default Layout;
