
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DiscoverySource, SUSTAINABLE_ACTIONS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, User2, MapPin, Radio, ListChecks, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource | ''>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const nextStep = () => {
    if (step === 1 && !name) {
      toast({
        title: "Campo richiesto",
        description: "Per favore, inserisci il tuo nome",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !city) {
      toast({
        title: "Campo richiesto",
        description: "Per favore, inserisci la tua città",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 3 && !discoverySource) {
      toast({
        title: "Campo richiesto",
        description: "Per favore, seleziona come ci hai conosciuto",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 4 && selectedActions.length === 0) {
      toast({
        title: "Selezione richiesta",
        description: "Per favore, seleziona almeno un'azione sostenibile",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const toggleAction = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };
  
  const completeOnboarding = async () => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi effettuare l'accesso per completare l'onboarding",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store user selected actions in localStorage for use in notifications
      localStorage.setItem('userSelectedActions', JSON.stringify(selectedActions));
      
      const { error, success } = await updateProfile({
        name,
        city,
        discovery_source: discoverySource,
        selected_actions: selectedActions,
      });
      
      if (error) {
        throw error;
      }
      
      if (success) {
        toast({
          title: "Profilo completato",
          description: "Il tuo profilo è stato configurato con successo",
          variant: "default",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio del profilo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
            alt="VolTogether Logo" 
            className="h-12 mx-auto mb-4" 
          />
          <h1 className="text-2xl md:text-3xl font-bold">Completa il tuo profilo</h1>
          <p className="text-gray-600 mt-1">Aiutaci a personalizzare la tua esperienza</p>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <StepIndicator number={1} title="Profilo" isActive={step === 1} isCompleted={step > 1} icon={<User2 className="h-5 w-5" />} />
            <StepIndicator number={2} title="Località" isActive={step === 2} isCompleted={step > 2} icon={<MapPin className="h-5 w-5" />} />
            <StepIndicator number={3} title="Scoperta" isActive={step === 3} isCompleted={step > 3} icon={<Radio className="h-5 w-5" />} />
            <StepIndicator number={4} title="Azioni" isActive={step === 4} isCompleted={step > 4} icon={<ListChecks className="h-5 w-5" />} />
            <StepIndicator number={5} title="Conferma" isActive={step === 5} isCompleted={false} icon={<CheckCircle2 className="h-5 w-5" />} />
            
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          </div>
        </div>
        
        <Card className="shadow-lg border border-gray-200 animate-scale-in duration-300">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Come ti chiami?"}
              {step === 2 && "Dove vivi?"}
              {step === 3 && "Come ci hai conosciuto?"}
              {step === 4 && "Quali azioni sostenibili faresti?"}
              {step === 5 && "Conferma i tuoi dati"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-2">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Il tuo nome</Label>
                  <Input
                    id="name"
                    placeholder="Inserisci il tuo nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Utilizzeremo il tuo nome per personalizzare l'esperienza nella piattaforma.
                  </p>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">In quale città vivi?</Label>
                  <Input
                    id="city"
                    placeholder="Es. Milano, Roma, Napoli..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Utilizziamo questa informazione per personalizzare le tue sfide e calcolare l'impatto ambientale locale.
                  </p>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Come ci hai conosciuto?</Label>
                  <RadioGroup value={discoverySource} onValueChange={(value) => setDiscoverySource(value as DiscoverySource)}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="social-media" id="social-media" />
                        <Label htmlFor="social-media">Social Media</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="friend" id="friend" />
                        <Label htmlFor="friend">Consiglio di un amico</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="search" id="search" />
                        <Label htmlFor="search">Motore di ricerca</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advertisement" id="advertisement" />
                        <Label htmlFor="advertisement">Pubblicità</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="news" id="news" />
                        <Label htmlFor="news">Articolo o notizia</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="event" id="event" />
                        <Label htmlFor="event">Evento o conferenza</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Altro</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-4">
                <Label>Seleziona le azioni che saresti disposto a fare:</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Puoi selezionare più opzioni. Queste azioni ti verranno suggerite durante le sfide giornaliere.
                </p>
                
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {SUSTAINABLE_ACTIONS.map((action) => (
                    <div key={action.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={action.id}
                        checked={selectedActions.includes(action.id)}
                        onCheckedChange={() => toggleAction(action.id)}
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={action.id}
                          className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {action.label}
                        </Label>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Riepilogo dei tuoi dati</h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-1 py-2 border-b">
                      <div className="text-gray-500">Nome</div>
                      <div className="col-span-2 font-medium">{name}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 py-2 border-b">
                      <div className="text-gray-500">Città</div>
                      <div className="col-span-2 font-medium">{city}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 py-2 border-b">
                      <div className="text-gray-500">Come ci hai conosciuto</div>
                      <div className="col-span-2 font-medium">
                        {discoverySource === 'social-media' && 'Social Media'}
                        {discoverySource === 'friend' && 'Consiglio di un amico'}
                        {discoverySource === 'search' && 'Motore di ricerca'}
                        {discoverySource === 'advertisement' && 'Pubblicità'}
                        {discoverySource === 'news' && 'Articolo o notizia'}
                        {discoverySource === 'event' && 'Evento o conferenza'}
                        {discoverySource === 'other' && 'Altro'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 py-2">
                      <div className="text-gray-500">Azioni selezionate</div>
                      <div className="col-span-2">
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedActions.map((actionId) => {
                            const action = SUSTAINABLE_ACTIONS.find((a) => a.id === actionId);
                            return action ? (
                              <li key={actionId} className="font-medium">{action.label}</li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-voltgreen-50 p-4 rounded-md border border-voltgreen-100">
                  <p className="text-voltgreen-800 text-sm">
                    Procedendo, accetti che questi dati vengano utilizzati per personalizzare la tua esperienza su VolTogether.
                    Potrai modificare queste informazioni in qualsiasi momento dalle impostazioni del tuo profilo.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
            </Button>
            
            <Button 
              onClick={nextStep}
              disabled={isLoading}
              className="bg-voltgreen-600 hover:bg-voltgreen-700"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Elaborazione...
                </span>
              ) : (
                <span className="flex items-center">
                  {step < 5 ? "Avanti" : "Completa registrazione"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

interface StepIndicatorProps {
  number: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  icon: React.ReactNode;
}

const StepIndicator = ({ number, title, isActive, isCompleted, icon }: StepIndicatorProps) => {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-full 
        ${isActive ? 'bg-voltgreen-600 text-white' : ''}
        ${isCompleted ? 'bg-voltgreen-100 text-voltgreen-600 border-2 border-voltgreen-500' : ''}
        ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
        transition-all duration-300
      `}>
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          icon
        )}
      </div>
      <div className={`
        text-xs font-medium mt-2
        ${isActive ? 'text-voltgreen-600' : ''}
        ${isCompleted ? 'text-voltgreen-600' : ''}
        ${!isActive && !isCompleted ? 'text-gray-400' : ''}
      `}>
        {title}
      </div>
    </div>
  );
};

export default Onboarding;
