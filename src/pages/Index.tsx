import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { ArrowRight, Leaf, Zap, Users, LightbulbOff, Badge, CheckCircle } from 'lucide-react';
const Index = () => {
  return <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-8 animation-delay-300">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-voltgreen-50 text-voltgreen-700 border border-voltgreen-100 text-sm font-medium mb-2 animate-fade-in">
                <Badge className="h-4 w-4 mr-1" />
                <span>Prossime sfide dal 31 Marzo al 6 Aprile 2025</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-in">
                Risparmia energia insieme alla <span className="text-voltgreen-600">community</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 animate-fade-in animation-delay-200">
                Unisciti a VolTogether e partecipa alle sfide giornaliere di riduzione dei consumi energetici. 
                Contribuisci al bilanciamento della rete e riduci l'impatto ambientale in modo divertente.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in animation-delay-300">
                <Link to="/register">
                  <Button className="bg-voltgreen-600 hover:bg-voltgreen-700 text-white px-8 py-6 rounded-lg text-lg">
                    Inizia ora <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="px-8 py-6 rounded-lg text-lg">
                    Accedi al tuo account
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in animation-delay-400">
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-voltgreen-500" />
                <span>Sfide giornaliere</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-voltgreen-500" />
                <span>Guadagna punti</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-voltgreen-500" />
                <span>Risparmia energia</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-voltgreen-500" />
                <span>Ricevi notifiche</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-voltgreen-500" />
                <span>Tracking automatico</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-voltgreen-500" />
                <span>Community attiva</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center md:justify-end animate-fade-in animation-delay-500">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-voltgreen-200 rounded-3xl rotate-3 transform-gpu"></div>
              <img src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" alt="VolTogether Logo" className="relative z-10 w-full h-auto p-8 animate-float" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Come funziona</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Partecipa alle sfide quotidiane per ridurre i consumi energetici 
              e contribuire alla sostenibilità ambientale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<LightbulbOff className="h-8 w-8 text-voltgreen-500" />} title="Riduci i consumi" description="Impegnati a ridurre i tuoi consumi energetici durante le ore di picco, dalle 19 alle 20, contribuendo al bilanciamento della rete." />
            
            <FeatureCard icon={<Zap className="h-8 w-8 text-voltgreen-500" />} title="Guadagna punti" description="Ogni azione sostenibile ti fa guadagnare punti. Mantieni una 'streak' di 3 giorni consecutivi per ottenere bonus extra." />
            
            <FeatureCard icon={<Users className="h-8 w-8 text-voltgreen-500" />} title="Unisciti alla community" description="Fai parte di una community di persone attente alla sostenibilità, partecipando insieme a sfide che hanno un impatto positivo sull'ambiente." />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-voltgreen-50 border border-voltgreen-100 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold">Pronto a iniziare?</h2>
                <p className="text-lg text-gray-600">
                  Registrati ora e unisciti alla prossima sfida di risparmio energetico.
                  Ogni piccola azione conta!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="bg-voltgreen-600 hover:bg-voltgreen-700 text-white px-8 rounded-lg">
                    Registrati ora
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" className="border-voltgreen-600 text-voltgreen-600 hover:bg-voltgreen-50 px-8 rounded-lg">
                    Accedi
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" alt="VolTogether Logo" className="h-8 w-auto" />
              <span className="text-voltgreen-700 font-display font-semibold text-xl">VolTogether</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-600 hover:text-voltgreen-600">Home</Link>
                <Link to="/about" className="text-gray-600 hover:text-voltgreen-600">Chi siamo</Link>
                <Link to="/faq" className="text-gray-600 hover:text-voltgreen-600">FAQ</Link>
                <Link to="/privacy" className="text-gray-600 hover:text-voltgreen-600">Privacy</Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-600 hover:text-voltgreen-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-voltgreen-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-voltgreen-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>;
};
const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="bg-voltgreen-50 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>;
};
export default Index;