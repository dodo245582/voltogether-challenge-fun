
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
      <div className="text-center p-4 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-voltgreen-600 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">Caricamento...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
