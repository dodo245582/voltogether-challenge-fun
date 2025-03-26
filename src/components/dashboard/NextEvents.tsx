
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const NextEvents = () => {
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <CardTitle className="text-xl font-semibold mb-4">Prossimi Eventi</CardTitle>
      <CardContent className="p-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div>
              <p className="font-medium">Sfida Giornaliera</p>
              <p className="text-sm text-gray-500">Domani, 19:00 - 20:00</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
              +10 punti
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div>
              <p className="font-medium">Sfida Energetica Speciale</p>
              <p className="text-sm text-gray-500">Questo weekend</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-voltgreen-100 text-voltgreen-700 rounded-full">
              +20 punti
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextEvents;
