
import { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { SUSTAINABLE_ACTIONS } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const NotificationModals = () => {
  const { 
    showParticipationModal, 
    showCompletionModal, 
    currentChallengeId,
    respondToParticipation,
    completeChallengeActions,
    dismissParticipationModal,
    dismissCompletionModal,
    markAllRelatedNotificationsAsRead
  } = useNotifications();
  
  const { user, refreshProfile } = useAuth();
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  
  // Reset selected actions when modal opens
  useEffect(() => {
    if (showCompletionModal) {
      setSelectedActions([]);
    }
  }, [showCompletionModal]);
  
  // Ottieni le azioni selezionate dall'utente in fase di registrazione
  const userSelectedActions = JSON.parse(localStorage.getItem('userSelectedActions') || '[]');
  
  // Ottieni tutte le azioni disponibili selezionate dall'utente
  const availableActions = SUSTAINABLE_ACTIONS.filter(action => 
    userSelectedActions.includes(action.id)
  );
  
  // Ottieni azioni consigliate (non selezionate dall'utente)
  const recommendedActions = SUSTAINABLE_ACTIONS.filter(action => 
    !userSelectedActions.includes(action.id)
  ).slice(0, 3);
  
  // Combina le azioni per la visualizzazione
  const allActions = [...availableActions, ...recommendedActions.slice(0, 3 - Math.min(3, availableActions.length))];
  
  const handleActionToggle = (actionId: string) => {
    if (actionId === 'none') {
      // Se seleziono "non sono riuscito a partecipare", deseleziono tutte le altre opzioni
      setSelectedActions(['none']);
    } else {
      // Se seleziono un'altra opzione, deseleziono "non sono riuscito a partecipare"
      setSelectedActions(prev => {
        if (prev.includes('none')) {
          return [actionId];
        }
        return prev.includes(actionId)
          ? prev.filter(id => id !== actionId)
          : [...prev, actionId];
      });
    }
  };
  
  const handleSubmitActions = async () => {
    if (currentChallengeId !== null) {
      await completeChallengeActions(currentChallengeId, selectedActions);
      
      // Mark all related notifications as read
      if (currentChallengeId) {
        markAllRelatedNotificationsAsRead(currentChallengeId);
      }
      
      // Forza l'aggiornamento del profilo per aggiornare l'UI
      if (user && refreshProfile) {
        console.log("Refreshing profile after challenge completion via notification");
        await refreshProfile(user.id);
      }
    }
  };

  const handleParticipationResponse = async (challengeId: number, participating: boolean) => {
    await respondToParticipation(challengeId, participating);
    
    // Mark all related notifications as read
    if (challengeId) {
      markAllRelatedNotificationsAsRead(challengeId);
    }
  };
  
  return (
    <>
      {/* Modal per la richiesta di partecipazione */}
      <Dialog open={showParticipationModal} onOpenChange={dismissParticipationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Parteciperai alla sfida di oggi?</DialogTitle>
            <DialogDescription>
              Oggi dalle 19:00 alle 20:00 riduci i tuoi consumi energetici e partecipa alla sfida!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-gray-600">
              Partecipando alla sfida contribuirai a ridurre l'impatto ambientale e guadagnerai punti per ogni azione sostenibile.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md border">
              <h4 className="font-medium text-sm mb-2">Azioni consigliate:</h4>
              <ul className="text-sm space-y-1.5">
                {(userSelectedActions.length > 0 ? 
                  SUSTAINABLE_ACTIONS.filter(action => userSelectedActions.includes(action.id)) : 
                  recommendedActions
                ).slice(0, 3).map(action => (
                  <li key={action.id} className="flex items-start gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{action.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => handleParticipationResponse(currentChallengeId || 0, false)}>
              <XCircle className="mr-2 h-4 w-4" />
              Non parteciperò
            </Button>
            <Button 
              onClick={() => handleParticipationResponse(currentChallengeId || 0, true)}
              className="bg-voltgreen-600 hover:bg-voltgreen-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Parteciperò
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal per il completamento della sfida */}
      <Dialog open={showCompletionModal} onOpenChange={dismissCompletionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sfida completata!</DialogTitle>
            <DialogDescription>
              Quali azioni hai fatto per ridurre i consumi energetici?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {allActions.map((action) => (
                <div key={action.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`action-${action.id}`}
                    checked={selectedActions.includes(action.id)}
                    onCheckedChange={() => handleActionToggle(action.id)}
                    disabled={selectedActions.includes('none')}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor={`action-${action.id}`}
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      {action.label}
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">+10 punti</Badge>
                    </label>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="action-none"
                    checked={selectedActions.includes('none')}
                    onCheckedChange={() => handleActionToggle('none')}
                    disabled={selectedActions.length > 0 && !selectedActions.includes('none')}
                  />
                  <div className="grid gap-1">
                    <label
                      htmlFor="action-none"
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Non sono riuscito a partecipare
                    </label>
                    <p className="text-sm text-gray-500">Nessun punto guadagnato, ma grazie per l'onestà!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleSubmitActions}
              disabled={selectedActions.length === 0}
              className="bg-voltgreen-600 hover:bg-voltgreen-700"
            >
              Conferma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationModals;
