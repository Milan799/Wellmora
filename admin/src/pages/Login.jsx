import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Key, Mail, ShieldAlert } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const GridBackground = () => {
  const [cells, setCells] = useState([]);

  useEffect(() => {
    const calculateCells = () => {
      const cellSize = 60; // size of each grid square in pixels
      const cols = Math.ceil(window.innerWidth / cellSize);
      const rows = Math.ceil(window.innerHeight / cellSize);
      const totalCells = cols * rows;

      const newCells = Array.from({ length: totalCells }).map((_, index) => {
        const delay = Math.random() * 8;
        const duration = 5 + Math.random() * 5;
        const shouldGlow = Math.random() < 0.08; // 8% of cells pulse automatically
        return { id: index, delay, duration, shouldGlow };
      });
      setCells(newCells);
    };

    calculateCells();
    window.addEventListener('resize', calculateCells);
    return () => window.removeEventListener('resize', calculateCells);
  }, []);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 grid" 
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(60px, 1fr))`,
        gridAutoRows: '60px',
        gap: '1px',
        backgroundColor: 'rgba(6, 9, 14, 0.45)',
        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.01) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={`w-full h-full relative transition-all duration-1000 pointer-events-auto hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.45)] hover:duration-0 ${
            cell.shouldGlow ? 'animate-gridPulse' : ''
          }`}
          style={{
            animationDelay: cell.shouldGlow ? `${cell.delay}s` : '0s',
            animationDuration: cell.shouldGlow ? `${cell.duration}s` : '0s'
          }}
        />
      ))}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoadingLocal(true);
    setErrorMsg('');

    const res = await login(email, password);
    if (res.success) {
      setLoadingLocal(false);
      navigate('/');
    } else {
      setLoadingLocal(false);
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="relative min-h-screen bg-blob-gradient px-6 flex items-center justify-center pb-20 transition-colors duration-300 overflow-hidden">
      <GridBackground />

      <div className="max-w-md w-full glass-card border border-[var(--card-border)] p-8 backdrop-blur-md shadow-2xl relative bg-[var(--card-bg)] z-10">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none z-0"></div>

        <div className="flex flex-col items-center mb-8">
          <Logo size="md" showText={true} className="mb-2 flex-col" />
          <h2 className="text-xl font-bold text-[var(--text-color)] mt-4 uppercase tracking-wider text-center">Admin Console</h2>
          <p className="text-[var(--text-muted)] text-xs mt-1 text-center font-semibold">Log in with your administrator credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="admin@wellmora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Security Key</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/15 animate-fadeIn">
              <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600 dark:text-rose-300 font-semibold leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full glass-btn-primary py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg cursor-pointer"
            disabled={loadingLocal}
          >
            {loadingLocal ? 'Authorizing credentials...' : 'Authenticate & Sign In'}
          </button>
        </form>

        <div className="text-center mt-8 pt-5 border-t border-[var(--card-border)] text-[10px] text-[var(--text-muted)] font-semibold">
          Wellmora Enterprise Command Center &copy; 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
