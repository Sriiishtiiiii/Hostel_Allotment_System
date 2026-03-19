import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface SimStudent { id: number; name: string; roll: string; cgpa: number; gender: 'Male' | 'Female'; dept: string }
interface SimRoom    { id: number; label: string; hostel: string; gender: 'Boys' | 'Girls' }
interface Allotment  { studentId: number; roomId: number | null; priority: number }
interface Batch      { num: number; students: SimStudent[]; allotments: Allotment[] }
type RoomStatus = 'available' | 'boys' | 'girls' | 'flash'

/* ── Data generators ────────────────────────────────────────────────────────── */
const MN = ['Aarav','Arjun','Rahul','Karan','Vikram','Rohan','Amit','Dev','Nitin','Aakash','Shiv','Kunal','Harsh','Varun','Ankit','Sumit','Piyush','Mohit','Ravi','Tushar'];
const FN = ['Priya','Sneha','Ananya','Divya','Pooja','Isha','Nisha','Riya','Meera','Sonal','Kavya','Deepa','Ankita','Shruti','Neha','Swati','Tanvi','Vidya','Komal','Jyoti'];
const LN = ['Kumar','Sharma','Singh','Verma','Patel','Gupta','Nair','Rao','Joshi','Mehta','Chauhan','Dubey','Mishra','Pandey','Tiwari','Agarwal','Bhat','Reddy','Pillai','Iyer'];
const DEPTS = ['CS','EC','ME','CE','EE','CH'];
const BH = ['Himadri','Kailash','Rajat','Neelkanth'];
const GH = ['Udaygiri','Aravali','Manimahesh'];

function mkStudents(): SimStudent[] {
  const n = 700, males = 420;
  return Array.from({ length: n }, (_, i) => {
    const m = i < males;
    const names = m ? MN : FN;
    const cgpa = Math.max(5.0, Math.min(10.0,
      Math.round((9.8 - (i / n) * 4.5 + (Math.random() - 0.5) * 0.6) * 10) / 10
    ));
    return {
      id: i + 1,
      name: `${names[i % names.length]} ${LN[Math.floor(i / names.length) % LN.length]}`,
      roll: `${['21','22','23','24'][i % 4]}${DEPTS[i % 6]}${String((i % 200) + 1).padStart(3,'0')}`,
      cgpa,
      gender: m ? 'Male' : 'Female',
      dept: DEPTS[i % 6],
    };
  }).sort((a, b) => b.cgpa - a.cgpa);
}

function mkRooms(): SimRoom[] {
  const rooms: SimRoom[] = [];
  let id = 1;
  for (const h of BH) for (let f = 1; f <= 5; f++) for (let r = 1; r <= 20; r++)
    rooms.push({ id: id++, label: `${h.slice(0,3).toUpperCase()}-${f}${String(r).padStart(2,'0')}`, hostel: h, gender: 'Boys' });
  for (const h of GH) for (let f = 1; f <= 5; f++) for (let r = 1; r <= 20; r++)
    rooms.push({ id: id++, label: `${h.slice(0,3).toUpperCase()}-${f}${String(r).padStart(2,'0')}`, hostel: h, gender: 'Girls' });
  return rooms;
}

function precompute(students: SimStudent[], rooms: SimRoom[]): Batch[] {
  const taken = new Set<number>();
  const q = [...students];
  const batches: Batch[] = [];
  const rng = (arr: SimRoom[]) => arr.slice().sort(() => Math.random() - 0.45).slice(0, 5);

  while (q.length) {
    const batch = q.splice(0, 5);
    const boys = rooms.filter(r => r.gender === 'Boys' && !taken.has(r.id));
    const girls = rooms.filter(r => r.gender === 'Girls' && !taken.has(r.id));

    const prefs = new Map<number, number[]>();
    for (const s of batch) prefs.set(s.id, rng(s.gender === 'Male' ? boys : girls).map(r => r.id));

    const allotted = new Map<number, number>();
    const claimed = new Set<number>();

    for (let p = 0; p < 5; p++) {
      const groups = new Map<number, SimStudent[]>();
      for (const s of batch.filter(s => !allotted.has(s.id))) {
        const rid = (prefs.get(s.id) || [])[p];
        if (!rid || claimed.has(rid)) continue;
        if (!groups.has(rid)) groups.set(rid, []);
        groups.get(rid)!.push(s);
      }
      for (const [rid, ss] of groups) {
        ss.sort((a, b) => b.cgpa - a.cgpa);
        allotted.set(ss[0].id, rid);
        claimed.add(rid);
        taken.add(rid);
      }
    }

    batches.push({
      num: batches.length + 1,
      students: batch,
      allotments: batch.map(s => {
        const rid = allotted.get(s.id) ?? null;
        return { studentId: s.id, roomId: rid, priority: rid ? (prefs.get(s.id) || []).indexOf(rid) + 1 : 0 };
      }),
    });
  }
  return batches;
}

