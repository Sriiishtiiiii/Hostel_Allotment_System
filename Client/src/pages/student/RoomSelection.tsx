import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoomWithOccupancy {
  room_id: number;
  room_number: string;
  floor: number;
  room_type: 'Single' | 'Double' | 'Triple';
  capacity: number;
  current_occupancy: number;
  available_slots: number;
  is_full: boolean;
}

interface Hostel {
  hostel_id: number;
  hostel_name: string;
  hostel_code: string;
  type: 'Boys' | 'Girls' | 'Co-ed';
  floors: number;
}

interface RoundStatus {
  inActiveRound: boolean;
  round: {
    round_id: number;
    round_number: number;
    status: string;
    deadline: string | null;
    has_submitted: boolean;
    pref_status: string | null;
  } | null;
  currentAllotment: any | null;
}

const ROOM_TYPE_LABEL: Record<string, string> = {
  Single: '1-seat',
  Double: '2-seat',
  Triple: '3-seat',
};

function Countdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return <span className="font-mono font-semibold text-orange-600">{remaining}</span>;
}

export default function RoomSelection() {
  const { user } = useAuth();
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [priorities, setPriorities] = useState<(number | null)[]>([null, null, null]);

  const { data: roundStatus, isLoading: loadingStatus } = useQuery<RoundStatus>({
    queryKey: ['my-round-status'],
    queryFn: () => api.getMyRoundStatus() as Promise<RoundStatus>,
  });

  const { data: hostels = [] } = useQuery<Hostel[]>({
    queryKey: ['hostels'],
    queryFn: () => api.getHostels() as Promise<Hostel[]>,
  });

  const allowedHostels = hostels.filter((h) => {
    if (h.type === 'Co-ed') return true;
    if ((user as any)?.gender === 'Male' && h.type === 'Boys') return true;
    if ((user as any)?.gender === 'Female' && h.type === 'Girls') return true;
    return false;
  });

  useEffect(() => {
    if (allowedHostels.length > 0 && !selectedHostelId) {
      setSelectedHostelId(allowedHostels[0].hostel_id);
    }
  }, [allowedHostels, selectedHostelId]);

  const { data: gridData, isLoading: loadingGrid } = useQuery<{
    hostel: Hostel;
    rooms: RoomWithOccupancy[];
  }>({
    queryKey: ['room-grid', selectedHostelId],
    queryFn: () => api.getRoomGrid(selectedHostelId!) as Promise<{ hostel: Hostel; rooms: RoomWithOccupancy[] }>,
    enabled: !!selectedHostelId,
  });

  const { data: existingPrefs } = useQuery({
    queryKey: ['my-preferences'],
    queryFn: () => api.getMyPreferences(),
    enabled: !!roundStatus?.round,
  });

  useEffect(() => {
    if (existingPrefs && roundStatus?.round) {
      setPriorities([
        (existingPrefs as any)?.priority_1_room_id ?? null,
        (existingPrefs as any)?.priority_2_room_id ?? null,
        (existingPrefs as any)?.priority_3_room_id ?? null,
      ]);
    }
  }, [existingPrefs, roundStatus?.round]);

  const submitMutation = useMutation({
    mutationFn: () =>
      api.submitPreferences({
        round_id: roundStatus!.round!.round_id,
        priority_1: priorities[0]!,
        priority_2: priorities[1] ?? undefined,
        priority_3: priorities[2] ?? undefined,
      }),
    onSuccess: () => toast.success('Preferences submitted!'),
    onError: (err: any) => toast.error(err.message || 'Submit failed'),
  });

  const currentHostel = gridData?.hostel;
  const rooms = gridData?.rooms ?? [];
  const floors = currentHostel
    ? Array.from({ length: currentHostel.floors }, (_, i) => i + 1)
    : [];
  const roomsOnFloor = rooms.filter((r) => r.floor === selectedFloor);

  const handleRoomClick = (room: RoomWithOccupancy) => {
    if (room.is_full) { toast.error('This room is full'); return; }
    const existingIdx = priorities.findIndex((p) => p === room.room_id);
    if (existingIdx !== -1) {
      const next = [...priorities];
      next[existingIdx] = null;
      const nonNull = next.filter(Boolean);
      while (nonNull.length < 3) nonNull.push(null);
      setPriorities(nonNull);
      return;
    }
    const emptyIdx = priorities.findIndex((p) => p === null);
    if (emptyIdx === -1) {
      toast('All 3 priorities selected. Click a selected room to remove it.', { icon: 'ℹ️' });
      return;
    }
    const next = [...priorities];
    next[emptyIdx] = room.room_id;
    setPriorities(next);
  };

  const getPriorityLabel = (roomId: number): string | null => {
    const idx = priorities.indexOf(roomId);
    return idx === -1 ? null : ['P1', 'P2', 'P3'][idx];
  };

  const getRoomStyle = (room: RoomWithOccupancy) => {
    const label = getPriorityLabel(room.room_id);
    if (label) return 'ring-2 ring-blue-500 bg-blue-50';
    if (room.is_full) return 'opacity-50 bg-red-50 cursor-not-allowed';
    return 'hover:bg-green-50 hover:ring-2 hover:ring-green-400 cursor-pointer';
  };

  const canSubmit = roundStatus?.inActiveRound && priorities[0] !== null && !submitMutation.isPending;
  const alreadySubmitted = roundStatus?.round?.has_submitted;

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold">Select Room Preferences</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick up to 3 rooms in priority order. Highest CGPA wins conflicts.
          </p>
        </div>

        {/* Round status banner */}
        {loadingStatus ? null : !roundStatus?.round ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="py-4 px-5 text-yellow-800 text-sm">
              You are not assigned to any round yet. Wait for admin to create a batch.
            </CardContent>
          </Card>
        ) : roundStatus.round.status === 'Upcoming' ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4 px-5 text-blue-800 text-sm">
              You are in Round #{roundStatus.round.round_number} (Upcoming). Selection opens when admin activates it.
            </CardContent>
          </Card>
        ) : roundStatus.round.status === 'Active' ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-green-800 font-medium text-sm">
                  Round #{roundStatus.round.round_number} is Active!
                  {alreadySubmitted && ' — Preferences already submitted.'}
                </span>
                {roundStatus.round.deadline && (
                  <span className="text-sm text-muted-foreground">
                    Closes in: <Countdown deadline={roundStatus.round.deadline} />
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Current allotment */}
        {roundStatus?.currentAllotment && (
          <Card className="border-blue-300 bg-blue-50">
            <CardContent className="py-4 px-5 text-blue-800 text-sm">
              Already allotted: <strong>{roundStatus.currentAllotment.hostel_name}</strong> —
              Room <strong>{roundStatus.currentAllotment.room_number}</strong> (Floor {roundStatus.currentAllotment.floor})
            </CardContent>
          </Card>
        )}

        <div className="flex gap-5">
          {/* Main: Hostel + Floor + Grid */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Hostel tabs */}
            <div className="flex gap-2 flex-wrap">
              {allowedHostels.map((h) => (
                <button
                  key={h.hostel_id}
                  onClick={() => { setSelectedHostelId(h.hostel_id); setSelectedFloor(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    selectedHostelId === h.hostel_id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-border hover:border-blue-400'
                  }`}
                >
                  {h.hostel_name}
                  <span className={`ml-2 text-xs ${selectedHostelId === h.hostel_id ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {h.type}
                  </span>
                </button>
              ))}
            </div>

            {/* Floor tabs */}
            {floors.length > 0 && (
              <div className="flex gap-2">
                {floors.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFloor(f)}
                    className={`px-3 py-1.5 rounded text-sm border transition ${
                      selectedFloor === f
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'border-border hover:border-gray-400'
                    }`}
                  >
                    Floor {f}
                  </button>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-100 ring-1 ring-green-400 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-100 inline-block opacity-60" /> Full
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-100 ring-2 ring-blue-500 inline-block" /> Selected
              </span>
            </div>

            {/* Room grid */}
            {loadingGrid ? (
              <div className="py-10 text-center text-muted-foreground">Loading rooms...</div>
            ) : roomsOnFloor.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No rooms on this floor.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {roomsOnFloor.map((room) => {
                  const label = getPriorityLabel(room.room_id);
                  return (
                    <div
                      key={room.room_id}
                      onClick={() => handleRoomClick(room)}
                      className={`relative border rounded-lg p-3 text-center transition select-none ${getRoomStyle(room)}`}
                    >
                      {label && (
                        <span className="absolute top-1 right-1 text-xs font-bold text-blue-600">{label}</span>
                      )}
                      <div className="font-bold text-sm">{room.room_number}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ROOM_TYPE_LABEL[room.room_type]}</div>
                      <div className={`text-xs mt-1 font-medium ${room.is_full ? 'text-red-500' : 'text-green-600'}`}>
                        {room.is_full ? 'Full' : `${room.available_slots}/${room.capacity} free`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selection panel */}
          <div className="w-52 shrink-0 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Your Priorities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[0, 1, 2].map((idx) => {
                  const roomId = priorities[idx];
                  const room = rooms.find((r) => r.room_id === roomId);
                  return (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Priority {idx + 1}</p>
                      {roomId ? (
                        <div className="flex items-center justify-between bg-blue-50 rounded px-2 py-1.5">
                          <span className="text-sm font-medium">
                            {room ? room.room_number : `#${roomId}`}
                          </span>
                          <button
                            onClick={() => {
                              const next = [...priorities];
                              next[idx] = null;
                              const nonNull = next.filter(Boolean);
                              while (nonNull.length < 3) nonNull.push(null);
                              setPriorities(nonNull);
                            }}
                            className="text-muted-foreground hover:text-red-500 ml-2 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="border-dashed border rounded px-2 py-1.5 text-xs text-muted-foreground text-center">
                          Click a room
                        </div>
                      )}
                    </div>
                  );
                })}

                <Button className="w-full mt-2" disabled={!canSubmit} onClick={() => submitMutation.mutate()}>
                  {submitMutation.isPending
                    ? 'Submitting...'
                    : alreadySubmitted
                    ? 'Update Preferences'
                    : 'Submit Preferences'}
                </Button>

                {!roundStatus?.inActiveRound && (
                  <p className="text-xs text-muted-foreground text-center">
                    Locked until your round is active
                  </p>
                )}
              </CardContent>
            </Card>

            {(user as any)?.cgpa && (
              <Card>
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">Your CGPA</p>
                  <p className="text-xl font-bold text-blue-700">{(user as any).cgpa}</p>
                  <p className="text-xs text-muted-foreground mt-1">Higher CGPA wins conflicts</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
