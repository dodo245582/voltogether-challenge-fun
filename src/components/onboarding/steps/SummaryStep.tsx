
import React from 'react';
import { DiscoverySource, SUSTAINABLE_ACTIONS } from '@/types';

interface SummaryStepProps {
  name: string;
  city: string;
  discoverySource: DiscoverySource | '';
  selectedActions: string[];
}

const SummaryStep = ({ name, city, discoverySource, selectedActions }: SummaryStepProps) => {
  const getDiscoverySourceText = () => {
    switch (discoverySource) {
      case 'social-media': return 'Social Media';
      case 'friend': return 'Consiglio di un amico';
      case 'search': return 'Motore di ricerca';
      case 'advertisement': return 'Pubblicità';
      case 'news': return 'Articolo o notizia';
      case 'event': return 'Evento o conferenza';
      case 'other': return 'Altro';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Riepilogo dei tuoi dati</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-1 py-2 border-b">
            <div className="text-gray-500">Nome</div>
            <div className="col-span-2 font-medium">{name}</div>
          </div>
          <div className="grid grid-cols-3 gap-1 py-2 border-b">
            <div className="text-gray-500">Città</div>
            <div className="col-span-2 font-medium">{city}</div>
          </div>
          <div className="grid grid-cols-3 gap-1 py-2 border-b">
            <div className="text-gray-500">Come ci hai conosciuto</div>
            <div className="col-span-2 font-medium">
              {getDiscoverySourceText()}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 py-2">
            <div className="text-gray-500">Azioni selezionate</div>
            <div className="col-span-2">
              <ul className="list-disc pl-5 space-y-1">
                {selectedActions.map((actionId) => {
                  const action = SUSTAINABLE_ACTIONS.find((a) => a.id === actionId);
                  return action ? (
                    <li key={actionId} className="font-medium">{action.label}</li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-voltgreen-50 p-4 rounded-md border border-voltgreen-100">
        <p className="text-voltgreen-800 text-sm">
          Procedendo, accetti che questi dati vengano utilizzati per personalizzare la tua esperienza su VolTogether.
          Potrai modificare queste informazioni in qualsiasi momento dalle impostazioni del tuo profilo.
        </p>
      </div>
    </div>
  );
};

export default SummaryStep;
