
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PlotApplicationFormProps {
  userRole: string;
}

const PlotApplicationForm = ({ userRole }: PlotApplicationFormProps) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    preferredSize: "",
    reason: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit an application.",
        variant: "destructive",
      });
      return;
    }
    
    if (!applicationData.preferredSize || !applicationData.reason) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.from("plot_applications").insert({
        applicant_id: profile.id,
        preferred_size: parseFloat(applicationData.preferredSize),
        reason: applicationData.reason,
      });

      if (error) throw error;
      
      toast({
        title: "Application submitted",
        description: "Your plot application has been submitted successfully.",
      });
      
      // Reset form
      setApplicationData({
        preferredSize: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Plot Application</h2>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Apply for a Forest Plot</CardTitle>
          <CardDescription>
            Fill out this form to request a plot for agroforestry activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preferredSize">Preferred Plot Size (Hectares)</Label>
              <Input
                id="preferredSize"
                name="preferredSize"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                placeholder="e.g., 0.5"
                value={applicationData.preferredSize}
                onChange={handleChange}
                disabled={isSubmitting || userRole !== "Community Member"}
                required
              />
              <p className="text-sm text-emerald-600">
                Enter the desired plot size in hectares (0.1 - 10)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Application</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Please explain why you need this plot and how you plan to use it..."
                rows={4}
                value={applicationData.reason}
                onChange={handleChange}
                disabled={isSubmitting || userRole !== "Community Member"}
                required
              />
            </div>

            {userRole === "Community Member" ? (
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            ) : (
              <p className="text-center text-amber-600">
                Only Community Members can apply for plots.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotApplicationForm;
