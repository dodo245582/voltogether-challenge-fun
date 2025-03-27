
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
      <div className="text-center p-6 rounded-lg">
        <Loader2 className="h-10 w-10 animate-spin text-voltgreen-600 mx-auto mb-3" />
        <p className="text-gray-700 font-medium text-base">Caricamento in corso...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
