import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  MapPin,
  BarChart3
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {

  const menuItems = [
    {
      id: 'overview',
      label: 'Übersicht',
      icon: LayoutDashboard,
    },
    {
      id: 'properties',
      label: 'Immobilien',
      icon: Building2,
    },
    {
      id: 'contacts',
      label: 'Anfragen',
      icon: MessageSquare,
    },
    {
      id: 'cities',
      label: 'Städte',
      icon: MapPin,
    },
  ];

  return (
    <Sidebar className="w-72 border-r">
      <SidebarContent className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary mb-2">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Verwaltungsbereich</p>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      activeTab === item.id 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted hover:shadow-sm'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;