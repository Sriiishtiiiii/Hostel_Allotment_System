import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Building2,
  CreditCard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Home,
  ClipboardList,
  DoorOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/ClerkAuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const studentNavItems: NavItem[] = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard },
  { label: "Apply for Hostel", path: "/student/apply", icon: FileText },
  { label: "Room Selection", path: "/student/rooms", icon: DoorOpen },
  { label: "My Allotment", path: "/student/allotment", icon: Home },
  { label: "Payments", path: "/student/payments", icon: CreditCard },
  { label: "Complaints", path: "/student/complaints", icon: MessageSquare },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Applications", path: "/admin/applications", icon: ClipboardList },
  { label: "Room Allotment", path: "/admin/allotment", icon: DoorOpen },
  { label: "Manage Hostels", path: "/admin/hostels", icon: Building2 },
  { label: "Students", path: "/admin/students", icon: Users },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Complaints", path: "/admin/complaints", icon: MessageSquare },
];

export const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const location = useLocation();

  const navItems = role === "admin" ? adminNavItems : studentNavItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">
              HostelHub
            </h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {role} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-primary">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
