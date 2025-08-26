import HydrationLoader from "@/app/loader";
import SidebarWrapper from "@/components/widgets/sidebar-wrapper";
import AuthProvider from "@/providers/auth-provider";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <HydrationLoader>
      <AuthProvider role={"ADMIN"}>
        <SidebarWrapper>{children}</SidebarWrapper>
      </AuthProvider>
    </HydrationLoader>
  );
};

export default Layout;
