
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock } from 'lucide-react';
import { SustainableAction } from '@/types';

interface CompletionBoxProps {
  userActions: SustainableAction[];
  getCompletionDeadline: () => string;
  handleSubmitCompletionActions: () => Promise<void>;
  selectedCompletionActions: string[];
  handleActionToggle: (actionId: string) => void;
}

const CompletionBox = ({ 
  userActions,
  getCompletionDeadline,
  handleSubmitCompletionActions,
  selectedCompletionActions,
  handleActionToggle
}: CompletionBoxProps) => {
  return (
    <Card className="border-voltgreen-200 bg-voltgreen-50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-voltgreen-800">Sfida completata!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-voltgreen-700 mb-4">
          Quali azioni hai fatto per ridurre i consumi energetici?
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
          {userActions.map((action) => (
            <div key={action.id} className="flex items-start space-x-2">
              <Checkbox 
                id={`dashboard-action-${action.id}`}
                checked={selectedCompletionActions.includes(action.id)}
                onCheckedChange={() => handleActionToggle(action.id)}
                disabled={selectedCompletionActions.includes('none')}
              />
              <div>
                <label
                  htmlFor={`dashboard-action-${action.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {action.label}
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
          onClick={handleSubmitCompletionActions}
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
