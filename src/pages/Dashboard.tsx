
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import Stats from '@/components/profile/Stats';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Challenge, User, CHALLENGE_DATES, SUSTAINABLE_ACTIONS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Award, Users, ArrowRight, Leaf, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // In futuro, questi dati verrebbero caricati da Supabase
  const [user, setUser] = useState<User>({
    id: '1',
    email: 'demo@voltogether.com',
    createdAt: new Date().toISOString(),
    city: 'Milano',
    discoverySource: 'social-media',
    selectedActions: ['laundry', 'pc', 'lights', 'tv'],
    completedChallenges: 0,
    totalPoints: 0,
    streak: 0
  });
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  // Funzione per generare le sfide
  useEffect(() => {
    const generatedChallenges = CHALLENGE_DATES.map((date, index) => ({
      id: index + 1,
      date,
      startTime: '19:00:00',
      endTime: '20:00:00',
      completed: false,
      participating: undefined,
      userActions: []
    }));
    
    setChallenges(generatedChallenges);
  }, []);
  
  // Funzione che trova la sfida corrente o la prossima
  const getCurrentOrNextChallenge = () => {
    const now = new Date();
    
    // Cerca una sfida attiva in questo momento
    const activeChallenge = challenges.find((challenge) => {
      const startTime = parseISO(`${challenge.date}T${challenge.startTime}`);
      const endTime = parseISO(`${challenge.date}T${challenge.endTime}`);
      return now >= startTime && now <= endTime;
    });
    
    if (activeChallenge) return activeChallenge;
    
    // Cerca la prossima sfida
    const todayChallenge = challenges.find((challenge) => 
      isSameDay(parseISO(challenge.date), now)
    );
    
    if (todayChallenge) return todayChallenge;
    
    // Trova la prossima sfida in base alla data
    return challenges.find((challenge) => {
      const challengeDate = parseISO(challenge.date);
      return challengeDate > now;
    });
  };
  
  const handleLogout = () => {
    // In futuro, qui ci sarà la logica di logout di Supabase
    toast({
      title: "Disconnesso",
      description: "Hai effettuato il logout con successo",
    });
    navigate('/');
  };
  
  const requestNotificationPermission = () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifiche non supportate",
        description: "Il tuo browser non supporta le notifiche push",
        variant: "destructive",
      });
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: "Notifiche attivate",
          description: "Riceverai notifiche per le prossime sfide",
        });
        
        // Demo notification
        new Notification('VolTogether - Notifiche attivate', {
          body: 'Riceverai notifiche per le prossime sfide di risparmio energetico',
          icon: '/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png'
        });
      } else {
        toast({
          title: "Permesso negato",
          description: "Non possiamo inviarti notifiche senza il tuo permesso",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleParticipate = (challengeId: number, participating: boolean) => {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId ? { ...challenge, participating } : challenge
      )
    );
    
    toast({
      title: participating ? "Partecipazione confermata" : "Partecipazione annullata",
      description: participating 
        ? "Hai confermato la tua partecipazione alla sfida" 
        : "Hai annullato la tua partecipazione alla sfida",
      variant: participating ? "default" : "destructive",
    });
    
    if (participating) {
      setUser((prev) => ({
        ...prev,
        completedChallenges: (prev.completedChallenges || 0) + 1
      }));
    }
  };
  
  const handleCompleteChallenge = (challengeId: number, actionIds: string[]) => {
    // Calcola i punti guadagnati
    const pointsPerAction = 10;
    const totalNewPoints = actionIds.length * pointsPerAction;
    
    // Aggiorna la sfida
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, completed: true, userActions: actionIds }
          : challenge
      )
    );
    
    // Determina se l'utente ha una streak
    const completedChallenges = challenges.filter((c) => c.completed).length;
    const newStreak = (user.streak || 0) + 1;
    const streakBonus = newStreak >= 3 ? 5 : 0;
    
    // Aggiorna i dati dell'utente
    setUser((prev) => ({
      ...prev,
      totalPoints: (prev.totalPoints || 0) + totalNewPoints + streakBonus,
      streak: newStreak,
    }));
    
    toast({
      title: "Sfida completata",
      description: `Hai guadagnato ${totalNewPoints} punti${streakBonus > 0 ? ` + ${streakBonus} punti bonus per la streak` : ''}!`,
      variant: "default",
    });
  };
  
  // Ottieni le azioni selezionate dall'utente
  const userActions = SUSTAINABLE_ACTIONS.filter(
    (action) => user.selectedActions?.includes(action.id)
  );
  
  // Ottieni le azioni consigliate (escluse quelle già selezionate dall'utente)
  const recommendedActions = SUSTAINABLE_ACTIONS.filter(
    (action) => !user.selectedActions?.includes(action.id)
  ).slice(0, 3);
  
  // Trova la sfida corrente o la prossima
  const currentOrNextChallenge = getCurrentOrNextChallenge();
  
  // Calcola il progresso della settimana
  const completedChallengesCount = challenges.filter((c) => c.completed).length;
  const progressPercentage = (completedChallengesCount / challenges.length) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar isAuthenticated={true} onLogout={handleLogout} />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="space-y-8">
          {/* Header e Statistiche */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Ciao, {user.city ? `da ${user.city}` : 'utente'}</h1>
                <p className="text-gray-600">Benvenuto alla tua dashboard di VolTogether</p>
              </div>
              
              <Button
                variant={notificationsEnabled ? "outline" : "default"}
                className={notificationsEnabled ? "border-voltgreen-500 text-voltgreen-700" : "bg-voltgreen-600 hover:bg-voltgreen-700"}
                onClick={requestNotificationPermission}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifiche attive
                  </>
                ) : (
                  <>
                    <BellOff className="mr-2 h-4 w-4" />
                    Attiva notifiche
                  </>
                )}
              </Button>
            </div>
            
            <Stats user={user} totalChallenges={challenges.length} />
          </div>
          
          {/* Progresso Settimanale */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Progresso Settimanale</h2>
              <Badge variant="outline" className="bg-voltgreen-50 text-voltgreen-700 border-voltgreen-200">
                {completedChallengesCount}/{challenges.length} Sfide
              </Badge>
            </div>
            
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-voltgreen-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>31 Marzo</span>
              <span>6 Aprile 2025</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Sfida Corrente/Prossima */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-voltgreen-500" />
              {currentOrNextChallenge && isSameDay(parseISO(currentOrNextChallenge.date), new Date()) 
                ? "Sfida di oggi" 
                : "Prossima sfida"}
            </h2>
            
            {currentOrNextChallenge && (
              <ChallengeCard 
                challenge={currentOrNextChallenge}
                recommendedActions={recommendedActions}
                userActions={userActions}
                onParticipate={handleParticipate}
                onCompleteChallenge={handleCompleteChallenge}
              />
            )}
          </div>
          
          {/* Community e Suggerimenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-blue-500 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Community</h3>
                    <p className="text-gray-600 mb-4">Insieme a te, ci sono altre 245 persone che partecipano alle sfide questa settimana.</p>
                    <Button variant="outline" className="w-full">
                      Scopri la community <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <Award className="h-6 w-6 text-amber-500 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Consigli per oggi</h3>
                    <p className="text-gray-600 mb-4">
                      Prova a ridurre il consumo spegnendo i dispositivi elettronici non necessari dalle 19:00 alle 20:00.
                    </p>
                    <div className="flex items-center p-2 bg-amber-50 rounded-md border border-amber-100 text-amber-800">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-sm">Fascia di picco: 19:00 - 20:00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Calendario Sfide */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Calendario Sfide</h2>
            
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  recommendedActions={recommendedActions}
                  userActions={userActions}
                  onParticipate={handleParticipate}
                  onCompleteChallenge={handleCompleteChallenge}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
