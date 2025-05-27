
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CropReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CropReportModal = ({ isOpen, onClose }: CropReportModalProps) => {
  const { user } = useAuth();
  const [plots, setPlots] = useState<Array<{ id: string; name: string }>>([]);
  const [cropTypes, setCropTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPlot, setSelectedPlot] = useState("");
  const [selectedCropType, setSelectedCropType] = useState("");
  const [areaPlanted, setAreaPlanted] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserPlots();
      fetchCropTypes();
    }
  }, [isOpen, user]);

  const fetchUserPlots = async () => {
    try {
      const { data, error } = await supabase
        .from('plots')
        .select('id, name')
        .eq('assigned_to', user?.id);

      if (error) throw error;
      setPlots(data || []);
    } catch (error) {
      console.error('Error fetching plots:', error);
    }
  };

  const fetchCropTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_types')
        .select('id, name');

      if (error) throw error;
      setCropTypes(data || []);
    } catch (error) {
      console.error('Error fetching crop types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlot || !selectedCropType || !areaPlanted || !plantingDate) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('crop_reports')
        .insert({
          user_id: user.id,
          plot_id: selectedPlot,
          crop_type_id: selectedCropType,
          area_planted: parseFloat(areaPlanted),
          planting_date: plantingDate,
          expected_harvest_date: expectedHarvestDate || null,
          notes: notes || null
        });

      if (error) throw error;

      toast({
        title: "Crop Report Submitted",
        description: "Your crop report has been submitted successfully.",
      });

      // Reset form
      setSelectedPlot("");
      setSelectedCropType("");
      setAreaPlanted("");
      setPlantingDate("");
      setExpectedHarvestDate("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error('Error submitting crop report:', error);
      toast({
        title: "Error",
        description: "Failed to submit crop report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Crop Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="plot">Select Plot</Label>
            <Select value={selectedPlot} onValueChange={setSelectedPlot} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plot" />
              </SelectTrigger>
              <SelectContent>
                {plots.map((plot) => (
                  <SelectItem key={plot.id} value={plot.id}>
                    {plot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cropType">Crop Type</Label>
            <Select value={selectedCropType} onValueChange={setSelectedCropType} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose crop type" />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="areaPlanted">Area Planted (acres)</Label>
            <Input
              id="areaPlanted"
              type="number"
              step="0.1"
              value={areaPlanted}
              onChange={(e) => setAreaPlanted(e.target.value)}
              placeholder="Enter area planted"
              required
            />
          </div>
          <div>
            <Label htmlFor="plantingDate">Planting Date</Label>
            <Input
              id="plantingDate"
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="expectedHarvestDate">Expected Harvest Date</Label>
            <Input
              id="expectedHarvestDate"
              type="date"
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the crop"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CropReportModal;