/* ── Canvas grid ─────────────────────────────────────────────────────────────*/
const COLS = 25, CELL = 11, GAP = 2, STEP = CELL + GAP;

function drawGrid(canvas: HTMLCanvasElement, rooms: SimRoom[], statuses: Map<number, RoomStatus>) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rooms.forEach((room, i) => {
    const x = (i % COLS) * STEP + 1, y = Math.floor(i / COLS) * STEP + 1;
    const s = statuses.get(room.id) ?? 'available';
    ctx.fillStyle =
      s === 'flash' ? '#f59e0b' :
      s === 'boys'  ? '#2563eb' :
      s === 'girls' ? '#db2777' :
      room.gender === 'Boys' ? '#dbeafe' : '#fce7f3';
    ctx.beginPath();
    ctx.roundRect(x, y, CELL, CELL, 2);
    ctx.fill();
  });
  // Divider between boys (0-399) and girls (400-699)
  const dividerRow = Math.ceil(400 / COLS);
  const divY = dividerRow * STEP + 1;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(0, divY - 3);
  ctx.lineTo(COLS * STEP + 2, divY - 3);
  ctx.stroke();
  ctx.setLineDash([]);
}

/* ── Component ───────────────────────────────────────────────────────────────*/
export default function Simulation() {
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [speed, setSpeed] = useState(2);
  const [stats, setStats] = useState({ allotted: 0, unresolved: 0, round: 0, total: 140 });
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [log, setLog] = useState<{ text: string; ok: boolean }[]>([]);
  const [elapsed, setElapsed] = useState('0:00');

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const dataRef    = useRef<{ rooms: SimRoom[]; roomMap: Map<number, SimRoom>; batches: Batch[] } | null>(null);
  const statusRef  = useRef<Map<number, RoomStatus>>(new Map());
  const idxRef     = useRef(0);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef   = useRef(0);

  const redraw = useCallback(() => {
    if (canvasRef.current && dataRef.current)
      drawGrid(canvasRef.current, dataRef.current.rooms, statusRef.current);
  }, []);

  // Pre-compute on mount
  useEffect(() => {
    const students = mkStudents();
    const rooms    = mkRooms();
    const batches  = precompute(students, rooms);
    const roomMap  = new Map(rooms.map(r => [r.id, r]));
    dataRef.current = { rooms, roomMap, batches };
    rooms.forEach(r => statusRef.current.set(r.id, 'available'));
    setStats(s => ({ ...s, total: batches.length }));
    setTimeout(redraw, 50);
  }, [redraw]);

  const runBatch = useCallback(() => {
    const data = dataRef.current;
    if (!data) return;
    const idx = idxRef.current;
    if (idx >= data.batches.length) {
      setPhase('done');
      if (timerRef.current) clearInterval(timerRef.current);
      if (clockRef.current) clearInterval(clockRef.current);
      return;
    }
    idxRef.current = idx + 1;
    const batch = data.batches[idx];

    // Flash rooms being assigned
    const newRooms: { id: number; gender: 'Boys' | 'Girls' }[] = [];
    for (const a of batch.allotments) {
      if (a.roomId) {
        statusRef.current.set(a.roomId, 'flash');
        const room = data.roomMap.get(a.roomId);
        if (room) newRooms.push({ id: a.roomId, gender: room.gender });
      }
    }
    redraw();

    // Settle to occupied color after flash
    setTimeout(() => {
      for (const r of newRooms)
        statusRef.current.set(r.id, r.gender === 'Boys' ? 'boys' : 'girls');
      redraw();
    }, 160);

    const allottedN   = batch.allotments.filter(a => a.roomId).length;
    const unresolvedN = batch.allotments.filter(a => !a.roomId).length;

    setCurrentBatch(batch);
    setStats(prev => ({
      ...prev,
      allotted:   prev.allotted + allottedN,
      unresolved: prev.unresolved + unresolvedN,
      round:      idx + 1,
    }));

    const newEntries = batch.allotments.map(a => {
      const s = batch.students.find(x => x.id === a.studentId)!;
      const r = a.roomId ? data.roomMap.get(a.roomId) : null;
      return r
        ? { text: `${s.name} (${s.cgpa}) → ${r.label} [P${a.priority}]`, ok: true }
        : { text: `${s.name} (${s.cgpa}) → Unresolved`, ok: false };
    });
    setLog(prev => [...newEntries, ...prev].slice(0, 80));
  }, [redraw]);

  // Interval-driven animation
  useEffect(() => {
    if (phase !== 'running') {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    const ms = Math.round(550 / speed);
    timerRef.current = setInterval(runBatch, ms);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, speed, runBatch]);

  // Clock
  useEffect(() => {
    if (phase === 'running') {
      if (!startRef.current) startRef.current = Date.now();
      clockRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
      }, 500);
    } else {
      if (clockRef.current) { clearInterval(clockRef.current); clockRef.current = null; }
    }
  }, [phase]);

  const handleStart = () => {
    if (!dataRef.current) return;
    idxRef.current = 0;
    startRef.current = Date.now();
    dataRef.current.rooms.forEach(r => statusRef.current.set(r.id, 'available'));
    redraw();
    setStats({ allotted: 0, unresolved: 0, round: 0, total: dataRef.current.batches.length });
    setLog([]);
    setCurrentBatch(null);
    setElapsed('0:00');
    setPhase('running');
  };

  const handlePause = () => setPhase(p => p === 'running' ? 'paused' : 'running');

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (clockRef.current) clearInterval(clockRef.current);
    idxRef.current = 0;
    startRef.current = 0;
    dataRef.current?.rooms.forEach(r => statusRef.current.set(r.id, 'available'));
    redraw();
    setPhase('idle');
    setStats({ allotted: 0, unresolved: 0, round: 0, total: dataRef.current?.batches.length ?? 140 });
    setLog([]);
    setCurrentBatch(null);
    setElapsed('0:00');
  };

  const pct    = stats.total > 0 ? Math.round((stats.round / stats.total) * 100) : 0;
  const canvasW = COLS * STEP + 2;
  const canvasH = Math.ceil(700 / COLS) * STEP + 2;

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-7xl">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hostel Allotment — Live Simulation</h1>
            <p className="text-blue-300 text-sm mt-1">NIT Hamirpur · 700 Students · 700 Rooms · Batches of 5 · CGPA Priority</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Speed selector */}
            <div className="flex gap-1 bg-white/10 rounded-lg p-1">
              {([1, 2, 4] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-all ${speed === s ? 'bg-blue-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                >
                  {s}×
                </button>
              ))}
            </div>
            {/* Action buttons */}
            {phase === 'idle' || phase === 'done' ? (
              <Button onClick={handleStart} className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg">
                {phase === 'done' ? '↺ Restart' : '▶ Start Simulation'}
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {phase === 'paused' ? '▶ Resume' : '⏸ Pause'}
                </Button>
                <Button onClick={handleReset} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  ↺ Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Students', value: '700',                         sub: '420 Boys · 280 Girls',          color: 'text-slate-700' },
            { label: 'Allotted',       value: String(stats.allotted),        sub: `${pct}% complete`,              color: 'text-emerald-600' },
            { label: 'Unresolved',     value: String(stats.unresolved),      sub: 'Conflict / no match',           color: 'text-rose-500' },
            { label: 'Round',          value: `${stats.round} / ${stats.total}`, sub: 'Batch progress',            color: 'text-blue-600' },
            { label: 'Time Elapsed',   value: elapsed,                       sub: phase === 'running' ? '⏱ Live' : phase === 'done' ? '✓ Done' : 'Stopped', color: 'text-purple-600' },
          ].map(s => (
            <Card key={s.label} className="text-center overflow-hidden">
              <CardContent className="pt-4 pb-3">
                <div className={`text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-muted-foreground mt-1">{s.label}</div>
                <div className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Progress Bar ── */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground px-0.5">
            <span>Round {stats.round} of {stats.total}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
              }}
            />
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Room Grid (Canvas) */}
          <div className="col-span-5">
            <Card className="h-full">
              <CardContent className="pt-4 pb-4">
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  Room Occupancy Grid
                  <span className="text-xs font-normal text-muted-foreground">(700 rooms)</span>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-[10px] text-muted-foreground">
                  {[
                    { color: '#dbeafe', label: 'Boys free' },
                    { color: '#2563eb', label: 'Boys allotted' },
                    { color: '#fce7f3', label: 'Girls free' },
                    { color: '#db2777', label: 'Girls allotted' },
                    { color: '#f59e0b', label: 'Assigning…' },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color, border: '1px solid #cbd5e1' }} />
                      {l.label}
                    </span>
                  ))}
                </div>
                <canvas ref={canvasRef} width={canvasW} height={canvasH} className="block rounded" />
                <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                  <div>▲ Boys hostels: Himadri, Kailash, Rajat, Neelkanth (rows 1–16)</div>
                  <div>▼ Girls hostels: Udaygiri, Aravali, Manimahesh (rows 17–28)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="col-span-7 flex flex-col gap-4">

            {/* Current batch cards */}
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                  {currentBatch
                    ? <>Current Batch <span className="text-muted-foreground font-normal text-xs">— Round #{currentBatch.num}</span></>
                    : <span className="text-muted-foreground">Waiting to start…</span>}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }, (_, i) => {
                    const student = currentBatch?.students[i] ?? null;
                    const almt    = currentBatch?.allotments[i] ?? null;
                    const room    = almt?.roomId ? dataRef.current?.roomMap.get(almt.roomId) : null;
                    const done    = almt !== null;
                    const ok      = done && !!room;

                    return (
                      <div key={i} className={`rounded-xl border-2 p-2.5 text-center text-xs transition-all ${
                        !student ? 'bg-slate-50 border-slate-200' :
                        !done    ? 'bg-blue-50 border-blue-200' :
                        ok       ? 'bg-emerald-50 border-emerald-300 shadow-sm' :
                                   'bg-rose-50 border-rose-200'
                      }`}>
                        {student ? (
                          <>
                            <div className="font-bold text-[11px] truncate">{student.name.split(' ')[0]}</div>
                            <div className="text-[9px] text-muted-foreground truncate">{student.roll}</div>
                            <div className={`text-2xl font-black mt-1 ${
                              student.cgpa >= 9 ? 'text-emerald-600' :
                              student.cgpa >= 7.5 ? 'text-blue-600' : 'text-orange-500'
                            }`}>{student.cgpa}</div>
                            <div className="text-[9px] text-muted-foreground">{student.dept} · {student.gender === 'Male' ? '♂' : '♀'}</div>
                            {done && (
                              <div className={`mt-1.5 text-[9px] font-semibold rounded-full px-1.5 py-0.5 ${
                                ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                              }`}>
                                {ok ? `${room!.label}` : 'Unresolved'}
                              </div>
                            )}
                            {ok && almt && almt.priority > 0 && (
                              <div className="text-[9px] text-muted-foreground mt-0.5">P{almt.priority} match</div>
                            )}
                          </>
                        ) : (
                          <div className="text-muted-foreground/40 py-5 text-lg">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activity feed */}
            <Card className="flex-1">
              <CardContent className="pt-4">
                <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>Activity Feed</span>
                  {log.length > 0 && (
                    <span className="text-[10px] font-normal text-muted-foreground">{log.length} events</span>
                  )}
                </div>
                <div className="h-56 overflow-y-auto space-y-0.5 pr-1">
                  {log.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 text-sm">
                      {phase === 'idle' ? 'Press Start to begin simulation' : 'Processing…'}
                    </div>
                  ) : log.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono ${
                        i === 0 ? 'ring-1 ' : ''
                      }${
                        entry.ok
                          ? `text-emerald-700 bg-emerald-50 ${i === 0 ? 'ring-emerald-300' : ''}`
                          : `text-rose-600 bg-rose-50 ${i === 0 ? 'ring-rose-300' : ''}`
                      }`}
                    >
                      <span>{entry.ok ? '✓' : '✗'}</span>
                      <span>{entry.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Done Banner ── */}
        {phase === 'done' && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white text-center shadow-lg">
            <div className="text-2xl font-black">Simulation Complete!</div>
            <div className="text-sm mt-1 opacity-90">
              <span className="font-semibold">{stats.allotted}</span> students allotted ·{' '}
              <span className="font-semibold">{stats.unresolved}</span> unresolved ·{' '}
              <span className="font-semibold">{stats.total}</span> rounds in{' '}
              <span className="font-semibold">{elapsed}</span>
            </div>
          </div>
        )}

        {/* ── Idle hint ── */}
        {phase === 'idle' && (
          <div className="text-center text-muted-foreground text-sm py-2">
            Press <strong>▶ Start Simulation</strong> to watch 700 students get allotted in real time.
            Use <strong>1×</strong> / <strong>2×</strong> / <strong>4×</strong> to control speed.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
