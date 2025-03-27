
import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProfileStepProps {
  name: string;
  setName: (name: string) => void;
}

// Using memo to prevent unnecessary re-renders
const ProfileStep = memo(({ name, setName }: ProfileStepProps) => {
  // Define onChange handler outside of render to avoid recreating on each render
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Il tuo nome</Label>
        <Input
          id="name"
          placeholder="Inserisci il tuo nome"
          value={name}
          onChange={handleChange}
          autoFocus
          required
          maxLength={50}
        />
        <p className="text-sm text-gray-500">
          Utilizzeremo il tuo nome per personalizzare l'esperienza nella piattaforma.
        </p>
      </div>
    </div>
  );
});

ProfileStep.displayName = 'ProfileStep';

export default ProfileStep;
