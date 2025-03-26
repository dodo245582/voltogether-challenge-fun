
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
            alt="VolTogether" 
            className="h-10" 
          />
          <span className="font-bold text-xl text-gray-800">VolTogether</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/how-it-works" 
            className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/how-it-works' ? 'font-medium text-gray-900' : ''}`}
          >
            Come Funziona
          </Link>
          <Link 
            to="/support" 
            className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/support' ? 'font-medium text-gray-900' : ''}`}
          >
            Supporto
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Accedi</Button>
              </Link>
              <Link to="/register">
                <Button>Registrati</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
