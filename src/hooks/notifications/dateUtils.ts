
import { Notification } from '@/types/notifications';
import { isToday, parseISO, set, format, isBefore } from 'date-fns';

export const isNotificationValid = (notification: Notification): boolean => {
  // Check if notification has a deadline and it has passed
  if (notification.deadline && new Date() > notification.deadline) {
    return false;
  }
  
  return true;
};

export const getParticipationDeadline = (): string => {
  const today = new Date();
  const deadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
  return format(deadline, 'HH:mm');
};

export const getCompletionDeadline = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadline = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
  return format(deadline, 'HH:mm');
};

export const shouldShowParticipationBox = (challengeId: number | null, notifications: Notification[]): boolean => {
  if (!challengeId) return false;
  
  console.log("shouldShowParticipationBox called with challengeId:", challengeId);
  
  // Get participation response from localStorage
  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  console.log("Participation response from localStorage:", participationResponse);
  
  // If user already responded, don't show the box
  if (participationResponse !== null) {
    console.log("shouldShowParticipationBox: User already responded with:", participationResponse);
    return false;
  }
  
  // Check if the notification has already been marked as read
  const participationNotification = notifications.find(n => 
    n.type === 'participation-request' && 
    n.challengeId === challengeId &&
    isToday(parseISO(n.timestamp))
  );
  
  if (participationNotification && participationNotification.read) {
    console.log("shouldShowParticipationBox: Notification already read");
    return false;
  }
  
  // Check if we're still in the participation window
  const today = new Date();
  const now = new Date();
  const participationDeadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
  const participationStartTime = set(today, { hours: 9, minutes: 0, seconds: 0 });
  
  const isInParticipationWindow = now >= participationStartTime && now < participationDeadline;
  
  console.log("Is in participation window:", isInParticipationWindow);
  
  return isInParticipationWindow;
};

export const shouldShowCompletionBox = (challengeId: number | null, notifications: Notification[]): boolean => {
  if (!challengeId) return false;
  
  console.log("Checking if completion box should show for challenge:", challengeId);
  
  // Get participation and completion status from localStorage
  const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
  const completionStatus = localStorage.getItem(`challenge_${challengeId}_completed`);
  
  // Only show the completion box if user participated and hasn't completed yet
  if (participationResponse !== 'true' || completionStatus === 'true') {
    return false;
  }
  
  // Check if we're in the completion window (between 20:00 today and 8:59 tomorrow)
  const today = new Date();
  const now = new Date();
  const completionStartTime = set(today, { hours: 20, minutes: 0, seconds: 0 });
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const completionEndTime = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
  
  const isAfterCompletionStart = now >= completionStartTime;
  const isBeforeCompletionEnd = now < completionEndTime;
  
  if (!isAfterCompletionStart || !isBeforeCompletionEnd) {
    console.log("Outside completion time window");
    return false;
  }
  
  // Check if the completion notification exists and has been read
  const completionNotification = notifications.find(n => 
    n.type === 'challenge-completion' && 
    n.challengeId === challengeId &&
    (isToday(parseISO(n.timestamp)) || 
      (parseISO(n.timestamp).getDate() === today.getDate() && 
       parseISO(n.timestamp).getMonth() === today.getMonth() && 
       parseISO(n.timestamp).getFullYear() === today.getFullYear()))
  );
  
  if (completionNotification && completionNotification.read) {
    return false;
  }
  
  return true;
};
