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

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        // Fetch challenges for the current week
        const fetchedChallenges = CHALLENGE_DATES.map((date, index) => ({
          id: index + 1,
          date: date,
          startTime: '18:00',
          endTime: '19:00',
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

  const userData: User = {
    id: user?.id || '',
    email: user?.email || '',
    name: user?.user_metadata?.name || '',
    created_at: user?.created_at || '', // Use created_at instead of createdAt
    city: user?.city || '',
    discovery_source: user?.discovery_source || '',
    selected_actions: user?.selected_actions || [],
    completed_challenges: user?.completed_challenges || 0,
    total_points: user?.total_points || 0,
    streak: user?.streak || 0,
  };

  const totalChallenges = challenges.length;

  const handleParticipateClick = async (challengeId: number) => {
    setChallenges(challenges.map(c =>
      c.id === challengeId ? { ...c, participating: !c.participating } : c
    ));
  };

  const handleActionSelect = (challengeId: number, actionId: string) => {
    setChallenges(challenges.map(c => {
      if (c.id === challengeId) {
        const actionIndex = c.userActions ? c.userActions.indexOf(actionId) : -1;
        if (actionIndex > -1) {
          // Action already selected, remove it
          const newUserActions = [...(c.userActions || [])];
          newUserActions.splice(actionIndex, 1);
          return { ...c, userActions: newUserActions };
        } else {
          // Action not selected, add it
          return { ...c, userActions: [...(c.userActions || []), actionId] };
        }
      }
      return c;
    }));
  };

  const handleCompleteChallengeClick = async (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      console.error(`Challenge with id ${challengeId} not found`);
      return;
    }

    if (!challenge.participating) {
      toast({
        variant: "destructive",
        title: "Attenzione!",
        description: "Devi partecipare alla sfida prima di poterla completare.",
      })
      return;
    }

    if (!challenge.userActions || challenge.userActions.length === 0) {
       toast({
        variant: "destructive",
        title: "Attenzione!",
        description: "Devi selezionare almeno un'azione sostenibile per completare la sfida.",
      })
      return;
    }

    const pointsEarned = challenge.userActions.reduce((sum, actionId) => {
      const action = SUSTAINABLE_ACTIONS.find(a => a.id === actionId);
      return sum + (action ? action.pointValue : 0);
    }, 0);

    try {
      // Update challenges state with the updated challenge
      setChallenges(challenges.map(c => (
        c.id === challengeId ? { ...c, completed: true } : c
      )));

      // Update user stats
      const updatedUser = {
        ...userData,
        completed_challenges: (userData.completed_challenges || 0) + 1, // Use snake_case
        total_points: (userData.total_points || 0) + pointsEarned,
        streak: (userData.streak || 0) + 1,
      };

      await updateUser(updatedUser);

      toast({
        title: "Sfida completata!",
        description: `Hai guadagnato ${pointsEarned} punti.`,
      })
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        variant: "destructive",
        title: "Errore!",
        description: "Failed to update user stats.",
      })
    }
  };

  const handleDiscoverySourceChange = async (source: string) => {
    try {
      const updatedUser = {
        ...userData,
        discovery_source: source,
      };
      await updateUser(updatedUser);
      toast({
        title: "Fonte di scoperta aggiornata!",
        description: `Hai aggiornato la tua fonte di scoperta a ${source}.`,
      })
    } catch (error) {
      console.error("Failed to update discovery source:", error);
       toast({
        variant: "destructive",
        title: "Errore!",
        description: "Failed to update discovery source.",
      })
    }
  };

  const selectedActionsCount = userData.selected_actions?.length || 0; // Use snake_case
  const participatingChallengesCount = challenges.filter(c => c.participating).length;
  
  const hasSelectedActions = userData.selected_actions && userData.selected_actions.length > 0; // Use snake_case
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> {/* Don't pass props to Navbar if it doesn't accept them */}
      
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Ciao, {userData.name || 'Volontario'}!
        </h1>

        <Stats user={userData} totalChallenges={totalChallenges} />

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
                    <div className="mb-4">
                      <h3 className="text-md font-semibold text-gray-700 mb-2">
                        Azioni Sostenibili
                      </h3>
                      {SUSTAINABLE_ACTIONS.map((action) => (
                        <div key={action.id} className="flex items-center mb-2">
                          <Checkbox
                            id={`action-${challenge.id}-${action.id}`}
                            checked={challenge.userActions?.includes(action.id) || false}
                            onCheckedChange={(checked) => {
                              handleActionSelect(challenge.id, action.id);
                            }}
                          />
                          <label
                            htmlFor={`action-${challenge.id}-${action.id}`}
                            className="ml-2 text-sm text-gray-600"
                          >
                            {action.label} ({action.pointValue} punti)
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => handleParticipateClick(challenge.id)}
                        disabled={challenge.completed}
                      >
                        {challenge.participating ? 'Non Partecipare' : 'Partecipa'}
                      </Button>
                      <Button
                        onClick={() => handleCompleteChallengeClick(challenge.id)}
                        disabled={challenge.completed || !challenge.participating}
                      >
                        Completa
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
