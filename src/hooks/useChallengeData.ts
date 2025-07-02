
import { useState, useEffect, useCallback } from 'react';
import { Challenge, SUSTAINABLE_ACTIONS  } from '@/types';
import { useAuth } from '@/context/auth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from '@/hooks/use-toast';

export const useChallengeData = (initialChallenge: Challenge) => {
  const { user, refreshProfile } = useAuth();
  const { updateProfile } = useUserProfile();
  const [challengeData, setChallengeData] = useState<Challenge>(initialChallenge);
  const [isLoading, setIsLoading] = useState(false);

  // Use useCallback to avoid recreating the function on every render
  const loadChallengeData = useCallback(() => {
    // Get the current date to check if this is a future, current, or past challenge
    const today = new Date();
    const challengeDate = new Date(initialChallenge.date);
    const isToday = today.toDateString() === challengeDate.toDateString();
    const isPastChallenge = challengeDate < new Date(today.setHours(0, 0, 0, 0));
    
    // Only load challenge state from localStorage if it exists
    const participating = localStorage.getItem(`challenge_${initialChallenge.id}_participating`);
    const completed = localStorage.getItem(`challenge_${initialChallenge.id}_completed`) === 'true';
    const userActionsStr = localStorage.getItem(`challenge_${initialChallenge.id}_actions`);
    
    let userActions = undefined;
    if (userActionsStr) {
      try {
        userActions = JSON.parse(userActionsStr);
      } catch (e) {
        console.error("Error parsing user actions:", e);
      }
    }
    
    console.log(`Challenge ${initialChallenge.id} data:`, {
      isTodayChallenge: isToday,
      isPastChallenge,
      participating: participating === 'true' ? true : participating === 'false' ? false : undefined,
      completed,
      userActions
    });
    
    // Determine the participation status based on challenge date and stored value
    let finalParticipating;
    
    if (isToday) {
      // For today's challenge, undefined means waiting for response
      // IMPORTANT: Never default to true for participation unless the user explicitly chose it
      finalParticipating = participating === 'true' ? true : 
                          participating === 'false' ? false : 
                          undefined;
    } else if (isPastChallenge) {
      // For past challenges, default to false if no value stored
      finalParticipating = participating === 'true' ? true : false;
    } else {
      // For future challenges, always undefined (waiting)
      finalParticipating = undefined;
    }
    
    // Only mark as completed if explicitly completed
    const isCompleted = completed === true;
    
    // 👉 Codice per forzare un test (solo per sviluppo!)
    // const testChallengeId = initialChallenge.id;
    // localStorage.setItem(`challenge_${testChallengeId}_participating`, "true");
    // localStorage.removeItem(`challenge_${testChallengeId}_completed`);

    // Set challenge data based on loaded state and date
    setChallengeData({
      ...initialChallenge,
      participating: finalParticipating,
      completed: isCompleted,
      userActions
    });
  }, [initialChallenge]);
  
  // Load challenge data once on mount
  useEffect(() => {
    loadChallengeData();
  }, [loadChallengeData]);

  const handleParticipateInChallenge = async (challengeId: number, participating: boolean) => {
    setIsLoading(true);
    
    try {
      // Update localStorage
      localStorage.setItem(`challenge_${challengeId}_participating`, participating.toString());
      
      // Update state
      setChallengeData(prev => ({
        ...prev,
        participating
      }));
      
      // If this is a past challenge and the user didn't participate, mark it as completed but with no points
      const today = new Date();
      const challengeDate = new Date(challengeData.date);
      
      if (!participating && challengeDate < new Date(today.setHours(0, 0, 0, 0))) {
        localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
        setChallengeData(prev => ({
          ...prev,
          completed: true
        }));
      }
      
      toast({
        title: participating ? "Partecipazione confermata" : "Partecipazione annullata",
        description: participating 
          ? "Riceverai una notifica poco prima dell'inizio della sfida" 
          : "Grazie per averci fatto sapere",
      });
      
      // Update user profile if needed
      if (user && !participating) {
        await updateProfile(user.id, {
          streak: 0,  // Reset streak if user is not participating
        });
        
        // Refresh profile to update UI
        if (refreshProfile) {
          await refreshProfile(user.id);
        }
      }
      
    } catch (error) {
      console.error("Error updating participation:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel salvataggio della partecipazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleCompleteChallenge = async (challengeId: number, actionIds: string[]) => {
  //   setIsLoading(true);
    
  //   try {
  //     // Calculate points dynamically from SUSTAINABLE_ACTIONS
  //     const actionsPoints = actionIds.includes('none') ? 0 : actionIds.reduce((sum, actionId) => {
  //         const action = SUSTAINABLE_ACTIONS.find(a => a.id === actionId);
  //         return sum + (action?.pointValue || 0);
  //       }, 0);

  //     // Calculate streak
  //     const currentStreak = parseInt(localStorage.getItem('streak') || '0');
  //     const newStreak = actionsPoints > 0 ? currentStreak + 1 : 0;
  //     const streakBonus = newStreak >= 3 ? 5 : 0;
      
  //     // Total points for this challenge
  //     const totalPoints = actionsPoints + streakBonus;
      
  //     // Update localStorage
  //     localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
  //     localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
  //     localStorage.setItem('streak', newStreak.toString());
      
  //     // Update current totalPoints in localStorage
  //     const currentTotalPoints = parseInt(localStorage.getItem('totalPoints') || '0');
  //     const newTotalPoints = currentTotalPoints + totalPoints;
  //     localStorage.setItem('totalPoints', newTotalPoints.toString());
      
  //     // Update completedChallenges in localStorage
  //     const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0') + 1;
  //     localStorage.setItem('completedChallenges', completedChallenges.toString());
      
  //     // Update state
  //     setChallengeData(prev => ({
  //       ...prev,
  //       completed: true,
  //       userActions: actionIds
  //     }));
      
  //     // Update user profile in the database and locally immediately
  //     if (user) {
  //       console.log("Updating profile after challenge completion with new values:", {
  //         completed_challenges: completedChallenges,
  //         total_points: newTotalPoints,
  //         streak: newStreak
  //       });
        
  //       // Update profile database first
  //       await updateProfile(user.id, {
  //         completed_challenges: completedChallenges,
  //         total_points: newTotalPoints,
  //         streak: newStreak
  //       });
        
  //       // Force refresh profile to update UI immediately
  //       if (refreshProfile) {
  //         console.log("Immediately refreshing profile data to update UI stats");
  //         await refreshProfile(user.id);
  //       }
  //     }
      
  //     toast({
  //       title: "Sfida completata",
  //       description: totalPoints > 0 
  //         ? `Hai guadagnato ${actionsPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!` 
  //         : "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
  //     });
      
  //   } catch (error) {
  //     console.error("Error completing challenge:", error);
  //     toast({
  //       title: "Errore",
  //       description: "Si è verificato un errore nel salvataggio delle azioni",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleCompleteChallenge = async (challengeId: number, actionIds: string[]) => {
    setIsLoading(true);
  
    try {
      // Verifica se la sfida era già stata completata
      const alreadyCompleted = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
  
      if (!alreadyCompleted) {
        // Calcola punti dinamicamente da SUSTAINABLE_ACTIONS
        const actionsPoints = actionIds.includes('none')
          ? 0
          : actionIds.reduce((sum, actionId) => {
              const action = SUSTAINABLE_ACTIONS.find(a => a.id === actionId);
              return sum + (action?.pointValue || 0);
            }, 0);
  
        // Calcola streak
        const currentStreak = parseInt(localStorage.getItem('streak') || '0');
        const newStreak = actionsPoints > 0 ? currentStreak + 1 : 0;
        const streakBonus = newStreak >= 3 ? 5 : 0;
  
        // Punti totali per questa sfida
        const uncappedTotalPoints = actionsPoints + streakBonus;
        const totalPoints = Math.min(uncappedTotalPoints, 300);
  
        // Aggiorna localStorage
        localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
        localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
        localStorage.setItem('streak', newStreak.toString());
  
        // Aggiorna totalPoints
        const currentTotalPoints = parseInt(localStorage.getItem('totalPoints') || '0');
        const newTotalPoints = currentTotalPoints + totalPoints;
        localStorage.setItem('totalPoints', newTotalPoints.toString());
  
        // Aggiorna completedChallenges
        const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0') + 1;
        localStorage.setItem('completedChallenges', completedChallenges.toString());
  
        // Aggiorna stato
        setChallengeData(prev => ({
          ...prev,
          completed: true,
          userActions: actionIds
        }));
  
        // Aggiorna profilo utente
        if (user) {
          await updateProfile(user.id, {
            completed_challenges: completedChallenges,
            total_points: newTotalPoints,
            streak: newStreak
          });
  
          if (refreshProfile) {
            await refreshProfile(user.id);
          }
        }
  
        // toast({
        //   title: "Sfida completata",
        //   description: totalPoints > 0
        //     ? `Hai guadagnato ${actionsPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!`
        //     : "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
        // });
        toast({
          title: "Sfida completata",
          description: totalPoints > 0
            ? `Hai guadagnato ${totalPoints} punti${streakBonus > 0 ? ` (inclusi ${streakBonus} punti bonus per la streak)` : ''}${totalPoints < uncappedTotalPoints ? ' (massimo raggiunto: 300 punti)' : ''}!`
            : "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
        });
      } else {
        // Caso già completato
        toast({
          title: "Sfida già completata",
          description: "Hai già completato questa sfida precedentemente.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel salvataggio delle azioni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  

  return {
    challengeData,
    isLoading,
    handleParticipateInChallenge,
    handleCompleteChallenge,
  };
};
