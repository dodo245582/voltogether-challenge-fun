
import Navbar from '@/components/layout/Navbar';
import { ArrowRight, Clock, Leaf, Zap, Users, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Come Funziona</h1>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Le Regole della Sfida</h2>
              <div className="space-y-4">
                <p className="text-lg">
                  VolTogether è una piattaforma che ti permette di partecipare a sfide giornaliere 
                  di risparmio energetico, contribuendo alla sostenibilità ambientale e al bilanciamento della rete elettrica.
                </p>
                
                <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Ecco come funziona:</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Clock className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Sfide Giornaliere</p>
                      <p>Ogni giorno, dalle 19:00 alle 20:00, c'è una sfida per ridurre i consumi energetici durante l'ora di picco.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Partecipazione</p>
                      <p>Ogni mattina alle 9:00 riceverai una notifica che ti chiede se vuoi partecipare alla sfida del giorno.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Leaf className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Azioni Sostenibili</p>
                      <p>Se decidi di partecipare, riceverai un promemoria alle 18:55 con consigli utili. Al termine della sfida, dovrai selezionare le azioni che hai compiuto per ridurre i consumi.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Zap className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Guadagna Punti</p>
                      <p>Ogni azione sostenibile ti fa guadagnare 10 punti. Accumula punti per salire in classifica e ottenere riconoscimenti.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Users className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Community</p>
                      <p>Fai parte di una comunità che si impegna collettivamente per un futuro più sostenibile. Insieme possiamo fare la differenza!</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Perché Partecipare?</h2>
              <div className="space-y-3">
                <p className="text-lg">
                  La tua partecipazione contribuisce a:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ridurre il carico sulla rete elettrica durante le ore di picco</li>
                  <li>Diminuire l'impatto ambientale legato alla produzione di energia</li>
                  <li>Promuovere abitudini sostenibili nella vita quotidiana</li>
                  <li>Partecipare a una community attiva e impegnata nella sostenibilità</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
