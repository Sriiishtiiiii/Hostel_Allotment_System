import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: "student" | "admin";
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">{children}</main>
    </div>
  );
};
