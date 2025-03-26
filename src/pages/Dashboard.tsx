
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Challenge, SUSTAINABLE_ACTIONS, CHALLENGE_DATES } from '@/types';
import Stats from '@/components/profile/Stats';
import Navbar from '@/components/layout/Navbar';
import { useNotifications } from '@/context/NotificationContext';
import NotificationModals from '@/components/notifications/NotificationModals';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { enableNotifications, notificationsEnabled } = useNotifications();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [communityCount, setCommunityCount] = useState(0);
  const [showActions, setShowActions] = useState<Record<number, boolean>>({});

  // Fetch community count from Supabase
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from('Users')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error("Error fetching user count:", error);
          setCommunityCount(1024); // Fallback to default if error
        } else {
          setCommunityCount(count || 1024);
        }
      } catch (error) {
        console.error("Unexpected error fetching user count:", error);
        setCommunityCount(1024); // Fallback to default if error
      }
    };

    fetchUserCount();
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        // Fetch challenges for the current week
        const fetchedChallenges = CHALLENGE_DATES.map((date, index) => {
          // Check if we have stored participation info for this challenge
          const participating = localStorage.getItem(`challenge_${index + 1}_participating`) === 'true';
          const completed = localStorage.getItem(`challenge_${index + 1}_completed`) === 'true';
          
          return {
            id: index + 1,
            date: date,
            startTime: '19:00',
            endTime: '20:00',
            completed: completed,
            participating: participating,
            userActions: [],
          };
        });
        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        toast({
          variant: "destructive",
          title: "Errore!",
          description: "Impossibile caricare le sfide.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [toast]);

  const handleParticipateClick = (challengeId: number) => {
    // Set the user's participation status for this challenge
    const isParticipating = challenges.find(c => c.id === challengeId)?.participating;
    localStorage.setItem(`challenge_${challengeId}_participating`, (!isParticipating).toString());
    
    // Update the UI
    setChallenges(challenges.map(c =>
      c.id === challengeId ? { ...c, participating: !c.participating } : c
    ));
  };

  const toggleShowActions = (challengeId: number) => {
    setShowActions(prev => ({
      ...prev,
      [challengeId]: !prev[challengeId]
    }));
  };

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Get user selected actions
  const userSelectedActions = JSON.parse(localStorage.getItem('userSelectedActions') || '[]');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NotificationModals />
      
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Ciao, {profile?.name || user?.email?.split('@')[0] || 'Volontario'}!
        </h1>

        <Stats 
          user={{
            id: user?.id || '',
            email: user?.email || '',
            name: profile?.name || user?.email?.split('@')[0] || '',
            city: profile?.city || '',
            discovery_source: profile?.discovery_source || '',
            selected_actions: profile?.selected_actions || [],
            completed_challenges: parseInt(localStorage.getItem('completedChallenges') || '0'),
            total_points: parseInt(localStorage.getItem('totalPoints') || '0'),
            streak: parseInt(localStorage.getItem('streak') || '0'),
          }} 
          totalChallenges={challenges.length} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Community Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Community</CardTitle>
              <CardDescription>Tutti insieme per l'ambiente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-voltgreen-600">{communityCount.toLocaleString('it-IT')}</div>
              <p className="text-sm text-gray-500 mt-1">utenti registrati</p>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notifiche</CardTitle>
              <CardDescription>Ricevi aggiornamenti sulle sfide</CardDescription>
            </CardHeader>
            <CardContent>
              {!notificationsEnabled && (
                <Button onClick={enableNotifications} className="w-full">
                  Attiva notifiche
                </Button>
              )}
              {notificationsEnabled && (
                <div className="text-sm text-gray-600">
                  <p className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Notifiche attive
                  </p>
                  <p className="mt-2">Riceverai notifiche per le prossime sfide</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Consigli utili</CardTitle>
              <CardDescription>Per ridurre i consumi</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-voltgreen-500 mr-2">•</span>
                  <span>Spegni le luci quando esci da una stanza</span>
                </li>
                <li className="flex items-start">
                  <span className="text-voltgreen-500 mr-2">•</span>
                  <span>Usa la lavatrice e lavastoviglie a pieno carico</span>
                </li>
                <li className="flex items-start">
                  <span className="text-voltgreen-500 mr-2">•</span>
                  <span>Scollega i caricabatterie quando non in uso</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sfide della Settimana
          </h2>
          {loading ? (
            <p>Caricamento sfide...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      Sfida #{challenge.id}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {formatDate(challenge.date)} - {challenge.startTime} - {challenge.endTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">Azioni consigliate</p>
                        <Button variant="ghost" size="sm" onClick={() => toggleShowActions(challenge.id)}>
                          {showActions[challenge.id] ? "Nascondi" : "Mostra"}
                        </Button>
                      </div>
                      
                      {showActions[challenge.id] && (
                        <div className="space-y-2 mt-2 pl-2 border-l-2 border-voltgreen-200">
                          {SUSTAINABLE_ACTIONS.filter(action => 
                            userSelectedActions.includes(action.id)
                          ).slice(0, 3).map((action) => (
                            <div key={action.id} className="flex items-start space-x-2">
                              <div className="h-4 w-4 text-voltgreen-500 flex-shrink-0">✓</div>
                              <span className="text-sm">{action.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant={challenge.participating ? "default" : "outline"}
                        onClick={() => handleParticipateClick(challenge.id)}
                        disabled={challenge.completed}
                        className={challenge.participating ? "bg-voltgreen-600 hover:bg-voltgreen-700" : ""}
                      >
                        {challenge.participating ? 'Partecipo' : 'Partecipa'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
