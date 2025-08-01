"use client";

import type React from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Sidebar from "@/components/widgets/sidebar";
import FullScreen from "@/components/widgets/full-screen";
import ThemeSwitcher from "@/components/widgets/theme-switcher";
import ChangeLanguage from "@/components/widgets/change-language";

interface SidebarWrapperProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  notifications?: number;
  onLogout?: () => void;
}

export default function SidebarWrapper({
  children,
  user,
  notifications,
  onLogout,
}: SidebarWrapperProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar user={user} notifications={notifications} onLogout={onLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
          <div className="flex justify-center items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <h1 className={"text-2xl font-semibold py-5"}>AIFU</h1>
          </div>
          <div className="flex justify-center items-center gap-2">
            <FullScreen />
            <ThemeSwitcher />
            <ChangeLanguage />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
