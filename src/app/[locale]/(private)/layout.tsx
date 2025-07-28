import React from "react";
import FullScreen from "@/components/widgets/full-screen";
import ThemeSwitcher from "@/components/widgets/theme-switcher";
import ChangeLanguage from "@/components/widgets/change-language";
import Sidebar from "@/components/widgets/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    // <AuthProvider>
    <div className={"flex w-full"}>
      <Sidebar />
      <div className={"flex flex-col h-dvh flex-1"}>
        <header
          className={
            "border-b w-full sticky top-0 z-50 bg-[#EFF6FF]/50 dark:bg-background"
          }
        >
          <div className="cont flex justify-between items-center">
            <div className="flex justify-center items-center gap-3">
              <h1 className={"text-2xl font-semibold py-5"}>AIFU</h1>
            </div>

            <div className="flex justify-center items-center gap-2">
              <FullScreen />
              <ThemeSwitcher />
              <ChangeLanguage />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto pb-3">{children}</div>
      </div>
    </div>
    // </AuthProvider>
  );
};

export default Layout;
