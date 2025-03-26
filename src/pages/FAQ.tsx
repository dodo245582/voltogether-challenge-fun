
import Navbar from '@/components/layout/Navbar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Domande Frequenti</h1>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg p-2">
              <AccordionTrigger className="text-left font-medium">
                In che modo le mie azioni sono importanti per la transizione energetica?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">
                La rete elettrica è soggetta a picchi di consumo, e per gestirli si usano le centrali di produzione da fonti fossili, 
                che compensano mancanze di produzione delle fonti rinnovabili. Ma l'equilibrio si può raggiungere anche limitando i propri 
                consumi quando la domanda di elettricità è satura! La flessibilità elettrica è cruciale per la transizione alle rinnovabili, 
                e si può raggiungere solo con l'aiuto di tutti i cittadini.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg p-2">
              <AccordionTrigger className="text-left font-medium">
                Sono "obbligato" a partecipare ogni giorno?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">
                No, non c'è nessun obbligo. Noi invieremo una notifica al giorno per partecipare agli eventi giornalieri, 
                e potrai decidere se partecipare. Più partecipi, più aiuti l'ambiente e più guadagni punti!
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg p-2">
              <AccordionTrigger className="text-left font-medium">
                Quanto durano gli eventi giornalieri?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">
                Gli eventi giornalieri in cui ti chiederemo di limitare i tuoi consumi elettrici hanno la durata di un'ora, 
                sempre allo stesso orario che verrà comunicato in anticipo, insieme a dei consigli su come risparmiare energia.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border rounded-lg p-2">
              <AccordionTrigger className="text-left font-medium">
                A quanto ammonterà la mia remunerazione? Chi la fornirà?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">
                Alla fine della settimana, in base alla quantità di attività che avrai completato, riceverai una piccola ricompensa monetaria, 
                che potrai decidere se incassare, tenere nell'app o donare. E' il gestore della rete elettrica stesso a premiare i cittadini 
                per il loro aiuto nella gestione di picchi di energia. L'ammontare dipende da quanto si partecipa, ma si tratta davvero di un 
                piccolo incentivo.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border rounded-lg p-2">
              <AccordionTrigger className="text-left font-medium">
                Cosa succederà dopo la settimana di sfida?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2">
                Stiamo costruendo la nostra app pezzo per pezzo, grazie a queste settimane di sperimentazione e al vostro aiuto. 
                Dopo la settimana di sfida ce ne saranno altre, con tante novità e proposte per migliorare la vostra esperienza!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
