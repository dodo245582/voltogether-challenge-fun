
import { useEffect, useMemo } from 'react';
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
    const challengeId = getCurrentChallengeId();
    return checkShouldShowParticipationBox(challengeId, notifications);
  }, [notifications]);

  const shouldShowCompletionBox = useMemo(() => {
    const challengeId = getCurrentChallengeId();
    return checkShouldShowCompletionBox(challengeId, notifications);
  }, [notifications]);
  
  // Check for initial participation notification
  useEffect(() => {
    const challengeId = getCurrentChallengeId();
    if (challengeId !== null) {
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
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
  }, []);

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
