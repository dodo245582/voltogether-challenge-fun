
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useCompletionManager = (
  setShowCompletionModal: (show: boolean) => void,
  markAllRelatedNotificationsAsRead: (challengeId: number) => void
) => {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const { updateProfile } = useUserProfile();
  
  const completeChallengeActions = useCallback(async (challengeId: number, actionIds: string[]) => {
    localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
    localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
    setShowCompletionModal(false);
    
    markAllRelatedNotificationsAsRead(challengeId);
    
    const pointsPerAction = 10;
    const totalPoints = actionIds.includes('none') ? 0 : actionIds.length * pointsPerAction;
    
    // Recupera i valori attuali dal profilo utente o dal localStorage
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    const currentPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
    
    // Calcola i nuovi valori
    const newStreak = totalPoints > 0 ? currentStreak + 1 : 0;
    const streakBonus = newStreak >= 3 ? 5 : 0;    
    const newTotalPoints = currentPoints + totalPoints + streakBonus;
    const newCompletedChallenges = completedChallenges + 1;
    
    // Aggiorna i valori in localStorage
    localStorage.setItem('streak', newStreak.toString());
    localStorage.setItem('totalPoints', newTotalPoints.toString());
    localStorage.setItem('completedChallenges', newCompletedChallenges.toString());
    
    if (user) {
      console.log("Updating profile after challenge completion with immediate values:", {
        completed_challenges: newCompletedChallenges,
        total_points: newTotalPoints,
        streak: newStreak
      });
      
      // Aggiorna il profilo utente nel database
      await updateProfile(user.id, {
        completed_challenges: newCompletedChallenges,
        total_points: newTotalPoints,
        streak: newStreak
      });
      
      if (refreshProfile) {
        console.log("Immediately refreshing profile to update UI stats after challenge completion");
        await refreshProfile(user.id);
      }
    }
    
    if (actionIds.includes('none')) {
      toast({
        title: "Sfida completata",
        description: "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
      });
    } else {
      toast({
        title: "Sfida completata",
        description: `Hai guadagnato ${totalPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!`,
      });
    }
  }, [user, refreshProfile, updateProfile, toast, setShowCompletionModal, markAllRelatedNotificationsAsRead]);

  return {
    completeChallengeActions
  };
};
