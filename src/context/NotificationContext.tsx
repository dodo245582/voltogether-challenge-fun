import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, parseISO, isToday, isBefore, isAfter, addHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { CHALLENGE_DATES, SUSTAINABLE_ACTIONS } from '@/types';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Notification types
type NotificationType = 
  | 'participation-request'  // Alle 9:00 - Parteciperai alla sfida?
  | 'challenge-reminder'     // Alle 18:55 - La sfida sta per iniziare
  | 'challenge-completion'   // Alle 20:00 - Quali azioni hai fatto?
  | 'custom';                // Altre notifiche personalizzate

interface Notification {
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

interface NotificationContextType {
  notifications: Notification[];
  showParticipationModal: boolean;
  showCompletionModal: boolean;
  currentChallengeId: number | null;
  markAsRead: (id: string) => void;
  respondToParticipation: (challengeId: number, participating: boolean) => void;
  completeChallengeActions: (challengeId: number, actionIds: string[]) => void;
  dismissParticipationModal: () => void;
  dismissCompletionModal: () => void;
  notificationsEnabled: boolean;
  enableNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// For the current challenge
const getCurrentChallengeId = () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const index = CHALLENGE_DATES.indexOf(todayStr);
  return index !== -1 ? index + 1 : null;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Funzione per controllare se le notifiche sono abilitate nel browser
  const areNotificationsEnabled = () => {
    return 'Notification' in window && Notification.permission === 'granted';
  };

  // Richiedi permesso notifiche
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
        
        // Demo notification
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

