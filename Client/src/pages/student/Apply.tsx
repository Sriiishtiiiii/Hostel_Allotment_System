import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  User,
  FileText,
  Home,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useHostels, useCreateApplication } from "@/hooks/useApi";
import { useUser } from "@clerk/clerk-react";

const Apply = () => {
  const { user } = useUser();
  const {
    data: hostels = [],
    loading: hostelsLoading,
    error: hostelsError,
    refetch: refetchHostels,
  } = useHostels();
  const createApplication = useCreateApplication();

  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information (pre-filled from user)
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    rollNumber: "",
    branch: "",
    year: "",
    cgpa: "",
    phoneNumber: "",
    emergencyContact: "",
    // Student ID (this should come from your user system)
    studentId: user?.publicMetadata?.studentId || 1, // TODO: Get real student ID

    // Preferences
    preferredHostel: "",
    roomType: "",
    specialRequirements: "",

    // Documents
    documents: {
      photo: null,
      idProof: null,
      academicRecords: null,
      medicalCertificate: null,
    },
  });

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Hostel Preferences", icon: Home },
    { id: 3, title: "Document Upload", icon: Upload },
    { id: 4, title: "Review & Submit", icon: CheckCircle },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = (showErrors = false) => {
    switch (currentStep) {
      case 1:
        if (
          !formData.firstName ||
          !formData.rollNumber ||
          !formData.branch ||
          !formData.year ||
          !formData.cgpa
        ) {
          if (showErrors) toast.error("Please fill in all required fields");
          return false;
        }
        if (parseFloat(formData.cgpa) < 0 || parseFloat(formData.cgpa) > 10) {
          if (showErrors) toast.error("CGPA must be between 0 and 10");
          return false;
        }
        return true;
      case 2:
        if (!formData.preferredHostel || !formData.roomType) {
          if (showErrors)
            toast.error("Please select hostel and room type preferences");
          return false;
        }
        return true;
      case 3:
        return true; // Documents are optional for now
      case 4:
        if (!termsAccepted) {
          if (showErrors) toast.error("Please accept the terms and conditions");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep(true)) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep(true)) return;

    try {
      const applicationData = {
        student_id: formData.studentId,
        preferred_hostel_id: parseInt(formData.preferredHostel),
        preferred_room_type: formData.roomType,
        // Add other relevant fields as needed
        special_requirements: formData.specialRequirements,
      };

      await createApplication.mutate(applicationData);

      // Reset form after success (toast shown by useApiMutation)
      setCurrentStep(1);
      setFormData((prev) => ({
        ...prev,
        preferredHostel: "",
        roomType: "",
        specialRequirements: "",
      }));
      setTermsAccepted(false);
    } catch (error) {
      // Error is handled by the hook and toast
      console.error("Application submission failed:", error);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <DashboardLayout requiredRole="student">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Hostel Application
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your application for hostel accommodation
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-4 ${
                        currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="mb-4" />
            <p className="text-center text-sm text-gray-600">
              Step {currentStep} of {steps.length}:{" "}
              {steps[currentStep - 1].title}
            </p>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const IconComponent = steps[currentStep - 1].icon;
                return <IconComponent className="w-5 h-5" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) =>
                      handleInputChange("rollNumber", e.target.value)
                    }
                    placeholder="e.g., 21CS001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) =>
                      handleInputChange("branch", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">
                        Computer Science Engineering
                      </SelectItem>
                      <SelectItem value="ECE">
                        Electronics & Communication
                      </SelectItem>
                      <SelectItem value="ME">Mechanical Engineering</SelectItem>
                      <SelectItem value="CE">Civil Engineering</SelectItem>
                      <SelectItem value="EE">Electrical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleInputChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA *</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    max="10"
                    min="0"
                    value={formData.cgpa}
                    onChange={(e) => handleInputChange("cgpa", e.target.value)}
                    placeholder="e.g., 8.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Hostel Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {hostelsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading hostels...</span>
                  </div>
                ) : hostelsError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-red-600 mb-2">Failed to load hostels</p>
                    <p className="text-sm text-gray-600 mb-4">{hostelsError}</p>
                    <Button
                      variant="outline"
                      onClick={() => refetchHostels()}
                      size="sm"
                      disabled={hostelsLoading}
                    >
                      {hostelsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                          Retrying...
                        </>
                      ) : (
                        "Retry"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label>Preferred Hostel *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hostels && hostels.length > 0 ? (
                        hostels.map((hostel: any) => (
                          <div
                            key={hostel.hostel_id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.preferredHostel ===
                              hostel.hostel_id.toString()
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              handleInputChange(
                                "preferredHostel",
                                hostel.hostel_id.toString(),
                              )
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">
                                  {hostel.hostel_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {hostel.type} Hostel
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Capacity
                                </p>
                                <p className="font-medium">
                                  {hostel.total_rooms || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hostels available. Please contact administration.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Room Type Preference *</Label>
                  <RadioGroup
                    value={formData.roomType}
                    onValueChange={(value) =>
                      handleInputChange("roomType", value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Single" id="single" />
                      <Label htmlFor="single">Single Room (₹60,000/year)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Double" id="double" />
                      <Label htmlFor="double">Double Room (₹45,000/year)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Triple" id="triple" />
                      <Label htmlFor="triple">Triple Room (₹35,000/year)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">
                    Special Requirements (Optional)
                  </Label>
                  <Textarea
                    id="requirements"
                    value={formData.specialRequirements}
                    onChange={(e) =>
                      handleInputChange("specialRequirements", e.target.value)
                    }
                    placeholder="Any special accommodations or requirements..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Document Requirements
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Please upload clear, legible copies of all required
                        documents. Accepted formats: PDF, JPG, PNG (Max size:
                        5MB each)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Passport Size Photo *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload photo
                      </p>
                      <input type="file" className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ID Proof (Aadhar/PAN) *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload ID proof
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Records *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Upload marksheets/transcripts
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Medical Certificate (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Upload medical certificate
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-4">Application Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {formData.firstName}{" "}
                      {formData.lastName}
                    </div>
                    <div>
                      <strong>Roll Number:</strong> {formData.rollNumber}
                    </div>
                    <div>
                      <strong>Branch:</strong> {formData.branch}
                    </div>
                    <div>
                      <strong>CGPA:</strong> {formData.cgpa}
                    </div>
                    <div>
                      <strong>Preferred Hostel:</strong>{" "}
                      {hostels.find(
                        (h: any) =>
                          h.hostel_id.toString() === formData.preferredHostel,
                      )?.hostel_name || "Not selected"}
                    </div>
                    <div>
                      <strong>Room Type:</strong> {formData.roomType}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Hostel Rules
                    </a>
                  </Label>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Important Notice
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once submitted, your application cannot be modified.
                        Please review all information carefully before
                        submitting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={handleNext} disabled={!validateCurrentStep()}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || createApplication.loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createApplication.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Apply;
