"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import TooltipBtn from "@/components/tooltip-btn";

const ChangeLanguage = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (locale: string) => {
    router.push(`/${locale}${pathname.slice(locale.length + 1)}`);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TooltipBtn title={t("change language")} variant="ghost">
          <Globe />
        </TooltipBtn>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{t("change language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => changeLanguage("uzb")}
          >
            O'zbekcha
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => changeLanguage("rus")}
          >
            Русский
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => changeLanguage("eng")}
          >
            English
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChangeLanguage;
