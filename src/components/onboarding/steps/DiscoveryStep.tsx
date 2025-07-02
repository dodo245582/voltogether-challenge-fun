import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DiscoverySource } from '@/types';

interface DiscoveryStepProps {
  discoverySource: DiscoverySource | '';
  setDiscoverySource: (source: DiscoverySource) => void;
}

const DiscoveryStep = ({ discoverySource, setDiscoverySource }: DiscoveryStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Come ci hai conosciuto?</Label>
        <RadioGroup 
          value={discoverySource} 
          onValueChange={(value) => setDiscoverySource(value as DiscoverySource)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sustainable-friends" id="sustainable-friends" />
              <Label htmlFor="sustainable-friends">Tramite Sustainable Friends</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="heroots" id="heroots" />
              <Label htmlFor="heroots">Tramite Heroots</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="greenpea" id="greenpea" />
              <Label htmlFor="greenpea">Tramite GreenPea</Label>
            </div>

             <div className="flex items-center space-x-2">
              <RadioGroupItem value="milan-green-forum" id="milan-green-forum" />
              <Label htmlFor="milan-green-forum">Tramite Milan Green Forum</Label>
            </div>

             <div className="flex items-center space-x-2">
              <RadioGroupItem value="impatto" id="impatto" />
              <Label htmlFor="impatto">Tramite Impatto</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instagram" id="instagram" />
              <Label htmlFor="instagram">VolTogether Instagram Page</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friend" id="friend" />
              <Label htmlFor="friend">Consiglio di un amico</Label>
            </div>
            
            {/* <div className="flex items-center space-x-2">
              <RadioGroupItem value="advertisement" id="advertisement" />
              <Label htmlFor="advertisement">Pubblicità</Label>
            </div> */}

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="previous-experiment" id="previous-experiment" />
              <Label htmlFor="previous-experiment">Dallo scorso esperimento</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="atmospheralab" id="atmospheralab" />
              <Label htmlFor="atmospheralab">AtmospheraLab</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cs1bc" id="cs1bc" />
              <Label htmlFor="cs1bc">Cs1bc</Label>
            </div>

            {/* <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Altro</Label>
            </div> */}

          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default DiscoveryStep;
