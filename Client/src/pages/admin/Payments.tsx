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
  CreditCard,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Home,
  DollarSign,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

interface Payment {
  payment_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  fee_id: number;
  fee_amount: number;
  hostel_name: string;
  payment_date: string | null;
  mode: string;
  status: "Pending" | "Paid" | "Failed";
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPayments();
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
      // Mock data for demo
      setPayments([
        {
          payment_id: 1,
          student_id: 1,
          student_name: "Arjun Kumar",
          roll_no: "21CS001",
          fee_id: 1,
          fee_amount: 50000,
          hostel_name: "Ramanujan Hostel",
          payment_date: "2024-01-25T12:00:00Z",
          mode: "Online",
          status: "Paid",
        },
        {
          payment_id: 2,
          student_id: 2,
          student_name: "Priya Sharma",
          roll_no: "21CS002",
          fee_id: 2,
          fee_amount: 45000,
          hostel_name: "Saraswati Hostel",
          payment_date: null,
          mode: "Online",
          status: "Pending",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (
    paymentId: number,
    newStatus: "Paid" | "Failed",
  ) => {
    try {
      setUpdatingPayment(paymentId);
      await api.updatePayment(paymentId, { status: newStatus });

      setPayments((prev) =>
        prev.map((payment) =>
          payment.payment_id === paymentId
            ? {
                ...payment,
                status: newStatus,
                payment_date:
                  newStatus === "Paid"
                    ? new Date().toISOString()
                    : payment.payment_date,
              }
            : payment,
        ),
      );

      toast.success(`Payment marked as ${newStatus.toLowerCase()}!`);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingPayment(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.fee_amount, 0),
    paid: payments.filter((p) => p.status === "Paid").length,
    paidAmount: payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.fee_amount, 0),
    pending: payments.filter((p) => p.status === "Pending").length,
    pendingAmount: payments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + p.fee_amount, 0),
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
          <h1 className="text-3xl font-bold mb-2">Payments Management</h1>
          <p className="text-muted-foreground">
            Track and manage hostel fee payments from students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Payments
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{stats.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{stats.paidAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{stats.pendingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Collection Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.total > 0
                      ? Math.round((stats.paid / stats.total) * 100)
                      : 0}
                    %
                  </p>
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payments ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.payment_id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {payment.student_name}
                          </h3>
                          <StatusBadge status={payment.status.toLowerCase()} />
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Roll No: {payment.roll_no}</p>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {payment.hostel_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />₹
                              {payment.fee_amount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {payment.payment_date
                                ? new Date(
                                    payment.payment_date,
                                  ).toLocaleDateString()
                                : "Not paid"}
                            </span>
                          </div>
                          <p>Payment Mode: {payment.mode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {payment.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updatePaymentStatus(payment.payment_id, "Paid")
                            }
                            disabled={updatingPayment === payment.payment_id}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updatePaymentStatus(payment.payment_id, "Failed")
                            }
                            disabled={updatingPayment === payment.payment_id}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Mark Failed
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

              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payments found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
