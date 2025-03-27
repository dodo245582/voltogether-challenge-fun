
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { DiscoverySource } from '@/types';
import { Loader2 } from 'lucide-react';
import StepIndicators from '@/components/onboarding/StepIndicators';
import StepNavigation from '@/components/onboarding/StepNavigation';
import ProfileStep from '@/components/onboarding/steps/ProfileStep';
import LocationStep from '@/components/onboarding/steps/LocationStep';
import DiscoveryStep from '@/components/onboarding/steps/DiscoveryStep';
import ActionsStep from '@/components/onboarding/steps/ActionsStep';
import SummaryStep from '@/components/onboarding/steps/SummaryStep';
import { useOnboardingState } from '@/hooks/useOnboardingState';

const OnboardingContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile, profile } = useAuth();
  const { 
    step, setStep, 
    name, setName, 
    city, setCity, 
    discoverySource, setDiscoverySource,
    selectedActions, setSelectedActions,
    isLoading, setIsLoading,
    redirectAttempted, setRedirectAttempted
  } = useOnboardingState(profile);
  
  const [error, setError] = useState(false);
  
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
    setSelectedActions(prev => {
      if (prev.includes(actionId)) {
        return prev.filter(id => id !== actionId);
      } else {
        return [...prev, actionId];
      }
    });
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
    
    // Update local storage cache first for immediate UI response
    try {
      localStorage.setItem('userSelectedActions', JSON.stringify(selectedActions));
      
      if (user.id) {
        const cachedProfile = localStorage.getItem(`profile_${user.id}`);
        if (cachedProfile) {
          const updatedCache = { 
            ...JSON.parse(cachedProfile), 
            name, 
            city, 
            discovery_source: discoverySource, 
            selected_actions: selectedActions,
            profile_completed: true
          };
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedCache));
        }
      }
    } catch (e) {
      console.error("Cache update error:", e);
    }
    
    const profileData = {
      name,
      city,
      discovery_source: discoverySource,
      selected_actions: selectedActions,
      profile_completed: true
    };
    
    console.log("Profile data being submitted:", profileData);
    
    // Set a very short timeout as fallback to ensure we don't freeze the UI
    const updateTimeoutId = setTimeout(() => {
      console.log("Profile update timeout - redirecting anyway");
      setIsLoading(false);
      navigate('/dashboard', { replace: true });
    }, 3000);
    
    try {
      const result = await updateProfile(profileData);
      
      clearTimeout(updateTimeoutId);
      
      if (result.error) {
        console.error("Error updating profile:", result.error);
        setError(true);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il salvataggio del profilo, ma ti reindirizziamo comunque alla dashboard.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profilo completato",
          description: "Il tuo profilo è stato configurato con successo",
          variant: "default",
        });
      }
      
      // Always redirect to dashboard after a short delay
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error) {
      console.error("Exception during profile update:", error);
      clearTimeout(updateTimeoutId);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore, ma ti reindirizziamo comunque alla dashboard.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard', { replace: true });
      }, 500);
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
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-voltgreen-600" />
          <p className="text-gray-600">Caricamento in corso...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold text-red-600 mb-4">Errore di caricamento</h2>
          <p className="mb-4">Si è verificato un errore. Puoi riprovare o procedere alla dashboard.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-voltgreen-600 text-white rounded hover:bg-voltgreen-700 transition-colors"
            >
              Riprova
            </button>
            <button 
              onClick={() => navigate('/dashboard', { replace: true })} 
              className="px-4 py-2 border border-voltgreen-600 text-voltgreen-600 rounded hover:bg-voltgreen-50 transition-colors"
            >
              Vai alla dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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
        
        <Card className="shadow-lg border border-gray-200">
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

export default OnboardingContainer;
