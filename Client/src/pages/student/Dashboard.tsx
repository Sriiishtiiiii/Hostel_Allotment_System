import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, AlertCircle, Clock, CheckCircle, MapPin, Grid2x2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

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
  currentAllotment: {
    allotment_id: number;
    room_number: string;
    floor: number;
    room_type: string;
    hostel_name: string;
    hostel_code: string;
  } | null;
}

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: roundStatus, isLoading } = useQuery<RoundStatus>({
    queryKey: ["my-round-status"],
    queryFn: () => api.getMyRoundStatus() as Promise<RoundStatus>,
  });

  const allotment = roundStatus?.currentAllotment;
  const round = roundStatus?.round;

  const getRoundBadge = () => {
    if (!round) return <Badge variant="secondary">No Round Assigned</Badge>;
    if (round.status === "Active")
      return <Badge className="bg-green-100 text-green-800">Round {round.round_number} — Active</Badge>;
    if (round.status === "Upcoming")
      return <Badge className="bg-blue-100 text-blue-800">Round {round.round_number} — Upcoming</Badge>;
    return <Badge variant="secondary">Round {round.round_number} — {round.status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="mt-2 opacity-90">
            Track your hostel allotment and room selection status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Allotment Status */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Room Allotment</CardTitle>
              <Home className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : allotment ? (
                <>
                  <div className="text-2xl font-bold">{allotment.room_number}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {allotment.hostel_name}, Floor {allotment.floor}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-muted-foreground">Not Allotted</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending allotment</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Round / Batch Status */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Batch Status</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="mt-1">{getRoundBadge()}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {!round
                      ? "Admin will assign you to a batch"
                      : round.status === "Active" && !round.has_submitted
                      ? "Select your room preferences now!"
                      : round.status === "Active" && round.has_submitted
                      ? "Preferences submitted — awaiting processing"
                      : "Waiting for batch activation"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* CGPA */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your CGPA</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {(user as any)?.cgpa ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Higher CGPA = earlier batch</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Selection status card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid2x2 className="w-5 h-5" />
                Allotment Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Allotment row */}
                <div
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    allotment ? "bg-green-50" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home
                      className={`w-5 h-5 ${allotment ? "text-green-600" : "text-gray-400"}`}
                    />
                    <div>
                      <p className="font-medium">Room Allotment</p>
                      <p className="text-sm text-gray-600">
                        {allotment
                          ? `${allotment.hostel_name} — Room ${allotment.room_number} (Floor ${allotment.floor})`
                          : "Not yet allotted"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      allotment ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                    }
                  >
                    {allotment ? "Allotted" : "Pending"}
                  </Badge>
                </div>

                {/* Batch row */}
                <div
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    round?.status === "Active"
                      ? "bg-green-50"
                      : round
                      ? "bg-blue-50"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      className={`w-5 h-5 ${
                        round?.status === "Active"
                          ? "text-green-600"
                          : round
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p className="font-medium">Batch Assignment</p>
                      <p className="text-sm text-gray-600">
                        {!round
                          ? "Admin will assign you to a round based on CGPA"
                          : round.status === "Active"
                          ? round.has_submitted
                            ? "Preferences submitted — awaiting processing"
                            : "Your round is active! Select your room now."
                          : `Round ${round.round_number} assigned — waiting for activation`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={round?.status === "Active" ? "default" : "secondary"}>
                    {!round ? "Not Assigned" : round.status}
                  </Badge>
                </div>

                <Link to="/student/select-room">
                  <Button
                    className="w-full mt-2"
                    variant={
                      round?.status === "Active" && !round.has_submitted ? "default" : "outline"
                    }
                  >
                    {round?.status === "Active" && !round.has_submitted
                      ? "Select Room Now"
                      : "View Room Selection"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/student/select-room">
                <Button variant="outline" className="w-full justify-start">
                  <Grid2x2 className="w-4 h-4 mr-2" />
                  Select Room
                </Button>
              </Link>
              <Link to="/student/allotment">
                <Button variant="outline" className="w-full justify-start mt-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Allotment
                </Button>
              </Link>
              <Link to="/student/complaints">
                <Button variant="outline" className="w-full justify-start mt-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Lodge Complaint
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
