import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCurrentChallengeId } from '@/types/notifications';
import { parseISO, isToday, isBefore, set, format } from 'date-fns';
import { CHALLENGE_DATES } from '@/types';

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

const ENABLE_LEGACY_NOTIFICATIONS = false;

export const useNotificationSystem = () => {
  console.log("useNotificationSystem hook initializing");
  const { user, profile, refreshProfile } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<number | null>(null);
  const [forceHideParticipationBox, setForceHideParticipationBox] = useState(false);
  
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
  
  const { respondToParticipation: originalRespondToParticipation } = useParticipationManager(
    setShowParticipationModal,
    markAllRelatedNotificationsAsRead
  );
  
  // Wrap the respondToParticipation to also update our local state
  const respondToParticipation = async (challengeId: number, participating: boolean) => {
    setForceHideParticipationBox(true);
    await originalRespondToParticipation(challengeId, participating);
    
    // Immediately update localStorage to ensure UI shows correct state
    localStorage.setItem(`challenge_${challengeId}_participating`, participating.toString());
    
    // If not participating, also mark as completed with no actions
    if (!participating) {
      localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
      localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(['none']));
    }
  };
  
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

    if (!ENABLE_LEGACY_NOTIFICATIONS) return false; // Skip if legacy notifications are disabled

    if (forceHideParticipationBox) {
      console.log("Forcing hide participation box due to user response");
      return false;
    }
    
    // Use the current challenge from state instead of getting it each time
    const activeChallenge = currentChallenge || getCurrentChallengeId();
    console.log("Checking if participation box should show for challenge:", activeChallenge);
    
    // For new users, ensure we don't default to "participating" without asking
    // Check if there's no explicit participation value in localStorage
    const challengeParticipation = localStorage.getItem(`challenge_${activeChallenge}_participating`);
    
    console.log("Challenge participation from localStorage:", challengeParticipation);
    
    // If the user hasn't explicitly responded (null) and we're within participation window,
    // we should show the participation box
    if (challengeParticipation === null) {
      const today = new Date();
      const participationDeadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
      const now = new Date();
      
      // Show participation box if we're before the deadline and it's after 9AM
      if (isBefore(now, participationDeadline) && today.getHours() >= 9) {
        console.log("New user or no participation response yet, showing participation box");
        return true;
      }
    }
    
    return checkShouldShowParticipationBox(activeChallenge, notifications);
  }, [currentChallenge, notifications, forceHideParticipationBox]);

  const shouldShowCompletionBox = useMemo(() => {

    if (!ENABLE_LEGACY_NOTIFICATIONS) return false; // Skip if legacy notifications are disabled

    const activeChallenge = currentChallenge || getCurrentChallengeId();
    console.log("Checking if completion box should show for challenge:", activeChallenge);
    return checkShouldShowCompletionBox(activeChallenge, notifications);
  }, [currentChallenge, notifications]);
  
  // Check for initial participation notification
  useEffect(() => {

    if (!ENABLE_LEGACY_NOTIFICATIONS) return; // Skip if legacy notifications are disabled

    const challengeId = currentChallenge || getCurrentChallengeId();
    console.log("Scheduling initial notification check for challenge:", challengeId);
    
    if (challengeId !== null) {
      // Set the current challenge ID in the notification manager
      setCurrentChallengeId(challengeId);
      
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      console.log("Initial participation response from localStorage:", participationResponse);
      
      // Get today's date in the correct format to compare with challenge dates
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const challengeDate = CHALLENGE_DATES[challengeId - 1];
      
      // Check if this challenge is for today and the current time is after 9AM
      const isCurrentChallenge = challengeDate === todayStr;
      const isAfter9AM = today.getHours() >= 9;
      
      if (participationResponse === null && isCurrentChallenge && isAfter9AM) {
        const now = new Date();
        const participationDeadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
        
        if (isBefore(now, participationDeadline)) {
          const alreadySentParticipation = notifications.some(n => 
            n.type === 'participation-request' && 
            n.challengeId === challengeId &&
            isToday(parseISO(n.timestamp))
          );
          
          if (!alreadySentParticipation) {
            console.log("Creating initial participation notification for today's challenge:", challengeId);
            createNotification(
              'participation-request',
              'Sfida di oggi',
              `Parteciperai alla sfida di oggi dalle 19:00 alle 20:00?`,
              challengeId,
              true
            );
          }
        } else {
          // After the participation deadline, mark as not participating
          console.log("Past participation deadline, marking as not participating");
          localStorage.setItem(`challenge_${challengeId}_participating`, 'false');
          localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
          localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(['none']));
        }
      }
    }
  }, [currentChallenge, notifications, createNotification, setCurrentChallengeId]);

  // Make sure we're checking for scheduled notifications regularly
  useEffect(() => {
    // Initial check
    checkForScheduledNotifications();
    
    // Set up interval for regular checks
    const interval = setInterval(() => {
      checkForScheduledNotifications();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkForScheduledNotifications]);

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
