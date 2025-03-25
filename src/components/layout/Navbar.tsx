
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

type NavbarProps = {
  onLogout?: () => void;
};

const Navbar = ({ onLogout }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useMobile();
  
  // Check if the user is authenticated by checking if the onLogout function exists
  const isAuthenticated = !!onLogout;
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setOpen(false);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img 
                src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
                alt="VolTogether Logo" 
                className="h-8"
              />
            </Link>
          </div>
          
          {isMobile ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Link to="/" onClick={() => setOpen(false)}>
                      <img 
                        src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
                        alt="VolTogether Logo" 
                        className="h-8"
                      />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      to="/" 
                      className="text-gray-600 hover:text-voltgreen-600 py-2 text-lg"
                      onClick={() => setOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/how-it-works" 
                      className="text-gray-600 hover:text-voltgreen-600 py-2 text-lg"
                      onClick={() => setOpen(false)}
                    >
                      Come Funziona
                    </Link>
                    <Link 
                      to="/support" 
                      className="text-gray-600 hover:text-voltgreen-600 py-2 text-lg"
                      onClick={() => setOpen(false)}
                    >
                      Supporto
                    </Link>
                  </nav>
                  
                  <div className="mt-auto space-y-4 pt-6">
                    {isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        className="w-full justify-center"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full justify-center">
                            Login
                          </Button>
                        </Link>
                        <Link to="/register" onClick={() => setOpen(false)}>
                          <Button className="w-full justify-center bg-voltgreen-600 hover:bg-voltgreen-700">
                            Registrati
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-8">
                <Link to="/" className="text-gray-600 hover:text-voltgreen-600">
                  Home
                </Link>
                <Link to="/how-it-works" className="text-gray-600 hover:text-voltgreen-600">
                  Come Funziona
                </Link>
                <Link to="/support" className="text-gray-600 hover:text-voltgreen-600">
                  Supporto
                </Link>
              </nav>
              
              <div className="flex space-x-4">
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-voltgreen-600 hover:bg-voltgreen-700">
                        Registrati
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
