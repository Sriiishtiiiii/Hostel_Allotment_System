import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STATUS_STYLES: Record<string, string> = {
  Upcoming: 'bg-blue-100 text-blue-800',
  Active: 'bg-green-100 text-green-800',
  Completed: 'bg-gray-100 text-gray-700',
};

const PREF_STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Allotted: 'bg-green-100 text-green-800',
  Unresolved: 'bg-red-100 text-red-800',
};

interface Round {
  round_id: number;
  round_number: number;
  academic_year: number;
  batch_size: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  window_hours: number;
  activated_at?: string;
  total_students: number;
  submitted_count: number;
  allotted_count: number;
}

interface RoundStudent {
  student_id: number;
  name: string;
  roll_no: string;
  cgpa: number;
  department: string;
  gender: string;
  email: string;
  notified: boolean;
  has_submitted: boolean;
  pref_status?: string;
  allotted_room_number?: string;
  allotted_hostel?: string;
}

export default function Rounds() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ batch_size: '5', academic_year: '', window_hours: '24' });
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const { data: rounds = [], isLoading } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: () => api.getRounds() as Promise<Round[]>,
  });

  const { data: roundStudents = [], isFetching: fetchingStudents } = useQuery<RoundStudent[]>({
    queryKey: ['round-students', selectedRoundId],
    queryFn: () => api.getRoundStudents(selectedRoundId!) as Promise<RoundStudent[]>,
    enabled: !!selectedRoundId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRound(data),
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Round created');
      qc.invalidateQueries({ queryKey: ['rounds'] });
      setCreateOpen(false);
      setForm({ batch_size: '5', academic_year: '', window_hours: '24' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create round'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => api.activateRound(id),
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Round activated');
      qc.invalidateQueries({ queryKey: ['rounds'] });
      if (selectedRoundId) qc.invalidateQueries({ queryKey: ['round-students', selectedRoundId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to activate round'),
  });

  const processMutation = useMutation({
    mutationFn: (id: number) => api.processRound(id),
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Round processed');
      qc.invalidateQueries({ queryKey: ['rounds'] });
      if (selectedRoundId) qc.invalidateQueries({ queryKey: ['round-students', selectedRoundId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to process round'),
  });

  const advanceMutation = useMutation({
    mutationFn: (id: number) => api.processAndAdvance(id),
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Round processed & next batch started');
      qc.invalidateQueries({ queryKey: ['rounds'] });
      setSelectedRoundId(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed'),
  });

  const handleCreate = () => {
    const batch_size = parseInt(form.batch_size);
    const academic_year = parseInt(form.academic_year);
    const window_hours = parseInt(form.window_hours);
    if (!academic_year || isNaN(academic_year)) {
      toast.error('Enter a valid academic year');
      return;
    }
    createMutation.mutate({ batch_size, academic_year, window_hours });
  };

  const selectedRound = rounds.find((r) => r.round_id === selectedRoundId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Allotment Rounds</h1>
          <p className="text-muted-foreground mt-1">
            Create batches, activate windows, and manage room allotment rounds.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New Round</Button>
      </div>

      {/* Rounds table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Rounds</CardTitle>
          <CardDescription>Click "View" on a round to see its students</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading...</div>
          ) : rounds.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No rounds yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {['Round', 'Acad. Year', 'Batch', 'Status', 'Submitted', 'Allotted', 'Window', 'Actions'].map(
                      (h) => (
                        <th key={h} className="text-left px-4 py-2 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr
                      key={r.round_id}
                      className={`border-t ${selectedRoundId === r.round_id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-2 font-medium">#{r.round_number}</td>
                      <td className="px-4 py-2">{r.academic_year}</td>
                      <td className="px-4 py-2">{r.batch_size}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {r.submitted_count ?? 0} / {r.total_students ?? 0}
                      </td>
                      <td className="px-4 py-2">{r.allotted_count ?? 0}</td>
                      <td className="px-4 py-2">{r.window_hours}h</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 flex-wrap">
                          {r.status === 'Upcoming' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                              onClick={() => activateMutation.mutate(r.round_id)}
                              disabled={activateMutation.isPending}
                            >
                              Activate
                            </Button>
                          )}
                          {r.status === 'Active' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 h-7 text-xs"
                                onClick={() => {
                                  if (confirm(`Process Round #${r.round_number}? Runs allotment algorithm only.`)) {
                                    processMutation.mutate(r.round_id);
                                  }
                                }}
                                disabled={processMutation.isPending || advanceMutation.isPending}
                              >
                                {processMutation.isPending ? 'Processing...' : 'Process'}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 h-7 text-xs"
                                onClick={() => {
                                  if (confirm(`Process Round #${r.round_number} and auto-start the next batch?`)) {
                                    advanceMutation.mutate(r.round_id);
                                  }
                                }}
                                disabled={processMutation.isPending || advanceMutation.isPending}
                              >
                                {advanceMutation.isPending ? 'Advancing...' : 'Process & Next Batch'}
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              setSelectedRoundId(
                                selectedRoundId === r.round_id ? null : r.round_id
                              )
                            }
                          >
                            {selectedRoundId === r.round_id ? 'Hide' : 'View'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students panel for selected round */}
      {selectedRound && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Round #{selectedRound.round_number} — Students ({selectedRound.total_students})
              </CardTitle>
              <Badge className={`${STATUS_STYLES[selectedRound.status]} border-0`}>
                {selectedRound.status}
              </Badge>
            </div>
            {selectedRound.activated_at && (
              <CardDescription>
                Activated:{' '}
                {new Date(selectedRound.activated_at).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                })}
                {' · '}
                Window: {selectedRound.window_hours}h
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {fetchingStudents ? (
              <div className="py-8 text-center text-muted-foreground">Loading students...</div>
            ) : roundStudents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No students in this round.</div>
            ) : (
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {['#', 'Name', 'Roll No', 'CGPA', 'Dept', 'Notified', 'Preferences', 'Allotted Room'].map(
                        (h) => (
                          <th key={h} className="text-left px-4 py-2 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {roundStudents.map((s, i) => (
                      <tr key={s.student_id} className="border-t">
                        <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{s.name}</td>
                        <td className="px-4 py-2 font-mono text-xs">{s.roll_no}</td>
                        <td className="px-4 py-2 font-semibold">{s.cgpa ?? '—'}</td>
                        <td className="px-4 py-2 text-xs">{s.department}</td>
                        <td className="px-4 py-2">
                          {s.notified ? (
                            <span className="text-green-600 text-xs">Yes</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {s.has_submitted ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                PREF_STATUS_STYLES[s.pref_status || 'Pending']
                              }`}
                            >
                              {s.pref_status || 'Pending'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not submitted</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {s.allotted_room_number
                            ? `${s.allotted_hostel} — ${s.allotted_room_number}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Round Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Allotment Round</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Academic Year</Label>
              <Input
                type="number"
                placeholder="e.g. 2024"
                value={form.academic_year}
                onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Year of the students being allotted (e.g. students admitted in 2024)
              </p>
            </div>
            <div className="space-y-1">
              <Label>Batch Size</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.batch_size}
                onChange={(e) => setForm((f) => ({ ...f, batch_size: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Top N students by CGPA auto-assigned to this round
              </p>
            </div>
            <div className="space-y-1">
              <Label>Selection Window (hours)</Label>
              <Input
                type="number"
                min={1}
                value={form.window_hours}
                onChange={(e) => setForm((f) => ({ ...f, window_hours: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                How long students have to submit preferences after you activate the round
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Round'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
