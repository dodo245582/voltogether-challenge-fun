
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  HelpCircle,
  LifeBuoy,
  Bell,
  BellDot
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from '@/context/NotificationContext';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isAuthenticated = false, onLogout }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { notifications, markAsRead } = useNotifications();

  // Controlla se ci sono notifiche non lette
  const hasUnreadNotifications = notifications.some(n => !n.read);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    toast({
      title: "Disconnesso",
      description: "Hai effettuato il logout con successo",
    });
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-voltgreen-600 font-display font-semibold text-xl"
          >
            <img 
              src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
              alt="VolTogether Logo" 
              className="h-8 w-auto object-contain" 
            />
            <span>VolTogether</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/how-it-works" 
                  className="text-gray-700 hover:text-voltgreen-600 transition-colors px-2 py-1 rounded-md"
                >
                  Come funziona
                </Link>
                <Link 
                  to="/support" 
                  className="text-gray-700 hover:text-voltgreen-600 transition-colors px-2 py-1 rounded-md"
                >
                  Support
                </Link>
                
                {/* Notification Bell */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      {hasUnreadNotifications ? (
                        <>
                          <BellDot className="h-5 w-5 text-voltgreen-600" />
                          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                        </>
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 max-h-[400px] overflow-y-auto">
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="font-medium">Notifiche</h4>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>Nessuna notifica</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-gray-50' : ''}`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div className="flex justify-between mb-1">
                              <h5 className="font-medium text-sm">{notification.title}</h5>
                              <span className="text-xs text-gray-500">
                                {format(parseISO(notification.timestamp), 'HH:mm', { locale: it })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="text-gray-700 hover:text-voltgreen-600">
                    <UserIcon className="h-5 w-5" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-voltgreen-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/how-it-works" 
                  className="text-gray-700 hover:text-voltgreen-600 transition-colors px-2 py-1 rounded-md"
                >
                  Come funziona
                </Link>
                <Link 
                  to="/support" 
                  className="text-gray-700 hover:text-voltgreen-600 transition-colors px-2 py-1 rounded-md"
                >
                  Support
                </Link>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-voltgreen-600 transition-colors px-3 py-1.5 rounded-md"
                >
                  Accedi
                </Link>
                <Link to="/register">
                  <Button variant="default" className="bg-voltgreen-600 hover:bg-voltgreen-700">
                    Registrati
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-lg animate-fade-in">
          <div className="pt-2 pb-4 space-y-1 px-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Come funziona
                </Link>
                <Link 
                  to="/support" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Support
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Profilo
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/how-it-works" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Come funziona
                </Link>
                <Link 
                  to="/support" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Support
                </Link>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Accedi
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-voltgreen-600 hover:bg-gray-50"
                >
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
