import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Notification, NotificationType } from '@/types/notifications';
import { isNotificationValid } from './dateUtils';
import { useNotificationPermissions } from './useNotificationPermissions';
import { parseISO, isToday, set } from 'date-fns';
import { useLocation } from 'react-router-dom';

export const useNotificationManager = () => {
  const { toast } = useToast();
  const { notificationsEnabled } = useNotificationPermissions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

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
    console.log(`Creating notification of type ${type} for challenge ${challengeId}`);
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
      console.log('Adding valid notification:', newNotification);
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: "default",
      });
      
      if (areNotificationsEnabled()) {
        new window.Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png'
        });
      }
      
      // Only show modals if we're on the dashboard
      if (isDashboard) {
        if (type === 'participation-request') {
          console.log('Setting participation modal to show');
          setCurrentChallengeId(challengeId || null);
          setShowParticipationModal(true);
          
          // Also ensure the value in localStorage is undefined (not false)
          // This ensures the challenge card shows "In attesa" instead of "Partecipi"
          if (challengeId) {
            const currentValue = localStorage.getItem(`challenge_${challengeId}_participating`);
            if (currentValue === null) {
              // Don't set anything - keep it undefined
              console.log(`Keeping participation for challenge ${challengeId} as undefined`);
            }
          }
        } else if (type === 'challenge-completion') {
          console.log('Setting completion modal to show');
          setCurrentChallengeId(challengeId || null);
          setShowCompletionModal(true);
        }
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
    showCompletionBox: showCompletionModal && isDashboard,
    showCompletionModal,
    setShowCompletionModal,
    showParticipationBox: showParticipationModal && isDashboard,
    currentChallengeId,
    setCurrentChallengeId,
    dismissParticipationModal,
    dismissCompletionModal
  };
};
