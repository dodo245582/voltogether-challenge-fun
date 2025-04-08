import { useState, useEffect, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Stats from '@/components/profile/Stats';
import { useNotifications } from '@/context/NotificationContext';
import Footer from '@/components/layout/Footer';
import { SUSTAINABLE_ACTIONS, CHALLENGE_DATES } from '@/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { useChallengeData } from '@/hooks/useChallengeData';
import DashboardContent from '@/components/dashboard/DashboardContent';
import CommunityStats from '@/components/dashboard/CommunityStats';

const Dashboard = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications, 
    shouldShowParticipationBox, 
    shouldShowCompletionBox,
    currentChallengeId: notificationChallengeId,
    respondToParticipation,
    completeChallengeActions,
    getParticipationDeadline,
    getCompletionDeadline
  } = useNotifications();

  console.log("Dashboard rendering with notificationChallengeId:", notificationChallengeId);
  console.log("shouldShowParticipationBox:", shouldShowParticipationBox);
  console.log("shouldShowCompletionBox:", shouldShowCompletionBox);

  const [challengeStats, setChallengeStats] = useState({
    totalChallenges: 7,
    completedChallenges: 0,
    points: 0
  });

  const initialChallengeData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayIndex = CHALLENGE_DATES.findIndex(date => date === todayStr);
    const dateToUse = todayIndex >= 0 ? CHALLENGE_DATES[todayIndex] : CHALLENGE_DATES[0];
    
    const challengeId = todayIndex >= 0 ? todayIndex + 1 : 1;
    
    // Check if we have saved participation status
    const participating = localStorage.getItem(`challenge_${challengeId}_participating`);
    const completed = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
    
    // For today's challenge, undefined means "waiting for response"
    // Only set a specific value if user has explicitly responded
    let participationStatus;
    if (participating === 'true') {
      participationStatus = true;
    } else if (participating === 'false') {
      participationStatus = false;
    } else {
      participationStatus = undefined; // In attesa
    }
    
    return {
      id: challengeId,
      date: dateToUse,
      startTime: '19:00',
      endTime: '20:00',
      completed: completed || false,
      participating: participationStatus
    };
  }, []);

  const { 
    challengeData: todayChallengeData,
    isLoading: challengeLoading,
    handleParticipateInChallenge, 
    handleCompleteChallenge 
  } = useChallengeData(initialChallengeData);

  const userActions = useMemo(() => 
    profile?.selected_actions 
      ? SUSTAINABLE_ACTIONS.filter(action => 
          profile.selected_actions?.includes(action.id)
        )
      : SUSTAINABLE_ACTIONS.slice(0, 3)
  , [profile?.selected_actions]);

  useEffect(() => {
    if (user && !profile?.name) {
      navigate('/onboarding');
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (profile) {
      setChallengeStats({
        totalChallenges: 7,
        completedChallenges: profile.completed_challenges || 0,
        points: profile.total_points || 0
      });
    }
  }, [profile]);

  const onCompleteChallenge = async (challengeId: number, actionIds: string[]) => {
    await handleCompleteChallenge(challengeId, actionIds);
    
    if (user && refreshProfile) {
      await refreshProfile(user.id);
    }
  };

  const onParticipateInChallenge = async (challengeId: number, participating: boolean) => {
    await handleParticipateInChallenge(challengeId, participating);
    
    if (user && refreshProfile) {
      await refreshProfile(user.id);
    }
  };

  const handleParticipationResponse = async (participating: boolean) => {
    if (notificationChallengeId !== null) {
      await respondToParticipation(notificationChallengeId, participating);
      
      if (participating) {
        handleParticipateInChallenge(notificationChallengeId, true);
      } else {
        handleParticipateInChallenge(notificationChallengeId, false);
      }
      
      if (user && refreshProfile) {
        await refreshProfile(user.id);
      }
    }
  };

  const [selectedCompletionActions, setSelectedCompletionActions] = useState<string[]>([]);
  
  const handleActionToggle = (actionId: string) => {
    if (actionId === 'none') {
      setSelectedCompletionActions(['none']);
    } else {
      setSelectedCompletionActions(prev => {
        if (prev.includes('none')) {
          return [actionId];
        }
        return prev.includes(actionId)
          ? prev.filter(id => id !== actionId)
          : [...prev, actionId];
      });
    }
  };
  
  const handleSubmitCompletionActions = async () => {
    if (notificationChallengeId !== null && selectedCompletionActions.length > 0) {
      await completeChallengeActions(notificationChallengeId, selectedCompletionActions);
      
      if (user && refreshProfile) {
        await refreshProfile(user.id);
      }
      
      setSelectedCompletionActions([]);
    }
  };

  useEffect(() => {
    document.body.classList.add('bg-white');
    return () => {
      document.body.classList.remove('bg-white');
    };
  }, []);

  const hasUnreadNotifications = useMemo(() => 
    notifications.some(n => !n.read)
  , [notifications]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader 
        profile={profile}
        username={profile?.name || user.email}
        points={challengeStats.points}
        hasUnreadNotifications={hasUnreadNotifications}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardContent 
            shouldShowParticipationBox={shouldShowParticipationBox}
            shouldShowCompletionBox={shouldShowCompletionBox}
            getParticipationDeadline={getParticipationDeadline}
            getCompletionDeadline={getCompletionDeadline}
            handleParticipationResponse={handleParticipationResponse}
            todayChallengeData={todayChallengeData}
            userActions={userActions}
            onParticipateInChallenge={onParticipateInChallenge}
            onCompleteChallenge={onCompleteChallenge}
            selectedCompletionActions={selectedCompletionActions}
            handleActionToggle={handleActionToggle}
            handleSubmitCompletionActions={handleSubmitCompletionActions}
          />
          
          {profile && (
            <Stats
              totalChallenges={challengeStats.totalChallenges}
              completedChallenges={challengeStats.completedChallenges}
              totalPoints={challengeStats.points}
              streak={profile.streak}
            />
          )}
          {/*
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100"></div>}>
            <CommunityStats
              activeUsers={profile?.active_users || 0}
              completedChallenges={profile?.completed_challenges || 0}
              impact={profile?.impact || 0}
            />
          </Suspense>
          */}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
