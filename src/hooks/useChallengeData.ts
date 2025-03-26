
import { useState, useCallback } from 'react';
import { Challenge } from '@/types';

export const useChallengeData = (initialChallengeData: Challenge) => {
  const [challengeData, setChallengeData] = useState<Challenge>(initialChallengeData);
  const [isLoading, setIsLoading] = useState(false);

  const handleParticipateInChallenge = useCallback((challengeId: number, participating: boolean) => {
    setChallengeData(prev => ({
      ...prev,
      participating
    }));
  }, []);

  const handleCompleteChallenge = useCallback((challengeId: number, actionIds: string[]) => {
    setChallengeData(prev => ({
      ...prev,
      completed: true,
      userActions: actionIds
    }));
  }, []);

  return {
    challengeData,
    isLoading,
    handleParticipateInChallenge,
    handleCompleteChallenge
  };
};
