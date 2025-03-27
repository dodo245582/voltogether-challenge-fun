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
import NotificationModals from '@/components/notifications/NotificationModals';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { it } from 'date-fns/locale';

const NextEvents = lazy(() => import('@/components/dashboard/NextEvents'));
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
          <div className="lg:col-span-2 space-y-6">
            {shouldShowParticipationBox && (
              <Card className="border-amber-200 bg-amber-50 shadow-sm animate-pulse-soft">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-800">Parteciperai alla sfida di oggi?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 mb-4">
                    Oggi dalle 19:00 alle 20:00 riduci i tuoi consumi energetici e partecipa alla sfida!
                  </p>
                  <div className="bg-white rounded-md p-3 border border-amber-200 mb-4">
                    <div className="flex items-center text-amber-800 mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      <p className="text-sm font-medium">
                        Hai tempo per rispondere fino alle {getParticipationDeadline()}!
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Partecipando alla sfida contribuirai a ridurre l'impatto ambientale e guadagnerai punti.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 pb-4">
                  <Button variant="outline" onClick={() => handleParticipationResponse(false)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Non parteciperò
                  </Button>
                  <Button 
                    onClick={() => handleParticipationResponse(true)}
                    className="bg-voltgreen-600 hover:bg-voltgreen-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Parteciperò
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {shouldShowCompletionBox && (
              <Card className="border-voltgreen-200 bg-voltgreen-50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-voltgreen-800">Sfida completata!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-voltgreen-700 mb-4">
                    Quali azioni hai fatto per ridurre i consumi energetici?
                  </p>
                  <div className="bg-white rounded-md p-3 border border-voltgreen-200 mb-4">
                    <div className="flex items-center text-amber-800 mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      <p className="text-sm font-medium">
                        Hai tempo per rispondere fino alle {getCompletionDeadline()}!
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {userActions.map((action) => (
                      <div key={action.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`dashboard-action-${action.id}`}
                          checked={selectedCompletionActions.includes(action.id)}
                          onCheckedChange={() => handleActionToggle(action.id)}
                          disabled={selectedCompletionActions.includes('none')}
                        />
                        <div>
                          <label
                            htmlFor={`dashboard-action-${action.id}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            {action.label}
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="dashboard-action-none"
                          checked={selectedCompletionActions.includes('none')}
                          onCheckedChange={() => handleActionToggle('none')}
                          disabled={selectedCompletionActions.length > 0 && !selectedCompletionActions.includes('none')}
                        />
                        <label
                          htmlFor="dashboard-action-none"
                          className="text-sm font-medium text-gray-700"
                        >
                          Non sono riuscito a partecipare
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <Button 
                    onClick={handleSubmitCompletionActions}
                    disabled={selectedCompletionActions.length === 0}
                    className="w-full bg-voltgreen-600 hover:bg-voltgreen-700"
                  >
                    Conferma
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            <ChallengeCard
              challenge={todayChallengeData}
              recommendedActions={SUSTAINABLE_ACTIONS.slice(0, 3)}
              userActions={userActions}
              onParticipate={onParticipateInChallenge}
              onCompleteChallenge={onCompleteChallenge}
            />
            
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100"></div>}>
              <NextEvents />
            </Suspense>
          </div>
          
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
