
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-10">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-voltgreen-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500 animate-pulse">Caricamento in corso...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
