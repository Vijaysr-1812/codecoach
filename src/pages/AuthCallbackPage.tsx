import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Mock auth hook - replace with actual auth service
const useAuth = () => ({
  exchangeCodeForSessionToken: async () => {
    // Mock implementation
    return Promise.resolve();
  }
});
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/login'); // Will redirect to profile or profile creation
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
