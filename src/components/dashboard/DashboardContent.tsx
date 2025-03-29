
import { Suspense } from 'react';
import { Challenge, SustainableAction } from '@/types';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import ParticipationBox from './ParticipationBox';
import CompletionBox from './CompletionBox';
import NextEvents from '@/components/dashboard/NextEvents';

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
  
  return (
    <div className="lg:col-span-2 space-y-6">
      {shouldShowParticipationBox && (
        <ParticipationBox 
          getParticipationDeadline={getParticipationDeadline}
          handleParticipationResponse={handleParticipationResponse}
        />
      )}
      
      {shouldShowCompletionBox && (
        <CompletionBox 
          userActions={userActions}
          getCompletionDeadline={getCompletionDeadline}
          handleSubmitCompletionActions={handleSubmitCompletionActions}
          selectedCompletionActions={selectedCompletionActions}
          handleActionToggle={handleActionToggle}
        />
      )}
      
      <ChallengeCard
        challenge={todayChallengeData}
        recommendedActions={userActions}
        userActions={userActions}
        onParticipate={onParticipateInChallenge}
        onCompleteChallenge={onCompleteChallenge}
      />
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <NextEvents />
      </div>
    </div>
  );
};

export default DashboardContent;
