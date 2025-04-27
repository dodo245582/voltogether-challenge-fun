
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CommunityStats = () => {
  const [totalCO2Saved, setTotalCO2Saved] = useState<number>(0);

  useEffect(() => {
    const fetchTotalPoints = async () => {
      const { data, error } = await supabase
        .from('Users_Challenges')
        .select('points')
        .not('points', 'is', null);

      if (!error && data) {
        const totalPoints = data.reduce((sum, record) => sum + (record.points || 0), 0);
        const co2Saved = (totalPoints * 0.01 * 0.256).toFixed(2);
        setTotalCO2Saved(parseFloat(co2Saved));
      }
    };

    fetchTotalPoints();
  }, []);

  return (
    <Card className="overflow-hidden bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-base font-medium text-gray-600">
            CO₂ Risparmiata dalla Community
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalCO2Saved.toFixed(2)} kg
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityStats;
