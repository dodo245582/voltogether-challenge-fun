
import { Notification } from '@/types/notifications';
import { parseISO, isToday, isBefore, set, isAfter, format } from 'date-fns';

export const isNotificationValid = (notification: Notification): boolean => {
  // If no deadline is specified, the notification is always valid
  if (!notification.deadline) {
    return true;
  }
  
  // Check if the current time is before the deadline
  const now = new Date();
  const deadline = new Date(notification.deadline);
  
  return isBefore(now, deadline);
};

// Formats the time deadline for participation notification
export const getParticipationDeadline = () => {
  return '18:54';
};

// Formats the time deadline for completion notification
export const getCompletionDeadline = () => {
  return '08:59 di domani';
};

export const shouldShowParticipationBox = (challengeId: number | null, notifications: Notification[]) => {
  console.log("shouldShowParticipationBox called with challengeId:", challengeId);
  
  if (!challengeId) return false;
  
  // Check if user has already responded to participation for this challenge
  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  console.log("Participation response from localStorage:", participationResponse);
  
  if (participationResponse !== null) {
    console.log("shouldShowParticipationBox: User already responded with:", participationResponse);
    return false;
  }
  
  // Check if the current time is after 9:00 AM and before 18:54
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const participationStart = set(today, { hours: 9, minutes: 0, seconds: 0 });
  const participationEnd = set(today, { hours: 18, minutes: 54, seconds: 0 });
  
  // On the day of the challenge, between 9:00 and 18:54, and user hasn't responded
  if (isAfter(now, participationStart) && isBefore(now, participationEnd) && isToday(today)) {
    console.log("shouldShowParticipationBox: Within participation response window");
    // Return true only if there's a today's participation notification that requires action
    const hasNotificationRequiringAction = notifications.some(n => 
      n.type === 'participation-request' && 
      n.challengeId === challengeId && 
      isToday(parseISO(n.timestamp)) && 
      n.requiredAction && 
      !n.read
    );
    
    return hasNotificationRequiringAction;
  }
  
  return false;
};

export const shouldShowCompletionBox = (challengeId: number | null, notifications: Notification[]) => {
  if (!challengeId) return false;
  
  // Check if user has already completed this challenge
  const challengeCompleted = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
  if (challengeCompleted) return false;
  
  // Check if user is participating in this challenge
  const isParticipating = localStorage.getItem(`challenge_${challengeId}_participating`) === 'true';
  if (!isParticipating) return false;
  
  // Check if the current time is after 20:00 and before 08:59 of the next day
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completionStart = set(today, { hours: 20, minutes: 0, seconds: 0 });
  const tomorrowEnd = set(new Date(today.getTime() + 86400000), { hours: 8, minutes: 59, seconds: 0 });
  
  // After 20:00 today and before 08:59 tomorrow, user is participating but hasn't completed
  if (isAfter(now, completionStart) && isBefore(now, tomorrowEnd)) {
    // Return true only if there's a completion notification that requires action
    const hasNotificationRequiringAction = notifications.some(n => 
      n.type === 'challenge-completion' && 
      n.challengeId === challengeId && 
      n.requiredAction && 
      !n.read &&
      isAfter(parseISO(n.timestamp), completionStart)
    );
    
    return hasNotificationRequiringAction;
  }
  
  return false;
};
