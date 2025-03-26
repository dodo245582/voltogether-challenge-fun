
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const CommunityStats = () => {
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <CardTitle className="text-xl font-semibold mb-4">Community</CardTitle>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Utenti attivi</span>
            <span className="font-medium">127</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Sfide completate</span>
            <span className="font-medium">842</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Impatto totale</span>
            <span className="font-medium">26.5 kWh risparmiati</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityStats;
