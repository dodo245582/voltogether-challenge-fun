
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNotificationPermissions = () => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
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

  useEffect(() => {
    setNotificationsEnabled(areNotificationsEnabled());
  }, []);

  return {
    notificationsEnabled,
    enableNotifications
  };
};
