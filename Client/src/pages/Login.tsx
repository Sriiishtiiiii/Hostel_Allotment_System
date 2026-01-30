import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UserRole = "student" | "admin";

export const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        toast.success(`Welcome back!`);
        navigate(selectedRole === "admin" ? "/admin" : "/student");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar to-sidebar-accent p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-sidebar-primary/20 flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                HostelHub
              </h1>
              <p className="text-sm text-white/60">Room Allotment System</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Streamlined Hostel
            <br />
            Allotment
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            A modern platform for hassle-free room selection, payments, and
            complaint resolution.
          </p>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-sidebar-accent border-2 border-sidebar flex items-center justify-center text-xs font-semibold text-sidebar-primary"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/60">
            <span className="text-white font-semibold">450+</span> students
            using our platform
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-xl">HostelHub</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                selectedRole === "student"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selectedRole === "student"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  "font-medium text-sm",
                  selectedRole === "student"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                Student
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                selectedRole === "admin"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selectedRole === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  "font-medium text-sm",
                  selectedRole === "admin"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                Admin
              </span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={
                  selectedRole === "student"
                    ? "student@university.edu"
                    : "admin@university.edu"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Demo credentials: Any email/password works
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
