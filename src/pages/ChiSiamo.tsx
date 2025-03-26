
import Navbar from '@/components/layout/Navbar';

const ChiSiamo = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Chi Siamo</h1>
          
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/lovable-uploads/0ed37364-f847-44e6-8162-d84926d75be7.png" 
              alt="Politecnico di Milano logo" 
              className="h-40 mb-4"
            />
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="text-lg text-center">
              VolTogether è stata creata da un gruppo multidisciplinare di studenti del Politecnico di Milano, 
              nel corso del programma di eccellenza chiamato Alta Scuola Politecnica. Stiamo ancora costruendo 
              la nostra soluzione, con il vostro aiuto miglioreremo sempre di più!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChiSiamo;
