
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-voltgreen-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Caricamento in corso...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
