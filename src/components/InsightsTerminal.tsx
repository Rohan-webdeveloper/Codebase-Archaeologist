import React, { useState, useEffect, useRef } from 'react';
import type { MockCodebase } from '../data/mockCodebase';
import { 
  ShieldAlert, 
  Info, 
  FileCode, 
  CornerDownRight, 
  ChevronRight, 
  Terminal, 
  HelpCircle,
  Copy,
  Check,
  Code
} from 'lucide-react';

interface InsightsTerminalProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  activeSidebarTab: string;
  codebaseData: MockCodebase;
}

export const InsightsTerminal: React.FC<InsightsTerminalProps> = ({
  selectedNodeId,
  onSelectNode,
  activeSidebarTab,
  codebaseData
}) => {
  const mockCodebaseData = codebaseData;
  const [activeTab, setActiveTab] = useState<'map' | 'bugs' | 'refactor' | 'docs'>('map');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Chat console states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; timestamp: string }>>([
    {
      sender: 'agent',
      text: "Hello! I am Scribe Agent, Codebase Archaeologist's documentation specialist. Ask me anything about the legacy architecture, data flow, or refactoring designs.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync terminal tab with the main navigation bar
  useEffect(() => {
    if (activeSidebarTab === 'map') setActiveTab('map');
    else if (activeSidebarTab === 'bugs') setActiveTab('bugs');
    else if (activeSidebarTab === 'refactor') setActiveTab('refactor');
    else if (activeSidebarTab === 'docs') setActiveTab('docs');
  }, [activeSidebarTab]);

  // Scroll to bottom on new chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Get selected node metrics
  const selectedNode = mockCodebaseData.nodes.find(n => n.id === selectedNodeId) || null;

  // Find relationships for selected node
  const inboundEdges = mockCodebaseData.edges.filter(e => e.target === selectedNodeId);
  const outboundEdges = mockCodebaseData.edges.filter(e => e.source === selectedNodeId);

  // Helper to copy code to clipboard
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Process terminal Q&A prompt
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg: { sender: 'user' | 'agent'; text: string; timestamp: string } = {
      sender: 'user',
      text,
      timestamp: timeString
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate Agent typing response
    setTimeout(() => {
      let reply = "";
      const queryLower = text.toLowerCase();

      if (queryLower.includes("circular") || queryLower.includes("coupling")) {
        reply = mockCodebaseData.scribeDocs.faqs[0].answer;
      } else if (queryLower.includes("sql") || queryLower.includes("injection") || queryLower.includes("vulnerab")) {
        reply = mockCodebaseData.scribeDocs.faqs[1].answer;
      } else if (queryLower.includes("auditor") || queryLower.includes("bugs")) {
        reply = "Our Auditor Agent scanned the codebase and flagged 3 security issues: a CRITICAL SQL Injection in authController.ts, a HIGH circular coupling inside sessionManager.ts, and a MEDIUM cyclomatic complexity warning in loginUser.";
      } else if (queryLower.includes("refactor") || queryLower.includes("architect")) {
        reply = "The Architect Agent has refactored authController.ts to use dependency injection (SRP/DIP). We introduced UserRepository and SessionService interfaces to isolate dependencies and enforce parameterized SQL inputs.";
      } else if (queryLower.includes("hello") || queryLower.includes("hi")) {
        reply = "Hello there! I am ready to guide you. Try clicking one of the predefined questions below or query a specific module path.";
      } else {
        reply = "I've analyzed that scope. The system contains coupled routes inside `src/controllers/authController.ts`. By utilizing a clean Repository implementation (`IUserRepository`), we prevent direct SQL strings and isolate transactions.";
      }

      const agentMsg: { sender: 'user' | 'agent'; text: string; timestamp: string } = {
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200);
  };

  // Node status badge helper
  const renderStatusBadge = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-[0_2px_8px_rgba(244,63,94,0.05)] dark:shadow-[0_0_8px_rgba(244,63,94,0.15)] flex items-center gap-1 transition-colors">Critical</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-800/60 flex items-center gap-1 transition-colors">Warning</span>;
      case 'healthy':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-800/60 flex items-center gap-1 transition-colors">Healthy</span>;
    }
  };

  // Render Diff side-by-side or unified
  const renderCodeDiff = () => {
    const diff = mockCodebaseData.architectBlueprint.fileDiffs[0];
    return (
      <div className="flex flex-col gap-4 mt-2 h-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 transition-colors">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-[10px] font-bold transition-colors">
              {diff.action}
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors">{diff.filePath}</span>
          </div>
          <button 
            onClick={() => handleCopy(diff.afterCode, 1)}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-550 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 rounded-md text-[11px] transition-all"
          >
            {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-550 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedIndex === 1 ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] overflow-y-auto">
          {/* Legacy Monolithic View */}
          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-lg overflow-hidden transition-colors duration-300">
            <div className="bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Legacy Code (Vulnerable)</span>
              <span className="text-[10px] text-slate-500 font-mono">Lines 1-22</span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-700 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed transition-colors">
              {diff.beforeCode.split('\n').map((line, idx) => {
                const isVulnerable = line.includes('VULNERABLE') || line.includes('SQL Injection') || line.includes('const sql =') || line.includes('db.query');
                return (
                  <div key={idx} className={`${isVulnerable ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-l-2 border-rose-600 pl-1' : ''}`}>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Refactored Interface View */}
          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-lg overflow-hidden transition-colors duration-300">
            <div className="bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Refactored Code (DI Pattern)</span>
              <span className="text-[10px] text-slate-500 font-mono">Lines 1-45</span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-750 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed transition-colors">
              {diff.afterCode.split('\n').map((line, idx) => {
                const isNew = line.includes('Refactored') || line.includes('constructor') || line.includes('IUserRepository') || line.includes('findByUsername');
                return (
                  <div key={idx} className={`${isNew ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500 pl-1' : ''}`}>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        {/* Diff syntax lines */}
        <div className="flex flex-col bg-slate-100/50 dark:bg-[#050811] border border-slate-200 dark:border-slate-850 p-3 rounded-lg transition-colors">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1 transition-colors">
            <Code className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" /> Unified Agent Diff Output
          </span>
          <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-950/80 p-2.5 rounded border border-slate-200 dark:border-slate-900 overflow-x-auto transition-colors">
            {diff.diffContent.split('\n').map((line, idx) => {
              const isAdd = line.startsWith('+');
              const isDel = line.startsWith('-');
              return (
                <div 
                  key={idx} 
                  className={
                    isAdd ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/15' : 
                    isDel ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/15' : 'text-slate-450 dark:text-slate-500'
                  }
                >
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white/90 dark:bg-[#0B0F19]/90 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl transition-colors duration-300">
      {/* Tab Control Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-1.5">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeTab === 'map'
              ? 'bg-indigo-50 dark:bg-[#151D30] text-indigo-700 dark:text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_0_10px_rgba(99,102,241,0.1)] border border-slate-200 dark:border-slate-800/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Node Scope
        </button>
        <button
          onClick={() => setActiveTab('bugs')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'bugs'
              ? 'bg-indigo-50 dark:bg-[#151D30] text-indigo-700 dark:text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_0_10px_rgba(99,102,241,0.1)] border border-slate-200 dark:border-slate-800/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Auditor
          <span className="w-4 h-4 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50 flex items-center justify-center text-[9px] font-bold">
            {mockCodebaseData.auditorReport.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('refactor')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeTab === 'refactor'
              ? 'bg-indigo-50 dark:bg-[#151D30] text-indigo-700 dark:text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_0_10px_rgba(99,102,241,0.1)] border border-slate-200 dark:border-slate-800/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Architect
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeTab === 'docs'
              ? 'bg-indigo-50 dark:bg-[#151D30] text-indigo-700 dark:text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_0_10px_rgba(99,102,241,0.1)] border border-slate-200 dark:border-slate-800/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Docs AI
        </button>
      </div>

      {/* Main Container Viewport */}
      <div className="flex-1 p-5 overflow-y-auto min-h-0 bg-slate-50/50 dark:bg-[#0B0F19]/50 transition-colors duration-300">
        
        {/* TAB 1: NODE SUMMARY & HIERARCHY */}
        {activeTab === 'map' && (
          <div className="flex flex-col gap-5">
            {selectedNode ? (
              <>
                {/* Selected Node Details Card */}
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-4 rounded-xl shadow-lg relative overflow-hidden transition-colors duration-300">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                  
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-sm transition-colors">
                        {selectedNode.type === 'file' ? '📁' : selectedNode.type === 'function' ? 'ƒ' : '🌐'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight transition-colors">{selectedNode.name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">{selectedNode.file_path}</span>
                      </div>
                    </div>
                    {renderStatusBadge(selectedNode.status)}
                  </div>

                  {/* AST metrics */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200 dark:border-slate-850/60 rounded-lg text-center transition-colors">
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Complexity</span>
                      <span className={`text-sm font-mono font-bold ${
                        (selectedNode.complexity || 0) > 15 ? 'text-rose-600 dark:text-rose-400' : (selectedNode.complexity || 0) > 8 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {selectedNode.complexity !== undefined ? selectedNode.complexity : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Lines</span>
                      <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 transition-colors">
                        {selectedNode.loc || (selectedNode.end_line && selectedNode.start_line ? selectedNode.end_line - selectedNode.start_line + 1 : 'N/A')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Symbol Scope</span>
                      <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 capitalize transition-colors">
                        {selectedNode.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scope Inbound / Outbound Relations */}
                <div className="flex flex-col gap-4">
                  {/* Inbound calls */}
                  <div className="bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl transition-colors duration-300">
                    <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 transition-colors">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" />
                      Inbound Dependencies ({inboundEdges.length})
                    </h5>
                    {inboundEdges.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {inboundEdges.map((edge, idx) => (
                          <div 
                            key={idx}
                            onClick={() => onSelectNode(edge.source)}
                            className="bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-[#161D2E]/60 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700/80 p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono transition-colors">
                                {edge.source.split('::').pop()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {edge.source.split('::')[0]}
                              </span>
                            </div>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-950 text-indigo-750 dark:text-indigo-300 font-mono px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded transition-colors">
                              Line {edge.line_number || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 bg-slate-100/30 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-900 border-dashed text-center font-mono transition-colors">
                        No inbound dependencies detected.
                      </div>
                    )}
                  </div>

                  {/* Outbound calls */}
                  <div className="bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl transition-colors duration-300">
                    <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Outbound Dependencies ({outboundEdges.length})
                    </h5>
                    {outboundEdges.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {outboundEdges.map((edge, idx) => (
                          <div 
                            key={idx}
                            onClick={() => onSelectNode(edge.target)}
                            className="bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-[#161D2E]/60 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700/80 p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono transition-colors">
                                {edge.target.split('::').pop()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {edge.target.split('::')[0]}
                              </span>
                            </div>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-950 text-indigo-750 dark:text-indigo-300 font-mono px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded transition-colors">
                              Line {edge.line_number || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 bg-slate-100/30 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-900 border-dashed text-center font-mono transition-colors">
                        No outbound calls detected.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 border-dashed rounded-xl p-8 transition-colors">
                <Info className="w-8 h-8 text-indigo-650 dark:text-indigo-500/50 mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">No Node Selected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px] mt-1.5 leading-relaxed transition-colors">
                  Click on any file or function node on the map graph to inspect its calls, lines of code, and safety metrics.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUDITOR SECURITY REPORT */}
        {activeTab === 'bugs' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-855 p-4 rounded-xl relative overflow-hidden transition-colors duration-300">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition-colors">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-600 dark:text-rose-500" />
                Auditor Agent Findings
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed transition-colors">
                The Auditor scans file hierarchies for vulnerability paths and code complexity warnings.
              </p>
            </div>

            {/* List of bugs */}
            <div className="flex flex-col gap-3">
              {mockCodebaseData.auditorReport.map((bug, index) => {
                const isCritical = bug.severity === 'CRITICAL' || bug.severity === 'HIGH';
                return (
                  <div 
                    key={index}
                    onClick={() => onSelectNode(bug.file_path)}
                    className={`bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-[#121828]/60 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800 p-4 rounded-xl flex gap-3 cursor-pointer transition-all duration-200 relative group overflow-hidden transition-colors duration-300 ${
                      isCritical ? 'hover:shadow-[0_2px_12px_rgba(244,63,94,0.05)] dark:hover:shadow-[0_0_15px_rgba(244,63,94,0.05)]' : ''
                    }`}
                  >
                    {/* Status side indicator */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      bug.severity === 'CRITICAL' ? 'bg-rose-650 dark:bg-rose-500' :
                      bug.severity === 'HIGH' ? 'bg-orange-550 dark:bg-orange-500' :
                      bug.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-blue-500'
                    }`} />

                    <div className="flex flex-col gap-1 w-full pl-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 truncate max-w-[200px]">
                          {bug.file_path}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          bug.severity === 'CRITICAL' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60' :
                          bug.severity === 'HIGH' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-850/60' :
                          'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-850/60'
                        }`}>
                          {bug.severity}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono transition-colors">{bug.function_name}()</h5>
                      <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed mt-1.5 transition-colors">{bug.bug_description}</p>
                      
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-900/80 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                        <strong className="text-slate-755 dark:text-slate-300">Impact: </strong>{bug.potential_impact}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ARCHITECT REFACTOR BLUEPRINTS */}
        {activeTab === 'refactor' && (
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 p-4 rounded-xl transition-colors duration-300">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition-colors">
                <FileCode className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400" />
                {mockCodebaseData.architectBlueprint.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed transition-colors">
                {mockCodebaseData.architectBlueprint.summary}
              </p>
              
              {/* SOLID display */}
              <div className="flex flex-col gap-2 mt-3.5">
                {mockCodebaseData.architectBlueprint.solidPrinciples.map((item, idx) => (
                  <div key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-650 dark:text-slate-300 transition-colors">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-750 dark:text-slate-200 font-semibold transition-colors">{item.principle}: </strong>
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Diff Display */}
            {renderCodeDiff()}
          </div>
        )}

        {/* TAB 4: SCRIBE AI DOCUMENTATION & CHAT */}
        {activeTab === 'docs' && (
          <div className="flex flex-col gap-5 h-full">
            {/* Documentation markdown view */}
            <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-855 p-4 rounded-xl flex flex-col gap-3.5 transition-colors duration-300">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight flex items-center gap-1 transition-colors">
                📖 {mockCodebaseData.scribeDocs.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans transition-colors">
                {mockCodebaseData.scribeDocs.content}
              </p>

              {/* Data Flow Lineage block */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-850 transition-colors">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2">
                  System Data Lineage Pipeline
                </span>
                <div className="flex flex-col gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors">
                  <div className="flex items-center text-slate-800 dark:text-slate-200 transition-colors">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">●</span> {mockCodebaseData.scribeDocs.lineage.source}
                  </div>
                  {mockCodebaseData.scribeDocs.lineage.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center pl-4 text-slate-500 dark:text-slate-400 border-l border-indigo-200 dark:border-indigo-950 py-0.5 transition-colors">
                      <span className="text-indigo-550 dark:text-indigo-650 mr-2">↓</span> {step}
                    </div>
                  ))}
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 mt-1 transition-colors">
                    <span className="text-emerald-500 mr-2">■</span> {mockCodebaseData.scribeDocs.lineage.target}
                  </div>
                </div>
              </div>
            </div>

            {/* Q&A Interactive anchors */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Interactive Q&A Anchors
              </span>
              <div className="flex flex-wrap gap-2">
                {mockCodebaseData.scribeDocs.faqs.map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(faq.question)}
                    className="text-left text-xs bg-white dark:bg-slate-950/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-indigo-650/30 dark:hover:border-indigo-900/60 p-2.5 rounded-lg text-slate-750 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-200 transition-all duration-200 flex items-start gap-1.5"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400">💡</span>
                    <span>{faq.question}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Command Line Terminal Chat Box */}
            <div className="flex flex-col bg-white dark:bg-[#050811] border border-slate-200 dark:border-slate-855 rounded-xl overflow-hidden shadow-lg h-[340px] transition-colors duration-300">
              {/* Terminal header */}
              <div className="bg-slate-50 dark:bg-[#0c1322]/90 border-b border-slate-200 dark:border-slate-850/80 px-4 py-2.5 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-655 dark:text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 tracking-wider transition-colors">SCRIBE_AGENT_TERM v1.0</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Console logs */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[9px] text-slate-500 mb-1">{msg.timestamp}</span>
                    <div className={`p-2.5 rounded-lg border ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/80 shadow-[0_0_10px_rgba(99,102,241,0.05)]' 
                        : 'bg-slate-55 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-850'
                    }`}>
                      {msg.sender === 'user' ? '> ' : ''}{msg.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="self-start text-indigo-600 dark:text-indigo-400 animate-pulse text-[10px]">
                    Scribe Agent typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(chatInput);
                }}
                className="bg-slate-55 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-850 p-2 flex gap-2 transition-colors"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Scribe about codebase, e.g. 'How does authentication flow work?'..."
                  className="flex-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 hover:border-slate-350 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
