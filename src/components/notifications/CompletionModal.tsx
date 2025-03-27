
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { SUSTAINABLE_ACTIONS } from '@/types';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (challengeId: number, actionIds: string[]) => Promise<void>;
  challengeId: number | null;
  getCompletionDeadline: () => string;
  userSelectedActions: string[];
}

export const CompletionModal = ({
  isOpen,
  onClose,
  onComplete,
  challengeId,
  getCompletionDeadline,
  userSelectedActions
}: CompletionModalProps) => {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedActions([]);
    }
  }, [isOpen]);
  
  const availableActions = SUSTAINABLE_ACTIONS.filter(action => 
    userSelectedActions.includes(action.id)
  );
  
  const recommendedActions = SUSTAINABLE_ACTIONS.filter(action => 
    !userSelectedActions.includes(action.id)
  ).slice(0, 3);
  
  const allActions = [...availableActions, ...recommendedActions.slice(0, 3 - Math.min(3, availableActions.length))];
  
  const handleActionToggle = (actionId: string) => {
    if (actionId === 'none') {
      setSelectedActions(['none']);
    } else {
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
    if (challengeId !== null) {
      await onComplete(challengeId, selectedActions);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sfida completata!</DialogTitle>
          <DialogDescription>
            Quali azioni hai fatto per ridurre i consumi energetici?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center p-2 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">
              Hai tempo per rispondere fino alle {getCompletionDeadline()}!
            </p>
          </div>
          
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
  );
};

export default CompletionModal;
