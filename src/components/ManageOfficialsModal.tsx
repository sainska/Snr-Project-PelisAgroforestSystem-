import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Trash } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ManageOfficialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OfficialFormData {
  email: string;
  name: string;
  phone: string;
  national_id: string;
  location: string;
}

const ManageOfficialsModal = ({ isOpen, onClose }: ManageOfficialsModalProps) => {
  const { user } = useAuth();
  const [officials, setOfficials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OfficialFormData>({
    email: "",
    name: "",
    phone: "",
    national_id: "",
    location: ""
  });

  // Fetch existing officials
  const fetchOfficials = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'NNECFA Official');

      if (error) throw error;
      setOfficials(data || []);
    } catch (error) {
      console.error('Error fetching officials:', error);
      toast({
        title: "Error",
        description: "Failed to load NNECFA Officials",
        variant: "destructive"
      });
    }
  };

  // Create new official
  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await authService.createNNECFAOfficial(
        formData.email,
        formData.name,
        formData.phone,
        formData.national_id,
        formData.location,
        user.id
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "NNECFA Official account created successfully. They will receive an email to set their password.",
      });

      // Reset form and refresh officials list
      setFormData({
        email: "",
        name: "",
        phone: "",
        national_id: "",
        location: ""
      });
      fetchOfficials();
    } catch (error) {
      console.error('Error creating official:', error);
      toast({
        title: "Error",
        description: "Failed to create NNECFA Official account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove official
  const handleRemoveOfficial = async (officialId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'Community Member' })
        .eq('id', officialId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Official role removed successfully",
      });

      fetchOfficials();
    } catch (error) {
      console.error('Error removing official:', error);
      toast({
        title: "Error",
        description: "Failed to remove official role",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-emerald-600" />
            Manage NNECFA Officials
          </DialogTitle>
        </DialogHeader>

        {/* Create New Official Form */}
        <form onSubmit={handleCreateOfficial} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                value={formData.national_id}
                onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <UserPlus className="h-4 w-4 mr-2" />
            {isLoading ? "Creating..." : "Create NNECFA Official"}
          </Button>
        </form>

        {/* List of Existing Officials */}
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-gray-900">Existing Officials</h3>
          {officials.map((official) => (
            <Card key={official.id} className="border-emerald-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{official.name}</p>
                    <p className="text-sm text-gray-600">{official.email}</p>
                    <p className="text-sm text-gray-500">{official.location}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveOfficial(official.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageOfficialsModal; 
