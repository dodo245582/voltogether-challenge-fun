
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SUSTAINABLE_ACTIONS } from '@/types';

interface ActionsStepProps {
  selectedActions: string[];
  toggleAction: (actionId: string) => void;
}

const ActionsStep = ({ selectedActions, toggleAction }: ActionsStepProps) => {
  return (
    <div className="space-y-4">
      <Label>Seleziona le azioni che saresti disposto a fare:</Label>
      <p className="text-sm text-gray-500 mb-4">
        Puoi selezionare più opzioni. Queste azioni ti verranno suggerite durante le sfide giornaliere.
      </p>
      
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {SUSTAINABLE_ACTIONS.map((action) => (
          <div key={action.id} className="flex items-start space-x-2">
            <Checkbox
              id={action.id}
              checked={selectedActions.includes(action.id)}
              onCheckedChange={() => toggleAction(action.id)}
            />
            <div className="grid gap-1">
              <Label
                htmlFor={action.id}
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {action.label}
              </Label>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionsStep;
