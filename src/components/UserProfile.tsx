
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    id_number: profile?.id_number || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        id_number: formData.id_number,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Profile Settings</h2>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Your Account Information</CardTitle>
          <CardDescription>Manage your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                />
                <p className="text-xs text-emerald-600">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter phone number (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="id_number">ID Number</Label>
                <Input
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter ID number (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={profile?.role || ""}
                  disabled
                />
                <p className="text-xs text-emerald-600">
                  Role cannot be changed
                </p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-emerald-700">Name</Label>
                <p className="text-emerald-800">{profile?.name || "Not provided"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-emerald-700">Email</Label>
                <p className="text-emerald-800">{profile?.email || "Not provided"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-emerald-700">Phone Number</Label>
                <p className="text-emerald-800">{profile?.phone || "Not provided"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-emerald-700">ID Number</Label>
                <p className="text-emerald-800">{profile?.id_number || "Not provided"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-emerald-700">Role</Label>
                <p className="text-emerald-800">{profile?.role || "Not assigned"}</p>
              </div>
              
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-600 hover:bg-emerald-700 mt-4"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
