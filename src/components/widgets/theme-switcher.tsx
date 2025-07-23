"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import TooltipBtn from "@/components/tooltip-btn";
import { useTranslations } from "next-intl";

const ThemeSwitcher = () => {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  return (
    <TooltipBtn
      variant={"ghost"}
      title={
        theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")
      }
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </TooltipBtn>
  );
};

export default ThemeSwitcher;
