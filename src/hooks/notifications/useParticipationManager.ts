
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { CHALLENGE_DATES } from '@/types';

export const useParticipationManager = (
  setShowParticipationModal: (show: boolean) => void,
  markAllRelatedNotificationsAsRead: (challengeId: number) => void
) => {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  
  const respondToParticipation = useCallback(async (challengeId: number, participating: boolean) => {
    localStorage.setItem(`challenge_${challengeId}_participating`, participating.toString());
    setShowParticipationModal(false);
    
    markAllRelatedNotificationsAsRead(challengeId);
    
    if (!participating) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const challengeDate = CHALLENGE_DATES[challengeId - 1];
      
      if (challengeDate <= todayStr) {
        localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
        localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(['none']));
      }
    }
    
    if (participating) {
      toast({
        title: "Partecipazione confermata",
        description: "Riceverai una notifica poco prima dell'inizio della sfida",
      });
    } else {
      toast({
        title: "Partecipazione annullata",
        description: "Grazie per averci fatto sapere. Ti aspettiamo per la prossima sfida!",
      });
    }
    
    if (user && refreshProfile) {
      await refreshProfile(user.id);
    }
  }, [user, refreshProfile, toast, setShowParticipationModal, markAllRelatedNotificationsAsRead]);

  return {
    respondToParticipation
  };
};
