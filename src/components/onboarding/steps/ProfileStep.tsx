
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProfileStepProps {
  name: string;
  setName: (name: string) => void;
}

const ProfileStep = ({ name, setName }: ProfileStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Il tuo nome</Label>
        <Input
          id="name"
          placeholder="Inserisci il tuo nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
};

export default ProfileStep;
