
import { CHALLENGE_DATES, SUSTAINABLE_ACTIONS } from '@/types';

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
}

// For the current challenge
export const getCurrentChallengeId = () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const index = CHALLENGE_DATES.indexOf(todayStr);
  return index !== -1 ? index + 1 : null;
};
