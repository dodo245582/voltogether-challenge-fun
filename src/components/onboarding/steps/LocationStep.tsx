
import React, { memo, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LocationStepProps {
  city: string;
  setCity: (city: string) => void;
}

// Using memo with useCallback to ensure maximum efficiency
const LocationStep = memo(
  ({ city, setCity }: LocationStepProps) => {
    // Use useCallback to prevent recreating function on each render
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setCity(e.target.value);
    }, [setCity]);
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">In quale città vivi?</Label>
          <Input
            id="city"
            placeholder="Es. Milano, Roma, Napoli..."
            value={city}
            onChange={handleChange}
            maxLength={50}
          />
          <p className="text-sm text-gray-500">
            Utilizziamo questa informazione per personalizzare le tue sfide.
          </p>
        </div>
      </div>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return prevProps.city === nextProps.city;
  }
);

LocationStep.displayName = 'LocationStep';

export default LocationStep;
