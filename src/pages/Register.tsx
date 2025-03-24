
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    // In futuro, qui andrà la logica di Supabase per la registrazione
    console.log('Register attempt with:', email, password, name);
    
    // Simula un ritardo per la registrazione
    setTimeout(() => {
      setIsLoading(false);
      
      // Salva il nome in localStorage per usarlo successivamente
      if (name) {
        localStorage.setItem('userName', name);
      }
      
      // Successo
      toast({
        title: 'Registrazione completata',
        description: 'Account creato con successo',
        variant: 'default',
      });
      
      // Passa all'onboarding
      navigate('/onboarding');
    }, 1500);
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
