
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
    <>
      {/* 🚀 Telegram Banner */}
      <div className="bg-green-500 text-white text-center py-2 mb-4 rounded shadow flex items-center justify-center space-x-2">
        {/* Telegram Icon */}
        <img
          src="/telegram-icon.png"
          alt="Telegram"
          className="h-5 w-5"
        />
        <strong>
          Unisciti al nostro canale Telegram per non perderti gli ultimi aggiornamenti!
          <a
            href="https://t.me/+p2j68UWf0yZkZjk8"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-2"
          >
            Clicca qui per iscriverti
          </a>
        </strong>
      </div>

      {/* CO₂ Box */}
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
    </>
  );
};

export default CommunityStats;


// import { useEffect, useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { supabase } from '@/integrations/supabase/client';

// const CommunityStats = () => {
//   const [totalCO2Saved, setTotalCO2Saved] = useState<number>(0);

//   useEffect(() => {
//     const fetchTotalPoints = async () => {
//       // Use RPC function to bypass RLS and get the sum of all points
//       const { data, error } = await supabase.rpc('get_total_community_points');

//       if (error) {
//         console.error('Error fetching total community points:', error);
//       } else if (data !== null) {
//         // Apply the CO2 calculation formula
//         const co2Saved = (data * 0.01 * 0.256).toFixed(2);
//         setTotalCO2Saved(parseFloat(co2Saved));
//       }
//     };

//     fetchTotalPoints();
//   }, []);

//   return (
//     <>
//       <Card className="overflow-hidden bg-white shadow-sm">
//         <CardContent className="p-6">
//           <div className="text-center">
//             <h3 className="text-base font-medium text-gray-600">
//               CO₂ Risparmiata dalla Community
//             </h3>
//             <p className="mt-2 text-3xl font-bold text-gray-900">
//               {totalCO2Saved.toFixed(2)} kg
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* 🚀 Telegram Banner */}
//       <div className="bg-blue-500 text-white text-center py-2 mt-4 rounded shadow">
//         Unisciti al nostro canale Telegram per non perderti gli ultimi aggiornamenti!
//         <a
//           href="https://t.me/+p2j68UWf0yZkZjk8"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="underline ml-2"
//         >
//           Clicca qui per iscriverti
//         </a>
//       </div>
//     </>
//   );
// };



// export default CommunityStats;
