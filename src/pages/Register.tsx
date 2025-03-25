
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error, success } = await signUp(email, password);
      
      if (success) {
        toast({
          title: 'Registrazione completata',
          description: 'Account creato con successo',
          variant: 'default',
        });
        
        // Passa all'onboarding
        navigate('/onboarding');
      } else {
        console.error("Registration error:", error);
        let errorMessage = 'Si è verificato un errore durante la registrazione';
        
        if (error?.message.includes('already registered')) {
          errorMessage = 'Questo indirizzo email è già registrato';
        }
        
        toast({
          title: 'Errore di registrazione',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast({
        title: 'Errore di registrazione',
        description: 'Si è verificato un errore imprevisto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} VolTogether. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default Register;
