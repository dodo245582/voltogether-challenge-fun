
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import ParticipationModal from './ParticipationModal';
import CompletionModal from './CompletionModal';

/**
 * NotificationModals component handles the rendering and coordination of 
 * participation and completion modals for challenge notifications.
 */
const NotificationModals = () => {
  const { 
    showParticipationModal, 
    showCompletionModal, 
    currentChallengeId,
    respondToParticipation,
    completeChallengeActions,
    dismissParticipationModal,
    dismissCompletionModal,
    markAllRelatedNotificationsAsRead,
    getParticipationDeadline,
    getCompletionDeadline
  } = useNotifications();
  
  const { user, refreshProfile } = useAuth();
  const { updateProfile } = useUserProfile();
  
  // Get previously selected actions from localStorage
  const userSelectedActions = JSON.parse(localStorage.getItem('userSelectedActions') || '[]');
  
  // Handle user participation response
  const handleParticipationResponse = async (challengeId: number, participating: boolean) => {
    await respondToParticipation(challengeId, participating);
    
    if (challengeId) {
      markAllRelatedNotificationsAsRead(challengeId);
    }
    
    if (user && refreshProfile) {
      await refreshProfile(user.id);
    }
  };
  
  // Handle submission of challenge completion actions
  const handleSubmitActions = async (challengeId: number, selectedActions: string[]) => {
    await completeChallengeActions(challengeId, selectedActions);
    
    if (challengeId) {
      markAllRelatedNotificationsAsRead(challengeId);
    }
    
    // Update user profile with new points and challenge completion
    if (user) {
      const pointsPerAction = 10;
      const totalPoints = selectedActions.includes('none') ? 0 : selectedActions.length * pointsPerAction;
      
      // Get current streak from localStorage
      const currentStreak = parseInt(localStorage.getItem('streak') || '0');
      const newStreak = totalPoints > 0 ? currentStreak + 1 : 0;
      const streakBonus = newStreak >= 3 ? 5 : 0;
      
      // Update profile in Supabase
      await updateProfile(user.id, {
        completed_challenges: parseInt(localStorage.getItem('completedChallenges') || '0') + 1,
        total_points: parseInt(localStorage.getItem('totalPoints') || '0') + totalPoints + streakBonus,
        streak: newStreak,
        selected_actions: userSelectedActions
      });
      
      if (refreshProfile) {
        console.log("Refreshing profile after challenge completion via notification");
        await refreshProfile(user.id);
      }
    }
  };
  
  return (
    <>
      <ParticipationModal 
        isOpen={showParticipationModal}
        onClose={dismissParticipationModal}
        onParticipate={handleParticipationResponse}
        challengeId={currentChallengeId}
        getParticipationDeadline={getParticipationDeadline}
        userSelectedActions={userSelectedActions}
      />
      
      <CompletionModal 
        isOpen={showCompletionModal}
        onClose={dismissCompletionModal}
        onComplete={handleSubmitActions}
        challengeId={currentChallengeId}
        getCompletionDeadline={getCompletionDeadline}
        userSelectedActions={userSelectedActions}
      />
    </>
  );
};

export default NotificationModals;
