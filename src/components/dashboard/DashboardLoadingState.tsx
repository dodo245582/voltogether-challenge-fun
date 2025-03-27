
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
      <div className="text-center p-6 rounded-lg">
        <Loader2 className="h-12 w-12 animate-spin text-voltgreen-600 mx-auto mb-4" />
        <p className="text-gray-700 font-medium text-lg">Caricamento dashboard in corso...</p>
        <p className="text-gray-500 text-sm mt-2">Stiamo recuperando i tuoi dati</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
