import React, { useState, useRef } from 'react';
import type { CodeNode, CodeEdge, MockCodebase } from '../data/mockCodebase';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Eye, EyeOff, Layers } from 'lucide-react';

interface RepositoryMapProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  filterType: 'all' | 'file' | 'function' | 'external_module';
  codebaseData: MockCodebase;
}

interface NodePosition {
  [id: string]: { x: number; y: number };
}

// Preset layout positions optimized for the 1000x600 grid
const initialNodePositions: NodePosition = {
  "src/app.ts": { x: 200, y: 80 },
  "express": { x: 80, y: 80 },
  "src/controllers/authController.ts": { x: 450, y: 100 },
  "src/controllers/authController.ts::loginUser": { x: 380, y: 220 },
  "src/controllers/authController.ts::registerUser": { x: 550, y: 220 },
  "src/services/sessionManager.ts": { x: 260, y: 350 },
  "src/services/sessionManager.ts::createSession": { x: 180, y: 480 },
  "src/services/sessionManager.ts::verifySession": { x: 340, y: 480 },
  "src/models/userModel.ts": { x: 720, y: 150 },
  "src/models/userModel.ts::getUserByUsername": { x: 650, y: 280 },
  "src/models/userModel.ts::createUser": { x: 800, y: 280 },
  "src/utils/crypto.ts": { x: 480, y: 380 },
  "src/utils/crypto.ts::hashPassword": { x: 480, y: 500 },
  "src/utils/crypto.ts::comparePassword": { x: 600, y: 480 },
  "src/utils/db.ts": { x: 820, y: 420 },
  "src/utils/db.ts::query": { x: 820, y: 520 },
  "mysql2": { x: 940, y: 520 }
};

// Layout generator to calculate coordinates dynamically for scanned repos
const calculateNodePositions = (codebase: MockCodebase): NodePosition => {
  if (codebase.repository_name === "legacy-express-monolith") {
    return initialNodePositions;
  }

  const nodes = codebase.nodes || [];
  const files = nodes.filter(n => n.type === 'file');
  const functions = nodes.filter(n => n.type === 'function');
  const externals = nodes.filter(n => n.type === 'external_module' || n.type === 'class');
  
  const newPositions: NodePosition = {};
  
  // Layout external modules at the left border
  const extCount = externals.length;
  externals.forEach((node, index) => {
    const x = 100;
    const y = extCount > 1 
      ? 80 + (index * (480 / (extCount - 1))) 
      : 325;
    newPositions[node.id] = { x, y };
  });
  
  // Layout files in a grid in the center area
  const fileCount = files.length;
  const cols = Math.ceil(Math.sqrt(fileCount)) || 1;
  const rows = Math.ceil(fileCount / cols) || 1;
  
  const cellWidth = cols > 1 ? 400 / (cols - 1) : 400;
  const cellHeight = rows > 1 ? 400 / (rows - 1) : 400;
  
  files.forEach((fileNode, index) => {
    const colIndex = index % cols;
    const rowIndex = Math.floor(index / cols);
    const fx = 300 + colIndex * cellWidth;
    const fy = 100 + rowIndex * cellHeight;
    newPositions[fileNode.id] = { x: fx, y: fy };
    
    // Layout functions of this file in a circle around it
    const fileFuncs = functions.filter(f => f.file_path === fileNode.file_path || f.id.startsWith(fileNode.id + '::'));
    const funcCount = fileFuncs.length;
    
    fileFuncs.forEach((funcNode, fIndex) => {
      const angle = (fIndex * 2 * Math.PI) / funcCount;
      const radius = 65;
      const x = fx + radius * Math.cos(angle);
      const y = fy + radius * Math.sin(angle);
      newPositions[funcNode.id] = { x, y };
    });
  });
  
  // Layout any orphaned functions that don't match any file path
  const orphanedFuncs = functions.filter(f => !newPositions[f.id]);
  const orphanedCount = orphanedFuncs.length;
  orphanedFuncs.forEach((funcNode, index) => {
    const angle = (index * 2 * Math.PI) / orphanedCount;
    const radius = 220;
    const x = 500 + radius * Math.cos(angle);
    const y = 325 + radius * Math.sin(angle);
    newPositions[funcNode.id] = { x, y };
  });

  return newPositions;
};

