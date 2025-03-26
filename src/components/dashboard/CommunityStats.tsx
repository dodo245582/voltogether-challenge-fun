
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CommunityStats = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeUsers: 127,
    completedChallenges: 842,
    impact: '26.5 kWh risparmiati'
  });

  useEffect(() => {
    // You could fetch real community stats from Supabase here
    // This is just a placeholder for now
    const fetchCommunityStats = async () => {
      try {
        // Example query to count active users
        // const { count: activeUsers } = await supabase
        //   .from('Users')
        //   .select('*', { count: 'exact', head: true });
        
        // For now, we just simulate the values
        // In the future, this could be connected to real data
        setStats({
          activeUsers: 127 + (profile?.completed_challenges || 0),
          completedChallenges: 842 + (profile?.completed_challenges || 0),
          impact: '26.5 kWh risparmiati'
        });
      } catch (error) {
        console.error("Error fetching community stats:", error);
      }
    };

    fetchCommunityStats();
  }, [profile]);

  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <CardTitle className="text-xl font-semibold mb-4">Community</CardTitle>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Utenti attivi</span>
            <span className="font-medium">{stats.activeUsers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Sfide completate</span>
            <span className="font-medium">{stats.completedChallenges}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Impatto totale</span>
            <span className="font-medium">{stats.impact}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityStats;
