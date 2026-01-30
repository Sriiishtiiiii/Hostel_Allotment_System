import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  FileText,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  MapPin,
  Bell,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useUser();
  const [applicationStatus] = useState("pending"); // Can be: 'not_applied', 'pending', 'approved', 'rejected'
  const [roomStatus] = useState("not_allotted"); // Can be: 'not_allotted', 'allotted', 'occupied'

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "allotted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const applicationProgress =
    applicationStatus === "not_applied"
      ? 0
      : applicationStatus === "pending"
        ? 50
        : applicationStatus === "approved"
          ? 100
          : 25;

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.firstName || "Student"}! 👋
              </h1>
              <p className="mt-2 opacity-90">
                Track your hostel application and manage your accommodation
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">2024</div>
                <div className="text-sm opacity-75">Academic Year</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Application Status
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {applicationStatus === "not_applied"
                      ? "Not Applied"
                      : applicationStatus === "pending"
                        ? "Pending"
                        : applicationStatus === "approved"
                          ? "Approved"
                          : "Rejected"}
                  </div>
                  <Progress value={applicationProgress} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Room Allotment
              </CardTitle>
              <Home className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roomStatus === "allotted" ? "Room A-204" : "Not Allotted"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {roomStatus === "allotted"
                  ? "Ramanujan Hostel"
                  : "Complete application first"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Fees
              </CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹45,000</div>
              <p className="text-xs text-red-600 mt-1">Due: March 15, 2024</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 Open</div>
              <p className="text-xs text-muted-foreground mt-1">
                1 resolved this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Status Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Personal Information</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Complete
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Document Verification</p>
                      <p className="text-sm text-gray-600">Under Review</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Room Allocation</p>
                      <p className="text-sm text-gray-600">
                        Waiting for approval
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Waiting</Badge>
                </div>

                <Link to="/student/apply">
                  <Button className="w-full mt-4">Update Application</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/student/payments">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Fees
                </Button>
              </Link>

              <Link to="/student/complaints">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Lodge Complaint
                </Button>
              </Link>

              <Link to="/student/allotment">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Room Details
                </Button>
              </Link>

              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notifications (3)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Application Submitted</p>
                    <p className="text-xs text-gray-600">
                      Your hostel application has been submitted for review
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Document Verified</p>
                    <p className="text-xs text-gray-600">
                      Your academic documents have been verified
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Fee Payment Due</p>
                    <p className="text-xs text-gray-600">
                      Hostel fee payment due by March 15
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-l-4 border-red-500">
                  <h4 className="font-medium text-red-800">Important Notice</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Last date for hostel fee payment is March 15, 2024. Late
                    fees will be applicable after the deadline.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-800">
                    Room Allocation Update
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Room allocation results will be announced on March 10, 2024.
                    Check your dashboard regularly.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border-l-4 border-green-500">
                  <h4 className="font-medium text-green-800">
                    Mess Menu Updated
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    New mess menu for the month of March has been updated. Check
                    the hostel notice board.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
