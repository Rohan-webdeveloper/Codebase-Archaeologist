import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Cpu, 
  User, 
  Mail, 
  Lock, 
  ShieldAlert 
} from 'lucide-react';

interface AuthLayoutProps {
  onLoginSuccess: (profile: { name: string; username: string; email: string }) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password strength logic
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const strengthScore = getPasswordStrength(regPassword);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 4: return { text: 'Strong', color: 'text-emerald-500' };
      case 3: return { text: 'Good', color: 'text-yellow-500' };
      case 2: return { text: 'Fair', color: 'text-orange-500' };
      case 1:
      default:
        return { text: 'Weak', color: 'text-rose-500' };
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    // Call success with profile info
    onLoginSuccess({
      name: loginEmail.split('@')[0],
      username: loginEmail.includes('@') ? loginEmail.split('@')[0] : loginEmail,
      email: loginEmail.includes('@') ? loginEmail : `${loginEmail}@archaeologist.local`
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
      setErrorMsg('Please complete all registration fields.');
      return;
    }

    if (!regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (strengthScore < 2) {
      setErrorMsg('Password must be at least Fair (score >= 2).');
      return;
    }

    onLoginSuccess({
      name: regName,
      username: regUsername,
      email: regEmail
    });
  };

  const handleGitHubOAuth = () => {
    // Instant login for GitHub
    onLoginSuccess({
      name: 'GitHub Developer',
      username: 'git_archaeologist',
      email: 'dev@github.com'
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#050811] relative overflow-hidden px-4 transition-colors duration-300 font-sans">
      
      {/* Background Cyber-grid Lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Main Glassmorphic Wrapper */}
      <div className="w-full max-w-md bg-white/70 dark:bg-[#090D16]/75 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden transition-all duration-300">
        
        {/* Top Branding Section */}
        <div className="pt-8 pb-6 px-8 text-center flex flex-col items-center border-b border-slate-200/50 dark:border-slate-900/60 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="relative group mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-0.5 bg-indigo-500 rounded-xl blur opacity-30 pointer-events-none" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Codebase Archaeologist
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System Ingestion & Code Quality Pipeline
          </p>
        </div>

        {/* Action Tabs Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-900 p-1.5 bg-slate-100/50 dark:bg-slate-950/30">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#151D30] text-indigo-600 dark:text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200/50 dark:border-slate-800/50'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#151D30] text-indigo-600 dark:text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200/50 dark:border-slate-800/50'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Forms Body Container */}
        <div className="p-8">
          
          {/* Error Alert Display */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fade-in">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              
              {/* Username Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Email or Username
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter email or username..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password recovery route simulated.'); }} className="text-[11px] font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me checkbox */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                  Remember this system
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] mt-2"
              >
                Sign In to Pipeline
              </button>

            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Legal Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Username
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="archaeologist_01"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Corporate / Academic Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Secure Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Secure Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-10 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {regPassword && (
                  <div className="flex flex-col gap-1 mt-1 animate-fade-in">
                    <div className="flex justify-between items-center text-[10px] font-medium">
                      <span className="text-slate-500">Complexity Score:</span>
                      <span className={getStrengthLabel(strengthScore).color}>
                        {getStrengthLabel(strengthScore).text} ({strengthScore}/4)
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                            i < strengthScore
                              ? strengthScore === 1 ? 'bg-rose-500' :
                                strengthScore === 2 ? 'bg-orange-500' :
                                strengthScore === 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-650" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-10 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] mt-2"
              >
                Register Workspace Account
              </button>

            </form>
          )}

          {/* Divider line */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-900" />
            </div>
            <span className="relative bg-[#FFFFFF] dark:bg-[#0B0F19] px-3.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">
              Alternative OAuth
            </span>
          </div>

          {/* GitHub Action button */}
          <button
            onClick={handleGitHubOAuth}
            className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-850 hover:border-slate-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
          >
            <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            Continue with GitHub
          </button>

        </div>
      </div>
    </div>
  );
};
