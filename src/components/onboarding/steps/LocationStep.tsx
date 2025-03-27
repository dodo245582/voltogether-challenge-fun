
import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LocationStepProps {
  city: string;
  setCity: (city: string) => void;
}

// Using memo to prevent unnecessary re-renders with a custom comparison function
const LocationStep = memo(
  ({ city, setCity }: LocationStepProps) => {
    // Define onChange handler outside of render to avoid recreating on each render
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCity(e.target.value);
    };
    
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
