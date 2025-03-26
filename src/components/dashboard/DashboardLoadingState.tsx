
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-voltgreen-600 mx-auto" />
      </div>
    </div>
  );
};

export default DashboardLoadingState;
