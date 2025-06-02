import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Application {
  id: string;
  created_at: string;
  preferred_size: number;
  reason: string;
  notes: string;
  status: string;
  reviewed_at: string | null;
}

const ReportsModal = ({ isOpen, onClose }: ReportsModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchApplications();
    }
  }, [isOpen, user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('plot_applications')
        .select('*')
        .eq('applicant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved': return "bg-green-500";
      case 'Rejected': return "bg-red-500";
      case 'Under Review': return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  const generateApplicationPDF = (application: Application) => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Plot Application Receipt', 105, 20, { align: 'center' });
    
    // Add NNECFA logo or header
    doc.setFontSize(12);
    doc.text('Nandi North Escarpment Community Forest Association', 105, 30, { align: 'center' });
    
    // Add application details
    doc.setFontSize(12);
    const details = [
      ['Application ID:', application.id],
      ['Date:', format(new Date(application.created_at), 'PPP')],
      ['Status:', application.status],
      ['Plot Size:', `${application.preferred_size} acres`],
      ['Review Date:', application.reviewed_at ? format(new Date(application.reviewed_at), 'PPP') : 'Pending'],
    ];

    // Add the table
    (doc as any).autoTable({
      startY: 40,
      head: [['Field', 'Details']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
    });

    // Add reason and notes
    doc.text('Reason for Application:', 14, doc.lastAutoTable.finalY + 20);
    doc.setFontSize(10);
    const splitReason = doc.splitTextToSize(application.reason, 180);
    doc.text(splitReason, 14, doc.lastAutoTable.finalY + 30);

    if (application.notes) {
      doc.setFontSize(12);
      doc.text('Additional Notes:', 14, doc.lastAutoTable.finalY + 50);
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(application.notes, 180);
      doc.text(splitNotes, 14, doc.lastAutoTable.finalY + 60);
    }

    // Add footer
    doc.setFontSize(10);
    doc.text('This is an official document of NNECFA', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`plot-application-${application.id}.pdf`);
  };

  const ViewApplicationDialog = ({ application }: { application: Application }) => (
    <Dialog open={!!application} onOpenChange={() => setSelectedApplication(null)}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(application.created_at), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={getStatusBadgeColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Plot Size</p>
              <p className="font-medium">{application.preferred_size} acres</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Reason</p>
            <p className="mt-1">{application.reason}</p>
          </div>

          {application.notes && (
            <div>
              <p className="text-sm text-gray-500">Additional Information</p>
              <p className="mt-1 whitespace-pre-wrap">{application.notes}</p>
            </div>
          )}

          {application.status === 'Approved' && (
            <Button 
              className="w-full"
              onClick={() => generateApplicationPDF(application)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Approval Receipt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Reports & Applications</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">Plot Applications</TabsTrigger>
            <TabsTrigger value="reports">Crop Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No applications found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="hover:bg-gray-50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusBadgeColor(application.status)}>
                            {application.status}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {format(new Date(application.created_at), 'PPP')}
                          </p>
                        </div>
                        <p className="mt-2">Plot Size: {application.preferred_size} acres</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {application.status === 'Approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateApplicationPDF(application)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            {/* Crop reports content will be implemented separately */}
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No crop reports found</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedApplication && (
          <ViewApplicationDialog application={selectedApplication} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
