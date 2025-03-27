
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CHALLENGE_DATES, SUSTAINABLE_ACTIONS } from '@/types';
import type { Notification, NotificationType } from '@/types/notifications';
import { getCurrentChallengeId } from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isToday, parseISO, format, addDays, isAfter, isBefore, set } from 'date-fns';
import { it } from 'date-fns/locale';

export const useNotificationSystem = () => {
  const { toast } = useToast();
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const getParticipationDeadline = (): string => {
    const today = new Date();
    const deadline = set(today, { hours: 18, minutes: 54, seconds: 0 });
    return format(deadline, "HH:mm 'di oggi'", { locale: it });
  };

  const getCompletionDeadline = (): string => {
    const tomorrow = addDays(new Date(), 1);
    const deadline = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
    return format(deadline, "HH:mm 'di domani'", { locale: it });
  };

  // Function to check if a notification is still valid based on its deadline
  const isNotificationValid = (notification: Notification): boolean => {
    // Se la notifica non ha una scadenza, è sempre valida
    if (!notification.deadline) return true;
    
    // Verifica se la notifica è ancora valida rispetto alla sua scadenza
    const now = new Date();
    return isBefore(now, notification.deadline);
  };

  // Funzione per ottenere solo le notifiche valide
  const getValidNotifications = useMemo(() => {
    return notifications.filter(isNotificationValid);
  }, [notifications]);

  const shouldShowParticipationBox = useMemo(() => {
    const challengeId = getCurrentChallengeId();
    if (!challengeId) return false;

    const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
    if (participationResponse !== null) return false; // Already responded

    const now = new Date();
    const participationDeadline = set(now, { hours: 18, minutes: 54, seconds: 0 });

    return isBefore(now, participationDeadline) && isToday(participationDeadline);
  }, [notifications]);

  const shouldShowCompletionBox = useMemo(() => {
    const challengeId = getCurrentChallengeId();
    if (!challengeId) return false;

    const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
    if (participationResponse !== 'true') return false; // Only show if participating

    const completionResponse = localStorage.getItem(`challenge_${challengeId}_completed`);
    if (completionResponse === 'true') return false; // Already completed

    const now = new Date();
    const completionCutoff = set(addDays(new Date(), 1), { hours: 8, minutes: 59, seconds: 0 });
    const challengeDay = parseISO(CHALLENGE_DATES[challengeId - 1]);
    const challengeEndTime = set(challengeDay, { hours: 20, minutes: 0, seconds: 0 });

    return isAfter(now, challengeEndTime) && isBefore(now, completionCutoff);
  }, [notifications]);

  const areNotificationsEnabled = () => {
    return 'Notification' in window && Notification.permission === 'granted';
  };

  const enableNotifications = () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifiche non supportate",
        description: "Il tuo browser non supporta le notifiche push",
        variant: "destructive",
      });
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: "Notifiche attivate",
          description: "Riceverai notifiche per le prossime sfide",
        });
        
        new Notification('VolTogether - Notifiche attivate', {
          body: 'Riceverai notifiche per le prossime sfide di risparmio energetico',
          icon: '/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png'
        });
      } else {
        toast({
          title: "Permesso negato",
          description: "Non possiamo inviarti notifiche senza il tuo permesso",
          variant: "destructive",
        });
      }
    });
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
      const tomorrow = addDays(new Date(), 1);
      deadline = set(tomorrow, { hours: 8, minutes: 59, seconds: 0 });
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
  };

  // Periodicamente filtra le notifiche scadute
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(isNotificationValid));
    }, 60000); // Controlla ogni minuto
    
    return () => clearInterval(interval);
  }, []);

  const checkForScheduledNotifications = () => {
    const now = new Date();
    const challengeId = getCurrentChallengeId();
    const todayStr = now.toISOString().split('T')[0];
    
    if (challengeId === null || !CHALLENGE_DATES.includes(todayStr)) return;
    
    const today9AM = new Date(todayStr);
    today9AM.setHours(9, 0, 0, 0);
    
    const today1855 = new Date(todayStr);
    today1855.setHours(18, 55, 0, 0);
    
    const today20 = new Date(todayStr);
    today20.setHours(20, 0, 0, 0);
    
    const testNow = new Date();
    const today9AMtest = new Date(testNow);
    today9AMtest.setMinutes(today9AMtest.getMinutes() - 2);
    
    const today1855test = new Date(testNow);
    today1855test.setMinutes(today1855test.getMinutes() - 1);
    
    const today20test = new Date(testNow);
    today20test.setMinutes(today20test.getMinutes() - 0.5);
    
    if (now.getTime() >= today9AMtest.getTime()) {
      const alreadySentParticipation = notifications.some(n => 
        n.type === 'participation-request' && 
        n.challengeId === challengeId &&
        isToday(parseISO(n.timestamp))
      );
      
      const hasResponded = localStorage.getItem(`challenge_${challengeId}_participating`) !== null;
      
      if (!alreadySentParticipation && !hasResponded) {
        createNotification(
          'participation-request',
          'Sfida di oggi',
          `Parteciperai alla sfida di oggi dalle 19:00 alle 20:00?`,
          challengeId,
          true
        );
      }
    }
    
    if (now.getTime() >= today1855test.getTime()) {
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      // Only send reminder if user explicitly chose to participate
      if (participationResponse === 'true') {
        const alreadySentReminder = notifications.some(n => 
          n.type === 'challenge-reminder' && 
          n.challengeId === challengeId &&
          isToday(parseISO(n.timestamp))
        );
        
        if (!alreadySentReminder) {
          createNotification(
            'challenge-reminder',
            'La sfida sta per iniziare!',
            'Riduci i tuoi consumi per la prossima ora. Ecco qualche consiglio: spegni le luci non necessarie, abbassa il riscaldamento, spegni gli elettrodomestici in standby.',
            challengeId,
            false
          );
        }
      }
    }
    
    if (now.getTime() >= today20test.getTime()) {
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      // Only send completion notification if user explicitly chose to participate
      if (participationResponse === 'true') {
        const alreadySentCompletion = notifications.some(n => 
          n.type === 'challenge-completion' && 
          n.challengeId === challengeId &&
          isToday(parseISO(n.timestamp))
        );
        
        const hasCompleted = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
        
        if (!alreadySentCompletion && !hasCompleted) {
          createNotification(
            'challenge-completion',
            'Sfida finita!',
            'Quali azioni hai fatto per ridurre i consumi?',
            challengeId,
            true
          );
        }
      }
    }
  };

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

  const respondToParticipation = async (challengeId: number, participating: boolean) => {
    localStorage.setItem(`challenge_${challengeId}_participating`, participating.toString());
    setShowParticipationModal(false);
    
    // Rimuovi immediatamente tutte le notifiche di partecipazione relative a questa sfida
    setNotifications(prev => 
      prev.filter(n => !(n.type === 'participation-request' && n.challengeId === challengeId))
    );
    
    // Segna come lette le altre notifiche relative a questa sfida
    markAllRelatedNotificationsAsRead(challengeId);
    
    if (participating) {
      toast({
        title: "Partecipazione confermata",
        description: "Riceverai una notifica poco prima dell'inizio della sfida",
      });
      
      const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
      localStorage.setItem('completedChallenges', (completedChallenges + 1).toString());
    } else {
      toast({
        title: "Partecipazione annullata",
        description: "Grazie per averci fatto sapere. Ti aspettiamo per la prossima sfida!",
      });
    }
    
    if (user && refreshProfile) {
      await refreshProfile(user.id);
    }
  };

  const completeChallengeActions = async (challengeId: number, actionIds: string[]) => {
    localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
    setShowCompletionModal(false);
    
    // Rimuovi immediatamente tutte le notifiche di completamento relative a questa sfida
    setNotifications(prev => 
      prev.filter(n => !(n.type === 'challenge-completion' && n.challengeId === challengeId))
    );
    
    // Segna come lette le altre notifiche relative a questa sfida
    markAllRelatedNotificationsAsRead(challengeId);
    
    const pointsPerAction = 10;
    const totalPoints = actionIds.includes('none') ? 0 : actionIds.length * pointsPerAction;
    
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    const newStreak = totalPoints > 0 ? currentStreak + 1 : 0;
    const streakBonus = newStreak >= 3 ? 5 : 0;
    
    localStorage.setItem('streak', newStreak.toString());
    
    const currentPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    const newTotalPoints = currentPoints + totalPoints + streakBonus;
    localStorage.setItem('totalPoints', newTotalPoints.toString());
    
    const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
    localStorage.setItem('completedChallenges', (completedChallenges + 1).toString());
    
    localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
    
    if (user && profile) {
      console.log("Updating profile after challenge completion");
      
      const updatedCompletedChallenges = (profile.completed_challenges || 0) + 1;
      const updatedTotalPoints = (profile.total_points || 0) + totalPoints + streakBonus;
      const updatedStreak = newStreak;
      
      await updateProfile({
        completed_challenges: updatedCompletedChallenges,
        total_points: updatedTotalPoints,
        streak: updatedStreak
      });
      
      if (refreshProfile) {
        console.log("Refreshing profile to update UI stats after challenge completion");
        await refreshProfile(user.id);
      }
    }
    
    if (actionIds.includes('none')) {
      toast({
        title: "Sfida completata",
        description: "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
      });
    } else {
      toast({
        title: "Sfida completata",
        description: `Hai guadagnato ${totalPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!`,
      });
    }
  };

  const dismissParticipationModal = () => {
    setShowParticipationModal(false);
  };

  const dismissCompletionModal = () => {
    setShowCompletionModal(false);
  };
  
  useEffect(() => {
    const challengeId = getCurrentChallengeId();
    if (challengeId !== null) {
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      if (participationResponse === null) {
        const alreadySentParticipation = notifications.some(n => 
          n.type === 'participation-request' && 
          n.challengeId === challengeId &&
          isToday(parseISO(n.timestamp))
        );
        
        if (!alreadySentParticipation) {
          createNotification(
            'participation-request',
            'Sfida di oggi',
            `Parteciperai alla sfida di oggi dalle 19:00 alle 20:00?`,
            challengeId,
            true
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    checkForScheduledNotifications();
    
    const interval = setInterval(() => {
      checkForScheduledNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    setNotificationsEnabled(areNotificationsEnabled());
  }, []);

  return {
    // Utilizza getValidNotifications invece di notifications
    notifications: getValidNotifications,
    showParticipationModal,
    showCompletionModal,
    currentChallengeId,
    markAsRead,
    markAllRelatedNotificationsAsRead,
    respondToParticipation,
    completeChallengeActions,
    dismissParticipationModal,
    dismissCompletionModal,
    notificationsEnabled,
    enableNotifications,
    shouldShowParticipationBox,
    shouldShowCompletionBox,
    getParticipationDeadline,
    getCompletionDeadline
  };
};
