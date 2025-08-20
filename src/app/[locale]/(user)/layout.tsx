import React from "react";
import FullScreen from "@/components/widgets/full-screen";
import ThemeSwitcher from "@/components/widgets/theme-switcher";
import ChangeLanguage from "@/components/widgets/change-language";
import logo from "../../../../public/logo-full.png";
import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="bg-[#213148]">
        <header className="cont flex h-16 shrink-0 justify-between items-center gap-2 px-4 ">
          <div className="flex justify-center items-center gap-3">
            <Link href="/">
              <h1 className={`text-2xl font-semibold py-5`}>
                <Image src={logo} alt={""} />
              </h1>
            </Link>
          </div>
          <div className="flex justify-center items-center gap-2 text-white">
            <FullScreen />
            <ThemeSwitcher />
            <ChangeLanguage />
          </div>
        </header>
      </div>
      {children}
    </>
  );
};

export default Layout;
