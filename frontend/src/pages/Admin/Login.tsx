import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from '../../services/auth.service';
import DarkVeil from '../../components/effects/DarkVeil';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0">
        <DarkVeil
          hueShift={1000}
          speed={0.3}
          warpAmount={0.2}
        />
      </div>
      
      <Card className="w-full max-w-md shadow-2xl relative z-10 bg-[rgba(12_13_15_/_0.6)] backdrop-blur-sm">
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
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
  );
}

