
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface PlotApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlotApplicationModal = ({ isOpen, onClose }: PlotApplicationModalProps) => {
  const { user } = useAuth();
  const [preferredSize, setPreferredSize] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !preferredSize || !reason) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('plot_applications')
        .insert({
          applicant_id: user.id,
          preferred_size: parseFloat(preferredSize),
          reason,
          notes: notes || null,
          status: 'Pending'
        });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your plot application has been submitted successfully.",
      });

      // Reset form
      setPreferredSize("");
      setReason("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for a Plot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="preferredSize">Preferred Size (acres)</Label>
            <Input
              id="preferredSize"
              type="number"
              step="0.1"
              value={preferredSize}
              onChange={(e) => setPreferredSize(e.target.value)}
              placeholder="Enter preferred plot size"
              required
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason for Application</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need this plot"
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information"
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
