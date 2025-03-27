
import { set, addDays, format, isAfter, isBefore, parseISO } from 'date-fns';
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
  if (!challengeId) return false;

  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  if (participationResponse !== null) return false; // Already responded

  const now = new Date();
  const today = new Date(now);
  const participationDeadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
  const participationStartTime = set(today, { hours: 9, minutes: 0, seconds: 0 });
  
  return isAfter(now, participationStartTime) && isBefore(now, participationDeadline);
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
  const challengeDay = parseISO(CHALLENGE_DATES[challengeId - 1]);
  const challengeEndTime = set(challengeDay, { hours: 20, minutes: 0, seconds: 0 });

  return isAfter(now, challengeEndTime) && isBefore(now, completionCutoff);
};
