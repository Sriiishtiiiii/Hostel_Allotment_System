import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { Building2, Info } from 'lucide-react';

export const AdminRoomAllotment = () => {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Room Allotment</h1>
            <p className="text-muted-foreground">
              View and manage room allocations across all hostels
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-info/10 text-info rounded-lg">
            <Info className="w-4 h-4" />
            <span className="text-sm">Click on a room to view details</span>
          </div>
        </div>

        {/* Room Grid */}
        <RoomGrid selectable={false} />
      </div>
    </DashboardLayout>
  );
};

export default AdminRoomAllotment;
