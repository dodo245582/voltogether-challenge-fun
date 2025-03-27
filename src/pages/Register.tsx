
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { Button } from '@/components/ui/button';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user, loading, signOut } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  // Se abbiamo già un utente, mostriamo l'opzione per fare logout
  useEffect(() => {
    if (user) {
      setShowLogout(true);
    }
  }, [user]);

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting registration with email:", email);
      const { error, success } = await signUp(email, password);
      
      if (success) {
        console.log("Registration successful, setting success state");
        setRegistrationSuccessful(true);
        
        toast({
          title: 'Registrazione completata',
          description: 'Ti abbiamo inviato un\'email di conferma. Procedi ora a completare il tuo profilo.',
          variant: 'default',
        });
        
        // Redirect to onboarding for new users to complete their profile
        navigate('/onboarding');
      } else {
        console.error("Registration error:", error);
        let errorMessage = 'Si è verificato un errore durante la registrazione';
        
        if (error?.message?.includes('already registered')) {
          errorMessage = 'Questo indirizzo email è già registrato';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Errore di registrazione',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast({
        title: 'Errore di registrazione',
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

  // Se la registrazione è avvenuta con successo, mostra lo spinner
  if (registrationSuccessful) {
    return <DashboardLoadingState />;
  }

  // Se l'utente è già autenticato, mostra l'opzione per fare logout
  if (showLogout) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow flex items-center justify-center px-4 py-24 animate-fade-in">
          <div className="w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Sei già registrato</h2>
            <p className="mb-6">Hai già effettuato l'accesso come {user?.email}</p>
            <div className="space-y-4">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Vai alla Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Esci e registra un nuovo account
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
            type="register" 
            onSubmit={handleRegister} 
            isLoading={isLoading} 
          />
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p className="italic">Dopo la registrazione, controlla la tua email per confermare il tuo account.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default Register;
