
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, XCircle, CheckCircle } from 'lucide-react';

interface ParticipationBoxProps {
  getParticipationDeadline: () => string;
  handleParticipationResponse: (participating: boolean) => Promise<void>;
}

const ParticipationBox = ({ 
  getParticipationDeadline, 
  handleParticipationResponse 
}: ParticipationBoxProps) => {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm animate-pulse-soft">
      <CardHeader>
        <CardTitle className="text-lg text-amber-800">Parteciperai alla sfida di oggi?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-amber-700 mb-4">
          Oggi dalle 19:00 alle 20:00 riduci i tuoi consumi energetici e partecipa alla sfida!
        </p>
        <div className="bg-white rounded-md p-3 border border-amber-200 mb-4">
          <div className="flex items-center text-amber-800 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">
              Hai tempo per rispondere fino alle {getParticipationDeadline()}!
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Partecipando alla sfida contribuirai a ridurre l'impatto ambientale e guadagnerai punti.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-4">
        <Button variant="outline" onClick={() => handleParticipationResponse(false)}>
          <XCircle className="mr-2 h-4 w-4" />
          Non parteciperò
        </Button>
        <Button 
          onClick={() => handleParticipationResponse(true)}
          className="bg-voltgreen-600 hover:bg-voltgreen-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Parteciperò
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParticipationBox;
