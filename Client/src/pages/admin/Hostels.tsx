import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { hostels, allRooms } from '@/data/mockData';
import { Building2, Users, DoorOpen, Layers, Plus, Edit, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AdminHostels = () => {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Manage Hostels</h1>
            <p className="text-muted-foreground">
              View and manage hostel details
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Hostel
          </Button>
        </div>

        {/* Hostels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostels.map((hostel) => {
            const hostelRooms = allRooms.filter(r => r.hostelId === hostel.id);
            const occupied = hostelRooms.filter(r => r.occupants.length >= r.capacity).length;
            const available = hostelRooms.filter(r => r.occupants.length < r.capacity && !r.isReserved).length;
            const reserved = hostelRooms.filter(r => r.isReserved).length;
            const occupancyRate = Math.round((occupied / hostelRooms.length) * 100);

            return (
              <div key={hostel.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{hostel.name}</h3>
                      <p className="text-sm text-muted-foreground">{hostel.type} Hostel</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DoorOpen className="w-4 h-4 mr-2" />
                        Manage Rooms
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DoorOpen className="w-4 h-4" />
                      <span className="text-sm">Total Rooms</span>
                    </div>
                    <p className="text-2xl font-bold">{hostelRooms.length}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Floors</span>
                    </div>
                    <p className="text-2xl font-bold">{hostel.floors}</p>
                  </div>
                  <div className="p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{available}</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-xl">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Reserved</span>
                    </div>
                    <p className="text-2xl font-bold text-warning">{reserved}</p>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Occupancy Rate</span>
                    <span className="font-semibold">{occupancyRate}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminHostels;
