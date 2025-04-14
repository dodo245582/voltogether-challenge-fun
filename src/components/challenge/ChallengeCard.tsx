import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO, isToday, isBefore, isAfter, set, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge & { start_time: string; end_time: string; };
}

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const now = new Date();
  const challengeDate = parseISO(challenge.start_time);
  const startTime = parseISO(challenge.start_time);
  const endTime = parseISO(challenge.end_time);

  const isDayInPast = isBefore(challengeDate, new Date(now.setHours(0, 0, 0, 0)));
  const isChallengeActive = isAfter(now, startTime) && isBefore(now, endTime);
  const isChallengeFuture = isBefore(now, startTime);
  const isChallengeOver = isAfter(now, endTime);

  const showParticipationQuestion =
    isToday(challengeDate) &&
    isAfter(now, set(new Date(), { hours: 9, minutes: 0 })) &&
    isBefore(now, set(new Date(), { hours: 18, minutes: 54 })) &&
    challenge.participating === undefined;

  const completionDeadline = set(addDays(challengeDate, 1), { hours: 8, minutes: 59 });
  const showCompletionQuestion =
    isChallengeOver &&
    !challenge.completed &&
    challenge.participating === true &&
    isBefore(now, completionDeadline);

  const formattedDate = format(challengeDate, 'EEEE d MMMM yyyy', { locale: it });
  const formattedTimeRange = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      className={`
      w-full overflow-hidden transition-all duration-300 border
      ${isChallengeActive ? 'border-voltgreen-500 shadow-lg shadow-voltgreen-100' : 'border-gray-200'}
      ${challenge.Users_Challenges.length > 0 && challenge.Users_Challenges[0].completed_at ? 'bg-gray-50' : 'bg-white'}
      animate-scale-in
    `}
    >
      <CardHeader
        className={`
        ${isChallengeActive ? 'bg-voltgreen-50' : ''}
        ${challenge.completed ? 'bg-gray-100' : ''}
      `}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-voltgreen-600" />
            <CardTitle className="font-medium text-lg">{formattedDate}</CardTitle>
          </div>
          {challenge.Users_Challenges.length > 0 && challenge.Users_Challenges[0].completed_at ? (
            <Badge variant="outline" className="bg-voltgreen-100 text-voltgreen-800 border-voltgreen-200">
              <CheckCircle className="mr-1 h-3 w-3" /> Completata
            </Badge>
          ) : challenge.Users_Challenges.length > 0 === false ? (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              <XCircle className="mr-1 h-3 w-3" /> Non partecipi
            </Badge>
          ) : challenge.Users_Challenges.length > 0 === true ? (
            <Badge variant="outline" className="bg-voltgreen-100 text-voltgreen-800 border-voltgreen-200">
              <CheckCircle className="mr-1 h-3 w-3" /> Partecipi
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              <Clock className="mr-1 h-3 w-3" /> In attesa
            </Badge>
          )}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formattedTimeRange}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {isChallengeActive && (
          <div className="bg-voltgreen-50 p-4 rounded-md border border-voltgreen-100 animate-pulse-soft">
            <p className="text-voltgreen-800 font-medium flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              La sfida è attiva ora!
            </p>
            <p className="text-sm text-voltgreen-700 mt-1">
              Ricordati di ridurre i tuoi consumi energetici fino alle {format(endTime, 'HH:mm')}
            </p>
          </div>
        )}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">Azioni consigliate</p>
              <Button variant="ghost" size="sm" onClick={() => setShowActions(!showActions)}>
                {showActions ? 'Nascondi' : 'Mostra'}
              </Button>
            </div>

            {showActions && (
              <div className="space-y-2 mt-2 pl-2 border-l-2 border-voltgreen-200">
                {challenge.actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-voltgreen-500" />
                    <span className="text-sm">{action.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
      </CardContent>

      <CardFooter
        className={`
        border-t flex justify-between items-center bg-gray-50 text-sm px-6 py-3
        ${challenge.completed ? 'bg-gray-100' : ''}
      `}
      >
        <div className="flex items-center">
          <ClockDisplay
            challenge={challenge}
          />
        </div>
      </CardFooter>
    </Card>
  );
};
const ClockDisplay = ({ challenge }: { challenge: Challenge & { start_time: string; end_time: string; } }) => {
  const now = new Date();
  const startTime = parseISO(challenge.start_time);
  const endTime = parseISO(challenge.end_time);
  const isActive = now >= startTime && now <= endTime;
  const isPast = now > endTime;

  if (isPast) {
    return <span className="text-gray-500">Sfida conclusa</span>;
  }

  if (isActive) {
    const minutesLeft = Math.floor((endTime.getTime() - now.getTime()) / 60000);
    return (
      <span className="text-voltgreen-700 font-medium flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {minutesLeft === 0 ? 'Un minuto' : `${minutesLeft} minuti`} alla fine
      </span>
    );
  }

  const hoursToStart = Math.floor((startTime.getTime() - now.getTime()) / 3600000);
  const minutesToStart = Math.floor(((startTime.getTime() - now.getTime()) % 3600000) / 60000);

  if (hoursToStart < 24) {
    if (hoursToStart === 0) {
      return (
        <span className="text-voltgreen-700 font-medium flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {minutesToStart === 0 ? 'Inizia a momenti' : `Inizia fra ${minutesToStart} minuti`}
        </span>
      );
    }
    return (
      <span className="text-gray-600 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {hoursToStart === 1 ? 'Inizia fra 1 ora' : `Inizia fra ${hoursToStart} ore`}
      </span>
    );
  }

  return (
    <span className="text-gray-600 flex items-center">
      <Calendar className="h-4 w-4 mr-1" />
      {format(startTime, 'd MMMM', { locale: it })}
    </span>
  );
};

export default ChallengeCard;
