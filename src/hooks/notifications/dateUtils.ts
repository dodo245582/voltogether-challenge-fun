
import { isToday, parseISO, isBefore, isAfter, set, addDays, format } from 'date-fns';
import { CHALLENGE_DATES } from '@/types';
import { Notification } from '@/types/notifications';

// Check if a notification should still be shown based on its deadline
export const isNotificationValid = (notification: Notification): boolean => {
  if (!notification.deadline) return true;
  
  return isBefore(new Date(), new Date(notification.deadline));
};

// Get the deadline for participation notification
export const getParticipationDeadline = (): string => {
  const now = new Date();
  const deadline = set(now, { hours: 18, minutes: 54, seconds: 0 });
  return format(deadline, 'HH:mm');
};

// Get the deadline for completion notification
export const getCompletionDeadline = (): string => {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const deadline = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
  return format(deadline, 'HH:mm');
};

// Determine if the participation box should be shown
export const shouldShowParticipationBox = (challengeId: number | null, notifications: Notification[]): boolean => {
  console.log("shouldShowParticipationBox called with challengeId:", challengeId);
  
  if (!challengeId) return false;
  
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const challengeDate = CHALLENGE_DATES[challengeId - 1];
  
  // Only show for today's challenge
  if (challengeDate !== today) {
    console.log("shouldShowParticipationBox: Not today's challenge");
    return false;
  }
  
  // Check if it's within the time window (9:00 to 18:54)
  const today9AM = set(now, { hours: 9, minutes: 0, seconds: 0 });
  const today1854 = set(now, { hours: 18, minutes: 54, seconds: 0 });
  
  if (isBefore(now, today9AM) || isAfter(now, today1854)) {
    console.log("shouldShowParticipationBox: Outside time window");
    return false;
  }
  
  // Check if user has already responded
  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  console.log("Participation response from localStorage:", participationResponse);
  
  if (participationResponse !== null) {
    console.log("shouldShowParticipationBox: User already responded with:", participationResponse);
    return false;
  }
  
  // Check if there's a valid participation notification
  const hasTodayParticipationNotification = notifications.some(n => 
    n.type === 'participation-request' && 
    n.challengeId === challengeId &&
    isToday(parseISO(n.timestamp)) &&
    !n.read
  );
  
  console.log("Has today's participation notification:", hasTodayParticipationNotification);
  return hasTodayParticipationNotification;
};

// Determine if the completion box should be shown
export const shouldShowCompletionBox = (challengeId: number | null, notifications: Notification[]): boolean => {
  console.log("Checking if completion box should show for challenge:", challengeId);
  
  if (!challengeId) return false;
  
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const challengeDate = CHALLENGE_DATES[challengeId - 1];
  
  // Check if the challenge is today or yesterday
  const isRelevantChallenge = challengeDate === today;
  
  if (!isRelevantChallenge) {
    console.log("Not today's challenge");
    return false;
  }
  
  // Check if user has participated and not completed
  const participating = localStorage.getItem(`challenge_${challengeId}_participating`) === 'true';
  const completed = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
  
  if (!participating || completed) {
    console.log("User not participating or already completed");
    return false;
  }
  
  // Check if it's after 8PM
  const today20 = set(now, { hours: 20, minutes: 0, seconds: 0 });
  const tomorrow9AM = set(addDays(now, 1), { hours: 9, minutes: 0, seconds: 0 });
  
  if (isBefore(now, today20) || isAfter(now, tomorrow9AM)) {
    console.log("Outside completion time window");
    return false;
  }
  
  // Check if there's a valid completion notification
  const hasTodayCompletionNotification = notifications.some(n => 
    n.type === 'challenge-completion' && 
    n.challengeId === challengeId &&
    isToday(parseISO(n.timestamp)) &&
    !n.read
  );
  
  console.log("Has today's completion notification:", hasTodayCompletionNotification);
  return hasTodayCompletionNotification;
};
