
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsEmailSent(true);
        toast({
          title: "Email Sent",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An error occurred while sending reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsEmailSent(false);
    onClose();
  };

  const handleBackToLogin = () => {
    setEmail('');
    setIsEmailSent(false);
    onBackToLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-lg">Reset Password</DialogTitle>
          <DialogDescription className="text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        {!isEmailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-10"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-2 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 mt-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-emerald-800 font-medium">Email Sent Successfully!</p>
              <p className="text-emerald-600 text-sm mt-1">
                Check your email for password reset instructions.
              </p>
            </div>
            
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;