import { useState, useEffect, useRef } from 'react';
import { RepositoryMap } from './components/RepositoryMap';
import { InsightsTerminal } from './components/InsightsTerminal';
import { AuthLayout } from './components/AuthLayout';
import { mockCodebaseData, generateDynamicCodebase } from './data/mockCodebase';
import { 
  Network, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Settings as SettingsIcon, 
  Search, 
  Cpu, 
  Database,
  ArrowRight,
  Terminal,
  Activity,
  Sun,
  Moon,
  Bell,
  LogOut,
  Laptop,
  Layout,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });
  const [userProfile, setUserProfile] = useState<{ name: string; username: string; email: string } | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nodeFilter, setNodeFilter] = useState<'all' | 'file' | 'function' | 'external_module'>('all');
  
  // Repo Analysis Simulator states
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/expressjs/express-monolith-api');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [hasLoaded, setHasLoaded] = useState<boolean>(true);
  const [codebaseData, setCodebaseData] = useState(mockCodebaseData);

  // Platform Layout Frame States
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(true);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [consoleExpanded, setConsoleExpanded] = useState<boolean>(true);
  
  // UI Dropdowns & Mobile Sheet states
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Responsive mobile listener
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme toggle helper
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Sync dark class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = (profile: { name: string; username: string; email: string }) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('user_profile', JSON.stringify(profile));
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    localStorage.setItem('is_authenticated', 'false');
    localStorage.removeItem('user_profile');
    setAvatarDropdownOpen(false);
  };

  // Search filtered node list
  const filteredNodesList = codebaseData.nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.file_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulate repository analysis logs scroll
  const handleAnalyzeRepo = () => {
    if (!repoUrl.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    setHasLoaded(false);
    setSelectedNodeId(null);

    const logs = [
      "[SYSTEM] Initializing Codebase Archaeologist Pipeline...",
      "[GIT] Cloning remote repository into secure runtime workspace...",
      "[AST] Traversing directories: Identified source files (JavaScript/TypeScript/Python)",
      "[AST] Launching Concrete Syntax Tree (CST) parsers...",
      "[AST] Resolving export declarations & symbol definitions...",
      "[AST] Tracing import scopes: Mapping structural dependency edges...",
      "[GRAPH] Ingesting structural nodes into memory Directed Graph schema...",
      "[AUDITOR] Auditor Swarm running: Initiating code quality checks...",
      "[AUDITOR] Auditor Alert: Running cycle and code smell checkers...",
      "[ARCHITECT] Architect Swarm running: Designing SOLID-compliant modular roadmaps...",
      "[SCRIBE] Scribe Swarm running: Building developer documentation guides...",
      "[SYSTEM] Multi-Agent Swarm evaluation complete. Graph successfully mapped!"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        const nextLog = logs[currentLogIndex];
        setAnalysisLogs(prev => [...prev, nextLog]);
        setAnalysisProgress(prev => Math.min(prev + (100 / logs.length), 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          // Attempt to call Uvicorn AST parser backend
          fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              repository_url: repoUrl,
              gemini_api_key: geminiApiKey
            })
          })
          .then(res => {
            if (!res.ok) throw new Error("Backend parser returned error status code: " + res.status);
            return res.json();
          })
          .then(data => {
            console.log("Real AST parse data resolved from Uvicorn:", data);
            const parsedNodes = data.nodes || [];
            const parsedEdges = data.edges || [];
            const dynamicData = generateDynamicCodebase(repoUrl, parsedNodes, parsedEdges, data);
            
            setCodebaseData(dynamicData);
            const criticalNode = dynamicData.nodes.find(n => n.status === 'critical') || dynamicData.nodes[0] || null;
            setSelectedNodeId(criticalNode ? criticalNode.id : null);
            
            setIsAnalyzing(false);
            setHasLoaded(true);
          })
          .catch(err => {
            console.warn("FastAPI AST parser is offline. Using local dynamic mock generation fallback...", err);
            const dynamicData = generateDynamicCodebase(repoUrl);
            
            setCodebaseData(dynamicData);
            const criticalNode = dynamicData.nodes.find(n => n.status === 'critical') || dynamicData.nodes[0] || null;
            setSelectedNodeId(criticalNode ? criticalNode.id : null);
            
            setIsAnalyzing(false);
            setHasLoaded(true);
          });
        }, 800);
      }
    }, 350);
  };

  // Render Auth View if not logged in
  if (!isAuthenticated) {
    return <AuthLayout onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-[#050811] text-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      
      {/* 1. PC DESKTOP NATIVE WINDOWS STYLE TITLE-BAR */}
      {isDesktopMode && (
        <div className="h-8 bg-slate-250 dark:bg-[#070b12] border-b border-slate-300 dark:border-slate-900/80 flex items-center justify-between px-4 select-none shrink-0 z-30 transition-colors">
          {/* macOS controls style */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDesktopMode(false)}
              title="Close Client Emulation"
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center text-[7px] text-rose-900 font-extrabold cursor-pointer"
            >
              ×
            </button>
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          {/* Central Title */}
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono tracking-widest">
            Codebase Archaeologist - Desktop Client
          </span>
          {/* Environment Tag */}
          <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50 font-bold font-mono">
            DEV-CLIENT- Tauri v1.0.4
          </span>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* 2. STICKY LEFT SIDEBAR (Hidden on mobile or collapsed) */}
        {sidebarExpanded && !isMobile && (
          <aside className="w-18 bg-white dark:bg-[#090D16] border-r border-slate-200 dark:border-slate-900 flex flex-col items-center py-6 justify-between z-20 shrink-0 transition-colors duration-300">
            <div className="flex flex-col items-center gap-8 w-full">
              {/* Logo Branding */}
              <div className="relative group cursor-pointer" title="Codebase Archaeologist">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-all duration-300">
                  <Cpu className="w-5.5 h-5.5 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300 pointer-events-none" />
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-3 w-full px-2">
                {[
                  { id: 'map', icon: <Network className="w-5 h-5" />, label: 'Repo Map' },
                  { id: 'bugs', icon: <ShieldAlert className="w-5 h-5" />, label: 'Bug Finder' },
                  { id: 'refactor', icon: <Sparkles className="w-5 h-5" />, label: 'Refactor Agent' },
                  { id: 'docs', icon: <BookOpen className="w-5 h-5" />, label: 'Docs AI' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.label}
                    className={`flex flex-col items-center justify-center py-3 w-full rounded-xl transition-all duration-200 group relative ${
                      activeTab === tab.id
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-slate-200 dark:border-indigo-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-100/40 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-[9px] font-bold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90">
                      {tab.id.toUpperCase()}
                    </span>
                    {activeTab === tab.id && (
                      <div className="absolute left-0 w-1 h-8 bg-indigo-650 dark:bg-indigo-500 rounded-r-md" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Bottom Settings Icon */}
            <button
              onClick={() => setActiveTab('settings')}
              title="Engine Settings"
              className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-slate-200 dark:border-indigo-900/65'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/40 dark:hover:bg-slate-900/40'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </aside>
        )}

        {/* MAIN CONTENT VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* APPLICATION HEADER */}
          <header className="h-16 bg-white dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-900 flex items-center justify-between px-6 z-10 shrink-0 transition-colors duration-300">
            
            {/* Left Block: Logo vector & profile environment */}
            <div className="flex items-center gap-3">
              {isMobile && (
                <button 
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg shrink-0 transition-colors"
                >
                  <Menu className="w-5.5 h-5.5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight hidden sm:inline text-slate-900 dark:text-slate-100">
                  Archaeologist
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded font-bold font-mono bg-emerald-100 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                  [PROD-SWARM]
                </span>
              </div>
            </div>

            {/* Middle Block: Repository Analyzer Address Bar */}
            <div className="flex-1 max-w-xl mx-4 flex bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 focus-within:border-indigo-500 rounded-xl overflow-hidden transition-all duration-200">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isAnalyzing}
                className="flex-1 bg-transparent px-4 py-2 text-xs font-mono text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none disabled:opacity-50"
                placeholder="Paste Git Repository URL..."
              />
              <button
                onClick={handleAnalyzeRepo}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white disabled:text-slate-400 font-bold text-xs px-4 flex items-center gap-1.5 transition-colors border-l border-indigo-500/20 shadow-[0_2px_8px_rgba(99,102,241,0.2)]"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Block: Theme Toggle, Notifications, Profile Dropdown */}
            <div className="flex items-center gap-2">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* Notifications bell badge */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(prev => !prev)}
                  className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all duration-200 relative"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </button>

                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-850 p-4 rounded-xl shadow-2xl z-30 font-sans text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-850 mb-2 uppercase tracking-wide text-[10px]">
                      Notification Swarm Feed
                    </h5>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 text-slate-600 dark:text-slate-350">
                        <span className="font-bold text-indigo-500">Auditor</span> flagged complexity warning in index file.
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 text-slate-600 dark:text-slate-350">
                        <span className="font-bold text-emerald-500">Scribe</span> updated documentation map reference details.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar dropdown */}
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setAvatarDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 focus:outline-none p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    {userProfile?.username.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                </button>

                {/* Avatar dropdown menus */}
                {avatarDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-850 rounded-xl shadow-2xl z-30 overflow-hidden font-sans text-xs animate-fade-in">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{userProfile?.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate mt-0.5">{userProfile?.email}</p>
                    </div>
                    
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <button 
                        onClick={() => {
                          setIsDesktopMode(prev => !prev);
                          setAvatarDropdownOpen(false);
                        }}
                        className="w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-350 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Laptop className="w-4 h-4 text-slate-400" />
                        Toggle Desktop Frame
                      </button>
                      <button 
                        onClick={() => {
                          toggleTheme();
                          setAvatarDropdownOpen(false);
                        }}
                        className="w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-350 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                        Theme: {theme === 'dark' ? 'Light' : 'Dark'}
                      </button>
                    </div>
                    
                    <div className="border-t border-slate-200 dark:border-slate-850 p-1.5">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left py-2 px-3 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Mobile hamburger navigation drawer */}
          {mobileMenuOpen && isMobile && (
            <div className="absolute inset-0 bg-slate-950/60 z-35 backdrop-blur-xs flex justify-start">
              <div className="w-64 bg-white dark:bg-[#090D16] h-full p-6 border-r border-slate-200 dark:border-slate-900 flex flex-col gap-6 animate-fade-in select-none">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                    Menu Sections
                  </span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {[
                    { id: 'map', icon: <Network className="w-4 h-4" />, label: 'Repo Map' },
                    { id: 'bugs', icon: <ShieldAlert className="w-4 h-4" />, label: 'Bug Finder' },
                    { id: 'refactor', icon: <Sparkles className="w-4 h-4" />, label: 'Refactor Swarm' },
                    { id: 'docs', icon: <BookOpen className="w-4 h-4" />, label: 'Docs AI' },
                    { id: 'settings', icon: <SettingsIcon className="w-4 h-4" />, label: 'Engine Config' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-slate-200 dark:border-indigo-900/60'
                          : 'text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* 3. SPLIT-SCREEN VIEWPORT LAYOUT */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            
            {/* LOGGING SIMULATION LAYER DURING RUNTIME */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#050811]/90 z-35 flex items-center justify-center p-8 backdrop-blur-sm">
                <div className="max-w-3xl w-full bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-h-[80vh]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-indigo-650 dark:text-indigo-400 flex items-center gap-2 font-bold">
                      <Terminal className="w-4 h-4 animate-spin" /> RUNNING SYSTEM SYNTAX SCANNER...
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">{Math.round(analysisProgress)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-1.5 border border-slate-300 dark:border-slate-900 overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_10px_#6366f1]"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-4 rounded-xl overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 flex flex-col gap-1.5">
                    {analysisLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`animate-fade-in ${
                          log && log.includes('Alert:') ? 'text-rose-600 dark:text-rose-450 font-semibold' : 
                          log && (log.includes('complete') || log.includes('Mapped')) ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 
                          log && log.includes('Swarm running') ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-550 dark:text-slate-400'
                        }`}
                      >
                        {log || ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOADED CONTENT PANELS */}
            {hasLoaded && (
              <>
                {activeTab === 'settings' ? (
                  /* SETTINGS OVERRIDE VIEW */
                  <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-indigo-650 dark:text-indigo-400" />
                        Engine Control Center
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Configure AST parser models, api swarm keys, and graph schema ingestion endpoints.
                      </p>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-900" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-850 p-5 rounded-xl flex flex-col gap-4">
                        <h4 className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-indigo-650 dark:text-indigo-400" /> Orchestrator Framework
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">Swarm Model API</label>
                          <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-350 focus:outline-none focus:border-indigo-500/80">
                            <option>Gemini 2.5 Flash (Default)</option>
                            <option>Gemini 2.5 Pro (Precision)</option>
                            <option>Gemini 1.5 Pro</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">Gemini API Key</label>
                          <input
                            type="password"
                            value={geminiApiKey}
                            onChange={(e) => {
                              setGeminiApiKey(e.target.value);
                              localStorage.setItem('gemini_api_key', e.target.value);
                            }}
                            placeholder="Enter your Gemini API Key..."
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-350 focus:outline-none focus:border-indigo-500/80 font-mono"
                          />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-850 p-5 rounded-xl flex flex-col gap-4">
                        <h4 className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Graph Database Config
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">Database URI</label>
                          <input 
                            type="text" 
                            defaultValue="bolt://localhost:7687" 
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-350 focus:outline-none focus:border-indigo-500/80 font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SPLIT PANEL: GRAPH VIZ + CONTEXT TERMINAL (Stretched/Stacked on mobile) */
                  <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'} overflow-hidden min-h-0 relative`}>
                    
                    {/* LEFT PANEL: INTERACTIVE GRAPH */}
                    <section className={`${isMobile ? 'h-1/2 min-h-[350px] w-full' : consoleExpanded ? 'w-[60%]' : 'w-full'} flex flex-col p-4 min-w-0 h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-900 bg-slate-50/20 dark:bg-[#060913]/30 transition-all duration-300`}>
                      
                      {/* Graph search and filtering bar */}
                      <div className="flex gap-2.5 mb-4 items-center bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 p-2 rounded-xl">
                        <div className="flex-1 flex bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850/80 focus-within:border-indigo-500 rounded-lg px-3 py-1.5 items-center gap-2 transition-colors">
                          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search function or file..."
                            className="bg-transparent text-xs text-slate-850 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-650 w-full focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Type</label>
                          <select
                            value={nodeFilter}
                            onChange={(e) => setNodeFilter(e.target.value as any)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs text-slate-850 dark:text-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500/80"
                          >
                            <option value="all">All Items</option>
                            <option value="file">Files</option>
                            <option value="function">Functions</option>
                            <option value="external_module">Modules</option>
                          </select>
                        </div>
                        <div className="text-[10.5px] text-slate-550 dark:text-slate-500 font-mono pl-1.5 border-l border-slate-200 dark:border-slate-850 select-none">
                          Found: <span className="text-slate-800 dark:text-slate-300 font-semibold">{filteredNodesList.length}</span>
                        </div>
                      </div>

                      {/* Draggable Graph component */}
                      <div className="flex-1 min-h-0 relative">
                        <RepositoryMap 
                          selectedNodeId={selectedNodeId}
                          onSelectNode={setSelectedNodeId}
                          filterType={nodeFilter}
                          codebaseData={codebaseData}
                        />
                      </div>
                    </section>

                    {/* RIGHT PANEL: CONTEXTUAL INSIGHTS CONSOLE */}
                    {consoleExpanded && (
                      <section className={`${isMobile ? 'flex-1 w-full' : 'w-[40%]'} flex flex-col p-4 min-w-0 h-full bg-slate-50/10 dark:bg-[#050811]/10 transition-all duration-300`}>
                        <InsightsTerminal
                          selectedNodeId={selectedNodeId}
                          onSelectNode={setSelectedNodeId}
                          activeSidebarTab={activeTab}
                          codebaseData={codebaseData}
                        />
                      </section>
                    )}

                  </div>
                )}
              </>
            )}

          </div>

          {/* Mobile Bottom Navigation Sheet */}
          {isMobile && (
            <div className="h-14 bg-white dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-900/80 flex items-center justify-around px-2 shrink-0 z-20">
              {[
                { id: 'map', icon: <Network className="w-5 h-5" />, label: 'Map' },
                { id: 'bugs', icon: <ShieldAlert className="w-5 h-5" />, label: 'Bugs' },
                { id: 'refactor', icon: <Sparkles className="w-5 h-5" />, label: 'Refactor' },
                { id: 'docs', icon: <BookOpen className="w-5 h-5" />, label: 'Docs' },
                { id: 'settings', icon: <SettingsIcon className="w-5 h-5" />, label: 'Config' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'text-indigo-650 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : 'text-slate-400'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[9px] font-bold mt-0.5">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* APPLICATION FOOTER */}
          <footer className="h-10 bg-white dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-900/80 flex items-center justify-between px-6 z-15 shrink-0 transition-colors">
            
            {/* Left Block: Connection status pulse + real-time performance */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Agent Swarm Ready</span>
              </div>
              <span className="hidden sm:inline border-l border-slate-200 dark:border-slate-850 h-3" />
              <span className="hidden sm:inline">CPU: 12%</span>
              <span className="hidden sm:inline">Memory: 420MB</span>
              <span className="hidden sm:inline">Latency: 45ms</span>
            </div>

            {/* Middle Block: Collapse/Expand Workspace toggles */}
            <div className="flex items-center gap-2">
              {!isMobile && (
                <>
                  <button
                    onClick={() => setSidebarExpanded(prev => !prev)}
                    title="Toggle Sidebar Panel"
                    className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                      sidebarExpanded
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 border-slate-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                        : 'bg-transparent border-slate-200 dark:border-slate-850 text-slate-400'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>Sidebar</span>
                  </button>
                  <button
                    onClick={() => setConsoleExpanded(prev => !prev)}
                    title="Toggle Console Panel"
                    className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                      consoleExpanded
                        ? 'bg-[#151D30]/20 dark:bg-[#151D30]/20 border-slate-200 dark:border-indigo-900/40 text-indigo-650 dark:text-indigo-300'
                        : 'bg-transparent border-slate-200 dark:border-slate-850 text-slate-400'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Console</span>
                  </button>
                </>
              )}
            </div>

            {/* Right Block: Version metadata linked to docs */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <Activity className="w-3 h-3 text-indigo-500" />
              <a 
                href="#docs" 
                onClick={(e) => { e.preventDefault(); setActiveTab('docs'); }}
                className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:underline transition-colors"
              >
                v1.2.0 Docs
              </a>
            </div>

          </footer>

        </div>
      </div>

    </div>
  );
}
