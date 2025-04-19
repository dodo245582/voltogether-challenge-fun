
import { Bell, BellDot, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  profile: User | null;
  username: string | null;
  points: number;
  hasUnreadNotifications: boolean;
  onLogout: () => void;
}

const DashboardHeader = ({ 
  profile, 
  username, 
  points, 
  hasUnreadNotifications, 
  onLogout 
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
            alt="VolTogether" 
            className="h-9" 
          />
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/how-it-works">
            <Button variant="ghost" size="sm" className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              <span>Come Funziona</span>
            </Button>
          </Link>
          
          {/*
          <div className="text-gray-600 hover:text-gray-900 cursor-pointer">
            {hasUnreadNotifications ? (
              <BellDot className="h-6 w-6 text-voltgreen-600" />
            ) : (
              <Bell className="h-6 w-6" />
            )}
          </div> */}
          
          {username && (
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{username}</p>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Esci</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
