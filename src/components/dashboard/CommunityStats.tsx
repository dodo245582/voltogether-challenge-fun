
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const CommunityStats = () => {
  const [totalCO2Saved, setTotalCO2Saved] = useState<number>(0);

  useEffect(() => {
    const fetchTotalPoints = async () => {
      // Use RPC function to bypass RLS and get the sum of all points
      const { data, error } = await supabase.rpc('get_total_community_points');

      if (error) {
        console.error('Error fetching total community points:', error);
      } else if (data !== null) {
        // Apply the CO2 calculation formula
        const co2Saved = (data * 0.01 * 0.256).toFixed(2);
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