export const RepositoryMap: React.FC<RepositoryMapProps> = ({
  selectedNodeId,
  onSelectNode,
  filterType,
  codebaseData
}) => {
  const [positions, setPositions] = useState<NodePosition>(() => calculateNodePositions(codebaseData));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showCallFlows, setShowCallFlows] = useState(true);
  const [showImports, setShowImports] = useState(true);

  const startPanOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync positions when codebaseData changes
  React.useEffect(() => {
    setPositions(calculateNodePositions(codebaseData));
  }, [codebaseData]);

  // Handle zooming using buttons
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleLayoutReset = () => {
    setPositions(calculateNodePositions(codebaseData));
    handleZoomReset();
  };

  // Node Drag and Pan handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string | null) => {
    e.stopPropagation();
    if (nodeId) {
      // Node dragging
      setDraggedNode(nodeId);
      onSelectNode(nodeId);
    } else {
      // Canvas panning
      setIsPanning(true);
      startPanOffset.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate coordinates relative to SVG scale and offset
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      setPositions(prev => ({
        ...prev,
        [draggedNode]: { x, y }
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - startPanOffset.current.x,
        y: e.clientY - startPanOffset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + zoomFactor, 2.5));
    } else {
      setZoom(prev => Math.max(prev - zoomFactor, 0.4));
    }
  };

  // Filter nodes based on sidebar status and filter bar status
  const visibleNodes = codebaseData.nodes.filter(node => {
    if (filterType === 'all') return true;
    return node.type === filterType;
  });

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  // Filter edges based on visible nodes and toggles
  const visibleEdges = codebaseData.edges.filter(edge => {
    const isSourceVisible = visibleNodeIds.has(edge.source);
    const isTargetVisible = visibleNodeIds.has(edge.target);
    if (!isSourceVisible || !isTargetVisible) return false;
    
    if (edge.type === 'calls' && !showCallFlows) return false;
    if (edge.type === 'imports' && !showImports) return false;
    return true;
  });

  // Check if edge connects to the selected node
  const isSelectedPath = (edge: CodeEdge) => {
    if (!selectedNodeId) return false;
    return edge.source === selectedNodeId || edge.target === selectedNodeId;
  };

  // Determine node styling
  const getNodeColor = (node: CodeNode) => {
    const isSelected = selectedNodeId === node.id;
    if (isSelected) return 'stroke-indigo-600 dark:stroke-indigo-400 fill-indigo-50 dark:fill-indigo-950/90 shadow-[0_0_15px_rgba(99,102,241,0.2)] dark:shadow-[0_0_15px_#6366f1]';
    
    switch (node.status) {
      case 'critical':
        return 'stroke-rose-500 dark:stroke-rose-600 fill-rose-50 dark:fill-rose-950/20';
      case 'warning':
        return 'stroke-amber-500 dark:stroke-amber-550 fill-amber-50 dark:fill-amber-950/20';
      case 'healthy':
      default:
        return 'stroke-emerald-500 dark:stroke-emerald-500 fill-emerald-50 dark:fill-emerald-950/20';
    }
  };


  const getNodeIconSymbol = (type: string) => {
    switch (type) {
      case 'file': return '📁';
      case 'class': return '📦';
      case 'function': return 'ƒ';
      case 'external_module': return '🌐';
      default: return '•';
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-2xl transition-colors duration-300">
      {/* Visual Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-between pointer-events-none">
        {/* Toggle options */}
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowCallFlows(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              showCallFlows 
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-200 shadow-[0_2px_8px_rgba(99,102,241,0.08)] dark:shadow-[0_0_10px_rgba(99,102,241,0.15)]' 
                : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
            }`}
          >
            {showCallFlows ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Call Chains
          </button>
          <button 
            onClick={() => setShowImports(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              showImports 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-200 shadow-[0_2px_8px_rgba(16,185,129,0.08)] dark:shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
            }`}
          >
            {showImports ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Import Trees
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex gap-1.5 bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 p-1 rounded-lg pointer-events-auto backdrop-blur-md shadow-md">
          <button 
            onClick={handleZoomIn} 
            title="Zoom In"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={handleZoomOut} 
            title="Zoom Out"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={handleZoomReset} 
            title="Reset Pan & Zoom"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px bg-slate-200 dark:bg-slate-800/80 mx-0.5" />
          <button 
            onClick={handleLayoutReset} 
            title="Reset Custom Layout"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Graph Canvas */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onMouseDown={(e) => handleMouseDown(e, null)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg 
          className="w-full h-full"
          viewBox="0 0 1000 650"
        >
          {/* Custom Cyberpunk SVG Filters for Neon glow */}
          <defs>
            <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Custom Edge Arrowhead Markers */}
            <marker id="arrow-calls" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge-calls)" />
            </marker>
            <marker id="arrow-imports" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge-imports)" />
            </marker>
            <marker id="arrow-selected" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge-selected)" />
            </marker>
          </defs>

          {/* Grid Background mapping */}
          <g 
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            className="transition-transform duration-75 ease-out"
          >
            {/* Grid Pattern lines */}
            <g className="opacity-40 dark:opacity-10">
              {Array.from({ length: 40 }).map((_, i) => (
                <line key={`x-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={800} className="stroke-slate-200 dark:stroke-slate-850" strokeWidth="1" />
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <line key={`y-${i}`} x1={0} y1={i * 50} x2={1200} y2={i * 50} className="stroke-slate-200 dark:stroke-slate-850" strokeWidth="1" />
              ))}
            </g>

            {/* Draw Dependency Connection Edges */}
            <g>
              {visibleEdges.map((edge, index) => {
                const startNode = positions[edge.source];
                const endNode = positions[edge.target];
                if (!startNode || !endNode) return null;

                const isSelected = isSelectedPath(edge);
                const isCall = edge.type === 'calls';

                return (
                  <g key={`edge-${index}`}>
                    {/* Shadow / Glow Line */}
                    {isSelected && (
                      <line 
                        x1={startNode.x}
                        y1={startNode.y}
                        x2={endNode.x}
                        y2={endNode.y}
                        stroke="var(--edge-selected)"
                        strokeWidth="5"
                        strokeOpacity="0.4"
                        filter="url(#glow-indigo)"
                        className="cyber-pulse"
                      />
                    )}
                    {/* Core Line */}
                    <line 
                      x1={startNode.x}
                      y1={startNode.y}
                      x2={endNode.x}
                      y2={endNode.y}
                      stroke={
                        isSelected 
                          ? 'var(--edge-selected)' 
                          : isCall 
                            ? 'var(--edge-calls)' 
                            : 'var(--edge-imports)' 
                      }
                      strokeWidth={isSelected ? 2 : 1.5}
                      strokeDasharray={edge.type === 'calls' ? '4 2' : undefined}
                      markerEnd={`url(#arrow-${isSelected ? 'selected' : edge.type})`}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </g>

            {/* Draw Structural Code Nodes */}
            <g>
              {visibleNodes.map((node) => {
                const pos = positions[node.id];
                if (!pos) return null;

                const isSelected = selectedNodeId === node.id;
                const isFunction = node.type === 'function';
                const filterColor = 
                  isSelected ? 'url(#glow-indigo)' :
                  node.status === 'critical' ? 'url(#glow-rose)' :
                  node.status === 'warning' ? 'url(#glow-amber)' :
                  'url(#glow-emerald)';

                return (
                  <g 
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group animate-fade-in"
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node.id);
                    }}
                  >
                    {/* Soft Neon Glow Background Circle */}
                    <circle 
                      r={isFunction ? 20 : 25}
                      className={`transition-all duration-300 ${getNodeColor(node)}`}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={filterColor}
                    />

                    {/* Node Center Icon Type */}
                    <text 
                      textAnchor="middle"
                      dy={isFunction ? "4" : "6"}
                      className={`select-none font-bold text-xs pointer-events-none fill-slate-700 dark:fill-slate-200 transition-colors`}
                      fontSize={isFunction ? "11px" : "12px"}
                    >
                      {getNodeIconSymbol(node.type)}
                    </text>

                    {/* Node Name Tag */}
                    <g transform={`translate(0, ${isFunction ? 32 : 38})`}>
                      {node.type === 'file' ? (
                        (() => {
                          const rawFolder = node.file_path && node.file_path.includes('/')
                            ? node.file_path.substring(0, node.file_path.lastIndexOf('/'))
                            : 'root';
                          const folderDisplay = rawFolder.length <= 20 
                            ? rawFolder 
                            : '.../' + rawFolder.split('/').slice(-2).join('/');
                          
                          const textLen = Math.max(node.name.length, folderDisplay.length);
                          const boxWidth = Math.min(textLen * 6.2 + 16, 170);
                          
                          return (
                            <>
                              <rect 
                                x={-boxWidth / 2}
                                y="-12"
                                width={boxWidth}
                                height="30"
                                rx="5"
                                className={`fill-white/95 dark:fill-[#0c1322]/95 stroke-slate-200 dark:stroke-slate-800/85 ${
                                  isSelected ? 'stroke-indigo-600 dark:stroke-indigo-500/80' : 'group-hover:stroke-slate-400 dark:group-hover:stroke-slate-700'
                                }`}
                                strokeWidth="1"
                              />
                              {/* Filename Label text */}
                              <text 
                                textAnchor="middle"
                                dy="2"
                                className={`text-[10px] font-bold tracking-wide pointer-events-none select-none ${
                                  isSelected ? 'fill-indigo-600 dark:fill-indigo-300' : 'fill-slate-800 dark:fill-slate-100'
                                }`}
                              >
                                {node.name.length > 20 ? node.name.substring(0, 18) + '..' : node.name}
                              </text>
                              {/* Parent Folder Label text */}
                              <text 
                                textAnchor="middle"
                                dy="13"
                                className="text-[7.5px] font-mono pointer-events-none select-none fill-slate-500 dark:fill-slate-400"
                              >
                                {folderDisplay}
                              </text>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          {/* Single-line Text Box Background glass */}
                          <rect 
                            x={-Math.min(node.name.length * 4.2 + 8, 80)}
                            y="-10"
                            width={Math.min(node.name.length * 8.4 + 16, 160)}
                            height="20"
                            rx="4"
                            className={`fill-white dark:fill-[#0c1322]/90 stroke-slate-200 dark:stroke-slate-800/85 ${
                              isSelected ? 'stroke-indigo-650 dark:stroke-indigo-700/80' : 'group-hover:stroke-slate-400 dark:group-hover:stroke-slate-700'
                            }`}
                            strokeWidth="1"
                          />
                          {/* Name Label text */}
                          <text 
                            textAnchor="middle"
                            dy="4"
                            className={`text-[10px] font-medium tracking-wide pointer-events-none select-none ${
                              isSelected ? 'fill-indigo-750 dark:fill-indigo-300 font-semibold' : 'fill-slate-600 dark:fill-slate-350 group-hover:fill-slate-900 dark:group-hover:fill-slate-100'
                            }`}
                          >
                            {node.name.length > 18 ? node.name.substring(0, 16) + '..' : node.name}
                          </text>
                        </>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* Floating Graph Legend Map */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-950/85 border border-slate-200 dark:border-slate-800/85 p-3 rounded-lg flex flex-col gap-1.5 backdrop-blur-md pointer-events-none shadow-lg max-w-[200px] transition-colors duration-300">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-400" /> Legend
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-650 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-500 bg-emerald-950/20" />
            <span>Healthy / Standard</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-650 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-500 bg-amber-950/20" />
            <span>Warning (Complexity)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-650 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border border-rose-600 bg-rose-950/20" />
            <span>Critical (Bug / Security)</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-0.5" />
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-450">
            <span className="text-xs">📁 / ƒ</span>
            <span>File Node / Function Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};
