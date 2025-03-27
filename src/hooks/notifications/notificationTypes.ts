
import { Notification, NotificationType } from '@/types/notifications';
import { User } from '@/types';

export interface NotificationActions {
  createNotification: (
    type: NotificationType,
    title: string,
    message: string,
    challengeId?: number,
    requiredAction?: boolean
  ) => Notification | null;
  markAsRead: (id: string) => void;
  markAllRelatedNotificationsAsRead: (challengeId: number) => void;
}

export interface ParticipationActions {
  respondToParticipation: (challengeId: number, participating: boolean) => Promise<void>;
  dismissParticipationModal: () => void;
  shouldShowParticipationBox: boolean;
  showParticipationModal: boolean;
  getParticipationDeadline: () => string;
}

export interface CompletionActions {
  completeChallengeActions: (challengeId: number, actionIds: string[]) => Promise<void>;
  dismissCompletionModal: () => void;
  shouldShowCompletionBox: boolean;
  showCompletionModal: boolean;
  getCompletionDeadline: () => string;
}

export interface NotificationPermissionActions {
  notificationsEnabled: boolean;
  enableNotifications: () => void;
}
