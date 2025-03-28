
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, profile, user, authInitialized } = useAuth();

  // Quick redirect if already authenticated
  useEffect(() => {
    if (authInitialized && user) {
      console.log("Login: User already authenticated, redirecting");
      if (profile && !profile.profile_completed) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, authInitialized, navigate]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with email:", email);
      const { error, success } = await signIn(email, password);
      
      if (success) {
        console.log("Login successful, redirecting");
        toast({
          title: 'Login effettuato',
          description: 'Hai effettuato l\'accesso con successo',
          variant: 'default',
        });
        
        // We'll do a quick local check based on any available profile info
        // but don't wait for full profile loading
        if (profile && !profile.profile_completed) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
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
