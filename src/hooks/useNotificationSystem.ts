
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
  const { user, profile, refreshProfile } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<number | null>(null);
  
  // Initialize the current challenge ID
  useEffect(() => {
    const challengeId = getCurrentChallengeId();
    console.log("Current challenge ID:", challengeId);
    setCurrentChallenge(challengeId);
  }, []);
  
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
    console.log("Checking if participation box should show for challenge:", currentChallenge || getCurrentChallengeId());
    return checkShouldShowParticipationBox(currentChallenge || getCurrentChallengeId(), notifications);
  }, [currentChallenge, notifications]);

  const shouldShowCompletionBox = useMemo(() => {
    console.log("Checking if completion box should show for challenge:", currentChallenge || getCurrentChallengeId());
    return checkShouldShowCompletionBox(currentChallenge || getCurrentChallengeId(), notifications);
  }, [currentChallenge, notifications]);
  
  // Check for initial participation notification
  useEffect(() => {
    const challengeId = currentChallenge || getCurrentChallengeId();
    console.log("Scheduling initial notification check for challenge:", challengeId);
    
    if (challengeId !== null) {
      // Set the current challenge ID in the notification manager
      setCurrentChallengeId(challengeId);
      
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      console.log("Initial participation response:", participationResponse);
      
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
  }, [currentChallenge, notifications]);

  return {
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
};
