
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, XCircle, CheckCircle } from 'lucide-react';
import { format, parseISO, isToday, isBefore, isAfter, set, addDays, addHours, subHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { Challenge } from '@/types';


interface ParticipationBoxProps {
  challenge: Challenge & { start_time: string; end_time: string; action_ids: string[] };
  acceptChallenge: () => void;
}

const ParticipationBox = ({ 
  challenge, 
  acceptChallenge 
}: ParticipationBoxProps) => {
  const today = format(new Date(), 'EEEE d MMMM', { locale: it });

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm animate-pulse-soft">
      <CardHeader>
        <CardTitle className="text-lg text-amber-800">Parteciperai alla sfida di oggi?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-amber-700 mb-4">
          Oggi dalle {format(parseISO(challenge.start_time), 'HH:mm')} alle {format(parseISO(challenge.end_time), 'HH:mm')} riduci i tuoi consumi energetici e partecipa alla sfida!
        </p>
        <div className="bg-white rounded-md p-3 border border-amber-200 mb-4">
          <div className="flex items-center text-amber-800 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">
              Hai tempo per rispondere fino alle {format(parseISO(challenge.start_time), 'HH:mm')}!
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Partecipando alla sfida contribuirai a ridurre l'impatto ambientale e guadagnerai punti.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex pt-2 pb-4">
        <Button 
          onClick={() => acceptChallenge()}
          className="bg-voltgreen-600 ml-auto hover:bg-voltgreen-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Parteciperò
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParticipationBox;
