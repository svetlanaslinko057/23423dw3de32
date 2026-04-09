import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white" data-testid="landing-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-[6px] flex items-center justify-center">
              <span className="text-black font-bold text-sm">D</span>
            </div>
            <span className="font-medium tracking-tight">Dev OS</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/builder/auth')}
              className="text-sm text-white/50 hover:text-white transition-colors"
              data-testid="nav-builders"
            >
              For Builders
            </button>
            <button 
              onClick={() => navigate('/client/auth')}
              className="text-sm text-white/50 hover:text-white transition-colors"
              data-testid="nav-clients"
            >
              For Clients
            </button>
          </div>
        </div>
      </nav>

      {/* Hero - Split Screen */}
      <section className="min-h-screen flex">
        {/* Left - Black with content */}
        <div className="w-1/2 bg-black flex flex-col justify-center px-16 pt-14">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 mb-8">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-xs text-white/60 tracking-wide">EXECUTION PLATFORM</span>
            </div>
            
            <h1 className="text-5xl font-medium tracking-tight leading-tight mb-6">
              Ship products,<br />
              <span className="text-white/30">not tickets</span>
            </h1>
            
            <p className="text-lg text-white/40 leading-relaxed mb-10">
              Real developers. Structured workflow.<br />
              From idea to production.
            </p>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/client/auth')}
                className="btn btn-primary btn-lg"
                data-testid="hero-start"
              >
                Start Project
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/builder/auth')}
                className="btn btn-ghost btn-lg"
                data-testid="hero-join"
              >
                Join as Builder
              </button>
            </div>
          </div>
        </div>

        {/* Right - White with animated code */}
        <div className="w-1/2 bg-white flex items-center justify-center p-16">
          <AnimatedWorkflow />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <ProcessStep 
              number="01"
              title="Submit"
              description="Describe your product. We structure it into scope."
            />
            <ProcessStep 
              number="02"
              title="Execute"
              description="Real developers build. Tracked. Verified."
            />
            <ProcessStep 
              number="03"
              title="Ship"
              description="Review deliverables. Approve. Go live."
            />
          </div>
        </div>
      </section>

      {/* Terminal Section */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <TerminalDemo />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-medium tracking-tight mb-4">Ready to ship?</h2>
          <p className="text-white/40 mb-8">Get a structured scope within 24 hours.</p>
          <button 
            onClick={() => navigate('/client/auth')}
            className="btn btn-primary btn-lg"
            data-testid="cta-start"
          >
            Start Project
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">D</span>
            </div>
            <span className="text-xs text-white/30">Dev OS</span>
          </div>
          <p className="text-xs text-white/20">Execution platform for product teams</p>
        </div>
      </footer>
    </div>
  );
};

// Animated Workflow Component
const AnimatedWorkflow = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: 'Request received',
      code: `{
  "project": "marketplace",
  "type": "mvp",
  "status": "pending"
}`,
      color: 'text-black'
    },
    {
      title: 'Scope created',
      code: `scope.create({
  features: ["auth", "products", "payments"],
  estimate: "120h",
  stages: 4
});`,
      color: 'text-black'
    },
    {
      title: 'Work assigned',
      code: `workUnit.assign({
  task: "auth_api",
  developer: "dev_001",
  status: "in_progress"
});`,
      color: 'text-black'
    },
    {
      title: 'Submission',
      code: `submission.create({
  summary: "Auth API complete",
  links: ["github.com/..."],
  status: "review"
});`,
      color: 'text-black'
    },
    {
      title: 'Delivered',
      code: `deliverable.send({
  version: "1.0",
  status: "pending_approval",
  client: "client_001"
});`,
      color: 'text-black'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((_, i) => (
          <div 
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-black' : 'bg-black/10'
            }`}
          />
        ))}
      </div>

      {/* Terminal window */}
      <div className="border border-black/10 rounded-xl overflow-hidden bg-black/[0.02]">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10 bg-black/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
            <div className="w-3 h-3 rounded-full bg-black/10" />
          </div>
          <span className="text-xs text-black/40 ml-2 font-mono">{steps[step].title}</span>
        </div>

        {/* Code */}
        <div className="p-5 min-h-[200px]">
          <pre className="font-mono text-sm text-black/70 whitespace-pre-wrap animate-fade-in">
            {steps[step].code}
          </pre>
        </div>

        {/* Status */}
        <div className="px-5 py-3 border-t border-black/10 flex items-center justify-between">
          <span className="text-xs text-black/40">Step {step + 1} of {steps.length}</span>
          <span className="flex items-center gap-1.5 text-xs text-black/60">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Processing
          </span>
        </div>
      </div>
    </div>
  );
};

// Terminal Demo
const TerminalDemo = () => {
  const [lines, setLines] = useState([]);
  
  const allLines = [
    { type: 'command', text: '> devos init marketplace-app' },
    { type: 'output', text: '  Creating project scope...' },
    { type: 'output', text: '  ✓ Scope defined: 4 features, 120h estimate' },
    { type: 'command', text: '> devos assign --auto' },
    { type: 'output', text: '  Assigning developers...' },
    { type: 'output', text: '  ✓ dev_alex → auth_module' },
    { type: 'output', text: '  ✓ dev_maria → product_api' },
    { type: 'command', text: '> devos status' },
    { type: 'output', text: '  Progress: ████████░░ 80%' },
    { type: 'output', text: '  In Review: 2 submissions' },
    { type: 'command', text: '> devos deliver --version 1.0' },
    { type: 'output', text: '  Building deliverable...' },
    { type: 'success', text: '  ✓ Deliverable ready for client approval' },
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLines.length) {
        setLines(prev => [...prev, allLines[i]]);
        i++;
      } else {
        // Reset after pause
        setTimeout(() => {
          setLines([]);
          i = 0;
        }, 2000);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
        <span className="text-xs text-white/30 ml-2 font-mono">devos-cli</span>
      </div>

      {/* Terminal content */}
      <div className="p-5 min-h-[320px] font-mono text-sm">
        {lines.map((line, i) => (
          <div 
            key={i}
            className={`mb-1 animate-slide-up ${
              line.type === 'command' ? 'text-white' :
              line.type === 'success' ? 'text-emerald-400' :
              'text-white/50'
            }`}
          >
            {line.text}
          </div>
        ))}
        <span className="inline-block w-2 h-4 bg-white/50 animate-pulse" />
      </div>
    </div>
  );
};

// Process Step
const ProcessStep = ({ number, title, description }) => (
  <div className="group" data-testid={`process-${number}`}>
    <span className="font-mono text-xs text-white/20 block mb-3">{number}</span>
    <h3 className="text-xl font-medium mb-2 group-hover:text-white transition-colors">{title}</h3>
    <p className="text-sm text-white/40 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
