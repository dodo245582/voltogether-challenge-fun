import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import Stats from '@/components/profile/Stats';
import { useNotifications } from '@/context/NotificationContext';
import Footer from '@/components/layout/Footer';
import { SUSTAINABLE_ACTIONS, CHALLENGE_DATES } from '@/types';
import { Bell, BellDot, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [challengeStats, setChallengeStats] = useState({
    totalChallenges: 7,
    completedChallenges: profile?.completed_challenges || 0,
    points: profile?.total_points || 0
  });

  const [todayChallengeData, setTodayChallengeData] = useState({
    id: 1,
    date: CHALLENGE_DATES[0],
    startTime: '19:00',
    endTime: '20:00',
    completed: false,
    participating: undefined
  });

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

  const handleParticipateInChallenge = (challengeId: number, participating: boolean) => {
    setTodayChallengeData(prev => ({
      ...prev,
      participating
    }));
  };

  const handleCompleteChallenge = (challengeId: number, actionIds: string[]) => {
    setTodayChallengeData(prev => ({
      ...prev,
      completed: true,
      userActions: actionIds
    }));
  };

  const hasUnreadNotifications = useMemo(() => 
    notifications.some(n => !n.read)
  , [notifications]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-voltgreen-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
              alt="VolTogether" 
              className="h-9" 
            />
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-gray-600 hover:text-gray-900 cursor-pointer">
              {hasUnreadNotifications ? (
                <BellDot className="h-6 w-6 text-voltgreen-600" />
              ) : (
                <Bell className="h-6 w-6" />
              )}
            </div>
            
            {user && (
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{profile?.name || user.email}</p>
                <p className="text-sm text-gray-500">{challengeStats.points} punti</p>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </div>
      </header>
      
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
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Prossimi Eventi</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Sfida Giornaliera</p>
                    <p className="text-sm text-gray-500">Domani, 19:00 - 20:00</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
                    +10 punti
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Sfida Energetica Speciale</p>
                    <p className="text-sm text-gray-500">Questo weekend</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
                    +20 punti
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {profile && (
              <Stats
                user={profile}
                totalChallenges={challengeStats.totalChallenges}
              />
            )}
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Community</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Utenti attivi</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sfide completate</span>
                  <span className="font-medium">842</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Impatto totale</span>
                  <span className="font-medium">26.5 kWh risparmiati</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
