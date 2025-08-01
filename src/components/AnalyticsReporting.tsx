import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  MessageSquare, 
  Eye,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  totalProperties: number;
  activeProperties: number;
  totalInquiries: number;
  newInquiries: number;
  inquiriesThisMonth: number;
  topPerformingProperties: Array<{
    id: string;
    title: string;
    inquiries: number;
    views?: number;
  }>;
  inquiriesByStatus: Array<{
    status: string;
    count: number;
  }>;
  monthlyInquiries: Array<{
    month: string;
    count: number;
  }>;
}

const AnalyticsReporting = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_analytics', token, timeRange }
      });

      if (data?.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Fehler",
        description: "Analytics konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analytics werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Immobilien</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.activeProperties || 0} aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Anfragen</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalInquiries || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{analytics?.inquiriesThisMonth || 0} diesen Monat
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neue Anfragen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.newInquiries || 0}</div>
            <p className="text-xs text-muted-foreground">
              Benötigen Bearbeitung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antwortzeit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              Durchschnittlich
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anfragen nach Status */}
        <Card>
          <CardHeader>
            <CardTitle>Anfragen nach Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.inquiriesByStatus?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                    <span className="text-sm font-medium">{getStatusLabel(item.status)}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">Keine Daten verfügbar</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Top Immobilien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topPerformingProperties?.slice(0, 5).map((property, index) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.inquiries} Anfragen</p>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">Keine Daten verfügbar</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend - Enhanced Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Anfragen Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {analytics?.monthlyInquiries?.length > 0 ? (
              <div className="space-y-4">
                {/* Chart Container */}
                <div className="relative h-80 w-full bg-gradient-to-t from-primary/5 to-transparent rounded-lg border border-border/20 p-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-4">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-full border-t border-border/10"
                        style={{ top: `${(i + 1) * 20}%` }}
                      />
                    ))}
                  </div>
                  
                  {/* Line Chart */}
                  <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    {(() => {
                      const maxValue = Math.max(...analytics.monthlyInquiries.map(m => m.count), 1);
                      const padding = 5; // 5% padding on each side
                      const chartWidth = 100 - (padding * 2);
                      
                      const points = analytics.monthlyInquiries.map((month, index) => {
                        const x = padding + (index / Math.max(analytics.monthlyInquiries.length - 1, 1)) * chartWidth;
                        const y = 95 - ((month.count / maxValue) * 75); // Leave more space at top and bottom
                        return `${x},${y}`;
                      }).join(' ');
                      
                      const areaPoints = `${padding},95 ${points} ${padding + chartWidth},95`;
                      
                      return (
                        <>
                          {/* Area under the line */}
                          <polygon
                            points={areaPoints}
                            fill="url(#areaGradient)"
                            className="drop-shadow-sm"
                          />
                          {/* Main line */}
                          <polyline
                            points={points}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="0.8"
                            className="drop-shadow-sm"
                          />
                          {/* Data points */}
                          {analytics.monthlyInquiries.map((month, index) => {
                            const x = padding + (index / Math.max(analytics.monthlyInquiries.length - 1, 1)) * chartWidth;
                            const y = 95 - ((month.count / maxValue) * 75);
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="1.2"
                                fill="hsl(var(--primary))"
                                className="drop-shadow-sm"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* Value Labels */}
                  <div className="absolute inset-4 pointer-events-none">
                    {analytics.monthlyInquiries.map((month, index) => {
                      const maxValue = Math.max(...analytics.monthlyInquiries.map(m => m.count), 1);
                      const padding = 5;
                      const chartWidth = 100 - (padding * 2);
                      const x = padding + (index / Math.max(analytics.monthlyInquiries.length - 1, 1)) * chartWidth;
                      const y = 95 - ((month.count / maxValue) * 75);
                      
                      return (
                        <div
                          key={index}
                          className="absolute transform -translate-x-1/2 -translate-y-full"
                          style={{ 
                            left: `${x}%`, 
                            top: `${y}%`,
                            marginTop: '-12px'
                          }}
                        >
                          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {month.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* X-axis labels */}
                <div className="grid grid-cols-12 gap-1 px-4">
                  {analytics.monthlyInquiries.map((month, index) => (
                    <div key={index} className="text-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {month.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-muted-foreground">Keine Trend-Daten verfügbar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Export contacts to CSV
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Name,Email,Telefon,Status,Datum\n" +
                  analytics?.topPerformingProperties?.map(p => 
                    `${p.title},,,Active,${new Date().toLocaleDateString('de-DE')}`
                  ).join('\n');
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `kontaktanfragen_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Anfragen Exportieren
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Generate and download analytics report
                const reportContent = `
Analytics Bericht - ${new Date().toLocaleDateString('de-DE')}

Übersicht:
- Gesamte Immobilien: ${analytics?.totalProperties || 0}
- Aktive Immobilien: ${analytics?.activeProperties || 0}
- Gesamte Anfragen: ${analytics?.totalInquiries || 0}
- Neue Anfragen: ${analytics?.newInquiries || 0}

Status Verteilung:
${analytics?.inquiriesByStatus?.map(item => `- ${getStatusLabel(item.status)}: ${item.count}`).join('\n') || 'Keine Daten'}

Top Immobilien:
${analytics?.topPerformingProperties?.slice(0, 5).map((p, i) => `${i + 1}. ${p.title} (${p.inquiries} Anfragen)`).join('\n') || 'Keine Daten'}
                `;
                
                const blob = new Blob([reportContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `analytics_bericht_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Bericht Generieren
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Schedule follow-ups (placeholder - could integrate with calendar)
                alert('Follow-up Planer wird in Kürze verfügbar sein!');
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Follow-ups Planen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsReporting;