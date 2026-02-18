import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Home,
  CreditCard,
  MessageSquare,
  LogOut,
  Building2,
  ClipboardList,
  DoorOpen,
  Users,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const studentNavItems: NavItem[] = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "Apply for Hostel", path: "/student/apply", icon: FileText },
  { label: "My Allotment", path: "/student/allotment", icon: Home },
  { label: "Payments", path: "/student/payments", icon: CreditCard },
  { label: "Complaints", path: "/student/complaints", icon: MessageSquare },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Applications", path: "/admin/applications", icon: ClipboardList },
  { label: "Room Allotment", path: "/admin/allotment", icon: DoorOpen },
  { label: "Students", path: "/admin/students", icon: Users },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Complaints", path: "/admin/complaints", icon: MessageSquare },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const role = (user?.publicMetadata?.role as "student" | "admin") || "student";

  const navItems = role === "admin" ? adminNavItems : studentNavItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">HostelHub</h1>
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
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-xs opacity-60">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
