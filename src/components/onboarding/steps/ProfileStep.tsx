
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProfileStepProps {
  name: string;
  setName: (name: string) => void;
  instagramAccount: string;
  setInstagramAccount: (account: string) => void;
  areraPortalAccess: boolean | undefined;
  setAreraPortalAccess: (access: boolean) => void;
}

const ProfileStep = ({ 
  name, 
  setName, 
  instagramAccount,
  setInstagramAccount,
  areraPortalAccess,
  setAreraPortalAccess
}: ProfileStepProps) => {
  return (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="instagram">Scrivi il tuo username di Instagram</Label>
        <Input
          id="instagram"
          placeholder="@username (opzionale)"
          value={instagramAccount}
          onChange={(e) => setInstagramAccount(e.target.value)}
          maxLength={30}
        />
        <p className="text-sm text-gray-500">
          Così, se hai interagito con i nostri contenuti, riceverai dei punti aggiuntivi!
        </p>
      </div>

      <div className="space-y-3">
        <Label>
          Per confermare le tue azioni, alla fine del test ti chiederemo di accedere al Portale Consumi ARERA. È un portale pubblico dove puoi visualizzare tutti i tuoi dati di consumo elettrico. Per accedere, è necessario avere lo SPID e la fornitura di energia a proprio nome. Tu li hai, oppure convivi con qualcuno che li ha in possesso?
        </Label>
        <RadioGroup
          value={areraPortalAccess === undefined ? "" : areraPortalAccess ? "yes" : "no"}
          onValueChange={(value) => setAreraPortalAccess(value === "yes")}
          className="flex flex-col space-y-2 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="arera-yes" />
            <Label htmlFor="arera-yes" className="font-normal">Sì</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="arera-no" />
            <Label htmlFor="arera-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default ProfileStep;
