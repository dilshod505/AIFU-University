"use client";

import { Maximize, Minimize } from "lucide-react";
import { useState } from "react";
import TooltipBtn from "@/components/tooltip-btn";
import { useTranslations } from "next-intl";

const FullScreen = () => {
  const t = useTranslations();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  return (
    <TooltipBtn
      title={isFullscreen ? t("Exit Fullscreen") : t("Enter Fullscreen")}
      variant={"ghost"}
      onClick={handleFullscreen}
      className={`${isFullscreen ? "" : "rotate-180"} hidden md:flex`}
    >
      {!isFullscreen ? <Maximize /> : <Minimize />}
    </TooltipBtn>
  );
};

export default FullScreen;
