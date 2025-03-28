
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-10">
      <div className="text-center">
        <img 
          src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
          alt="VolTogether" 
          className="h-12 mx-auto mb-4 animate-pulse" 
        />
        <Loader2 className="h-8 w-8 animate-spin text-voltgreen-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Caricamento in corso...</p>
        <p className="text-xs text-gray-400 mt-1 italic">Stiamo preparando tutti i tuoi dati</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
