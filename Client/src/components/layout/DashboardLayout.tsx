import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: "student" | "admin";
}

export const DashboardLayout = ({
  children,
  requiredRole,
}: DashboardLayoutProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.publicMetadata?.role as "student" | "admin") || "student";

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">{children}</main>
    </div>
  );
};
