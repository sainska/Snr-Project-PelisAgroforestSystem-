
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Smartphone, CheckCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

interface STKPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mpesaCode: string, phoneNumber: string) => void;
  amount: number;
  accountReference: string;
}

const STKPushModal = ({ isOpen, onClose, onSuccess, amount, accountReference }: STKPushModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pushSent, setPushSent] = useState(false);
  const [mpesaCode, setMpesaCode] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  const handleSendSTKPush = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (e.g., 254712345678)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.initiateSTKPush(phoneNumber, amount, accountReference);
      if (result.success) {
        setPushSent(true);
        setCheckoutRequestId(result.checkout_request_id);
        toast({
          title: "STK Push Sent",
          description: "Please check your phone and enter your M-Pesa PIN",
        });
      }
    } catch (error) {
      toast({
        title: "STK Push Failed",
        description: "Failed to send STK push. Please try manual payment instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!mpesaCode) {
      toast({
        title: "Missing M-Pesa Code",
        description: "Please enter the M-Pesa transaction code",
        variant: "destructive",
      });
      return;
    }

    onSuccess(mpesaCode, phoneNumber);
    handleClose();
  };

  const handleClose = () => {
    setPhoneNumber('');
    setMpesaCode('');
    setPushSent(false);
    setCheckoutRequestId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] mx-4">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            M-Pesa STK Push Payment
          </DialogTitle>
          <DialogDescription>
            Pay Ksh {amount} using M-Pesa STK Push or enter payment details manually
          </DialogDescription>
        </DialogHeader>

        {!pushSent ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Enter your M-Pesa registered phone number to receive a payment prompt
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                Enter in format: 254XXXXXXXXX (without + or spaces)
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSendSTKPush}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending STK Push...
                  </>
                ) : (
                  'Send STK Push'
                )}
              </Button>
              
              <Button
                onClick={() => setPushSent(true)}
                variant="outline"
                className="w-full"
              >
                Skip STK Push (Manual Payment)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                {checkoutRequestId ? 
                  `STK push sent! Check your phone (${phoneNumber}) and enter your M-Pesa PIN.` :
                  'Complete your M-Pesa payment and enter the transaction code below.'
                }
              </AlertDescription>
            </Alert>

            {!checkoutRequestId && (
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-800 text-sm">Manual Payment Instructions:</h4>
                <ol className="list-decimal list-inside text-sm text-emerald-700 mt-2 space-y-1">
                  <li>Go to M-Pesa on your phone</li>
                  <li>Select "Pay Bill"</li>
                  <li>Enter Business Number: <strong>123456</strong></li>
                  <li>Enter Account Number: <strong>{accountReference}</strong></li>
                  <li>Enter Amount: <strong>{amount}</strong></li>
                  <li>Enter your M-Pesa PIN and send</li>
                </ol>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mpesa-code" className="text-sm font-medium">M-Pesa Transaction Code</Label>
              <Input
                id="mpesa-code"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g., QGH7X9K2M1"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!mpesaCode}
              >
                Confirm Payment
              </Button>
              
              <Button
                onClick={() => setPushSent(false)}
                variant="outline"
                className="w-full"
              >
                Back to STK Push
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default STKPushModal;