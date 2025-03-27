import { CHALLENGE_DATES, SUSTAINABLE_ACTIONS } from '@/types';
import { parseISO, isToday, format } from 'date-fns';

// Notification types
export type NotificationType = 
  | 'participation-request'  // Alle 9:00 - Parteciperai alla sfida?
  | 'challenge-reminder'     // Alle 18:55 - La sfida sta per iniziare
  | 'challenge-completion'   // Alle 20:00 - Quali azioni hai fatto?
  | 'custom';                // Altre notifiche personalizzate

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  challengeId?: number;
  actions?: string[];
  read: boolean;
  timestamp: string;
  requiredAction: boolean;
  deadline?: Date; // Added deadline field for time-sensitive notifications
}

export interface NotificationContextType {
  notifications: Notification[];
  showParticipationModal: boolean;
  showCompletionModal: boolean;
  currentChallengeId: number | null;
  markAsRead: (id: string) => void;
  markAllRelatedNotificationsAsRead: (challengeId: number) => void;
  respondToParticipation: (challengeId: number, participating: boolean) => void;
  completeChallengeActions: (challengeId: number, actionIds: string[]) => void;
  dismissParticipationModal: () => void;
  dismissCompletionModal: () => void;
  notificationsEnabled: boolean;
  enableNotifications: () => void;
  // Box visibility control properties
  shouldShowParticipationBox: boolean;
  shouldShowCompletionBox: boolean;
  getParticipationDeadline: () => string;
  getCompletionDeadline: () => string;
}

// For the current challenge
export const getCurrentChallengeId = () => {
  const today = new Date();
  // Use the date in the format YYYY-MM-DD
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Find the index of today's date in the CHALLENGE_DATES array
  const index = CHALLENGE_DATES.indexOf(todayStr);
  
  // If today's date is in the array, return the challenge ID (index + 1)
  // Otherwise, find the next upcoming challenge date
  if (index !== -1) {
    console.log("Found today's date in challenge dates:", todayStr, "index:", index);
    return index + 1;
  } else {
    // Find the next future challenge
    const upcomingIndex = CHALLENGE_DATES.findIndex(date => {
      return parseISO(date) > today;
    });
    
    if (upcomingIndex !== -1) {
      console.log("Found next upcoming challenge date:", CHALLENGE_DATES[upcomingIndex], "index:", upcomingIndex);
      return upcomingIndex + 1;
    } else {
      // If no future challenges, return the last challenge
      const lastIndex = CHALLENGE_DATES.length - 1;
      console.log("No upcoming challenges found, using last challenge:", CHALLENGE_DATES[lastIndex], "index:", lastIndex);
      return lastIndex >= 0 ? lastIndex + 1 : null;
    }
  }
};
