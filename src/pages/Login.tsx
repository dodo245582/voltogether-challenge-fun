
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, authInitialized, profile, refreshProfile } = useAuth();

  // Quick redirect if already authenticated
  useEffect(() => {
    if (!authInitialized) return;
    
    if (user) {
      console.log("Login: User already authenticated, redirecting");
      setRedirecting(true);
      
      // Make sure profile is loaded
      if (user.id && !profile) {
        console.log("Login: Profile not loaded, fetching profile before redirect");
        refreshProfile(user.id)
          .then(() => {
            // After profile fetch, determine where to go
            if (profile?.profile_completed) {
              console.log("Login: Profile completed, redirecting to dashboard");
              navigate('/dashboard', { replace: true });
            } else {
              console.log("Login: Profile not completed, redirecting to onboarding");
              navigate('/onboarding', { replace: true });
            }
          })
          .catch(error => {
            console.error("Failed to refresh profile:", error);
            // Default to onboarding if profile fetch fails
            navigate('/onboarding', { replace: true });
          });
      } else {
        // Profile already loaded, determine where to go
        if (profile?.profile_completed) {
          console.log("Login: Profile completed, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("Login: Profile not completed, redirecting to onboarding");
          navigate('/onboarding', { replace: true });
        }
      }
    }
  }, [user, authInitialized, navigate, profile, refreshProfile]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with email:", email);
      const { error, success } = await signIn(email, password);
      
      if (success) {
        console.log("Login successful, preparing redirect");
        toast({
          title: 'Login effettuato',
          description: 'Hai effettuato l\'accesso con successo',
          variant: 'default',
        });
        
        // Show loading state to avoid flicker
        setRedirecting(true);
        
        // Profile status check is now handled by the useEffect above
        // The redirect will happen once the profile is loaded
      } else {
        console.error("Login error:", error);
        let errorMessage = 'Email o password non validi';
        
        if (error?.code === 'email_not_confirmed') {
          errorMessage = 'Email non confermata. Controlla la tua casella email per confermare la registrazione.';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Errore di login',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        title: 'Errore di login',
        description: 'Si è verificato un errore imprevisto',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  if (redirecting) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-24 animate-fade-in">
        <div className="w-full max-w-md">
          <AuthForm 
            type="login" 
            onSubmit={handleLogin} 
            isLoading={isLoading} 
          />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo: usa <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">demo@voltogether.com</span> e <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">password123</span></p>
            <p className="mt-2 italic">Nota: Per l'account demo, assicurati di controllare l'email per confermare la registrazione oppure disabilita la verifica email nelle impostazioni di Supabase.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default Login;
