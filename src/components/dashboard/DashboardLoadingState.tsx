
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-voltgreen-600 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">Caricamento...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
