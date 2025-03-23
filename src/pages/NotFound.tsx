
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-24 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="mb-6 text-9xl font-bold text-gray-200">404</div>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Pagina non trovata</h1>
          <p className="text-xl text-gray-600 mb-8">
            Ci dispiace, la pagina che stai cercando non esiste o è stata spostata.
          </p>
          <Link to="/">
            <Button className="bg-voltgreen-600 hover:bg-voltgreen-700 text-white px-6 py-6 rounded-lg text-lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Torna alla home
            </Button>
          </Link>
        </div>
      </div>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default NotFound;
