// src/pages/Login.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DarkVeil from '../../components/effects/DarkVeil';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const fadeInStyle = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If we already have a session, push to the dashboard.
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message || 'Login failed. Please try again.');
      return;
    }

    // Successful login; client now has a session. Navigate on same origin.
    navigate('/admin/dashboard', { replace: true });
  };

  // While the auth hook is checking the initial session, you can gate the UI (optional)
  if (authLoading) {
    return (
      <div className="fixed inset-0 grid place-items-center">
        <p className="text-white/80">Checking session…</p>
      </div>
    );
  }

  return (
    <>
      <style>{fadeInStyle}</style>
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <DarkVeil hueShift={1000} speed={0.3} warpAmount={0.2} />
        </div>

        <Card
          className="w-full max-w-md shadow-2xl relative z-10 bg-[rgb(0_0_0_/_0.45)] backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.7s ease-in forwards', opacity: 0 }}
        >
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/SystemaLogo.png"
                alt="SystemUOA Logo"
                className="h-20 w-auto"
              />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Systema
            </CardTitle>
            <CardDescription className="text-base text-white">
              Recruiter Login Portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recruiter@company.com"
                  className="border-white text-white placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="border-white text-white placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                size="lg"
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-white">Don't have an account? </span>
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
