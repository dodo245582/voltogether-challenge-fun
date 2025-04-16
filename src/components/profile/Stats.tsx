import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { Zap, Award, Calendar, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const Stats = () => {

  const [totalPoints, setTotalPoints] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [streak, setStreak] = useState(0);


    useEffect(() => {
      fetchData();
    }, []);



      const fetchData = async () => {
      
        try {
          // Fetch all challenges, including their action_ids arrays and associated challenge_user
          const { data: userChallenges, error: challengeError } = await supabase
          .from('Users_Challenges')
          .select('id, points')

          if (challengeError) {
            console.error('Error fetching challenge:', challengeError);
            return;
            }
          
          setTotalPoints(userChallenges.reduce((sum, userChallenge) => sum + (userChallenge.points || 0), 0));

          setTotalChallenges(userChallenges.length);
          setCompletedChallenges(userChallenges.filter(userChallenge => userChallenge.points > 0).length);

            let currentStreak = 0;
            let maxStreak = 0;

            // Sort challenges by id in descending order to prioritize the most recent ones
            const sortedChallenges = userChallenges.sort((a, b) => b.id - a.id);

            // Iterate through sorted challenges to calculate streak
            sortedChallenges.forEach((challenge) => {
              if (challenge.points > 0) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
              } else {
              currentStreak = 0;
              }
            });

            setStreak(maxStreak);
      
        } catch (error) {
          console.error('Unexpected error:', error);
        }
      
        };


  const percentageCompleted = totalChallenges > 0 
    ? Math.round((completedChallenges / totalChallenges) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4">
      <StatsCard 
        title="Punti Totali" 
        value={totalPoints.toString()} 
        description="Punti guadagnati dalle sfide" 
        icon={<Zap className="h-5 w-5 text-blue-500" />} 
        trend={totalPoints > 0 ? "up" : "neutral"}
      />
      
      <StatsCard 
        title="Sfide Completate" 
        value={`${completedChallenges}/${totalChallenges}`} 
        description={`${percentageCompleted}% delle sfide completate`}
        icon={<Calendar className="h-5 w-5 text-green-500" />} 
        trend={completedChallenges > 0 ? "up" : "neutral"}
      />
      
      {streak === 2 && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertDescription className="flex items-center">
            <span className="font-medium">Possibilità di streak!</span>
            <span className="ml-1">Se completi la prossima sfida hai 5 punti bonus!</span>
          </AlertDescription>
        </Alert>
      )}
      
      <StatsCard 
        title="Streak Attuale" 
        value={streak.toString()} 
        description={
          streak === 2 
            ? "Completa la prossima sfida per ottenere +5 punti bonus!" 
            : streak >= 3 
              ? "Completa 3 sfide consecutive e ottieni +5 punti bonus!" 
              : "Completa 3 sfide consecutive per ottenere punti bonus"
        }
        icon={<TrendingUp className="h-5 w-5 text-orange-500" />} 
        trend={streak >= 3 ? "up" : (streak === 2 ? "up" : "neutral")}
      />
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== "neutral" && (
          <div className={`mt-2 text-xs flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>in crescita</span>
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
                <span>in calo</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Stats;
