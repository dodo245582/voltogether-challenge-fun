
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-voltgreen-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Caricamento in corso...</p>
        <p className="text-gray-500 text-sm mt-2">Solo un momento, stiamo preparando la tua dashboard</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
