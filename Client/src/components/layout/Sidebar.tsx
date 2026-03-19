import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  LogOut,
  Building2,
  Upload,
  Layers,
  Grid2x2,
  Play,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const studentNavItems: NavItem[] = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "Select Room", path: "/student/select-room", icon: Grid2x2 },
  { label: "My Allotment", path: "/student/allotment", icon: Home },
  { label: "Complaints", path: "/student/complaints", icon: MessageSquare },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Upload CSV", path: "/admin/csv", icon: Upload },
  { label: "Rounds", path: "/admin/rounds", icon: Layers },
  { label: "Complaints", path: "/admin/complaints", icon: MessageSquare },
  { label: "Simulation", path: "/admin/simulation", icon: Play },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.is_admin ?? false;
  const navItems = isAdmin ? adminNavItems : studentNavItems;
  const role = isAdmin ? "admin" : "student";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">NITH Hostel</h1>
            <p className="text-xs opacity-60 capitalize">{role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "opacity-80 hover:opacity-100 hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t">
        <div className="mb-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs opacity-60">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
