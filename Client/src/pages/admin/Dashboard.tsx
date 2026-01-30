import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { dashboardStats, applications, students, complaints, hostels, allRooms } from '@/data/mockData';
import { 
  Users, 
  FileText, 
  Building2, 
  CreditCard, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  DoorOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AdminDashboard = () => {
  const recentApplications = applications.slice(0, 5);
  const openComplaints = complaints.filter(c => c.status === 'Open' || c.status === 'In Progress');

  const totalRooms = allRooms.length;
  const occupiedRooms = allRooms.filter(r => r.occupants.length >= r.capacity).length;
  const availableRooms = allRooms.filter(r => r.occupants.length < r.capacity && !r.isReserved).length;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of hostel management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={dashboardStats.totalStudents}
            subtitle="+12 this month"
            icon={Users}
            variant="primary"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Applications"
            value={dashboardStats.pendingApplications}
            subtitle="Requires action"
            icon={FileText}
            variant="warning"
          />
          <StatCard
            title="Room Occupancy"
            value={`${Math.round((occupiedRooms / totalRooms) * 100)}%`}
            subtitle={`${occupiedRooms}/${totalRooms} rooms`}
            icon={DoorOpen}
            variant="success"
          />
          <StatCard
            title="Open Complaints"
            value={openComplaints.length}
            subtitle="Needs attention"
            icon={MessageSquare}
            variant="destructive"
          />
        </div>

        {/* Room Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {hostels.slice(0, 3).map((hostel) => {
            const hostelRooms = allRooms.filter(r => r.hostelId === hostel.id);
            const occupied = hostelRooms.filter(r => r.occupants.length >= r.capacity).length;
            const available = hostelRooms.filter(r => r.occupants.length < r.capacity && !r.isReserved).length;
            const occupancyRate = Math.round((occupied / hostelRooms.length) * 100);

            return (
              <div key={hostel.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{hostel.name}</h3>
                    <p className="text-xs text-muted-foreground">{hostel.type} Hostel</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-semibold">{occupancyRate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{occupied} occupied</span>
                    <span>{available} available</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">Recent Applications</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/applications">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentApplications.map((app) => {
                const student = students.find(s => s.id === app.studentId);
                const hostel = hostels.find(h => h.id === app.preferredHostelId);
                
                return (
                  <div key={app.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {student?.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hostel?.name} • {app.preferredRoomType}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={app.status.toLowerCase()} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Complaints */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">Open Complaints</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/complaints">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {openComplaints.slice(0, 5).map((complaint) => {
                const student = students.find(s => s.id === complaint.studentId);
                
                return (
                  <div key={complaint.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        complaint.status === 'Open' ? 'bg-info/10' : 'bg-warning/10'
                      }`}>
                        <MessageSquare className={`w-5 h-5 ${
                          complaint.status === 'Open' ? 'text-info' : 'text-warning'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{complaint.category}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {complaint.description}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={complaint.status.toLowerCase().replace(' ', '-')} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/applications"
            className="p-6 bg-warning/5 border border-warning/20 rounded-xl hover:border-warning/50 transition-all group"
          >
            <Clock className="w-8 h-8 text-warning mb-4" />
            <h3 className="font-semibold mb-1 group-hover:text-warning transition-colors">
              Review Applications
            </h3>
            <p className="text-sm text-muted-foreground">
              {applications.filter(a => a.status === 'Pending').length} pending reviews
            </p>
          </Link>
          <Link
            to="/admin/allotment"
            className="p-6 bg-primary/5 border border-primary/20 rounded-xl hover:border-primary/50 transition-all group"
          >
            <DoorOpen className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
              Allot Rooms
            </h3>
            <p className="text-sm text-muted-foreground">
              {availableRooms} rooms available
            </p>
          </Link>
          <Link
            to="/admin/complaints"
            className="p-6 bg-destructive/5 border border-destructive/20 rounded-xl hover:border-destructive/50 transition-all group"
          >
            <MessageSquare className="w-8 h-8 text-destructive mb-4" />
            <h3 className="font-semibold mb-1 group-hover:text-destructive transition-colors">
              Resolve Complaints
            </h3>
            <p className="text-sm text-muted-foreground">
              {openComplaints.length} open complaints
            </p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
