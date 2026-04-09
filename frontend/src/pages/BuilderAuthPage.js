import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff, Loader2, Terminal } from 'lucide-react';

const BuilderAuthPage = () => {
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
          role: 'developer'
        });
      }
      
      await login(form.email, form.password);
      navigate('/developer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/demo`, { role: 'developer' }, { withCredentials: true });
      window.location.href = '/developer/dashboard';
    } catch (err) {
      setError('Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="builder-auth-page">
      {/* Left - Black with form */}
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
              <span className="block text-xs text-white/40">Builder Access</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-medium tracking-tight mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Join as Builder'}
          </h1>
          <p className="text-white/40 mb-8">
            {mode === 'signin' ? 'Access your workspace' : 'Start building with Dev OS'}
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
                placeholder="you@email.com"
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

          {/* Demo Button - Single */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="btn btn-secondary w-full h-12"
            data-testid="demo-btn"
          >
            <Terminal className="w-4 h-4" />
            Enter Demo Workspace
          </button>
        </div>
      </div>

      {/* Right - White with animated code */}
      <div className="w-1/2 bg-white flex items-center justify-center p-16">
        <WorkflowAnimation />
      </div>
    </div>
  );
};

// Animated Workflow
const WorkflowAnimation = () => {
  const [currentLine, setCurrentLine] = useState(0);
  
  const codeLines = [
    { text: '// workflow.ts', dim: true },
    { text: '' },
    { text: 'const pipeline = {' },
    { text: '  request: "received",' },
    { text: '  scope: "structured",' },
    { text: '  assignment: "auto",' },
    { text: '  execution: "tracked",' },
    { text: '  review: "verified",' },
    { text: '  delivery: "approved"' },
    { text: '};' },
    { text: '' },
    { text: '// You build.' },
    { text: '// We manage.' },
    { text: '// Client receives.' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= codeLines.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md">
      {/* Terminal header */}
      <div className="border border-black/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10 bg-black/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
          </div>
          <span className="text-xs text-black/40 ml-2 font-mono">execution_platform</span>
        </div>

        {/* Code content */}
        <div className="p-6 min-h-[320px] font-mono text-sm">
          {codeLines.slice(0, currentLine + 1).map((line, i) => (
            <div 
              key={i}
              className={`${line.dim ? 'text-black/30' : 'text-black/70'} ${
                i === currentLine ? 'animate-fade-in' : ''
              }`}
              style={{ minHeight: '1.5rem' }}
            >
              {line.text}
            </div>
          ))}
          <span className="inline-block w-2 h-4 bg-black/30 animate-pulse" />
        </div>
      </div>

      {/* Stats below */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatBlock label="Builders" value="200+" />
        <StatBlock label="Projects" value="500+" />
        <StatBlock label="Delivery" value="98%" />
      </div>
    </div>
  );
};

const StatBlock = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-medium text-black">{value}</div>
    <div className="text-xs text-black/40 mt-1">{label}</div>
  </div>
);

export default BuilderAuthPage;
