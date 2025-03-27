
import { createContext, useContext, ReactNode } from 'react';
import type { NotificationContextType } from '@/types/notifications';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

// Create the context with undefined as initial value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notificationSystem = useNotificationSystem();
  
  return (
    <NotificationContext.Provider value={notificationSystem}>
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
