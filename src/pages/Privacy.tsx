
import Navbar from '@/components/layout/Navbar';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Informativa sulla Privacy</h1>
          
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              Proteggere la tua privacy è importante per noi. Questa informativa descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-2">Dati raccolti</h2>
            <p>
              Raccogliamo solo i dati necessari per il funzionamento dell'app, come:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Informazioni di registrazione (nome, email)</li>
              <li>Preferenze selezionate durante l'onboarding</li>
              <li>Attività svolte durante le sfide</li>
              <li>Punteggi e progressi nell'app</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-2">Utilizzo dei dati</h2>
            <p>
              Utilizziamo i tuoi dati esclusivamente per:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Permetterti di utilizzare tutte le funzionalità dell'app</li>
              <li>Migliorare la tua esperienza utente</li>
              <li>Inviare notifiche relative alle sfide</li>
              <li>Analizzare l'impatto collettivo delle azioni sostenibili</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-2">Protezione dei dati</h2>
            <p>
              Adottiamo misure di sicurezza per proteggere i tuoi dati personali. Non condividiamo mai i tuoi dati con terze parti senza il tuo consenso esplicito.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-2">I tuoi diritti</h2>
            <p>
              Hai il diritto di accedere, modificare o richiedere la cancellazione dei tuoi dati in qualsiasi momento. Per esercitare questi diritti, contattaci all'indirizzo email: team@voltogether.it
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
