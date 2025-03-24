
import { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { SUSTAINABLE_ACTIONS } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

export const NotificationModals = () => {
  const { 
    showParticipationModal, 
    showCompletionModal, 
    currentChallengeId,
    respondToParticipation,
    completeChallengeActions,
    dismissParticipationModal,
    dismissCompletionModal
  } = useNotifications();
  
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  
  // Reset selected actions when modal opens
  useEffect(() => {
    if (showCompletionModal) {
      setSelectedActions([]);
    }
  }, [showCompletionModal]);
  
  // Ottieni le azioni selezionate dall'utente in fase di registrazione
  const userSelectedActions = JSON.parse(localStorage.getItem('userSelectedActions') || '[]');
  
  // Ottieni tutte le azioni disponibili
  const availableActions = SUSTAINABLE_ACTIONS.filter(action => 
    userSelectedActions.includes(action.id)
  );
  
  // Ottieni azioni consigliate (non selezionate dall'utente)
  const recommendedActions = SUSTAINABLE_ACTIONS.filter(action => 
    !userSelectedActions.includes(action.id)
  ).slice(0, 3);
  
  // Combina le azioni per la visualizzazione
  const allActions = [...availableActions, ...recommendedActions];
  
  const handleActionToggle = (actionId: string) => {
    setSelectedActions(prev => 
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };
  
  const handleSubmitActions = () => {
    if (currentChallengeId !== null) {
      completeChallengeActions(currentChallengeId, selectedActions);
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
                {recommendedActions.slice(0, 3).map(action => (
                  <li key={action.id} className="flex items-start gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{action.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => respondToParticipation(currentChallengeId || 0, false)}>
              <XCircle className="mr-2 h-4 w-4" />
              Non parteciperò
            </Button>
            <Button onClick={() => respondToParticipation(currentChallengeId || 0, true)}>
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
                    onCheckedChange={() => {
                      setSelectedActions(['none']); // Reset and only select 'none'
                    }}
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
