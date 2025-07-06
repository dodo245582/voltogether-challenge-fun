
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
                  {/* Sfide Giornaliere */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Clock className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Sfide Giornaliere</p>
                      <p>Durante la settimana dal 5 all’11 maggio, lanceremo 3 sfide tra le 19:00 e le 20:00. Ti avviseremo con 24 ore di anticipo ogni volta che una sfida sarà attiva. Cosa dovrai fare per partecipare? Abbassare il tuo consumo energetico durante l’orario stabilito, tramite alcune semplici azioni (la lista completa è qui sotto, in “Guadagna Punti”).</p>
                    </div>
                  </div>

                  {/* Partecipazione */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <CheckCircle className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Partecipazione</p>
                      <p>
                        Ecco gli step da seguire:<br /><br />
                        1. 24 ore prima dell’inizio della sfida verrai avvisato/a tramite email.<br /><br />
                        2. Il giorno della sfida, dalle ore 9:00, troverai un box sulla tua dashboard con la domanda:
                        “Parteciperai alla sfida di oggi?” Clicca su “Parteciperò” per confermare. Hai tempo fino alle 19:00.<br /><br />
                        3. Solo se avrai confermato la tua partecipazione, al termine della sfida comparirà una nuova domanda sulla tua dashboard:
                        “Che azioni hai fatto per partecipare alla sfida?”, dove potrai selezionare le azioni che hai fatto.
                        Avrai tempo per compilarlo entro 3 ore dalla fine della sfida.<br /><br />
                        4. Una volta selezionate le azioni, fai refresh della pagina e i tuoi punti si aggiorneranno!
                      </p>
                    </div>
                  </div>

                  {/* Azioni Sostenibili */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Leaf className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Azioni Sostenibili</p>
                      <p>
                        Come detto sopra, al termine della sfida dovrai selezionare le azioni che hai compiuto per ridurre i consumi durante l’ora di sfida.
                        Ricorda che dovrai selezionare solo le azioni che hai evitato di fare rispetto alle tue abitudini, non quelle che comunque non avresti fatto.
                        Se, per esempio, normalmente avresti usato la lavastoviglie tra le 19:00 e le 20:00, ma hai scelto di posticiparla, allora è un’azione valida.
                        Non selezionare azioni che comunque non avresti fatto. Per qualsiasi dubbio non esitare a contattarci.
                        Abbiamo anche creato un video a riguardo sulla nostra pagina Instagram vol.together.
                      </p>
                    </div>
                  </div>

                  {/* Guadagna Punti */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Zap className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Guadagna Punti</p>
                      <p>
                        Come detto sopra, ad ogni azione fatta per partecipare corrispondono dei punti, che saranno poi convertiti in remunerazione, a seconda del suo impatto energetico. Ecco la lista:<br /><br />
                        - Spegni luci non necessarie: 10 punti<br />
                        - Scollega caricabatterie e prese non utilizzate: 5 punti<br />
                        - Spegni dispositivi come TV e PC invece di lasciarli in stand-by: 15 punti<br />
                        - Usa modalità ECO/temperatura più bassa elettrodomestici: 30 punti<br />
                        - Sposta utilizzo lavatrice: 70 punti<br />
                        - Abbassa riscaldamento di due gradi: 25 punti<br />
                        - Alza temperatura frigo: 15 punti<br />
                        - Abbassa temperatura ferro da stiro di 10 gradi: 15 punti<br />
                        - Sposta utilizzo lavastoviglie: 100 punti<br />
                        - Sposta utilizzo forno: 100 punti<br />
                        - Stendi i panni invece di usare l'asciugatrice: 190 punti<br /><br />
                        Attenzione: Ogni punto corrisponde a 0.007 euro. La cifra è una simulazione realistica di quella che fornirebbe l’operatore di rete.
                      </p>
                    </div>
                  </div>

                  {/* Limite Punti */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Zap className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nota Sul Calcolo Dei Punti</p>
                      <p>
                        Per ogni sfida è possibile guadagnare fino a un massimo di 300 punti, che corrispondono a un risparmio massimo di circa 3 kWh.
                        Questo limite esiste perché, realisticamente, è difficile ridurre il consumo oltre questa soglia in un’unica occasione.
                        Il nostro obiettivo è premiare comportamenti concreti e sostenibili!
                      </p>
                    </div>
                  </div>

                  {/* Community */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Users className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Community</p>
                      <p>Fai parte di una comunità che si impegna collettivamente per un futuro più sostenibile. Insieme possiamo fare la differenza!</p>
                    </div>
                  </div>

                  {/* Verifica */}
                  <div className="flex gap-3">
                    <div className="shrink-0 bg-voltgreen-100 rounded-full p-2 mt-1">
                      <Users className="h-5 w-5 text-voltgreen-600" />
                    </div>
                    <div>
                      <p className="font-medium">Verifica</p>
                      <p>
                        Ti ricordiamo che per verificare la tua partecipazione e accedere al tuo incentivo ti chiederemo una prova dell’abbassamento dei tuoi consumi
                        quando la settimana di sfide sarà finita: potrai fornirla tramite il Portale Consumi ARERA
                        (<a href="https://www.consumienergia.it/portaleConsumi/" className="text-voltgreen-600 underline">link</a>),
                        oppure tramite screenshot della visualizzazione oraria del giorno della sfida.
                      </p>
                    </div>
                  </div>

                </div> {/* fine space-y-4 */}
              </div> {/* fine space-y-4 (contenitore grande) */}
            </section>

            {/* Sezione: Perché partecipare */}
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

          </div> {/* fine space-y-8 */}
        </div> {/* fine card */}
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
