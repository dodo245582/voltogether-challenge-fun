
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { DiscoverySource } from '@/types';
import StepIndicators from '@/components/onboarding/StepIndicators';
import StepNavigation from '@/components/onboarding/StepNavigation';
import ProfileStep from '@/components/onboarding/steps/ProfileStep';
import LocationStep from '@/components/onboarding/steps/LocationStep';
import DiscoveryStep from '@/components/onboarding/steps/DiscoveryStep';
import ActionsStep from '@/components/onboarding/steps/ActionsStep';
import SummaryStep from '@/components/onboarding/steps/SummaryStep';

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
      console.log("Starting onboarding completion process");
      
      // Store user selected actions in localStorage for use in notifications
      localStorage.setItem('userSelectedActions', JSON.stringify(selectedActions));
      
      const { error, success } = await updateProfile({
        name,
        city,
        discovery_source: discoverySource,
        selected_actions: selectedActions,
      });
      
      if (error) {
        console.error("Error in onboarding profile update:", error);
        throw error;
      }
      
      if (success) {
        console.log("Onboarding completed successfully");
        toast({
          title: "Profilo completato",
          description: "Il tuo profilo è stato configurato con successo",
          variant: "default",
        });
        
        // Delay redirect to ensure profile is updated in the context
        setTimeout(() => {
          console.log("Navigating to dashboard");
          // Use direct window location change instead of router navigation
          // This forces a full page reload which helps with auth state consistency
          window.location.href = '/dashboard';
        }, 1000); // Longer delay to ensure profile update is processed
      }
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio del profilo",
        variant: "destructive",
      });
      
      // Even with an error, try to navigate after a delay
      // This handles cases where the UI update succeeded but DB update failed
      setTimeout(() => {
        console.log("Forcing navigation to dashboard despite error");
        window.location.href = '/dashboard';
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return <ProfileStep name={name} setName={setName} />;
      case 2:
        return <LocationStep city={city} setCity={setCity} />;
      case 3:
        return <DiscoveryStep 
          discoverySource={discoverySource} 
          setDiscoverySource={setDiscoverySource as (source: DiscoverySource) => void} 
        />;
      case 4:
        return <ActionsStep selectedActions={selectedActions} toggleAction={toggleAction} />;
      case 5:
        return <SummaryStep 
          name={name} 
          city={city} 
          discoverySource={discoverySource} 
          selectedActions={selectedActions} 
        />;
      default:
        return null;
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
        
        <StepIndicators currentStep={step} />
        
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
            {renderStepContent()}
          </CardContent>
          
          <CardFooter>
            <StepNavigation 
              step={step} 
              isLoading={isLoading} 
              onPrev={prevStep} 
              onNext={nextStep} 
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
