"use client";

import type React from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import FullScreen from "@/components/widgets/full-screen";
import ThemeSwitcher from "@/components/widgets/theme-switcher";
import ChangeLanguage from "@/components/widgets/change-language";
import OptimizedSidebar from "@/components/widgets/sidebar";
import NotificationHeader from "@/components/widgets/notification-header";

interface SidebarWrapperProps {
  children: React.ReactNode;
  notifications?: number;
  onLogout?: () => void;
}

export default function SidebarWrapper({
  children,
  notifications,
  onLogout,
}: SidebarWrapperProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <OptimizedSidebar notifications={notifications} onLogout={onLogout} />
      {/* Bu yerga overflow-x-hidden klassini qo'shing */}
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 w-auto shrink-0 justify-between items-center gap-2 border-b px-4">
          <div className="flex justify-center items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <h1 className={"text-2xl font-semibold py-5"}>AIFU</h1>
          </div>
          <div className="flex justify-center items-center gap-2">
            <FullScreen />
            <ThemeSwitcher />
            <ChangeLanguage />
            <NotificationHeader />
          </div>
        </header>
        <main className="flex-1 overflow-auto px-5">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
