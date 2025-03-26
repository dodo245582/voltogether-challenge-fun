
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProps {
  step: number;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const StepNavigation = ({ step, isLoading, onPrev, onNext }: StepNavigationProps) => {
  return (
    <div className="flex justify-between pt-2">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={step === 1 || isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
      </Button>
      
      <Button 
        onClick={onNext}
        disabled={isLoading}
        className="bg-voltgreen-600 hover:bg-voltgreen-700"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Elaborazione...
          </span>
        ) : (
          <span className="flex items-center">
            {step < 5 ? "Avanti" : "Completa registrazione"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
};

export default StepNavigation;
