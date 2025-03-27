
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
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
    
    if (user && refreshProfile) {
      console.log("Refreshing profile after challenge completion via notification");
      await refreshProfile(user.id);
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
