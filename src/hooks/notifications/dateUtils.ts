
import { set, addDays, format, isAfter, isBefore, parseISO, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { CHALLENGE_DATES } from '@/types';

export const getParticipationDeadline = (): string => {
  const today = new Date();
  const deadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
  return format(deadline, "HH:mm 'di oggi'", { locale: it });
};

export const getCompletionDeadline = (): string => {
  const tomorrow = addDays(new Date(), 1);
  const deadline = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
  return format(deadline, "HH:mm 'di domani'", { locale: it });
};

export const isNotificationValid = (notification: { deadline?: Date }): boolean => {
  if (!notification.deadline) return true;
  
  const now = new Date();
  return isBefore(now, notification.deadline);
};

export const shouldShowParticipationBox = (
  challengeId: number | null,
  notifications: { type: string; challengeId?: number; timestamp: string }[]
): boolean => {
  if (!challengeId) {
    console.log("shouldShowParticipationBox: No challenge ID provided");
    return false;
  }

  // Check if user has already responded to participation
  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  
  console.log("shouldShowParticipationBox called with challengeId:", challengeId);
  console.log("Participation response from localStorage:", participationResponse);
  
  if (participationResponse !== null) {
    console.log("shouldShowParticipationBox: User already responded with:", participationResponse);
    return false; // Already responded
  }
  
  // Check if this is today's challenge
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const challengeDate = CHALLENGE_DATES[challengeId - 1];
  
  // Only show participation box for today's challenge and if it's after 9:00 AM
  const isCurrentChallenge = challengeDate === todayStr;
  const isAfter9AM = today.getHours() >= 9;
  
  // Check if before 18:54 (participation deadline)
  const participationDeadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
  const isBeforeDeadline = isBefore(today, participationDeadline);
  
  console.log("shouldShowParticipationBox: isCurrentChallenge:", isCurrentChallenge, 
              "isAfter9AM:", isAfter9AM, "isBeforeDeadline:", isBeforeDeadline);
  
  return isCurrentChallenge && isAfter9AM && isBeforeDeadline;
};

export const shouldShowCompletionBox = (
  challengeId: number | null,
  notifications: { type: string; challengeId?: number; timestamp: string }[]
): boolean => {
  if (!challengeId) return false;

  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  if (participationResponse !== 'true') return false; // Only show if participating

  const completionResponse = localStorage.getItem(`challenge_${challengeId}_completed`);
  if (completionResponse === 'true') return false; // Already completed

  const now = new Date();
  const tomorrow = addDays(new Date(), 1);
  const completionCutoff = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
  
  const today = new Date(now);
  const challengeDate = CHALLENGE_DATES[challengeId - 1];
  if (!challengeDate) return false;
  
  const challengeDateTime = parseISO(challengeDate);
  const isTodayOrYesterday = isToday(challengeDateTime) || 
                             (challengeDateTime.getDate() === today.getDate() - 1 && 
                              challengeDateTime.getMonth() === today.getMonth() &&
                              challengeDateTime.getFullYear() === today.getFullYear());
                              
  if (!isTodayOrYesterday) return false;
  
  const challengeEndTime = set(parseISO(challengeDate), { hours: 20, minutes: 0, seconds: 0 });

  return isAfter(now, challengeEndTime) && isBefore(now, completionCutoff);
};
