
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Calendar, MapPin } from "lucide-react";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Report {
  id: string;
  type: 'application' | 'crop_report';
  title: string;
  date: string;
  status: string;
  details: string;
}

const ReportsModal = ({ isOpen, onClose }: ReportsModalProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchReports();
    }
  }, [isOpen, user]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // Fetch plot applications
      const { data: applications, error: appError } = await supabase
        .from('plot_applications')
        .select(`
          id,
          preferred_size,
          reason,
          status,
          created_at
        `)
        .eq('applicant_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch crop reports
      const { data: cropReports, error: cropError } = await supabase
        .from('crop_reports')
        .select(`
          id,
          area_planted,
          planting_date,
          created_at,
          plots(name),
          crop_types(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (appError) throw appError;
      if (cropError) throw cropError;

      const allReports: Report[] = [
        ...(applications?.map(app => ({
          id: app.id,
          type: 'application' as const,
          title: `Plot Application - ${app.preferred_size} acres`,
          date: new Date(app.created_at).toLocaleDateString(),
          status: app.status,
          details: app.reason
        })) || []),
        ...(cropReports?.map(report => ({
          id: report.id,
          type: 'crop_report' as const,
          title: `Crop Report - ${(report as any).crop_types?.name || 'Unknown Crop'}`,
          date: new Date(report.created_at).toLocaleDateString(),
          status: 'Submitted',
          details: `${report.area_planted} acres on ${(report as any).plots?.name || 'Unknown Plot'}`
        })) || [])
      ];

      setReports(allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Reports</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports found</p>
              <p className="text-sm">Your applications and crop reports will appear here</p>
            </div>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="border-emerald-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {report.type === 'application' ? (
                        <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                      ) : (
                        <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                      )}
                      {report.title}
                    </CardTitle>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {report.date}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{report.details}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
