import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentAllotment from "./pages/student/Allotment";
import StudentComplaints from "./pages/student/Complaints";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/Applications";
import AdminComplaints from "./pages/admin/Complaints";
import AdminCsvUpload from "./pages/admin/CsvUpload";
import AdminRounds from "./pages/admin/Rounds";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isLoaded, isSignedIn, user } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (adminOnly && !user?.is_admin) return <Navigate to="/student/dashboard" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { isSignedIn, user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={isSignedIn ? <Navigate to={user?.is_admin ? "/admin/dashboard" : "/student/dashboard"} replace /> : <Login />} />
      <Route path="/signup" element={isSignedIn ? <Navigate to="/student/dashboard" replace /> : <Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ForgotPassword />} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/allotment" element={<ProtectedRoute><StudentAllotment /></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute><StudentComplaints /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute adminOnly><AdminApplications /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute adminOnly><AdminComplaints /></ProtectedRoute>} />
      <Route path="/admin/csv" element={<ProtectedRoute adminOnly><AdminCsvUpload /></ProtectedRoute>} />
      <Route path="/admin/rounds" element={<ProtectedRoute adminOnly><AdminRounds /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen">
            <AppRoutes />
          </div>
          <Toaster position="top-right" />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
