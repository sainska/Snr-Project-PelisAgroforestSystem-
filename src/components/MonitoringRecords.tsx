
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringRecordsProps {
  userRole: string;
}

interface MonitoringRecord {
  id: string;
  visit_date: string;
  condition: string;
  compliance_level: number;
  recommendations: string | null;
  flagged: boolean;
  officer: {
    name: string;
  };
  plot: {
    name: string;
  };
}

const MonitoringRecords = ({ userRole }: MonitoringRecordsProps) => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!profile) return;
      
      setIsLoading(true);
      
      try {
        let query = supabase
          .from('monitoring_records')
          .select(`
            id,
            visit_date,
            condition,
            compliance_level,
            recommendations,
            flagged,
            officer:profiles!monitoring_records_officer_id_fkey(name),
            plot:plots!monitoring_records_plot_id_fkey(name)
          `)
          .order('visit_date', { ascending: false });
        
        // Filter based on user role
        if (userRole === 'Community Member') {
          // Get plots assigned to the community member
          const { data: userPlots } = await supabase
            .from('plots')
            .select('id')
            .eq('assigned_to', profile.id);
            
          if (userPlots && userPlots.length > 0) {
            const plotIds = userPlots.map(plot => plot.id);
            query = query.in('plot_id', plotIds);
          } else {
            setRecords([]);
            setIsLoading(false);
            return;
          }
        } else if (userRole === 'Forest Officer') {
          query = query.eq('officer_id', profile.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setRecords(data || []);
      } catch (error) {
        console.error('Error fetching monitoring records:', error);
        toast({
          title: 'Error',
          description: 'Failed to load monitoring records. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (profile) fetchRecords();
  }, [profile, userRole]);

  const getComplianceBadge = (level: number) => {
    if (level >= 4) return <Badge className="bg-green-500">High</Badge>;
    if (level >= 2) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge className="bg-red-500">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Monitoring Records</h2>
      
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">Plot Monitoring History</CardTitle>
          <CardDescription>
            {userRole === 'Community Member'
              ? 'Records of inspections on your assigned plots'
              : 'Records of plot inspections and compliance checks'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-emerald-700">Loading records...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plot</TableHead>
                    {userRole !== 'Community Member' && <TableHead>Officer</TableHead>}
                    <TableHead>Condition</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.visit_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.plot.name}</TableCell>
                      {userRole !== 'Community Member' && (
                        <TableCell>{record.officer.name}</TableCell>
                      )}
                      <TableCell>{record.condition}</TableCell>
                      <TableCell>{getComplianceBadge(record.compliance_level)}</TableCell>
                      <TableCell>
                        {record.flagged ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-amber-600">No monitoring records found.</p>
              {userRole === 'Community Member' ? (
                <p className="text-emerald-700 mt-2">
                  Your plots have not been inspected yet or you may not have any assigned plots.
                </p>
              ) : userRole === 'Forest Officer' ? (
                <p className="text-emerald-700 mt-2">
                  You have not created any monitoring records yet.
                </p>
              ) : (
                <p className="text-emerald-700 mt-2">
                  No monitoring activities have been recorded in the system.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringRecords;
