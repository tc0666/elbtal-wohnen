import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import PropertiesManagement from '@/components/PropertiesManagement';
import ContactRequestsManagement from '@/components/ContactRequestsManagement';
import CitiesManagement from '@/components/CitiesManagement';
import AdminOverview from '@/components/AdminOverview';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const userStr = localStorage.getItem('adminUser');
      
      if (!token || !userStr) {
        navigate('/admin1244');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-auth', {
          body: { action: 'verify', token }
        });
        
        console.log('Auth verification response:', { data, error });
        
        if (error) {
          console.error('Supabase function error:', error);
          throw new Error('Authentication failed');
        }
        
        if (!data || !data.success) {
          throw new Error('Invalid token or auth failed');
        }

        setAdminUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        toast({
          title: "Sitzung abgelaufen",
          description: "Bitte melden Sie sich erneut an.",
          variant: "destructive"
        });
        navigate('/admin1244');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
    navigate('/admin1244');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'properties':
        return <PropertiesManagement />;
      case 'contacts':
        return <ContactRequestsManagement />;
      case 'cities':
        return <CitiesManagement />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <AdminHeader adminUser={adminUser} onLogout={handleLogout} />
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;