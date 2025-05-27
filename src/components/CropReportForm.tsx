
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CropReportFormProps {
  userRole: string;
}

interface CropType {
  id: string;
  name: string;
  category: string;
}

interface Plot {
  id: string;
  name: string;
  size: number;
  location_description: string | null;
}

const CropReportForm = ({ userRole }: CropReportFormProps) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [userPlots, setUserPlots] = useState<Plot[]>([]);
  const [reportData, setReportData] = useState({
    plotId: "",
    cropTypeId: "",
    plantingDate: "",
    areaPlanted: "",
    expectedHarvestDate: "",
    notes: "",
  });

  useEffect(() => {
    const fetchCropTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("crop_types")
          .select("id, name, category")
          .order("name");

        if (error) throw error;
        setCropTypes(data || []);
      } catch (error) {
        console.error("Error fetching crop types:", error);
        toast({
          title: "Error",
          description: "Failed to load crop types. Please try again.",
          variant: "destructive",
        });
      }
    };

    const fetchUserPlots = async () => {
      if (!profile) return;

      try {
        const { data, error } = await supabase
          .from("plots")
          .select("id, name, size, location_description")
          .eq("assigned_to", profile.id)
          .eq("status", "Active");

        if (error) throw error;
        setUserPlots(data || []);
      } catch (error) {
        console.error("Error fetching user plots:", error);
        toast({
          title: "Error",
          description: "Failed to load your plots. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchCropTypes();
    if (profile) fetchUserPlots();
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReportData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setReportData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a crop report.",
        variant: "destructive",
      });
      return;
    }
    
    if (
      !reportData.plotId ||
      !reportData.cropTypeId ||
      !reportData.plantingDate ||
      !reportData.areaPlanted
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.from("crop_reports").insert({
        user_id: profile.id,
        plot_id: reportData.plotId,
        crop_type_id: reportData.cropTypeId,
        planting_date: reportData.plantingDate,
        area_planted: parseFloat(reportData.areaPlanted),
        expected_harvest_date: reportData.expectedHarvestDate || null,
        notes: reportData.notes,
      });

      if (error) throw error;
      
      toast({
        title: "Report submitted",
        description: "Your crop report has been submitted successfully.",
      });
      
      // Reset form
      setReportData({
        plotId: "",
        cropTypeId: "",
        plantingDate: "",
        areaPlanted: "",
        expectedHarvestDate: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting crop report:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Crop Reporting</h2>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Submit Crop Report</CardTitle>
          <CardDescription>
            Record your planting activities and crop details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userPlots.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plotId">Select Plot</Label>
                <Select
                  value={reportData.plotId}
                  onValueChange={(value) => handleSelectChange("plotId", value)}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plot" />
                  </SelectTrigger>
                  <SelectContent>
                    {userPlots.map((plot) => (
                      <SelectItem key={plot.id} value={plot.id}>
                        {plot.name} ({plot.size} ha)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropTypeId">Crop Type</Label>
                <Select
                  value={reportData.cropTypeId}
                  onValueChange={(value) => handleSelectChange("cropTypeId", value)}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.name} ({crop.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  name="plantingDate"
                  type="date"
                  value={reportData.plantingDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaPlanted">Area Planted (Hectares)</Label>
                <Input
                  id="areaPlanted"
                  name="areaPlanted"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g., 0.25"
                  value={reportData.areaPlanted}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedHarvestDate">Expected Harvest Date (Optional)</Label>
                <Input
                  id="expectedHarvestDate"
                  name="expectedHarvestDate"
                  type="date"
                  value={reportData.expectedHarvestDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional information about this planting..."
                  rows={3}
                  value={reportData.notes}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Crop Report"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-amber-600 mb-4">
                You don't have any active plots assigned to you.
              </p>
              <p className="text-emerald-700">
                Please apply for a plot first or contact a Forest Officer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CropReportForm;
