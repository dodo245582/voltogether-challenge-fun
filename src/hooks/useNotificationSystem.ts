
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCurrentChallengeId } from '@/types/notifications';
import { parseISO, isToday, isBefore, set } from 'date-fns';

import { useNotificationManager } from './notifications/useNotificationManager';
import { useParticipationManager } from './notifications/useParticipationManager';
import { useCompletionManager } from './notifications/useCompletionManager';
import { useNotificationScheduler } from './notifications/useNotificationScheduler';
import { useNotificationPermissions } from './notifications/useNotificationPermissions';
import { 
  getParticipationDeadline, 
  getCompletionDeadline, 
  shouldShowParticipationBox as checkShouldShowParticipationBox,
  shouldShowCompletionBox as checkShouldShowCompletionBox
} from './notifications/dateUtils';

export const useNotificationSystem = () => {
  console.log("useNotificationSystem hook initializing");
  const { user, profile, refreshProfile } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<number | null>(null);
  
  const {
    notifications,
    createNotification,
    markAsRead,
    markAllRelatedNotificationsAsRead,
    showParticipationModal,
    setShowParticipationModal,
    showCompletionModal,
    setShowCompletionModal,
    currentChallengeId,
    setCurrentChallengeId,
    dismissParticipationModal,
    dismissCompletionModal
  } = useNotificationManager();
  
  // Initialize the current challenge ID
  useEffect(() => {
    const challengeId = getCurrentChallengeId();
    console.log("Current challenge ID set to:", challengeId);
    setCurrentChallenge(challengeId);
    
    if (challengeId !== null) {
      setCurrentChallengeId(challengeId);
    }
  }, [setCurrentChallengeId]);
  
  const { respondToParticipation } = useParticipationManager(
    setShowParticipationModal,
    markAllRelatedNotificationsAsRead
  );
  
  const { completeChallengeActions } = useCompletionManager(
    setShowCompletionModal,
    markAllRelatedNotificationsAsRead
  );
  
  const { notificationsEnabled, enableNotifications } = useNotificationPermissions();
  
  const { checkForScheduledNotifications } = useNotificationScheduler(
    createNotification,
    notifications
  );
  
  const shouldShowParticipationBox = useMemo(() => {
    // Use the current challenge from state instead of getting it each time
    const activeChallenge = currentChallenge || getCurrentChallengeId();
    console.log("Checking if participation box should show for challenge:", activeChallenge);
    
    // FORCE TRUE FOR TESTING - remove this line in production
    return true;
    
    // Commented out for testing, uncomment in production:
    // return checkShouldShowParticipationBox(activeChallenge, notifications);
  }, [currentChallenge, notifications]);

  const shouldShowCompletionBox = useMemo(() => {
    const activeChallenge = currentChallenge || getCurrentChallengeId();
    console.log("Checking if completion box should show for challenge:", activeChallenge);
    return checkShouldShowCompletionBox(activeChallenge, notifications);
  }, [currentChallenge, notifications]);
  
  // Check for initial participation notification
  useEffect(() => {
    const challengeId = currentChallenge || getCurrentChallengeId();
    console.log("Scheduling initial notification check for challenge:", challengeId);
    
    if (challengeId !== null) {
      // Set the current challenge ID in the notification manager
      setCurrentChallengeId(challengeId);
      
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      console.log("Initial participation response from localStorage:", participationResponse);
      
      if (participationResponse === null) {
        const now = new Date();
        const today = new Date(now);
        const participationDeadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
        
        if (isBefore(now, participationDeadline)) {
          const alreadySentParticipation = notifications.some(n => 
            n.type === 'participation-request' && 
            n.challengeId === challengeId &&
            isToday(parseISO(n.timestamp))
          );
          
          if (!alreadySentParticipation) {
            console.log("Creating initial participation notification for challenge:", challengeId);
            createNotification(
              'participation-request',
              'Sfida di oggi',
              `Parteciperai alla sfida di oggi dalle 19:00 alle 20:00?`,
              challengeId,
              true
            );
          }
        } else {
          localStorage.setItem(`challenge_${challengeId}_participating`, 'false');
          localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
          localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(['none']));
        }
      }
    }
  }, [currentChallenge, notifications, createNotification, setCurrentChallengeId]);

  const notificationSystemContext = {
    notifications,
    showParticipationModal,
    showCompletionModal,
    currentChallengeId,
    markAsRead,
    markAllRelatedNotificationsAsRead,
    respondToParticipation,
    completeChallengeActions,
    dismissParticipationModal,
    dismissCompletionModal,
    notificationsEnabled,
    enableNotifications,
    shouldShowParticipationBox,
    shouldShowCompletionBox,
    getParticipationDeadline,
    getCompletionDeadline
  };

  console.log("useNotificationSystem returning context with shouldShowParticipationBox:", shouldShowParticipationBox);
  return notificationSystemContext;
};
