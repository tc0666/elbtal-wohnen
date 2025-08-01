import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  MapPin,
  BarChart3,
  User,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  adminUser: any;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, adminUser, onLogout }) => {

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
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <Sidebar className="w-64 border-r" collapsible="offcanvas">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-primary mb-2">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Verwaltungsbereich</p>
        </div>
        
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium ${
                      activeTab === item.id 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted hover:shadow-sm'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="p-4 border-t">
          <SidebarMenuButton
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{adminUser?.username || 'Admin'}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;