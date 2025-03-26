
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import Stats from '@/components/profile/Stats';
import { useNotifications } from '@/context/NotificationContext';
import Footer from '@/components/layout/Footer';
import { SUSTAINABLE_ACTIONS, CHALLENGE_DATES } from '@/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { useChallengeData } from '@/hooks/useChallengeData';

// Lazy load components that aren't immediately visible
const NextEvents = lazy(() => import('@/components/dashboard/NextEvents'));
const CommunityStats = lazy(() => import('@/components/dashboard/CommunityStats'));

const Dashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [challengeStats, setChallengeStats] = useState({
    totalChallenges: 7,
    completedChallenges: profile?.completed_challenges || 0,
    points: profile?.total_points || 0
  });

  const initialChallengeData = {
    id: 1,
    date: CHALLENGE_DATES[0],
    startTime: '19:00',
    endTime: '20:00',
    completed: false,
    participating: undefined
  };

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
          <div className="lg:col-span-2 space-y-6">
            <ChallengeCard
              challenge={todayChallengeData}
              recommendedActions={SUSTAINABLE_ACTIONS.slice(0, 3)}
              userActions={userActions}
              onParticipate={handleParticipateInChallenge}
              onCompleteChallenge={handleCompleteChallenge}
            />
            
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100"></div>}>
              <NextEvents />
            </Suspense>
          </div>
          
          <div className="space-y-6">
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
