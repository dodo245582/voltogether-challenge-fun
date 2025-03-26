
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Index = () => {
  const { user } = useAuth();
  
  // Set body background to white (in case it was changed by other components)
  useEffect(() => {
    document.body.classList.add('bg-white');
    return () => {
      document.body.classList.remove('bg-white');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-voltgreen-50 to-voltgreen-100 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Risparmia energia, aiuta l'ambiente e guadagna punti
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              VolTogether è la community che ti aiuta a ridurre i consumi energetici nelle ore di picco, contribuendo alla transizione energetica.
            </p>
            
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="font-medium">
                  Vai alla Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="font-medium w-full sm:w-auto">
                    Unisciti Ora
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="font-medium w-full sm:w-auto">
                    Accedi
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Come Funziona</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="bg-voltgreen-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-voltgreen-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Ricevi Notifiche</h3>
                <p className="text-gray-600">
                  Ricevi notifiche per le sfide giornaliere e decidi se partecipare.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="bg-voltgreen-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-voltgreen-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Riduci i Consumi</h3>
                <p className="text-gray-600">
                  Durante l'ora di picco, riduci i tuoi consumi energetici seguendo i nostri consigli.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="bg-voltgreen-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-voltgreen-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Guadagna Punti</h3>
                <p className="text-gray-600">
                  Registra le tue azioni sostenibili e accumula punti per ogni sfida completata.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/how-it-works">
                <Button variant="outline">Scopri di Più</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
