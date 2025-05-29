
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface MonitoringRecord {
  id: string;
  visit_date: string;
  condition: string;
  compliance_level: number;
  recommendations: string;
  flagged: boolean;
  officer: {
    name: string;
  };
  plot: {
    name: string;
    size: number;
  };
}

const MonitoringRecords = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchRecords();
    }
  }, [profile]);

  const fetchRecords = async () => {
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
          plots(name, size)
        `)
        .order('visit_date', { ascending: false });

      // If user is a community member, only show records for their plots
      if (profile?.role === 'Community Member') {
        const { data: userPlots } = await supabase
          .from('plots')
          .select('id')
          .eq('assigned_to', profile.id);

        if (userPlots && userPlots.length > 0) {
          const plotIds = userPlots.map(plot => plot.id);
          query = query.in('plot_id', plotIds);
        } else {
          // User has no plots, show empty array
          setRecords([]);
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our interface
      const transformedRecords = (data || []).map(record => ({
        id: record.id,
        visit_date: record.visit_date,
        condition: record.condition,
        compliance_level: record.compliance_level,
        recommendations: record.recommendations || '',
        flagged: record.flagged || false,
        officer: {
          name: 'Forest Officer' // Default name since we don't have officer data
        },
        plot: {
          name: (record as any).plots?.name || 'Unknown Plot',
          size: (record as any).plots?.size || 0
        }
      }));

      setRecords(transformedRecords);
    } catch (error) {
      console.error('Error fetching monitoring records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monitoring records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading monitoring records...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Monitoring Records</h2>
      
      {records.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No monitoring records found</p>
          <p className="text-sm text-gray-400">
            {profile?.role === 'Community Member' 
              ? 'Monitoring records for your plots will appear here' 
              : 'Monitoring records will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id} className="border-emerald-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                    {record.plot.name} ({record.plot.size} acres)
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getConditionColor(record.condition)}>
                      {record.condition}
                    </Badge>
                    {record.flagged && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(record.visit_date).toLocaleDateString()}
                  <span className="mx-2">•</span>
                  <span>Officer: {record.officer.name}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 w-32">Compliance Level:</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            record.compliance_level >= 80 ? 'bg-green-500' :
                            record.compliance_level >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${record.compliance_level}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{record.compliance_level}%</span>
                      {record.compliance_level >= 80 && (
                        <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  {record.recommendations && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Recommendations:</span>
                      <p className="text-sm text-gray-700 mt-1">{record.recommendations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {profile?.role !== 'Community Member' && (
        <div className="text-center">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Create New Record
          </Button>
        </div>
      )}
    </div>
  );
};

export default MonitoringRecords;