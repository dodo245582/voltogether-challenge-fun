
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Notification, NotificationType } from '@/types/notifications';
import { isNotificationValid } from './dateUtils';
import { useNotificationPermissions } from './useNotificationPermissions';
import { parseISO, isToday, set } from 'date-fns';

export const useNotificationManager = () => {
  const { toast } = useToast();
  const { notificationsEnabled } = useNotificationPermissions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);

  const areNotificationsEnabled = () => {
    return 'Notification' in window && Notification.permission === 'granted';
  };

  const createNotification = (
    type: NotificationType,
    title: string,
    message: string,
    challengeId?: number,
    requiredAction: boolean = false
  ) => {
    let deadline: Date | undefined;
    
    if (type === 'participation-request') {
      const today = new Date();
      deadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
    } else if (type === 'challenge-completion') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      deadline = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
    } else if (type === 'challenge-reminder') {
      const today = new Date();
      deadline = set(today, { hours: 20, minutes: 0, seconds: 0 });
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      challengeId,
      read: false,
      timestamp: new Date().toISOString(),
      requiredAction,
      deadline
    };
    
    if (isNotificationValid(newNotification)) {
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: "default",
      });
      
      if (areNotificationsEnabled()) {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png'
        });
      }
      
      if (type === 'participation-request') {
        setCurrentChallengeId(challengeId || null);
        setShowParticipationModal(true);
      } else if (type === 'challenge-completion') {
        setCurrentChallengeId(challengeId || null);
        setShowCompletionModal(true);
      }
      
      return newNotification;
    }
    
    return null;
  };

  const getValidNotifications = useMemo(() => {
    return notifications.filter(isNotificationValid);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRelatedNotificationsAsRead = (challengeId: number) => {
    console.log(`Marking all notifications related to challenge ${challengeId} as read`);
    setNotifications(prev => 
      prev.map(n => 
        n.challengeId === challengeId ? { ...n, read: true } : n
      )
    );
  };

  const dismissParticipationModal = () => {
    setShowParticipationModal(false);
  };

  const dismissCompletionModal = () => {
    setShowCompletionModal(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(isNotificationValid));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications: getValidNotifications,
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
  };
};
