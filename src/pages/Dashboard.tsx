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
import { useNotifications } from '@/context/NotificationContext';
import NotificationModals from '@/components/notifications/NotificationModals';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notificationsEnabled, enableNotifications } = useNotifications();
  const { signOut } = useAuth();
  
  // Recupera il nome dell'utente dal localStorage
  const userName = localStorage.getItem('userName') || 'utente';
  
  // In futuro, questi dati verrebbero caricati da Supabase
  const [user, setUser] = useState<User>({
    id: '1',
    email: 'demo@voltogether.com',
    name: userName,
    createdAt: new Date().toISOString(),
    city: localStorage.getItem('userCity') || 'Milano',
    discoverySource: localStorage.getItem('userDiscoverySource') as any || 'social-media',
    selectedActions: JSON.parse(localStorage.getItem('userSelectedActions') || '[]'),
    completedChallenges: parseInt(localStorage.getItem('completedChallenges') || '0'),
    totalPoints: parseInt(localStorage.getItem('totalPoints') || '0'),
    streak: parseInt(localStorage.getItem('streak') || '0')
  });
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  // Funzione per generare le sfide
  useEffect(() => {
    const generatedChallenges = CHALLENGE_DATES.map((date, index) => {
      const challengeId = index + 1;
      const participating = localStorage.getItem(`challenge_${challengeId}_participating`) === 'true';
      const completed = localStorage.getItem(`challenge_${challengeId}_completed`) === 'true';
      const userActions = JSON.parse(localStorage.getItem(`challenge_${challengeId}_actions`) || '[]');
      
      return {
        id: challengeId,
        date,
        startTime: '19:00:00',
        endTime: '20:00:00',
        completed,
        participating,
        userActions
      };
    });
    
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
    
    // Cerca la sfida di oggi
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
    // Use the signOut function from AuthContext
    signOut();
    
    // Clear localStorage data
    localStorage.removeItem('userName');
    localStorage.removeItem('userCity');
    localStorage.removeItem('userDiscoverySource');
    localStorage.removeItem('userSelectedActions');
    localStorage.removeItem('completedChallenges');
    localStorage.removeItem('totalPoints');
    localStorage.removeItem('streak');
    
    // Rimuovi anche i dati delle sfide
    challenges.forEach(challenge => {
      localStorage.removeItem(`challenge_${challenge.id}_participating`);
      localStorage.removeItem(`challenge_${challenge.id}_completed`);
      localStorage.removeItem(`challenge_${challenge.id}_actions`);
    });
    
    toast({
      title: "Disconnesso",
      description: "Hai effettuato il logout con successo",
    });
  };
  
  const handleParticipate = (challengeId: number, participating: boolean) => {
    // Salva la partecipazione
    localStorage.setItem(`challenge_${challengeId}_participating`, participating.toString());
    
    // Aggiorna la lista delle sfide
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
      // Aggiorna il contatore delle sfide partecipate
      const completedChallenges = parseInt(localStorage.getItem('completedChallenges') || '0');
      localStorage.setItem('completedChallenges', (completedChallenges + 1).toString());
      
      setUser((prev) => ({
        ...prev,
        completedChallenges: (prev.completedChallenges || 0) + 1
      }));
    }
  };
  
  const handleCompleteChallenge = (challengeId: number, actionIds: string[]) => {
    // Salva le azioni completate
    localStorage.setItem(`challenge_${challengeId}_actions`, JSON.stringify(actionIds));
    
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
    
    // Segna la sfida come completata
    localStorage.setItem(`challenge_${challengeId}_completed`, 'true');
    
    // Determina se l'utente ha una streak
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    const newStreak = currentStreak + 1;
    const streakBonus = newStreak >= 3 ? 5 : 0;
    
    // Salva lo streak
    localStorage.setItem('streak', newStreak.toString());
    
    // Aggiorna punti totali
    const currentPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    const newTotalPoints = currentPoints + totalNewPoints + streakBonus;
    localStorage.setItem('totalPoints', newTotalPoints.toString());
    
    // Aggiorna i dati dell'utente
    setUser((prev) => ({
      ...prev,
      totalPoints: newTotalPoints,
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
  
  // Prepara le date per il display del progresso settimanale
  const firstDate = challenges.length > 0 ? parseISO(challenges[0].date) : new Date();
  const lastDate = challenges.length > 0 ? parseISO(challenges[challenges.length - 1].date) : new Date();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onLogout={handleLogout} />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="space-y-8">
          {/* Header e Statistiche */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Ciao, {user.name}</h1>
                <p className="text-gray-600">Benvenuto alla tua dashboard di VolTogether</p>
              </div>
              
              <Button
                variant={notificationsEnabled ? "outline" : "default"}
                className={notificationsEnabled ? "border-voltgreen-500 text-voltgreen-700" : "bg-voltgreen-600 hover:bg-voltgreen-700"}
                onClick={enableNotifications}
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
              <span>{format(firstDate, 'd MMMM', { locale: it })}</span>
              <span>{format(lastDate, 'd MMMM yyyy', { locale: it })}</span>
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
      
      <NotificationModals />
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
