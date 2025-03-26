
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Challenge, SustainableAction } from '@/types';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  recommendedActions: SustainableAction[];
  userActions: SustainableAction[];
  onParticipate: (challengeId: number, participating: boolean) => void;
  onCompleteChallenge: (challengeId: number, actionIds: string[]) => void;
}

const ChallengeCard = ({
  challenge,
  recommendedActions,
  userActions,
  onParticipate,
  onCompleteChallenge,
}: ChallengeCardProps) => {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);

  const now = new Date();
  const challengeDate = parseISO(challenge.date);
  const startTime = parseISO(`${challenge.date}T${challenge.startTime}`);
  const endTime = parseISO(`${challenge.date}T${challenge.endTime}`);
  
  const isDayInPast = challengeDate < new Date(now.setHours(0, 0, 0, 0));
  const isChallengeActive = now >= startTime && now <= endTime;
  const isChallengeFuture = now < startTime;
  const isChallengeOver = now > endTime;
  
  const showParticipationQuestion = isChallengeFuture && 
    (now >= new Date(startTime.getTime() - 3 * 60 * 60 * 1000)); // 3 hours before
  
  const showCompletionQuestion = isChallengeOver && !challenge.completed;

  const formattedDate = format(challengeDate, 'EEEE d MMMM yyyy', { locale: it });
  const formattedTimeRange = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;

  // Calculate total points from completed actions
  const totalPointsEarned = challenge.completed && challenge.userActions ? 
    challenge.userActions.length * 10 : 0;

  const handleActionToggle = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleSubmitActions = () => {
    if (selectedActions.length > 0) {
      onCompleteChallenge(challenge.id, selectedActions);
    }
  };

  return (
    <Card className={`
      w-full overflow-hidden transition-all duration-300 border
      ${isChallengeActive ? 'border-voltgreen-500 shadow-lg shadow-voltgreen-100' : 'border-gray-200'}
      ${challenge.completed ? 'bg-gray-50' : 'bg-white'}
      animate-scale-in
    `}>
      <CardHeader className={`
        ${isChallengeActive ? 'bg-voltgreen-50' : ''}
        ${challenge.completed ? 'bg-gray-100' : ''}
      `}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-voltgreen-600" />
            <CardTitle className="font-medium text-lg">{formattedDate}</CardTitle>
          </div>
          {challenge.completed ? (
            <Badge variant="outline" className="bg-voltgreen-100 text-voltgreen-800 border-voltgreen-200">
              <CheckCircle className="mr-1 h-3 w-3" /> Completata
            </Badge>
          ) : challenge.participating === false ? (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              <XCircle className="mr-1 h-3 w-3" /> Non partecipi
            </Badge>
          ) : isChallengeActive ? (
            <Badge className="bg-voltgreen-500 animate-pulse">In corso</Badge>
          ) : (isDayInPast && !challenge.participating) ? (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              <XCircle className="mr-1 h-3 w-3" /> Persa
            </Badge>
          ) : (isDayInPast && challenge.participating) ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              <Clock className="mr-1 h-3 w-3" /> In attesa
            </Badge>
          ) : null}
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
        
        {showParticipationQuestion && !isDayInPast && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="font-medium mb-2">Parteciperai alla sfida di oggi?</p>
            <div className="flex space-x-2 mt-3">
              <Button 
                variant="outline" 
                className={`flex-1 ${challenge.participating ? 'bg-voltgreen-50 border-voltgreen-200 text-voltgreen-700' : ''}`}
                onClick={() => onParticipate(challenge.id, true)}
              >
                <CheckCircle className={`h-4 w-4 mr-2 ${challenge.participating ? 'text-voltgreen-500' : ''}`} />
                Sì
              </Button>
              <Button 
                variant="outline" 
                className={`flex-1 ${challenge.participating === false ? 'bg-gray-100 border-gray-300' : ''}`}
                onClick={() => onParticipate(challenge.id, false)}
              >
                <XCircle className={`h-4 w-4 mr-2 ${challenge.participating === false ? 'text-gray-500' : ''}`} />
                No
              </Button>
            </div>
          </div>
        )}
        
        {showCompletionQuestion && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="font-medium mb-2">Quali azioni hai fatto per partecipare?</p>
            <div className="space-y-2 mt-3">
              {[...userActions, ...recommendedActions]
                .filter((action, index, self) => 
                  // Remove duplicates
                  index === self.findIndex((a) => a.id === action.id)
                )
                .map((action) => (
                  <div key={action.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`action-${action.id}`}
                      checked={selectedActions.includes(action.id)}
                      onCheckedChange={() => handleActionToggle(action.id)}
                    />
                    <div className="grid gap-1">
                      <label
                        htmlFor={`action-${action.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                      >
                        {action.label}
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">+10 punti</Badge>
                      </label>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                ))}
            </div>
            <Button 
              className="w-full mt-4 bg-voltgreen-600 hover:bg-voltgreen-700" 
              onClick={handleSubmitActions}
              disabled={selectedActions.length === 0}
            >
              Conferma azioni
            </Button>
          </div>
        )}
        
        {((!showParticipationQuestion && !showCompletionQuestion) || challenge.completed) && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">Azioni consigliate</p>
              <Button variant="ghost" size="sm" onClick={() => setShowActions(!showActions)}>
                {showActions ? "Nascondi" : "Mostra"}
              </Button>
            </div>
            
            {showActions && (
              <div className="space-y-2 mt-2 pl-2 border-l-2 border-voltgreen-200">
                {recommendedActions.slice(0, 3).map((action) => (
                  <div key={action.id} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-voltgreen-500" />
                    <span className="text-sm">{action.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`
        border-t flex justify-between items-center bg-gray-50 text-sm px-6 py-3
        ${challenge.completed ? 'bg-gray-100' : ''}
      `}>
        <div className="flex items-center">
          <ClockDisplay 
            startTime={startTime} 
            endTime={endTime} 
            isActive={isChallengeActive}
            isPast={isDayInPast}
          />
        </div>
        
        {challenge.completed && (
          <div className="flex items-center text-voltgreen-700">
            <span className="font-medium">+{totalPointsEarned} punti</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const ClockDisplay = ({ 
  startTime, 
  endTime, 
  isActive, 
  isPast 
}: { 
  startTime: Date; 
  endTime: Date; 
  isActive: boolean; 
  isPast: boolean;
}) => {
  const now = new Date();
  
  if (isPast) {
    return <span className="text-gray-500">Sfida conclusa</span>;
  }
  
  if (isActive) {
    const minutesLeft = Math.floor((endTime.getTime() - now.getTime()) / 60000);
    return (
      <span className="text-voltgreen-700 font-medium flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {minutesLeft === 0 ? "Un minuto" : `${minutesLeft} minuti`} alla fine
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
          {minutesToStart === 0 ? "Inizia a momenti" : `Inizia fra ${minutesToStart} minuti`}
        </span>
      );
    }
    return (
      <span className="text-gray-600 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {hoursToStart === 1 ? "Inizia fra 1 ora" : `Inizia fra ${hoursToStart} ore`}
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
