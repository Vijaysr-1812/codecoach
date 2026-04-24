'use client'; // This directive might be needed depending on your setup
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Code, User } from 'lucide-react';
import Particles from '@/components/Particles';
import { supabase } from '@/lib/supabase'; // Import the client
import { useAuth } from '@/hooks/useAuth'; // Import the hook

const StudentLogin = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // If they were bounced here by ProtectedRoute, go back to where they were headed.
  const redirectTo =
    (location.state as { from?: { pathname: string; search: string } } | null)?.from?.pathname
      ? `${(location.state as { from: { pathname: string; search: string } }).from.pathname}${
          (location.state as { from: { pathname: string; search: string } }).from.search || ''
        }`
      : '/profile';

  // If the user is already logged in, send them to their intended destination.
  useEffect(() => {
    if (session) {
      navigate(redirectTo, { replace: true });
    }
  }, [session, navigate, redirectTo]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your email and password',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // Navigation is handled by the useEffect
    }
  };

  // ▼▼▼ THIS IS THE UPDATED AND SIMPLIFIED FUNCTION ▼▼▼
  const handleSignup = async () => {
    if (!email || !password || !username) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    // We now pass the username in `options.data` for our database trigger to use.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data.user) {
      // We no longer need to manually insert the profile here. The database does it!
      toast({
        title: 'Account Created',
        description: `Welcome, ${username}! Please check your email to verify.`,
      });
      // The useEffect and AuthProvider will handle navigation after the session starts.
    }
  };
  // ▲▲▲ END OF UPDATED FUNCTION ▲▲▲

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Particles />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Code className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CodeCoach Access
          </h1>
          <p className="text-muted-foreground">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isSignup ? 'Sign Up' : 'Login'}
            </CardTitle>
            <CardDescription>
              {isSignup
                ? 'Create a new account to access CodeCoach'
                : 'Sign in to your CodeCoach account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50"
                  disabled={loading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50"
                disabled={loading}
              />
            </div>
            <Button
              onClick={isSignup ? handleSignup : handleLogin}
              className="w-full neon-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Login')}
            </Button>

            <div className="text-center mt-2">
              <Button
                variant="link"
                className="text-primary"
                onClick={() => setIsSignup(!isSignup)}
                disabled={loading}
              >
                {isSignup
                  ? 'Already have an account? Login'
                  : "Don't have an account? Sign Up"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;