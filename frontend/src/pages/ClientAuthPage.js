import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

const ClientAuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'register') {
        await axios.post(`${API}/auth/register`, {
          email: form.email,
          password: form.password,
          name: form.name,
          role: 'client'
        });
      }
      
      await login(form.email, form.password);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/demo`, { role: 'client' }, { withCredentials: true });
      window.location.href = '/client/dashboard';
    } catch (err) {
      setError('Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="client-auth-page">
      {/* Left - White with animated flow */}
      <div className="w-1/2 bg-white flex items-center justify-center p-16">
        <ClientFlowAnimation />
      </div>

      {/* Right - Black with form */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center px-16">
        <div className="max-w-md mx-auto w-full">
          {/* Back */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white rounded-[8px] flex items-center justify-center">
              <span className="text-black font-bold">D</span>
            </div>
            <div>
              <span className="font-medium tracking-tight text-lg">Dev OS</span>
              <span className="block text-xs text-white/40">Client Portal</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-medium tracking-tight mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Start your project'}
          </h1>
          <p className="text-white/40 mb-8">
            {mode === 'signin' ? 'Manage your projects' : 'From idea to production'}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-[8px] mb-8">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-[6px] transition-all ${
                mode === 'signin' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              data-testid="tab-signin"
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-[6px] transition-all ${
                mode === 'register' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              data-testid="tab-register"
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-[8px] border border-white/20 bg-white/5 text-sm text-white/70">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-label block mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="input"
                  required={mode === 'register'}
                  data-testid="input-name"
                />
              </div>
            )}
            
            <div>
              <label className="text-label block mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="input"
                required
                data-testid="input-email"
              />
            </div>
            
            <div>
              <label className="text-label block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pr-10"
                  required
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-12 mt-6"
              data-testid="submit-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-4 text-xs text-white/30">or try demo</span>
            </div>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="btn btn-secondary w-full h-12"
            data-testid="demo-btn"
          >
            <Sparkles className="w-4 h-4" />
            Enter Demo Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

// Animated Flow for Clients
const ClientFlowAnimation = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      label: 'Your request',
      json: `{
  "idea": "Marketplace App",
  "features": [
    "User accounts",
    "Product listings",
    "Payments"
  ]
}`
    },
    {
      label: 'Our scope',
      json: `{
  "project": "Marketplace MVP",
  "stages": 4,
  "estimate": "120h",
  "team": 2
}`
    },
    {
      label: 'In progress',
      json: `{
  "stage": "Development",
  "progress": "65%",
  "completed": [
    "Auth API",
    "Product CRUD"
  ]
}`
    },
    {
      label: 'Delivery',
      json: `{
  "version": "1.0",
  "status": "pending_approval",
  "includes": [
    "Source code",
    "Documentation",
    "Preview link"
  ]
}`
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md">
      {/* Flow steps */}
      <div className="flex items-center justify-between mb-8">
        {['Request', 'Scope', 'Build', 'Ship'].map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              i <= step ? 'bg-black text-white' : 'bg-black/5 text-black/30'
            }`}>
              {i + 1}
            </div>
            {i < 3 && (
              <div className={`w-12 h-0.5 transition-all ${
                i < step ? 'bg-black' : 'bg-black/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Terminal */}
      <div className="border border-black/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10 bg-black/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
          </div>
          <span className="text-xs text-black/40 ml-2 font-mono">{steps[step].label}</span>
        </div>

        <div className="p-5 min-h-[240px] font-mono text-sm">
          <pre className="text-black/60 whitespace-pre animate-fade-in">
            {steps[step].json}
          </pre>
        </div>
      </div>

      {/* Caption */}
      <div className="text-center mt-6">
        <p className="text-sm text-black/40">
          From idea to production.<br />
          <span className="text-black">You decide. We deliver.</span>
        </p>
      </div>
    </div>
  );
};

export default ClientAuthPage;
