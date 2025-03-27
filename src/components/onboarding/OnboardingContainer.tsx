import { useState, useEffect } from 'react';
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
  const { user, updateProfile, profile, refreshProfile } = useAuth();
  const { 
    step, setStep, 
    name, setName, 
    city, setCity, 
    discoverySource, setDiscoverySource,
    selectedActions, setSelectedActions,
    isLoading, setIsLoading,
    redirectAttempted, setRedirectAttempted
  } = useOnboardingState(profile);
  
  const [refreshError, setRefreshError] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState(false);
  const [updateAttempts, setUpdateAttempts] = useState(0);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  useEffect(() => {
    if (!user || redirectAttempted) return;
    
    console.log("OnboardingContainer: Checking profile status for user:", user.id);
    
    let refreshTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let mounted = true;
    
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log("OnboardingContainer: Profile refresh timeout reached");
        setRefreshTimeout(true);
      }
    }, 5000);
    
    const attemptRefresh = () => {
      if (!mounted || !refreshProfile) return;
      
      refreshProfile(user.id)
        .then(() => {
          if (mounted) {
            clearTimeout(timeoutId);
            if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
          }
        })
        .catch(error => {
          console.error("OnboardingContainer: Error refreshing profile:", error);
          
          if (mounted && refreshAttempts < 3) {
            const retryDelay = Math.pow(2, refreshAttempts) * 1000; // Exponential backoff
            console.log(`OnboardingContainer: Retrying profile refresh in ${retryDelay}ms (attempt ${refreshAttempts + 1})`);
            
            refreshTimeoutId = setTimeout(() => {
              if (mounted) {
                setRefreshAttempts(prev => prev + 1);
                attemptRefresh();
              }
            }, retryDelay);
          } else if (mounted) {
            setRefreshError(true);
            clearTimeout(timeoutId);
          }
        });
    };
    
    attemptRefresh();
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
    };
  }, [user, redirectAttempted, refreshProfile, refreshAttempts]);
  
  useEffect(() => {
    if (profile && profile.profile_completed === true && !redirectAttempted) {
      console.log("User already has a completed profile, redirecting to dashboard");
      setRedirectAttempted(true);
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate, redirectAttempted, setRedirectAttempted]);
  
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
    setSelectedActions((prev: string[]) => {
      if (prev.includes(actionId)) {
        return prev.filter((id) => id !== actionId);
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
    
    if (!name || !city || !discoverySource || selectedActions.length === 0) {
      toast({
        title: "Campi obbligatori mancanti",
        description: "Tutti i campi del profilo sono obbligatori",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
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
    
    const updateTimeoutId = setTimeout(() => {
      console.log("Profile update timeout reached");
      setIsLoading(false);
      toast({
        title: "Operazione completata",
        description: "Anche se l'aggiornamento ha impiegato più tempo del previsto, il tuo profilo dovrebbe essere stato completato. Ti reindirizziamo alla dashboard.",
        variant: "default",
      });
      
      navigate('/dashboard', { replace: true });
    }, 8000);
    
    try {
      const attemptUpdate = async (attempt = 1): Promise<any> => {
        try {
          console.log(`Calling updateProfile with data (attempt ${attempt}):`, profileData);
          const result = await updateProfile(profileData);
          
          if (result.error) {
            console.error(`Error in onboarding profile update (attempt ${attempt}):`, result.error);
            
            if (attempt < 3) {
              const retryDelay = Math.pow(2, attempt) * 500;
              console.log(`Retrying update after ${retryDelay}ms`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              return attemptUpdate(attempt + 1);
            }
            
            throw result.error;
          }
          
          return result;
        } catch (error) {
          if (attempt < 3) {
            const retryDelay = Math.pow(2, attempt) * 500;
            console.log(`Caught exception, retrying update after ${retryDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return attemptUpdate(attempt + 1);
          }
          throw error;
        }
      };
      
      const { error, success } = await attemptUpdate();
      
      clearTimeout(updateTimeoutId);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        console.log("Onboarding completed successfully");
        toast({
          title: "Profilo completato",
          description: "Il tuo profilo è stato configurato con successo",
          variant: "default",
        });
        
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      clearTimeout(updateTimeoutId);
      
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio del profilo",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard', { replace: true });
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
  
  if (refreshError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold text-red-600 mb-4">Errore di caricamento</h2>
          <p className="mb-4">Si è verificato un errore durante il caricamento del profilo. Riprova più tardi.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-voltgreen-600 text-white rounded hover:bg-voltgreen-700 transition-colors"
          >
            Ricarica pagina
          </button>
        </div>
      </div>
    );
  }
  
  if (refreshTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold text-amber-600 mb-4">Caricamento lento</h2>
          <p className="mb-4">Il caricamento del profilo sta impiegando più tempo del previsto. Puoi attendere o ricaricare la pagina.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-voltgreen-600 text-white rounded hover:bg-voltgreen-700 transition-colors"
            >
              Ricarica pagina
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

export default OnboardingContainer;
