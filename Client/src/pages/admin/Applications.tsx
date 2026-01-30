import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Home,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

interface Application {
  application_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  cgpa: number;
  preferred_hostel_id: number;
  hostel_name: string;
  preferred_room_type: string;
  applied_date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingApplication, setUpdatingApplication] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications();
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(
        "Failed to load applications. Please check your server connection.",
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: number,
    newStatus: "Approved" | "Rejected",
  ) => {
    try {
      setUpdatingApplication(applicationId);
      await api.updateApplication(applicationId, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app,
        ),
      );

      toast.success(`Application ${newStatus.toLowerCase()} successfully!`);
      await fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application status");
    } finally {
      setUpdatingApplication(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || app.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "Pending").length,
    approved: applications.filter((app) => app.status === "Approved").length,
    rejected: applications.filter((app) => app.status === "Rejected").length,
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Applications Management</h1>
          <p className="text-muted-foreground">
            Review and manage hostel applications from students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.application_id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {application.student_name}
                          </h3>
                          <StatusBadge status={application.status} />
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            Roll No: {application.roll_no} | CGPA:{" "}
                            {application.cgpa}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {application.hostel_name} (
                              {application.preferred_room_type})
                            </span>
                            <span>
                              Applied:{" "}
                              {new Date(
                                application.applied_date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {application.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateApplicationStatus(
                                application.application_id,
                                "Approved",
                              )
                            }
                            disabled={
                              updatingApplication === application.application_id
                            }
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateApplicationStatus(
                                application.application_id,
                                "Rejected",
                              )
                            }
                            disabled={
                              updatingApplication === application.application_id
                            }
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No applications found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Applications;
