
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Shield, CreditCard, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EnhancedAuthModal = ({ isOpen, onClose, onSuccess }: EnhancedAuthModalProps) => {
  const { signUp, signIn, uploadDocument, submitPayment } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    national_id: "",
    location: "",
    id_document: null as File | null,
    face_photo: null as File | null,
    mpesa_code: "",
    mpesa_phone: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    return { score, isStrong: score >= 4 };
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (registrationStep === 1) {
        // Step 1: Basic information validation
        if (!registrationData.email || !registrationData.password || !registrationData.name || 
            !registrationData.phone || !registrationData.national_id || !registrationData.location) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }

        if (registrationData.password !== registrationData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }

        const { isStrong } = checkPasswordStrength(registrationData.password);
        if (!isStrong) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
            variant: "destructive",
          });
          return;
        }

        setRegistrationStep(2);
      } else if (registrationStep === 2) {
        // Step 2: Document upload validation
        if (!registrationData.id_document || !registrationData.face_photo) {
          toast({
            title: "Documents Required",
            description: "Please upload both your National ID and face photo.",
            variant: "destructive",
          });
          return;
        }

        setRegistrationStep(3);
      } else if (registrationStep === 3) {
        // Step 3: Payment validation
        if (!registrationData.mpesa_code || !registrationData.mpesa_phone) {
          toast({
            title: "Payment Required",
            description: "Please provide M-Pesa payment details.",
            variant: "destructive",
          });
          return;
        }

        // Final registration
        const { data, error } = await signUp(
          registrationData.email,
          registrationData.password,
          {
            name: registrationData.name,
            phone: registrationData.phone,
            national_id: registrationData.national_id,
            location: registrationData.location,
          }
        );

        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          // Upload documents
          if (registrationData.id_document) {
            await uploadDocument(registrationData.id_document, 'id');
          }
          if (registrationData.face_photo) {
            await uploadDocument(registrationData.face_photo, 'face');
          }

          // Submit payment
          await submitPayment(registrationData.mpesa_code, registrationData.mpesa_phone);

          toast({
            title: "Registration Successful",
            description: "Please check your email for verification. Your account will be reviewed by an officer.",
          });

          onClose();
          setActiveTab("login");
          setRegistrationStep(1);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(loginData.email, loginData.password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome Back",
          description: "Successfully logged in!",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File, type: 'id_document' | 'face_photo') => {
    setRegistrationData(prev => ({ ...prev, [type]: file }));
  };

  const { score: passwordScore } = checkPasswordStrength(registrationData.password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">Pelis Agroforest System</DialogTitle>
          <DialogDescription>
            Join the Nandi North Escarpment Community Forest Association
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-800">Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-800">
                  Registration - Step {registrationStep} of 3
                </CardTitle>
                <Progress value={(registrationStep / 3) * 100} className="w-full" />
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  {registrationStep === 1 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={registrationData.name}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="national_id">National ID *</Label>
                          <Input
                            id="national_id"
                            value={registrationData.national_id}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, national_id: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={registrationData.phone}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={registrationData.location}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, location: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registrationData.email}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={registrationData.password}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <Progress value={(passwordScore / 5) * 100} className="w-full h-2" />
                        <p className="text-xs text-gray-600">
                          Password strength: {passwordScore}/5 (Must be strong to continue)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={registrationData.confirmPassword}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}

                  {registrationStep === 2 && (
                    <>
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Upload your National ID and a clear face photo for verification
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="id-upload">National ID Document *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <input
                              id="id-upload"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'id_document')}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('id-upload')?.click()}
                            >
                              {registrationData.id_document ? 'Change File' : 'Upload ID Document'}
                            </Button>
                            {registrationData.id_document && (
                              <p className="text-sm text-green-600 mt-2">
                                ✓ {registrationData.id_document.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="face-upload">Face Photo *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <input
                              id="face-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'face_photo')}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('face-upload')?.click()}
                            >
                              {registrationData.face_photo ? 'Change Photo' : 'Upload Face Photo'}
                            </Button>
                            {registrationData.face_photo && (
                              <p className="text-sm text-green-600 mt-2">
                                ✓ {registrationData.face_photo.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {registrationStep === 3 && (
                    <>
                      <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertDescription>
                          Pay the membership fee of Ksh 300 via M-Pesa to complete registration
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-emerald-800">Payment Instructions:</h4>
                          <ol className="list-decimal list-inside text-sm text-emerald-700 mt-2 space-y-1">
                            <li>Go to M-Pesa on your phone</li>
                            <li>Select "Pay Bill"</li>
                            <li>Enter Business Number: <strong>123456</strong></li>
                            <li>Enter Account Number: Your National ID</li>
                            <li>Enter Amount: <strong>300</strong></li>
                            <li>Enter your M-Pesa PIN and send</li>
                          </ol>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mpesa_code">M-Pesa Transaction Code *</Label>
                          <Input
                            id="mpesa_code"
                            placeholder="e.g., QGH7X9K2M1"
                            value={registrationData.mpesa_code}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, mpesa_code: e.target.value.toUpperCase() }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mpesa_phone">M-Pesa Phone Number *</Label>
                          <Input
                            id="mpesa_phone"
                            placeholder="254712345678"
                            value={registrationData.mpesa_phone}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, mpesa_phone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    {registrationStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRegistrationStep(prev => prev - 1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : registrationStep === 3 ? "Complete Registration" : "Next"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAuthModal;
