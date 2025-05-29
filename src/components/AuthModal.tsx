
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        onClose();
      } else {
        const { error } = await signUp(email, password, {
          name,
          phone,
          national_id: nationalId,
          location,
        });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email for verification.",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <>
      <Dialog open={isOpen && !showForgotPassword} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-emerald-800 text-lg">
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-sm font-medium">National ID</Label>
                    <Input
                      id="nationalId"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="Enter your national ID"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter your location"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-10" disabled={isLoading}>
                {isLoading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
              
              {mode === 'login' && (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleForgotPassword}
                  className="w-full text-emerald-600 hover:text-emerald-700 p-0 h-auto text-sm"
                >
                  Forgot your password?
                </Button>
              )}
              
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleCloseForgotPassword}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
};

export default AuthModal;