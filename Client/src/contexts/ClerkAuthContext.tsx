import React, { createContext, useContext, ReactNode } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

type UserRole = "student" | "admin";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  } | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();

  const authValue: AuthContextType = {
    user: user
      ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          role: (user.publicMetadata?.role as UserRole) || "student",
        }
      : null,
    role: user ? (user.publicMetadata?.role as UserRole) || "student" : null,
    isAuthenticated: !!user,
    isLoading: !isLoaded,
    getToken: async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    },
    logout: async () => {
      await signOut();
    },
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
