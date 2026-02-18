import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Phone, Mail, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";

const StudentAllotment = () => {
  const { user } = useUser();

  const [allotments, setAllotments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔑 THIS IS THE IMPORTANT PART — API CALL
  useEffect(() => {
    if (!user) return;

    const studentId = user.publicMetadata?.studentId as number;

    if (!studentId) {
      setError("Student ID not found in user metadata");
      setLoading(false);
      return;
    }

    api
      .getAllotments(studentId)
      .then((data) => {
        console.log("ALLOTMENTS FROM BACKEND:", data);
        setAllotments(data);
      })
      .catch((err) => {
        console.error("FAILED TO LOAD ALLOTMENTS:", err);
        setError(err.message || "Failed to load allotments");
      })
      .finally(() => setLoading(false));
  }, [user]);

  // ---------- STATES ----------
  if (loading) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading allotment...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (allotments.length === 0) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="text-gray-600">No active allotment found.</div>
      </DashboardLayout>
    );
  }

  // Assuming ONE active allotment per student
  const allotment = allotments[0];

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Allocation</h1>
          <p className="text-gray-600 mt-2">
            View your hostel and room details
          </p>
        </div>

        <Tabs defaultValue="my-room" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-room">My Room</TabsTrigger>
            <TabsTrigger value="hostel-info">Hostel Info</TabsTrigger>
          </TabsList>

          {/* ================= MY ROOM ================= */}
          <TabsContent value="my-room">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Room {allotment.room_number}
                </CardTitle>
                <CardDescription>Your allocated room details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Hostel</p>
                    <p className="text-gray-600">{allotment.hostel_name}</p>
                  </div>

                  <div>
                    <p className="font-medium">Room Type</p>
                    <p className="text-gray-600">{allotment.room_type}</p>
                  </div>

                  <div>
                    <p className="font-medium">Status</p>
                    <Badge className="bg-green-100 text-green-800">
                      {allotment.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="font-medium">Allotted On</p>
                    <p className="text-gray-600">
                      {new Date(allotment.allotment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= HOSTEL INFO ================= */}
          <TabsContent value="hostel-info">
            <Card>
              <CardHeader>
                <CardTitle>{allotment.hostel_name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Warden</p>
                  <p className="text-gray-600">Dr. Rajesh Kumar</p>
                </div>

                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +91 9999999999
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    hostel@college.edu
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DEBUG (remove later) */}
        <pre className="text-xs bg-gray-100 p-3 rounded">
          {JSON.stringify(allotments, null, 2)}
        </pre>
      </div>
    </DashboardLayout>
  );
};

export default StudentAllotment;
