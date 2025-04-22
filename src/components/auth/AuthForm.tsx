
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

const AuthForm = ({ type, onSubmit, isLoading = false }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    // Email validation
    if (!email) {
      newErrors.email = 'L\'email è richiesta';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'L\'email non è valida';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'La password è richiesta';
      isValid = false;
    } else if (type === 'register' && password.length < 8) {
      newErrors.password = 'La password deve contenere almeno 8 caratteri';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email, password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-scale-in border border-gray-200">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">
          {type === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
        </CardTitle>
        <CardDescription>
          {type === 'login' 
            ? 'Inserisci le tue credenziali per accedere' 
            : 'Registrati per partecipare alle sfide energetiche'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          
          {type === 'login' && (
            <div className="text-right">
              <a 
  href="https://app.voltogether.it/support" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-sm text-voltgreen-600 hover:text-voltgreen-700"
>
  Password dimenticata?
</a>

            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-voltgreen-600 hover:bg-voltgreen-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {type === 'login' ? 'Accesso in corso...' : 'Registrazione in corso...'}
              </span>
            ) : (
              <>{type === 'login' ? 'Accedi' : 'Registrati'}</>
            )}
          </Button>
          
          <div className="text-center text-sm">
            {type === 'login' ? (
              <p>
                Non hai un account?{' '}
                <Link to="/register" className="text-voltgreen-600 hover:text-voltgreen-700 font-medium">
                  Registrati
                </Link>
              </p>
            ) : (
              <p>
                Hai già un account?{' '}
                <Link to="/login" className="text-voltgreen-600 hover:text-voltgreen-700 font-medium">
                  Accedi
                </Link>
              </p>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;
