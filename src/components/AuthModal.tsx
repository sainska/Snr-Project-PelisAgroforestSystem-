
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
};

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerIdNumber, setRegisterIdNumber] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please provide both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        onLogin({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name || data.user.email,
          role: data.user.user_metadata.role || "Community Member",
          idNumber: data.user.user_metadata.idNumber || "",
        });
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.user_metadata.name || data.user.email}!`,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signUp(
        registerEmail,
        registerPassword,
        {
          name: registerName,
          role: "Community Member",
          phone: registerPhone,
          idNumber: registerIdNumber,
        }
      );
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        });
        
        // Reset form and switch to login tab
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterIdNumber("");
        setRegisterPhone("");
        setActiveTab("login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "There was a problem creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">
            Welcome to Pelis Agroforest System
          </DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to access forest management features.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password" 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  disabled={isLoading}
                  required
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input 
                  id="register-name" 
                  value={registerName} 
                  onChange={(e) => setRegisterName(e.target.value)} 
                  placeholder="John Doe"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input 
                  id="register-email" 
                  type="email" 
                  value={registerEmail} 
                  onChange={(e) => setRegisterEmail(e.target.value)} 
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input 
                  id="register-password" 
                  type="password" 
                  value={registerPassword} 
                  onChange={(e) => setRegisterPassword(e.target.value)} 
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-id-number">ID Number</Label>
                <Input 
                  id="register-id-number" 
                  value={registerIdNumber} 
                  onChange={(e) => setRegisterIdNumber(e.target.value)} 
                  placeholder="Optional"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">Phone Number</Label>
                <Input 
                  id="register-phone" 
                  value={registerPhone} 
                  onChange={(e) => setRegisterPhone(e.target.value)} 
                  placeholder="Optional"
                  disabled={isLoading}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
