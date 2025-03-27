
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { SUSTAINABLE_ACTIONS } from '@/types';

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParticipate: (challengeId: number, participating: boolean) => Promise<void>;
  challengeId: number | null;
  getParticipationDeadline: () => string;
  userSelectedActions: string[];
}

export const ParticipationModal = ({
  isOpen,
  onClose,
  onParticipate,
  challengeId,
  getParticipationDeadline,
  userSelectedActions
}: ParticipationModalProps) => {
  const recommendedActions = SUSTAINABLE_ACTIONS.slice(0, 3);

  const handleParticipationResponse = async (participating: boolean) => {
    if (challengeId !== null) {
      await onParticipate(challengeId, participating);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          
          <div className="flex items-center p-2 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">
              Hai tempo per rispondere fino alle {getParticipationDeadline()}!
            </p>
          </div>
          
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
          <Button variant="outline" onClick={() => handleParticipationResponse(false)}>
            <XCircle className="mr-2 h-4 w-4" />
            Non parteciperò
          </Button>
          <Button 
            onClick={() => handleParticipationResponse(true)}
            className="bg-voltgreen-600 hover:bg-voltgreen-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Parteciperò
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipationModal;
