import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Users,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Book,
  Shield,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const Allotment = () => {
  const [selectedFloor, setSelectedFloor] = useState(1);

  // Mock room data
  const roomData = {
    1: [
      {
        id: "A101",
        status: "occupied",
        occupants: ["John Doe"],
        type: "single",
      },
      { id: "A102", status: "available", occupants: [], type: "double" },
      {
        id: "A103",
        status: "occupied",
        occupants: ["Mike Smith", "Tom Brown"],
        type: "double",
      },
      { id: "A104", status: "maintenance", occupants: [], type: "single" },
      {
        id: "A105",
        status: "occupied",
        occupants: ["Alice Johnson"],
        type: "single",
      },
      { id: "A106", status: "available", occupants: [], type: "double" },
      {
        id: "A107",
        status: "occupied",
        occupants: ["Bob Wilson", "Charlie Davis"],
        type: "double",
      },
      { id: "A108", status: "available", occupants: [], type: "single" },
    ],
    2: [
      {
        id: "A201",
        status: "occupied",
        occupants: ["Sarah Connor"],
        type: "single",
      },
      {
        id: "A202",
        status: "occupied",
        occupants: ["Lisa Wong", "Anna Bell"],
        type: "double",
      },
      { id: "A203", status: "available", occupants: [], type: "double" },
      {
        id: "A204",
        status: "occupied",
        occupants: ["Your Room"],
        type: "single",
      },
      {
        id: "A205",
        status: "occupied",
        occupants: ["David Lee"],
        type: "single",
      },
      { id: "A206", status: "available", occupants: [], type: "double" },
      { id: "A207", status: "maintenance", occupants: [], type: "single" },
      {
        id: "A208",
        status: "occupied",
        occupants: ["Emma Stone", "Grace Kelly"],
        type: "double",
      },
    ],
  };

  const getRoomColor = (status: string, isMyRoom: boolean) => {
    if (isMyRoom) return "bg-blue-500 text-white";
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hostelInfo = {
    name: "Ramanujan Hostel",
    warden: "Dr. Rajesh Kumar",
    phone: "+91 9876543210",
    email: "ramanujan.hostel@university.edu",
    facilities: [
      { icon: Wifi, name: "High-Speed WiFi" },
      { icon: Car, name: "Parking" },
      { icon: Utensils, name: "Mess Facility" },
      { icon: Dumbbell, name: "Gymnasium" },
      { icon: Book, name: "Reading Room" },
      { icon: Shield, name: "24/7 Security" },
    ],
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Allocation</h1>
          <p className="text-gray-600 mt-2">
            View your room details and hostel map
          </p>
        </div>

        <Tabs defaultValue="my-room" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-room">My Room</TabsTrigger>
            <TabsTrigger value="floor-map">Floor Map</TabsTrigger>
            <TabsTrigger value="hostel-info">Hostel Info</TabsTrigger>
          </TabsList>

          {/* My Room Tab */}
          <TabsContent value="my-room" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Room Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Room A-204
                  </CardTitle>
                  <CardDescription>Your allocated room details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Room Type</p>
                      <p className="text-gray-600">Single AC Room</p>
                    </div>
                    <div>
                      <p className="font-medium">Floor</p>
                      <p className="text-gray-600">2nd Floor</p>
                    </div>
                    <div>
                      <p className="font-medium">Allocation Date</p>
                      <p className="text-gray-600">March 1, 2024</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Room Amenities</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Air Conditioning
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Study Table & Chair
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Wardrobe
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Attached Bathroom
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        WiFi Connection
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Power Backup
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Room Rules & Guidelines
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Maintain cleanliness and hygiene</li>
                      <li>• No outside guests after 10 PM</li>
                      <li>• Report any maintenance issues immediately</li>
                      <li>• Follow hostel curfew timings</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Room Change Request
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Warden
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Book className="w-4 h-4 mr-2" />
                    Hostel Rules
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Floor Map Tab */}
          <TabsContent value="floor-map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Floor Selection</CardTitle>
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4].map((floor) => (
                    <Button
                      key={floor}
                      variant={selectedFloor === floor ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFloor(floor)}
                    >
                      Floor {floor}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                      <span>Your Room</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span>Maintenance</span>
                    </div>
                  </div>

                  {/* Room Grid */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    {roomData[selectedFloor as keyof typeof roomData]?.map(
                      (room) => {
                        const isMyRoom = room.occupants.includes("Your Room");
                        return (
                          <div
                            key={room.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${getRoomColor(room.status, isMyRoom)}`}
                            title={`${room.id} - ${room.status} - ${room.occupants.join(", ")}`}
                          >
                            <div className="text-center">
                              <div className="font-medium">{room.id}</div>
                              <div className="text-xs mt-1">
                                {room.type}{" "}
                                {room.type === "single" ? "(1)" : "(2)"}
                              </div>
                              {isMyRoom && (
                                <div className="text-xs mt-1 font-bold">
                                  YOUR ROOM
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Floor Layout */}
                  <div className="bg-white p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">
                      Floor {selectedFloor} Layout
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>Common Room</div>
                      <div>Washrooms</div>
                      <div>Study Hall</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hostel Info Tab */}
          <TabsContent value="hostel-info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {hostelInfo.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Hostel Warden</h4>
                    <p className="text-gray-600">{hostelInfo.warden}</p>
                  </div>

                  <div>
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {hostelInfo.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {hostelInfo.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Facilities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {hostelInfo.facilities.map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <facility.icon className="w-4 h-4 text-blue-600" />
                          {facility.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hostel Timings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Entry/Exit Timings</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Weekdays: 6:00 AM - 11:00 PM</p>
                      <p>Weekends: 6:00 AM - 11:30 PM</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Mess Timings</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Breakfast: 7:30 AM - 9:30 AM</p>
                      <p>Lunch: 12:00 PM - 2:00 PM</p>
                      <p>Dinner: 7:00 PM - 9:30 PM</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Common Area Timings</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Study Hall: 6:00 AM - 11:00 PM</p>
                      <p>Recreation Room: 6:00 AM - 10:00 PM</p>
                      <p>Gymnasium: 6:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Allotment;
