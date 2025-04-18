
import { Suspense, useState, useEffect } from 'react';
import { Challenge, SustainableAction } from '@/types';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import ParticipationBox from './ParticipationBox';
import CompletionBox from './CompletionBox';
import NextEvents from '@/components/dashboard/NextEvents';
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isToday, isBefore, isAfter, set, addDays, addHours, subHours } from 'date-fns';

interface DashboardContentProps {
  shouldShowParticipationBox: boolean;
  shouldShowCompletionBox: boolean;
  getParticipationDeadline: () => string;
  getCompletionDeadline: () => string;
  handleParticipationResponse: (participating: boolean) => Promise<void>;
  todayChallengeData: Challenge;
  userActions: SustainableAction[];
  onParticipateInChallenge: (challengeId: number, participating: boolean) => Promise<void>;
  onCompleteChallenge: (challengeId: number, actionIds: string[]) => Promise<void>;
  selectedCompletionActions: string[];
  handleActionToggle: (actionId: string) => void;
  handleSubmitCompletionActions: () => Promise<void>;
}

const DashboardContent = ({
  shouldShowParticipationBox,
  shouldShowCompletionBox,
  getParticipationDeadline,
  getCompletionDeadline,
  handleParticipationResponse,
  todayChallengeData,
  userActions,
  onParticipateInChallenge,
  onCompleteChallenge,
  selectedCompletionActions,
  handleActionToggle,
  handleSubmitCompletionActions
}: DashboardContentProps) => {
  console.log("DashboardContent rendering with shouldShowCompletionBox:", shouldShowCompletionBox);

    const [challenge, setChallenge] = useState<Challenge & { start_time: string; end_time: string; action_ids: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
  
    try {
      // Fetch all challenges, including their action_ids arrays and associated challenge_user
      const { data: challenge, error: challengeError } = await supabase
      .from('Challenges')
      .select('*, Users_Challenges(*)') // Include the challenge_user relationship
      .lte('start_time', addHours(new Date(), 3).toISOString())
      .gte('end_time', subHours(new Date(), 3).toISOString())
      .single();

      if (challengeError) {
      console.error('Error fetching challenge:', challengeError);
      return;
      }
      console.log(challenge);

      // Fetch all actions related to the challenge
      const actionIds = challenge.action_ids || [];
      const { data: actions, error: actionsError } = await supabase
      .from('Actions')
      .select('*')
      .in('label', actionIds);

      if (actionsError) {
      console.error('Error fetching actions:', actionsError);
      return;
      }

      // Map actions to the challenge
      const challengeWithActions = {
      ...challenge,
      actions: actions.filter((action) => actionIds.includes(action.label)),
      };
      console.log("Challenge with actions:", challengeWithActions);
      setChallenge(challengeWithActions);
  
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  
    setLoading(false);
    };
  
    

  const acceptChallenge = async () => {
    const { error } = await supabase
    .from('Users_Challenges')
    .insert({challenge_id: challenge.id})
    console.log(error)

    fetchData();

  };

  const completeChallenge = async (actionIds: string[]) => {
    console.log('Selected actions:', actionIds);

    let points = 0;

    if (actionIds[0] !== 'none') {
      // Fetch points for the selected actions
      const { data: actions } = await supabase
        .from('Actions')
        .select('point_value')
        .in('label', actionIds);
      points = actions.reduce((sum, action) => sum + (action.point_value || 0), 0);
      console.log(points)
    }
    const { error } = await supabase
      .from('Users_Challenges')
      .update({ completed_at: new Date().toISOString(), actions_done: actionIds, points: points })
      .eq('challenge_id', challenge.id);

    if (error) {
      console.error('Error updating Users_Challenges:', error);
    }
    fetchData();
  };

  return (
    <div className="lg:col-span-2 space-y-6">

      {challenge && !(challenge.Users_Challenges && challenge.Users_Challenges.length > 0) && isAfter(new Date(), subHours(parseISO(challenge.start_time), 3)) && isBefore(new Date(), parseISO(challenge.start_time)) && (
        <ParticipationBox
          challenge={challenge}
          acceptChallenge={acceptChallenge}
        />
      )}
      
      {challenge && (challenge.Users_Challenges && challenge.Users_Challenges.length > 0 && !challenge.Users_Challenges[0].completed_at) && isAfter(new Date(), parseISO(challenge.end_time)) && isBefore(new Date(), addHours(parseISO(challenge.end_time), 3)) && (
        <CompletionBox 
          challenge={challenge}
          submittedActions={completeChallenge}
        />
      )}
      
      {challenge && (
        <ChallengeCard
          challenge={challenge}
        />
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <NextEvents />
      </div>
        </div>
  );
};

export default DashboardContent;
