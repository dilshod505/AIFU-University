import React from "react";
import AuthProvider from "@/providers/auth-provider";
import SidebarWrapper from "@/components/widgets/sidebar-wrapper";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider role={"SUPER_ADMIN"}>
      <SidebarWrapper>{children}</SidebarWrapper>
    </AuthProvider>
  );
};

export default Layout;
