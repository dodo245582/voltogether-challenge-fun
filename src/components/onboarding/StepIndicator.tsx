
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  number: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  icon: React.ReactNode;
}

const StepIndicator = ({ number, title, isActive, isCompleted, icon }: StepIndicatorProps) => {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-full 
        ${isActive ? 'bg-voltgreen-600 text-white' : ''}
        ${isCompleted ? 'bg-voltgreen-100 text-voltgreen-600 border-2 border-voltgreen-500' : ''}
        ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
        transition-all duration-300
      `}>
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          icon
        )}
      </div>
      <div className={`
        text-xs font-medium mt-2
        ${isActive ? 'text-voltgreen-600' : ''}
        ${isCompleted ? 'text-voltgreen-600' : ''}
        ${!isActive && !isCompleted ? 'text-gray-400' : ''}
      `}>
        {title}
      </div>
    </div>
  );
};

export default StepIndicator;
