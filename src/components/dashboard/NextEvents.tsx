import { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { CheckCircle, TreePalm } from 'lucide-react';
import { format, addDays, set, addHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";

const NextEvents = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);


      try {
        // Fetch all challenges, including their action_ids arrays
        const { data: challenges, error: challengesError } = await supabase
          .from('Challenges')
          .select('*')
          .gte('start_time', addHours(new Date(), 3).toISOString())
          .order('start_time', { ascending: true })
          .limit(2)


        if (challengesError) {
          console.error('Error fetching challenges:', challengesError);
          return;
        }

        // Fetch all actions related to the challenges
        const actionIds = challenges.flatMap((challenge) => challenge.action_ids || []);
        const { data: actions, error: actionsError } = await supabase
          .from('Actions')
          .select('*')
          .in('label', actionIds);

          console.log(actions)

        if (actionsError) {
          console.error('Error fetching actions:', actionsError);
          return;
        }

        // Map actions to their respective challenges
        const challengesWithActions = challenges.map((challenge) => ({
          ...challenge,
          actions: actions.filter((action) => challenge.action_ids?.includes(action.label)),
        }));

        setChallenges(challengesWithActions);
      } catch (error) {
        console.error('Unexpected error:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }


  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <CardTitle className="text-xl font-semibold mb-4">Prossimi Eventi</CardTitle>
      <CardContent className="p-0">
        <div className="space-y-5">
            {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div key={challenge.id}>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                <p className="font-medium">{challenge.title}</p>
                <p>{format(new Date(challenge.start_time), "EEEE d MMMM", { locale: it })}, {format(new Date(challenge.start_time), "HH:mm", { locale: it })} - {format(new Date(challenge.end_time), "HH:mm", { locale: it })} </p>
                </div>
                {/* <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
                +10 punti per azione
                </span> */}
              </div> 

              <div className="mt-3 pl-3">
                <p className="text-sm font-medium mb-2">Azioni consigliate:</p>
                <div className="space-y-1.5">
                {challenge.actions?.map((action) => (
                  <div key={action.id} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-voltgreen-500" />
                  <span className="text-sm">{action.title}</span>
                  </div>
                ))}
                </div>
              </div>
              </div>
            ))
            ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-500">
              <TreePalm className="h-8 w-8 text-gray-300 mb-2"/>
              <p className="text-sm">Al momento non ci sono nuove challenge in arrivo. Riprova tra poco.</p>
            </div>
            )}

        </div>
      </CardContent>
    </Card>
  );
};

export default NextEvents;
