
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-gray-500 text-sm">© {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/faq" className="text-gray-600 hover:text-gray-900 text-sm">
              FAQ
            </Link>
            <Link to="/chi-siamo" className="text-gray-600 hover:text-gray-900 text-sm">
              Chi Siamo
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
              Privacy
            </Link>
            
            <div className="flex items-center space-x-4 ml-2">
              <a 
                href="https://www.instagram.com/vol.together?igsh=NmxvYzM0MWl3bDVp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-voltgreen-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61570044600729" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-voltgreen-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
