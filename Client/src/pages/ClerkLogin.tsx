import React from "react";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ClerkLogin = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Hostel Management
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>

        <SignIn
          routing="path"
          path="/login"
          afterSignInUrl="/student/dashboard"
        />
      </div>
    </div>
  );
};

export default ClerkLogin;
