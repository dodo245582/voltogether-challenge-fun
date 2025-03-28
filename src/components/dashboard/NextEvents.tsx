
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { SUSTAINABLE_ACTIONS, CHALLENGE_DATES } from '@/types';
import { CheckCircle } from 'lucide-react';
import { format, addDays, isToday, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const NextEvents = () => {
  // Getting random recommended actions for the next day
  const recommendedActions = SUSTAINABLE_ACTIONS.slice(0, 3);
  
  // Get today's date
  const today = new Date();
  
  // Find the next challenge date after today
  const findNextChallengeDate = () => {
    const todayStr = today.toISOString().split('T')[0];
    const todayIndex = CHALLENGE_DATES.findIndex(date => date === todayStr);
    
    // If today is a challenge day and we have more challenges after today
    if (todayIndex >= 0 && todayIndex < CHALLENGE_DATES.length - 1) {
      return parseISO(CHALLENGE_DATES[todayIndex + 1]);
    } 
    // If today is not a challenge day or it's the last challenge day
    else {
      return addDays(today, 1); // Default to tomorrow
    }
  };
  
  const nextChallengeDate = findNextChallengeDate();
  const nextChallengeDateFormatted = format(nextChallengeDate, 'EEEE d MMMM', { locale: it });
  
  // Get date for special challenge (this weekend)
  const weekend = new Date(today);
  weekend.setDate(today.getDate() + (6 - today.getDay()));
  const weekendFormatted = format(weekend, 'EEEE d MMMM', { locale: it });

  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <CardTitle className="text-xl font-semibold mb-4">Prossimi Eventi</CardTitle>
      <CardContent className="p-0">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Sfida Giornaliera</p>
                <p className="text-sm text-gray-500">{nextChallengeDateFormatted}, 19:00 - 20:00</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
                +10 punti per azione
              </span>
            </div>
            
            <div className="mt-3 pl-3">
              <p className="text-sm font-medium mb-2">Azioni consigliate:</p>
              <div className="space-y-1.5">
                {recommendedActions.map(action => (
                  <div key={action.id} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-voltgreen-500" />
                    <span className="text-sm">{action.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div>
              <p className="font-medium">Sfida Energetica Speciale</p>
              <p className="text-sm text-gray-500">{weekendFormatted}</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
              +20 punti per azione
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextEvents;
