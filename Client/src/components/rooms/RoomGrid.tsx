import { useState } from 'react';
import { Room, hostels, allRooms } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Users, 
  BedDouble, 
  Check,
  X,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface RoomGridProps {
  hostelId?: number;
  onRoomSelect?: (room: Room) => void;
  selectable?: boolean;
}

export const RoomGrid = ({ hostelId = 1, onRoomSelect, selectable = true }: RoomGridProps) => {
  const [selectedHostel, setSelectedHostel] = useState(hostelId);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);

  const hostel = hostels.find(h => h.id === selectedHostel);
  const rooms = allRooms.filter(
    r => r.hostelId === selectedHostel && r.floor === selectedFloor
  );

  const getRoomStatus = (room: Room): 'available' | 'occupied' | 'reserved' | 'selected' => {
    if (selectedRoom?.id === room.id) return 'selected';
    if (room.occupants.length >= room.capacity) return 'occupied';
    if (room.isReserved) return 'reserved';
    return 'available';
  };

  const handleRoomClick = (room: Room) => {
    const status = getRoomStatus(room);
    
    if (status === 'occupied') {
      toast.error('This room is fully occupied');
      return;
    }
    
    if (!selectable) {
      setDetailRoom(room);
      return;
    }

    if (selectedRoom?.id === room.id) {
      setSelectedRoom(null);
      onRoomSelect?.(null as any);
    } else {
      setSelectedRoom(room);
      onRoomSelect?.(room);
      toast.success(`Room ${room.roomNumber} selected`);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedRoom) {
      toast.success(`Room ${selectedRoom.roomNumber} confirmed!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hostel Selector */}
      <div className="flex flex-wrap gap-3">
        {hostels.map((h) => (
          <button
            key={h.id}
            onClick={() => {
              setSelectedHostel(h.id);
              setSelectedFloor(1);
              setSelectedRoom(null);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
              selectedHostel === h.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-foreground hover:border-primary/50'
            )}
          >
            <Building2 className="w-4 h-4" />
            {h.name}
          </button>
        ))}
      </div>

      {/* Floor Selector */}
      {hostel && (
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground mr-2">Floor:</span>
          {Array.from({ length: hostel.floors }, (_, i) => i + 1).map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={cn(
                'floor-tab',
                selectedFloor === floor && 'floor-tab-active'
              )}
            >
              {floor}F
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-success/20 border-2 border-success" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-destructive/20 border-2 border-destructive opacity-70" />
          <span className="text-sm text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-warning/20 border-2 border-warning" />
          <span className="text-sm text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary border-2 border-primary ring-2 ring-primary/30" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
      </div>

      {/* Room Grid */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {/* Floor Header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <span className="text-lg font-display font-semibold">
            Floor {selectedFloor}
          </span>
          <span className="text-sm text-muted-foreground">
            ({rooms.filter(r => getRoomStatus(r) === 'available').length} available)
          </span>
        </div>

        {/* Corridor Layout */}
        <div className="relative">
          {/* Left Side Rooms */}
          <div className="flex justify-center gap-8">
            <div className="grid grid-cols-5 gap-3">
              {rooms.slice(0, Math.ceil(rooms.length / 2)).map((room) => {
                const status = getRoomStatus(room);
                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={cn(
                      'room-cell',
                      status === 'available' && 'room-available',
                      status === 'occupied' && 'room-occupied',
                      status === 'reserved' && 'room-reserved',
                      status === 'selected' && 'room-selected'
                    )}
                    title={`Room ${room.roomNumber} - ${room.roomType}`}
                  >
                    {room.roomNumber}
                  </button>
                );
              })}
            </div>

            {/* Corridor */}
            <div className="w-16 flex items-center justify-center">
              <div className="w-full h-full bg-muted/30 rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground rotate-90 whitespace-nowrap">
                  CORRIDOR
                </span>
              </div>
            </div>

            {/* Right Side Rooms */}
            <div className="grid grid-cols-5 gap-3">
              {rooms.slice(Math.ceil(rooms.length / 2)).map((room) => {
                const status = getRoomStatus(room);
                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={cn(
                      'room-cell',
                      status === 'available' && 'room-available',
                      status === 'occupied' && 'room-occupied',
                      status === 'reserved' && 'room-reserved',
                      status === 'selected' && 'room-selected'
                    )}
                    title={`Room ${room.roomNumber} - ${room.roomType}`}
                  >
                    {room.roomNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Room Info */}
      {selectedRoom && selectable && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 animate-scale-in">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Selected: Room {selectedRoom.roomNumber}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4" />
                  {selectedRoom.roomType}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Capacity: {selectedRoom.capacity}
                </span>
                <span className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  {selectedRoom.occupants.length}/{selectedRoom.capacity} occupied
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRoom(null)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmSelection}>
                <Check className="w-4 h-4 mr-1" />
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Room Detail Dialog */}
      <Dialog open={!!detailRoom} onOpenChange={() => setDetailRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room {detailRoom?.roomNumber}</DialogTitle>
            <DialogDescription>
              {hostel?.name} - Floor {detailRoom?.floor}
            </DialogDescription>
          </DialogHeader>
          {detailRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-semibold">{detailRoom.roomType}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold">{detailRoom.capacity} students</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Occupancy</p>
                  <p className="font-semibold">{detailRoom.occupants.length}/{detailRoom.capacity}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">
                    {detailRoom.isReserved ? 'Reserved' : detailRoom.occupants.length >= detailRoom.capacity ? 'Occupied' : 'Available'}
                  </p>
                </div>
              </div>
              {detailRoom.occupants.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Occupants</p>
                  <div className="space-y-2">
                    {detailRoom.occupants.map((occupant, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg text-sm">
                        {occupant}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
