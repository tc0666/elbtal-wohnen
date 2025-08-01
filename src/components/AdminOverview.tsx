import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Building2, MessageSquare, MapPin, TrendingUp } from 'lucide-react';

interface OverviewStats {
  totalProperties: number;
  activeProperties: number;
  totalRequests: number;
  newRequests: number;
  totalCities: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalRequests: 0,
    newRequests: 0,
    totalCities: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        // Fetch properties
        const { data: propertiesData } = await supabase.functions.invoke('admin-management', {
          body: { action: 'get_properties', token }
        });

        // Fetch contact requests
        const { data: requestsData } = await supabase.functions.invoke('admin-management', {
          body: { action: 'get_contact_requests', token }
        });

        // Fetch cities
        const { data: citiesData } = await supabase.functions.invoke('admin-management', {
          body: { action: 'get_cities', token }
        });

        const properties = propertiesData?.properties || [];
        const requests = requestsData?.requests || [];
        const cities = citiesData?.cities || [];

        setStats({
          totalProperties: properties.length,
          activeProperties: properties.filter((p: any) => p.is_active).length,
          totalRequests: requests.length,
          newRequests: requests.filter((r: any) => r.status === 'new').length,
          totalCities: cities.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Immobilien Gesamt',
      value: stats.totalProperties,
      description: `${stats.activeProperties} aktiv`,
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      title: 'Kontaktanfragen',
      value: stats.totalRequests,
      description: `${stats.newRequests} neue`,
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      title: 'Städte',
      value: stats.totalCities,
      description: 'Standorte verfügbar',
      icon: MapPin,
      color: 'text-purple-600',
    },
    {
      title: 'Aktivitätsrate',
      value: stats.totalProperties > 0 ? Math.round((stats.activeProperties / stats.totalProperties) * 100) : 0,
      description: '% aktive Immobilien',
      icon: TrendingUp,
      color: 'text-orange-600',
      suffix: '%',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Übersicht</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Übersicht</h1>
        <div className="text-sm text-muted-foreground">
          Zuletzt aktualisiert: {new Date().toLocaleString('de-DE')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value}
                {card.suffix && <span className="text-lg">{card.suffix}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Neue Immobilie hinzufügen</span>
              </div>
              <span className="text-xs text-muted-foreground">Strg+N</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Neue Anfragen prüfen</span>
              </div>
              <span className="text-xs text-muted-foreground">{stats.newRequests} neu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Systemstatus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Datenbank</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>API Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Erreichbar</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Letzter Backup</span>
              <span className="text-sm text-muted-foreground">Automatisch</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;