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
  AlertCircle,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  User,
  Home,
  Wrench,
  Zap,
  Droplets,
  Wifi,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

interface Complaint {
  complaint_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  room_id: number;
  room_number: string;
  hostel_name: string;
  category: string;
  description: string;
  raised_date: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
}

const categoryIcons = {
  Maintenance: Wrench,
  Electrical: Zap,
  Plumbing: Droplets,
  Internet: Wifi,
  Other: AlertCircle,
};

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [updatingComplaint, setUpdatingComplaint] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.getComplaints();
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
      // Mock data for demo
      setComplaints([
        {
          complaint_id: 1,
          student_id: 1,
          student_name: "Arjun Kumar",
          roll_no: "21CS001",
          room_id: 101,
          room_number: "A101",
          hostel_name: "Ramanujan Hostel",
          category: "Maintenance",
          description: "AC not working properly, making loud noises",
          raised_date: "2024-01-28T09:00:00Z",
          status: "Open",
        },
        {
          complaint_id: 2,
          student_id: 2,
          student_name: "Priya Sharma",
          roll_no: "21CS002",
          room_id: 201,
          room_number: "B201",
          hostel_name: "Saraswati Hostel",
          category: "Electrical",
          description: "Power outlet not functioning in the study area",
          raised_date: "2024-01-27T14:30:00Z",
          status: "In Progress",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (
    complaintId: number,
    newStatus: "In Progress" | "Resolved" | "Closed",
  ) => {
    try {
      setUpdatingComplaint(complaintId);
      await api.updateComplaint(complaintId, { status: newStatus });

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.complaint_id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint,
        ),
      );

      toast.success(`Complaint status updated to ${newStatus.toLowerCase()}!`);
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint status");
    } finally {
      setUpdatingComplaint(null);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      complaint.status.toLowerCase().replace(" ", "-") === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      complaint.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "Open").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const categories = [...new Set(complaints.map((c) => c.category))];

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
          <h1 className="text-3xl font-bold mb-2">Complaints Management</h1>
          <p className="text-muted-foreground">
            Track and resolve student complaints efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Complaints
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
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
                  placeholder="Search by student name, roll number, or room..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => {
                const CategoryIcon =
                  categoryIcons[
                    complaint.category as keyof typeof categoryIcons
                  ] || AlertCircle;

                return (
                  <div
                    key={complaint.complaint_id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {complaint.category} Issue
                          </h3>
                          <StatusBadge
                            status={complaint.status
                              .toLowerCase()
                              .replace(" ", "-")}
                          />
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {complaint.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {complaint.student_name} ({complaint.roll_no})
                          </span>
                          <span className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            {complaint.hostel_name} - {complaint.room_number}
                          </span>
                          <span>
                            Raised:{" "}
                            {new Date(
                              complaint.raised_date,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {complaint.status !== "Resolved" &&
                          complaint.status !== "Closed" && (
                            <>
                              {complaint.status === "Open" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateComplaintStatus(
                                      complaint.complaint_id,
                                      "In Progress",
                                    )
                                  }
                                  disabled={
                                    updatingComplaint === complaint.complaint_id
                                  }
                                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Start Work
                                </Button>
                              )}
                              {complaint.status === "In Progress" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateComplaintStatus(
                                      complaint.complaint_id,
                                      "Resolved",
                                    )
                                  }
                                  disabled={
                                    updatingComplaint === complaint.complaint_id
                                  }
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Mark Resolved
                                </Button>
                              )}
                            </>
                          )}
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredComplaints.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No complaints found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Complaints;
