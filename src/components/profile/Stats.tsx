
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { Zap, Award, Calendar, TrendingUp } from 'lucide-react';

interface StatsProps {
  user: User;
  totalChallenges: number;
}

const Stats = ({ user, totalChallenges }: StatsProps) => {
  const completedChallenges = user.completedChallenges || 0;
  const totalPoints = user.totalPoints || 0;
  const streak = user.streak || 0;
  
  const percentageCompleted = totalChallenges > 0 
    ? Math.round((completedChallenges / totalChallenges) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
      
      <StatsCard 
        title="Streak Attuale" 
        value={streak.toString()} 
        description={streak >= 3 ? "Completa 3 sfide consecutive e ottieni +5 punti bonus!" : "Completa 3 sfide consecutive per ottenere punti bonus"}
        icon={<TrendingUp className="h-5 w-5 text-orange-500" />} 
        trend={streak >= 3 ? "up" : "neutral"}
      />
      
      <StatsCard 
        title="Punti per Sfida" 
        value={completedChallenges > 0 ? Math.round(totalPoints / completedChallenges).toString() : "0"} 
        description="Media punti per sfida completata"
        icon={<Award className="h-5 w-5 text-purple-500" />} 
        trend="neutral"
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
