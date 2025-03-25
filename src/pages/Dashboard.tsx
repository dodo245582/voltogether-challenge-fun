
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/components/ui/use-toast"
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, Challenge, SUSTAINABLE_ACTIONS, SustainableAction, CHALLENGE_DATES } from '@/types';
import Stats from '@/components/profile/Stats';
import Navbar from '@/components/layout/Navbar';
import { useNotifications } from '@/context/NotificationContext';
import NotificationModals from '@/components/notifications/NotificationModals';

const Dashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const { enableNotifications, notificationsEnabled } = useNotifications();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [communityCount, setCommunityCount] = useState(1024); // Esempio di conteggio della community
  const [showActions, setShowActions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        // Fetch challenges for the current week
        const fetchedChallenges = CHALLENGE_DATES.map((date, index) => ({
          id: index + 1,
          date: date,
          startTime: '19:00',
          endTime: '20:00',
          completed: false,
          participating: false,
          userActions: [],
        }));
        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        toast({
          variant: "destructive",
          title: "Errore!",
          description: "Failed to fetch challenges.",
        })
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [toast]);

  // Create a user data object from the profile
  const userData: User = profile || {
    id: user?.id || '',
    email: user?.email || '',
    name: user?.user_metadata?.name || '',
    created_at: user?.created_at || '',
    city: '',
    discovery_source: '',
    selected_actions: [],
    completed_challenges: 0,
    total_points: 0,
    streak: 0,
  };

  const totalChallenges = challenges.length;

  const handleParticipateClick = async (challengeId: number) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NotificationModals />
      
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Ciao, {userData.name || 'Volontario'}!
        </h1>

        <Stats user={userData} totalChallenges={totalChallenges} />

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
                      {challenge.date} - {challenge.startTime} - {challenge.endTime}
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
                          {SUSTAINABLE_ACTIONS.slice(0, 3).map((action) => (
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
                        variant="outline"
                        onClick={() => handleParticipateClick(challenge.id)}
                        disabled={challenge.completed}
                      >
                        {challenge.participating ? 'Non Partecipare' : 'Partecipa'}
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
