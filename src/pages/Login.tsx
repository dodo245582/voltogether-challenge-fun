
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, loading, signOut } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  // Se abbiamo già un utente, mostriamo l'opzione per fare logout
  useEffect(() => {
    if (user) {
      setShowLogout(true);
    }
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with email:", email);
      const { error, success } = await signIn(email, password);
      
      if (success) {
        console.log("Login successful, setting success state");
        setLoginSuccessful(true);
        toast({
          title: 'Login effettuato',
          description: 'Hai effettuato l\'accesso con successo',
          variant: 'default',
        });
        
        // Let the protected route handle the redirection
        // It will check profile_completed and redirect accordingly
        navigate('/dashboard', { replace: true });
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

  const handleLogout = async () => {
    try {
      console.log("Logging out current user");
      await signOut();
      setShowLogout(false);
      toast({
        title: 'Logout effettuato',
        description: 'Hai effettuato il logout con successo',
        variant: 'default',
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: 'Errore durante il logout',
        description: 'Si è verificato un errore durante il logout',
        variant: 'destructive',
      });
    }
  };

  // Se stiamo ancora caricando lo stato dell'autenticazione, mostra spinner
  if (loading) {
    return <DashboardLoadingState />;
  }

  // Se il login è avvenuto con successo, mostra lo spinner
  if (loginSuccessful) {
    return <DashboardLoadingState />;
  }

  // Se l'utente è già autenticato, mostra l'opzione per fare logout
  if (showLogout) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow flex items-center justify-center px-4 py-24 animate-fade-in">
          <div className="w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Sei già autenticato</h2>
            <p className="mb-6">Hai già effettuato l'accesso come {user?.email}</p>
            <div className="space-y-4">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Vai alla Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Esci e accedi con un altro account
              </Button>
            </div>
          </div>
        </main>
        
        <footer className="py-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
        </footer>
      </div>
    );
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
