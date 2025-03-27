
import { useState, useEffect } from 'react';
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
  
  // Verificare lo stato del profilo all'avvio
  useEffect(() => {
    if (user && !redirectAttempted) {
      // Assicuriamoci che i dati del profilo siano aggiornati
      refreshProfile?.(user.id);
    }
  }, [user, redirectAttempted, refreshProfile]);
  
  // Gestire il reindirizzamento se il profilo è già completo
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
      console.log("Inizio aggiornamento profilo:", { name, city, selected_actions: selectedActions, discovery_source: discoverySource });
      
      localStorage.setItem('userSelectedActions', JSON.stringify(selectedActions));
      
      const profileData = {
        name,
        city,
        discovery_source: discoverySource,
        selected_actions: selectedActions,
        profile_completed: true // Set profile as completed
      };
      
      console.log("Profile data being submitted:", profileData);
      
      try {
        if (user.id) {
          const cachedProfile = localStorage.getItem(`profile_${user.id}`);
          if (cachedProfile) {
            const updatedCache = { ...JSON.parse(cachedProfile), ...profileData };
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedCache));
          }
        }
      } catch (e) {
        console.error("Cache update error:", e);
      }
      
      console.log("Calling updateProfile with data:", profileData);
      const { error, success } = await updateProfile(profileData);
      
      console.log("Risultato aggiornamento profilo:", { error, success });
      
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
        
        // Refresh profile data again to make sure we have the most up-to-date data
        if (user && refreshProfile) {
          await refreshProfile(user.id);
        }
        
        // Force redirect to dashboard
        navigate('/dashboard', { replace: true });
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
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-voltgreen-600 rounded-full"></div>
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
