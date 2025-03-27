
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Stats from '@/components/profile/Stats';
import { useNotifications } from '@/context/NotificationContext';
import Footer from '@/components/layout/Footer';
import { SUSTAINABLE_ACTIONS, CHALLENGE_DATES } from '@/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { useChallengeData } from '@/hooks/useChallengeData';
import NotificationModals from '@/components/notifications/NotificationModals';
import DashboardContent from '@/components/dashboard/DashboardContent';

const CommunityStats = lazy(() => import('@/components/dashboard/CommunityStats'));

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
    
    return {
      id: todayIndex >= 0 ? todayIndex + 1 : 1,
      date: dateToUse,
      startTime: '19:00',
      endTime: '20:00',
      completed: false,
      participating: undefined
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
      console.log("Updating dashboard stats from profile:", {
        completedChallenges: profile.completed_challenges || 0,
        points: profile.total_points || 0
      });
      
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
      console.log("Refreshing profile after challenge completion");
      await refreshProfile(user.id);
    }
  };

  const onParticipateInChallenge = async (challengeId: number, participating: boolean) => {
    await handleParticipateInChallenge(challengeId, participating);
    
    if (user && refreshProfile) {
      console.log("Refreshing profile after participation update");
      await refreshProfile(user.id);
    }
  };

  const handleParticipationResponse = async (participating: boolean) => {
    console.log("Responding to participation with:", participating, "for challenge:", notificationChallengeId);
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
              user={profile}
              totalChallenges={challengeStats.totalChallenges}
            />
          )}
          
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100"></div>}>
            <CommunityStats />
          </Suspense>
        </div>
      </main>
      
      <NotificationModals />
      <Footer />
    </div>
  );
};

export default Dashboard;
