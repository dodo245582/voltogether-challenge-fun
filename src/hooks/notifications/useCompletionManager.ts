
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useCompletionManager = (
  setShowCompletionModal: (show: boolean) => void,
  markAllRelatedNotificationsAsRead: (challengeId: number) => void
) => {
  const { toast } = useToast();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  
  const completeChallengeActions = useCallback(async (challengeId: number, actionIds: string[]) => {
    localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
    localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
    setShowCompletionModal(false);
    
    markAllRelatedNotificationsAsRead(challengeId);
    
    const pointsPerAction = 10;
    const totalPoints = actionIds.includes('none') ? 0 : actionIds.length * pointsPerAction;
    
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    const newStreak = totalPoints > 0 ? currentStreak + 1 : 0;
    const streakBonus = newStreak >= 3 ? 5 : 0;
    
    localStorage.setItem('streak', newStreak.toString());
    
    const currentPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    const newTotalPoints = currentPoints + totalPoints + streakBonus;
    localStorage.setItem('totalPoints', newTotalPoints.toString());
    
    const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
    localStorage.setItem('completedChallenges', (completedChallenges + 1).toString());
    
    if (user && profile) {
      console.log("Updating profile after challenge completion");
      
      const updatedCompletedChallenges = (profile.completed_challenges || 0) + 1;
      const updatedTotalPoints = (profile.total_points || 0) + totalPoints + streakBonus;
      const updatedStreak = newStreak;
      
      await updateProfile({
        completed_challenges: updatedCompletedChallenges,
        total_points: updatedTotalPoints,
        streak: updatedStreak
      });
      
      if (refreshProfile) {
        console.log("Refreshing profile to update UI stats after challenge completion");
        await refreshProfile(user.id);
      }
    }
    
    if (actionIds.includes('none')) {
      toast({
        title: "Sfida completata",
        description: "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
      });
    } else {
      const pointsPerAction = 10;
      const totalPoints = actionIds.length * pointsPerAction;
      
      const currentStreak = parseInt(localStorage.getItem('streak') || '0');
      const newStreak = totalPoints > 0 ? currentStreak + 1 : 0;
      const streakBonus = newStreak >= 3 ? 5 : 0;
      
      toast({
        title: "Sfida completata",
        description: `Hai guadagnato ${totalPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!`,
      });
    }
  }, [user, profile, updateProfile, refreshProfile, toast, setShowCompletionModal, markAllRelatedNotificationsAsRead]);

  return {
    completeChallengeActions
  };
};
