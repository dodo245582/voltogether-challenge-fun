
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock } from 'lucide-react';
import { Challenge, SustainableAction } from '@/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface CompletionBoxProps {
  challenge: Challenge & { start_time: string; end_time: string; action_ids: string[] };
  submittedActions: (actionIds: string[]) => void;
}

const CompletionBox = ({ 
  challenge,
  submittedActions,
}: CompletionBoxProps) => {
  const today = format(new Date(), 'EEEE d MMMM', { locale: it });

  const [selectedCompletionActions, setSelectedCompletionActions] = useState<string[]>([]);

  const handleActionToggle = (actionId: string) => {
    setSelectedCompletionActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((id) => id !== actionId);
      } else {
        if (actionId === 'none') {
          return ['none'];
        }
        return prev.filter((id) => id !== 'none').concat(actionId);
      }
    });
  };

  const handleSubmitCompletionActions = () => {
    console.log('Selected actions:', selectedCompletionActions);
  };

  const getCompletionDeadline = () => {
    const endTime = new Date(challenge.end_time);
    endTime.setHours(endTime.getHours() + 3);
    return format(endTime, 'HH:mm', { locale: it });
  };

  return (
    <Card className="border-voltgreen-200 bg-voltgreen-50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-voltgreen-800">Sfida completata!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-voltgreen-700 mb-4">
          Quali azioni hai fatto oggi per ridurre i consumi energetici?
        </p>
        <div className="bg-white rounded-md p-3 border border-voltgreen-200 mb-4">
          <div className="flex items-center text-amber-800 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">
              Hai tempo per rispondere fino alle {getCompletionDeadline()}!
            </p>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
          {challenge.actions.map((action) => (
            <div key={action.label} className="flex items-center space-x-2">
              <Checkbox 
                id={`dashboard-action-${action.label}`}
                checked={selectedCompletionActions.includes(action.label)}
                onCheckedChange={() => handleActionToggle(action.label)}
              />
              <div>
                <label
                  htmlFor={`dashboard-action-${action.label}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {action.title}
                </label>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-3 mt-3">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="dashboard-action-none"
                checked={selectedCompletionActions.includes('none')}
                onCheckedChange={() => handleActionToggle('none')}
                disabled={selectedCompletionActions.length > 0 && !selectedCompletionActions.includes('none')}
              />
              <label
                htmlFor="dashboard-action-none"
                className="text-sm font-medium text-gray-700"
              >
                Non sono riuscito a partecipare
              </label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={() => submittedActions(selectedCompletionActions)}
          disabled={selectedCompletionActions.length === 0}
          className="w-full bg-voltgreen-600 hover:bg-voltgreen-700"
        >
          Conferma
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompletionBox;
