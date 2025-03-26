
const DashboardLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-voltgreen-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
