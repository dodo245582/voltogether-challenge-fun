
import React from 'react';
import StepIndicator from './StepIndicator';
import { User2, MapPin, Radio, ListChecks, CheckCircle2 } from 'lucide-react';

interface StepIndicatorsProps {
  currentStep: number;
}

const StepIndicators = ({ currentStep }: StepIndicatorsProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center relative">
        <StepIndicator 
          number={1} 
          title="Profilo" 
          isActive={currentStep === 1} 
          isCompleted={currentStep > 1} 
          icon={<User2 className="h-5 w-5" />} 
        />
        <StepIndicator 
          number={2} 
          title="Località" 
          isActive={currentStep === 2} 
          isCompleted={currentStep > 2} 
          icon={<MapPin className="h-5 w-5" />} 
        />
        <StepIndicator 
          number={3} 
          title="Scoperta" 
          isActive={currentStep === 3} 
          isCompleted={currentStep > 3} 
          icon={<Radio className="h-5 w-5" />} 
        />
        <StepIndicator 
          number={4} 
          title="Azioni" 
          isActive={currentStep === 4} 
          isCompleted={currentStep > 4} 
          icon={<ListChecks className="h-5 w-5" />} 
        />
        <StepIndicator 
          number={5} 
          title="Conferma" 
          isActive={currentStep === 5} 
          isCompleted={false} 
          icon={<CheckCircle2 className="h-5 w-5" />} 
        />
        
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
      </div>
    </div>
  );
};

export default StepIndicators;
