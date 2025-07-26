import React from "react";
import AuthProvider from "@/providers/auth-provider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Layout;