  // Funzione per creare notifiche
  const createNotification = (type: NotificationType, title: string, message: string, challengeId?: number, requiredAction: boolean = false) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      challengeId,
      read: false,
      timestamp: new Date().toISOString(),
      requiredAction
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostro toast per tutte le notifiche
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: "default",
    });
    
    // Mostro notifica push se abilitate
    if (areNotificationsEnabled()) {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png'
      });
    }
    
    // Mostro modal appropriata se richiesto
    if (type === 'participation-request') {
      setCurrentChallengeId(challengeId || null);
      setShowParticipationModal(true);
    } else if (type === 'challenge-completion') {
      setCurrentChallengeId(challengeId || null);
      setShowCompletionModal(true);
    }
    
    return newNotification;
  };
  
  // Verifica immediata delle notifiche all'avvio
  useEffect(() => {
    const challengeId = getCurrentChallengeId();
    if (challengeId !== null) {
      // Verifica se l'utente ha già risposto alla partecipazione per questa sfida
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      // Se non ha ancora risposto, mostra la notifica di partecipazione
      if (participationResponse === null) {
        // Verifica se abbiamo già inviato questa notifica oggi per evitare duplicati
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

  // Controlla e crea notifiche appropriate in base all'ora del giorno
  const checkForScheduledNotifications = () => {
    const now = new Date();
    const challengeId = getCurrentChallengeId();
    const todayStr = now.toISOString().split('T')[0];
    
    if (challengeId === null || !CHALLENGE_DATES.includes(todayStr)) return;
    
    // Crea oggetti Date per i momenti chiave
    const today9AM = new Date(todayStr);
    today9AM.setHours(9, 0, 0, 0);
    
    const today1855 = new Date(todayStr);
    today1855.setHours(18, 55, 0, 0);
    
    const today20 = new Date(todayStr);
    today20.setHours(20, 0, 0, 0);
    
    // Imposta orari per testing - REMOVE IN PRODUCTION
    // For testing purposes, we're setting times closer to now
    const testNow = new Date();
    const today9AMtest = new Date(testNow);
    today9AMtest.setMinutes(today9AMtest.getMinutes() - 2); // 2 minutes ago
    
    const today1855test = new Date(testNow);
    today1855test.setMinutes(today1855test.getMinutes() - 1); // 1 minute ago
    
    const today20test = new Date(testNow);
    today20test.setMinutes(today20test.getMinutes() - 0.5); // 30 seconds ago
    
    // Se ora attuale è dopo le 9:00
    // if (now.getTime() >= today9AM.getTime()) {
    if (now.getTime() >= today9AMtest.getTime()) { // FOR TESTING
      // Controlla se abbiamo già inviato questa notifica oggi
      const alreadySentParticipation = notifications.some(n => 
        n.type === 'participation-request' && 
        n.challengeId === challengeId &&
        isToday(parseISO(n.timestamp))
      );
      
      // Controlla se l'utente ha già risposto alla richiesta di partecipazione
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
    
    // Se ora attuale è dopo le 18:55
    // if (now.getTime() >= today1855.getTime()) {
    if (now.getTime() >= today1855test.getTime()) { // FOR TESTING
      // Controlla se l'utente ha accettato di partecipare
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      if (participationResponse === 'true') {
        // Controlla se abbiamo già inviato questa notifica oggi
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
    
    // Se ora attuale è dopo le 20:00
    // if (now.getTime() >= today20.getTime()) {
    if (now.getTime() >= today20test.getTime()) { // FOR TESTING
      // Controlla se l'utente ha accettato di partecipare
      const participationResponse = localStorage.getItem(`challenge_${challengeId}_participating`);
      
      if (participationResponse === 'true') {
        // Controlla se abbiamo già inviato questa notifica oggi
        const alreadySentCompletion = notifications.some(n => 
          n.type === 'challenge-completion' && 
          n.challengeId === challengeId &&
          isToday(parseISO(n.timestamp))
        );
        
        // Controlla se la sfida è già stata completata
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

  // Controlla le notifiche ogni 30 secondi
  useEffect(() => {
    checkForScheduledNotifications(); // Controlla subito
    
    const interval = setInterval(() => {
      checkForScheduledNotifications();
    }, 30000); // Controlla ogni 30 secondi
    
    return () => clearInterval(interval);
  }, [notifications]);

  // Controlla se le notifiche erano state già abilitate
  useEffect(() => {
    setNotificationsEnabled(areNotificationsEnabled());
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const respondToParticipation = async (challengeId: number, participating: boolean) => {
    // Salva la risposta
    localStorage.setItem(`challenge_${challengeId}_participating`, participating.toString());
    
    // Chiudi il modal
    setShowParticipationModal(false);
    
    // Aggiorna lo stato delle notifiche relative a questa sfida
    setNotifications(prev => 
      prev.map(n => 
        n.challengeId === challengeId && n.type === 'participation-request'
          ? { ...n, read: true }
          : n
      )
    );
    
    // Messaggio di conferma
    if (participating) {
      toast({
        title: "Partecipazione confermata",
        description: "Riceverai una notifica poco prima dell'inizio della sfida",
      });
      
      // Incrementa il contatore delle sfide partecipate
      const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
      localStorage.setItem('completedChallenges', (completedChallenges + 1).toString());
    } else {
      toast({
        title: "Partecipazione annullata",
        description: "Grazie per averci fatto sapere. Ti aspettiamo per la prossima sfida!",
      });
    }

    // Refresh profile data to update UI
    if (user) {
      await refreshProfile(user.id);
    }
  };

  const completeChallengeActions = async (challengeId: number, actionIds: string[]) => {
    // Salva le azioni completate
    localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
    
    // Chiudi il modal
    setShowCompletionModal(false);
    
    // Aggiorna lo stato delle notifiche relative a questa sfida
    setNotifications(prev => 
      prev.map(n => 
        n.challengeId === challengeId && n.type === 'challenge-completion'
          ? { ...n, read: true }
          : n
      )
    );
    
    // Calcola punti
    const pointsPerAction = 10;
    const totalNewPoints = actionIds.includes('none') ? 0 : actionIds.length * pointsPerAction;
    
    // Determina se l'utente ha una streak
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    const newStreak = totalNewPoints > 0 ? currentStreak + 1 : 0; // Reset streak if no points earned
    const streakBonus = newStreak >= 3 ? 5 : 0;
    
    // Salva lo streak
    localStorage.setItem('streak', newStreak.toString());
    
    // Aggiorna punti totali
    const currentPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    const newTotalPoints = currentPoints + totalNewPoints + streakBonus;
    localStorage.setItem('totalPoints', newTotalPoints.toString());
    
    // Aggiorna il contatore delle sfide completate
    const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
    localStorage.setItem('completedChallenges', (completedChallenges + 1).toString());
    
    // Segna la sfida come completata
    localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
    
    // Update user profile in database
    if (user && profile) {
      console.log("Updating profile after challenge completion");
      
      // Calculate new values
      const updatedCompletedChallenges = (profile.completed_challenges || 0) + 1;
      const updatedTotalPoints = (profile.total_points || 0) + totalNewPoints + streakBonus;
      const updatedStreak = newStreak;
      
      // Update profile in database
      await updateProfile({
        completed_challenges: updatedCompletedChallenges,
        total_points: updatedTotalPoints,
        streak: updatedStreak
      });
      
      // Refresh profile to ensure UI is updated
      await refreshProfile(user.id);
    }
    
    // Messaggio di conferma
    if (actionIds.includes('none')) {
      toast({
        title: "Sfida completata",
        description: "Grazie per la tua onestà! Ti aspettiamo alla prossima sfida.",
      });
    } else {
      toast({
        title: "Sfida completata",
        description: `Hai guadagnato ${totalNewPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!`,
      });
    }
  };

  const dismissParticipationModal = () => {
    setShowParticipationModal(false);
  };

  const dismissCompletionModal = () => {
    setShowCompletionModal(false);
  };
  
  const value = {
    notifications,
    showParticipationModal,
    showCompletionModal,
    currentChallengeId,
    markAsRead,
    respondToParticipation,
    completeChallengeActions,
    dismissParticipationModal,
    dismissCompletionModal,
    notificationsEnabled,
    enableNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
