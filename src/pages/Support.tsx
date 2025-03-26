
import Navbar from '@/components/layout/Navbar';

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Supporto</h1>
          
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              Stai riscontrando problemi? Mandaci una mail a{' '}
              <a 
                href="mailto:team@voltogether.com?subject=Supporto" 
                className="text-voltgreen-600 hover:underline font-medium"
              >
                team@voltogether.com
              </a>{' '}
              con come oggetto "Supporto" e spiegaci cosa non va.
            </p>
            
            <p className="text-lg">
              Faremo del nostro meglio per aiutarti!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
