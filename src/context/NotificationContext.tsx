
import { createContext, useContext, ReactNode } from 'react';
import type { NotificationContextType } from '@/types/notifications';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

// Create the context with undefined as initial value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notificationSystem = useNotificationSystem();
  
  // DEBUG: Log notification system values
  console.log("NotificationProvider rendering with values:", {
    showParticipationModal: notificationSystem.showParticipationModal,
    shouldShowParticipationBox: notificationSystem.shouldShowParticipationBox,
    currentChallengeId: notificationSystem.currentChallengeId
  });
  
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
  
  // DEBUG: Log what's being used from the context
  console.log("useNotifications called, returning context with shouldShowParticipationBox:", 
    context.shouldShowParticipationBox);
  
  return context;
};
