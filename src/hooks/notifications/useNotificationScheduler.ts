
import { useEffect } from 'react';
import { CHALLENGE_DATES } from '@/types';
import { getCurrentChallengeId } from '@/types/notifications';
import { isToday, parseISO, set } from 'date-fns';

export const useNotificationScheduler = (
  createNotification: (type: string, title: string, message: string, challengeId?: number, requiredAction?: boolean) => any,
  notifications: any[]
) => {
  const checkForScheduledNotifications = () => {
    const now = new Date();
    const challengeId = getCurrentChallengeId();
    const todayStr = now.toISOString().split('T')[0];
    
    if (challengeId === null || !CHALLENGE_DATES.includes(todayStr)) return;
    
    const today9AM = new Date(todayStr);
    today9AM.setHours(9, 0, 0, 0);
    
    const today1855 = new Date(todayStr);
    today1855.setHours(18, 55, 0, 0);
    
    const today20 = new Date(todayStr);
    today20.setHours(20, 0, 0, 0);
    
    if (now.getTime() >= today9AM.getTime()) {
      const alreadySentParticipation = notifications.some(n => 
        n.type === 'participation-request' && 
        n.challengeId === challengeId &&
        isToday(parseISO(n.timestamp))
      );
      
      const hasResponded = localStorage.getItem(`challenge_${challengeId}_participating`) !== null;
      
      if (!alreadySentParticipation && !hasResponded) {
        createNotification(
          'participation-request',
          'Sfida di oggi',
          `Parteciperai alla sfida di oggi dalle 19:00 alle 20:00?`,
          challengeId,
          true
        );
      }
    }
    
    if (now.getTime() >= today1855.getTime()) {
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      if (participationResponse === 'true') {
        const alreadySentReminder = notifications.some(n => 
          n.type === 'challenge-reminder' && 
          n.challengeId === challengeId &&
          isToday(parseISO(n.timestamp))
        );
        
        if (!alreadySentReminder) {
          createNotification(
            'challenge-reminder',
            'La sfida sta per iniziare!',
            'Riduci i tuoi consumi per la prossima ora. Ecco qualche consiglio: spegni le luci non necessarie, abbassa il riscaldamento, spegni gli elettrodomestici in standby.',
            challengeId,
            false
          );
        }
      }
    }
    
    if (now.getTime() >= today20.getTime()) {
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      if (participationResponse === 'true') {
        const alreadySentCompletion = notifications.some(n => 
          n.type === 'challenge-completion' && 
          n.challengeId === challengeId &&
          isToday(parseISO(n.timestamp))
        );
        
        const hasCompleted = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
        
        if (!alreadySentCompletion && !hasCompleted) {
          createNotification(
            'challenge-completion',
            'Sfida finita!',
            'Quali azioni hai fatto per ridurre i consumi?',
            challengeId,
            true
          );
        }
      }
    }
  };

  useEffect(() => {
    checkForScheduledNotifications();
    
    const interval = setInterval(() => {
      checkForScheduledNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [notifications]);

  return {
    checkForScheduledNotifications
  };
};
