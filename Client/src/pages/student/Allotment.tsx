import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Home, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RoundStatus {
  inActiveRound: boolean;
  round: any | null;
  currentAllotment: {
    allotment_id: number;
    room_number: string;
    floor: number;
    room_type: string;
    hostel_name: string;
    hostel_code: string;
  } | null;
}

const StudentAllotment = () => {
  const { data: roundStatus, isLoading, error } = useQuery<RoundStatus>({
    queryKey: ["my-round-status"],
    queryFn: () => api.getMyRoundStatus() as Promise<RoundStatus>,
  });

  const allotment = roundStatus?.currentAllotment;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading allotment...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          Failed to load allotment data
        </div>
      </DashboardLayout>
    );
  }

  if (!allotment) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Allotment</h1>
            <p className="text-muted-foreground mt-2">Your room allocation details</p>
          </div>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="py-10 text-center">
              <Home className="w-12 h-12 mx-auto mb-4 text-yellow-500 opacity-60" />
              <p className="font-medium text-yellow-800">No active allotment found</p>
              <p className="text-sm text-yellow-700 mt-1">
                You will receive an email once a room is allotted to you.
              </p>
              <Link to="/student/select-room">
                <Button className="mt-4" variant="outline">
                  Go to Room Selection
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Allotment</h1>
          <p className="text-muted-foreground mt-2">Your room allocation details</p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4 px-5 flex items-center gap-3 text-green-800">
            <Home className="w-5 h-5 text-green-600" />
            <span className="font-medium">Room allotted successfully!</span>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Room Details
              </CardTitle>
              <CardDescription>Your allocated room information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                  <p className="text-2xl font-bold mt-1">{allotment.room_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Floor</p>
                  <p className="text-2xl font-bold mt-1">{allotment.floor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hostel</p>
                  <p className="font-semibold mt-1">{allotment.hostel_name}</p>
                  {allotment.hostel_code && (
                    <p className="text-xs text-muted-foreground">{allotment.hostel_code}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Room Type</p>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">{allotment.room_type}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hostel Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hostel Name</p>
                <p className="font-semibold">{allotment.hostel_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground pt-2 border-t">
                For queries, contact the Hostel Management Cell or raise a complaint.
              </div>
              <Link to="/student/complaints">
                <Button variant="outline" size="sm" className="mt-2">
                  Lodge a Complaint
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAllotment;
