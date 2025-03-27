
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LocationStepProps {
  city: string;
  setCity: (city: string) => void;
}

const LocationStep = ({ city, setCity }: LocationStepProps) => {
  // Handle city input change with debounce
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      // Sanitize input - prevent special characters that might cause issues
      const sanitized = value.replace(/[^\w\s,àèéìòù]/gi, '');
      setCity(sanitized);
    } catch (error) {
      console.error("Error updating city value:", error);
      // Fallback to empty string if there's an error
      setCity('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="city">In quale città vivi?</Label>
        <Input
          id="city"
          placeholder="Es. Milano, Roma, Napoli..."
          value={city || ''}
          onChange={handleCityChange}
          autoFocus
          maxLength={100}
          aria-describedby="city-description"
        />
        <p id="city-description" className="text-sm text-gray-500">
          Utilizziamo questa informazione per personalizzare le tue sfide e calcolare l'impatto ambientale locale.
        </p>
      </div>
    </div>
  );
};

export default LocationStep;
