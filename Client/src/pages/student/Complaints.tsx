import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, X } from "lucide-react";
import { api } from "@/lib/api";

interface Complaint {
  complaint_id: number;
  category: string;
  description: string;
  status: string;
  raised_date: string;
}

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-red-100 text-red-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-gray-100 text-gray-700",
};

const Complaints = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ["my-complaints"],
    queryFn: () => api.getComplaints() as Promise<Complaint[]>,
  });

  const submitMutation = useMutation({
    mutationFn: () => api.createComplaint({ category, description }),
    onSuccess: () => {
      toast.success("Complaint submitted!");
      setShowForm(false);
      setCategory("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to submit"),
  });

  const canSubmit = category && description.trim().length >= 10 && !submitMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Complaints</h1>
            <p className="text-muted-foreground mt-1">Submit and track your complaints</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "New Complaint"}
          </Button>
        </div>

        {/* Submit form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Lodge a Complaint</CardTitle>
              <CardDescription>Describe the issue you are facing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Describe the issue in detail (min 10 characters)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button disabled={!canSubmit} onClick={() => submitMutation.mutate()}>
                {submitMutation.isPending ? "Submitting..." : "Submit Complaint"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complaints list */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Your submitted complaints and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground">No complaints submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.complaint_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{c.category} Issue</span>
                          <Badge className={STATUS_COLORS[c.status] || "bg-gray-100 text-gray-700"}>
                            {c.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Raised: {new Date(c.raised_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Complaints;
