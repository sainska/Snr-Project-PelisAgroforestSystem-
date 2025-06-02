import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface PlotApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  preferredSize: string;
  locationPreference: string;
  reason: string;
  farmingExperience: string;
  intendedUse: string;
  hasEquipment: boolean;
  notes: string;
}

const PlotApplicationModal = ({ isOpen, onClose }: PlotApplicationModalProps) => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    preferredSize: "",
    locationPreference: "",
    reason: "",
    farmingExperience: "",
    intendedUse: "",
    hasEquipment: false,
    notes: "",
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.preferredSize || parseFloat(formData.preferredSize) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid plot size.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.locationPreference) {
      toast({
        title: "Validation Error",
        description: "Please specify your preferred location.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.reason || formData.reason.length < 50) {
      toast({
        title: "Validation Error",
        description: "Please provide a detailed reason for your application (minimum 50 characters).",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.farmingExperience) {
      toast({
        title: "Validation Error",
        description: "Please describe your farming experience.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form before proceeding
      if (!validateForm()) return;

      setIsSubmitting(true);

      // Combine all additional information into notes
      const combinedNotes = `
Location Preference: ${formData.locationPreference}
Farming Experience: ${formData.farmingExperience}
Intended Use: ${formData.intendedUse}
Has Equipment: ${formData.hasEquipment ? 'Yes' : 'No'}
Additional Notes: ${formData.notes}
      `.trim();

      // Log the data being submitted
      console.log('Submitting plot application:', {
        applicant_id: user?.id,
        preferred_size: parseFloat(formData.preferredSize),
        reason: formData.reason,
        notes: combinedNotes,
        status: 'Pending'
      });

      const { data, error } = await supabase
        .from('plot_applications')
        .insert({
          applicant_id: user?.id,
          preferred_size: parseFloat(formData.preferredSize),
          reason: formData.reason,
          notes: combinedNotes,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Application submitted successfully:', data);

      toast({
        title: "Application Submitted",
        description: "Your plot application has been submitted successfully.",
      });

      // Reset form
      setFormData({
        preferredSize: "",
        locationPreference: "",
        reason: "",
        farmingExperience: "",
        intendedUse: "",
        hasEquipment: false,
        notes: "",
      });
      onClose();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "Failed to submit application. ";
      if (error.code === "23502") { // not_null_violation
        errorMessage += "Please fill in all required fields.";
      } else if (error.code === "23503") { // foreign_key_violation
        errorMessage += "Invalid reference to farm group.";
      } else if (error.code === "42703") { // undefined_column
        errorMessage += "Database schema mismatch. Please contact support.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply for a Plot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredSize">Preferred Size (acres)</Label>
              <Input
                id="preferredSize"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.preferredSize}
                onChange={(e) => handleInputChange("preferredSize", e.target.value)}
                placeholder="Enter preferred plot size"
                required
              />
            </div>
            <div>
              <Label htmlFor="locationPreference">Preferred Location</Label>
              <Input
                id="locationPreference"
                value={formData.locationPreference}
                onChange={(e) => handleInputChange("locationPreference", e.target.value)}
                placeholder="Specify preferred location"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Application</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="Explain in detail why you need this plot (minimum 50 characters)"
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="farmingExperience">Farming Experience</Label>
            <Textarea
              id="farmingExperience"
              value={formData.farmingExperience}
              onChange={(e) => handleInputChange("farmingExperience", e.target.value)}
              placeholder="Describe your farming experience and any relevant skills"
              required
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="intendedUse">Intended Use</Label>
            <Select
              value={formData.intendedUse}
              onValueChange={(value) => handleInputChange("intendedUse", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select intended use" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crops">Crop Farming</SelectItem>
                <SelectItem value="agroforestry">Agroforestry</SelectItem>
                <SelectItem value="mixed">Mixed Farming</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEquipment"
              checked={formData.hasEquipment}
              onCheckedChange={(checked) => handleInputChange("hasEquipment", checked as boolean)}
            />
            <Label htmlFor="hasEquipment">I have access to necessary farming equipment</Label>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information that might support your application"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlotApplicationModal;
