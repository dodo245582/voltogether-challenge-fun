
import { Loader2 } from "lucide-react";

const DashboardLoadingState = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-10">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-voltgreen-600 mx-auto" />
      </div>
    </div>
  );
};

export default DashboardLoadingState;
