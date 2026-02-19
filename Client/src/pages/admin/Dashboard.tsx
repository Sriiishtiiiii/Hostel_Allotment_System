import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Layers,
  CheckCircle,
  Upload,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

interface Round {
  round_id: number;
  round_number: number;
  academic_year: number;
  batch_size: number;
  status: "Upcoming" | "Active" | "Completed";
  total_students: number;
  submitted_count: number;
  allotted_count: number;
  activated_at: string | null;
  processed_at: string | null;
}

const AdminDashboard = () => {
  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["students"],
    queryFn: () => api.getStudents() as Promise<any[]>,
  });

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ["rounds"],
    queryFn: () => api.getRounds() as Promise<Round[]>,
  });

  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ["complaints"],
    queryFn: () => api.getComplaints() as Promise<any[]>,
  });

  const activeRound = rounds.find((r) => r.status === "Active");
  const totalAllotted = rounds.reduce((sum, r) => sum + (Number(r.allotted_count) || 0), 0);
  const openComplaints = complaints.filter(
    (c) => c.status === "Open" || c.status === "In Progress"
  ).length;

  const getRoundStatusColor = (status: string) => {
    if (status === "Active") return "bg-green-100 text-green-800";
    if (status === "Upcoming") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 opacity-90">NIT Hamirpur Hostel Allotment System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold mt-1">{students.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Imported via CSV</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Allotted</p>
                  <p className="text-3xl font-bold mt-1">{totalAllotted}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {students.length > 0
                      ? `${Math.round((totalAllotted / students.length) * 100)}% of students`
                      : "Across all rounds"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Round</p>
                  <p className="text-3xl font-bold mt-1">
                    {activeRound ? `#${activeRound.round_number}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeRound
                      ? `${activeRound.submitted_count}/${activeRound.total_students} submitted`
                      : "No active round"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Complaints</p>
                  <p className="text-3xl font-bold mt-1">{openComplaints}</p>
                  <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rounds Table + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rounds */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Allotment Rounds</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/rounds">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {rounds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No rounds created yet</p>
                  <Link to="/admin/rounds">
                    <Button size="sm" className="mt-3">Create First Round</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {rounds.slice(0, 5).map((round) => (
                    <div
                      key={round.round_id}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Round #{round.round_number}
                          <span className="text-muted-foreground font-normal ml-2">
                            ({round.academic_year})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {round.total_students} students ·{" "}
                          {round.submitted_count} submitted ·{" "}
                          {round.allotted_count} allotted
                        </p>
                      </div>
                      <Badge className={getRoundStatusColor(round.status)}>
                        {round.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/csv">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-semibold text-sm">Upload CSV</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Import student result data
                  </p>
                </div>
              </Link>
              <Link to="/admin/rounds">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:border-purple-400 transition-colors cursor-pointer mt-3">
                  <Layers className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-semibold text-sm">Manage Rounds</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create, activate, process batches
                  </p>
                </div>
              </Link>
              <Link to="/admin/complaints">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg hover:border-red-400 transition-colors cursor-pointer mt-3">
                  <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
                  <p className="font-semibold text-sm">Complaints</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {openComplaints} open · track and resolve
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
