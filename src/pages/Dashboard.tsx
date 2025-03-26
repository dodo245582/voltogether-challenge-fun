
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import Stats from '@/components/profile/Stats';
import { useNotifications } from '@/context/NotificationContext';
import Footer from '@/components/layout/Footer';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [challengeStats, setChallengeStats] = useState({
    totalChallenges: 7,
    completedChallenges: user?.profile?.challenges_participated || 0,
    points: user?.profile?.points || 0
  });

  useEffect(() => {
    if (user && !user.profile?.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.profile) {
      setChallengeStats({
        totalChallenges: 7,
        completedChallenges: user.profile.challenges_participated || 0,
        points: user.profile.points || 0
      });
    }
  }, [user]);

  // Always render with white background
  useEffect(() => {
    document.body.classList.add('bg-white');
    return () => {
      document.body.classList.remove('bg-white');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/8fb26252-8fb0-4f8b-8f11-0c217cfcbf7b.png" 
              alt="VolTogether" 
              className="h-9" 
            />
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
          
          {user && (
            <div className="flex items-center">
              <div className="mr-4 text-right hidden sm:block">
                <p className="font-medium text-gray-900">{user.profile?.name || user.email}</p>
                <p className="text-sm text-gray-500">{challengeStats.points} punti</p>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChallengeCard />
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Prossimi Eventi</h2>
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
            </div>
          </div>
          
          <div className="space-y-6">
            <Stats 
              challengesParticipated={challengeStats.completedChallenges}
              totalChallenges={challengeStats.totalChallenges}
              points={challengeStats.points}
            />
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Community</h2>
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
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
