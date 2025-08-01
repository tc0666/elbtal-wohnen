import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
  adminUser: any;
  onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ adminUser, onLogout }) => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="font-semibold text-lg">Admin Dashboard</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{adminUser?.username}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;