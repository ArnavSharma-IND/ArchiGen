/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { 
  Play, 
  Copy, 
  Check, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  FileCode,
  FileDown,
  AlertTriangle
} from "lucide-react";

// Initialize mermaid
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "JetBrains Mono, Inter, sans-serif",
    themeVariables: {
      primaryColor: "#111111",
      primaryTextColor: "#f1f5f9",
      primaryBorderColor: "#334155",
      lineColor: "#10b981", // Emerald-ish line colors for tech look
      secondaryColor: "#09090b",
      tertiaryColor: "#18181b",
      background: "#030303"
    }
  });
} catch (e) {
  console.error("Mermaid initialization failed:", e);
}

interface DiagramRendererProps {
  initialCode: string;
  diagramId: string;
  title: string;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  initialCode,
  diagramId,
  title
}) => {
  const [code, setCode] = useState(initialCode);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [panState, setPanState] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial code when props change
  useEffect(() => {
    setCode(initialCode);
    renderDiagram(initialCode);
  }, [initialCode]);

  const renderDiagram = async (mermaidCode: string) => {
    if (!mermaidCode || mermaidCode.trim() === "") {
      setError("Empty diagram code.");
      return;
    }

    try {
      setError(null);
      // Clean up string: remove possible outer markdown backticks
      let cleanCode = mermaidCode
        .trim()
        .replace(/^```mermaid\s*/i, "")
        .replace(/```$/, "");

      // Unique ID for mermaid render engine
      const uniqRenderId = `mermaid-render-${diagramId}-${Math.floor(Math.random() * 100000)}`;
      
      const { svg } = await mermaid.render(uniqRenderId, cleanCode);
      setSvgContent(svg);
    } catch (err: any) {
      console.error("Mermaid syntax/render exception:", err);
      // Retrieve friendly parser logs
      const msg = err?.message || "Verify your Mermaid.js coordinate, indentation, or block tags syntax.";
      setError(msg);
    }
  };

  const handleApplyChanges = () => {
    renderDiagram(code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, "_")}_diagram.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export SVG diagram.");
    }
  };

  const handleDownloadMermaid = () => {
    try {
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, "_")}.mermaid`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export Mermaid script.");
    }
  };

  // Zoom and Pan Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const handleReset = () => {
    setZoom(1);
    setPanState({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return; // ignore drag during raw edits
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panState.x, y: e.clientY - panState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanState({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      className={`flex flex-col border border-white/10 rounded-xl bg-[#09090b] transition-all overflow-hidden ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "relative"
      }`}
      id={`diagram-engine-card-${diagramId}`}
    >
      {/* Header element */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-sans font-medium text-white/80 text-xs tracking-wide uppercase uppercase">{title}</h4>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Action buttons */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
              isEditing 
                ? "bg-white/10 text-emerald-400 border-white/10 hover:bg-white/15" 
                : "bg-white/5 text-slate-300 hover:bg-white/10 border-white/10"
            }`}
            title="Edit Mermaid Raw Code"
            id={`btn-toggle-edit-${diagramId}`}
          >
            <FileCode size={13} />
            <span>{isEditing ? "View Render" : "Edit Code"}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 bg-white/5 text-slate-350 hover:text-white border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
            title="Copy Mermaid Code"
            id={`btn-copy-${diagramId}`}
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={!!error}
            className="p-1.5 bg-white/5 text-slate-350 hover:text-white border border-white/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-white/10 transition-all"
            title="Export as SVG Image"
            id={`btn-download-svg-${diagramId}`}
          >
            <Download size={14} />
          </button>

          <button
            onClick={handleDownloadMermaid}
            className="p-1.5 bg-white/5 text-slate-350 hover:text-white border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
            title="Export Raw Mermaid Script"
            id={`btn-download-mermaid-${diagramId}`}
          >
            <FileDown size={14} />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-white/5 text-slate-355 hover:text-white border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Viewer"}
            id={`btn-maximize-${diagramId}`}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-[460px] relative">
        {/* Workspace Layout Split */}
        <div className={`flex w-full h-full ${isEditing ? "divide-x divide-white/10" : ""}`}>
          
          {/* Column 1: Live Editor (Only Visible when isEditing is true) */}
          {isEditing && (
            <div className="w-1/2 flex flex-col bg-[#050505]">
              <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-white/5 text-xs text-white/40 font-mono">
                <span>mermaid-syntax.txt</span>
                <button
                  onClick={handleApplyChanges}
                  className="flex items-center gap-1.5 px-2 py-1 bg-emerald-600 border border-emerald-500/20 text-white rounded font-sans cursor-pointer hover:bg-emerald-500 text-xs transition-all font-medium"
                  id={`btn-apply-diagram-${diagramId}`}
                >
                  <Play size={10} />
                  <span>Update Render</span>
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-[12px] leading-relaxed bg-[#020202] text-emerald-400 outline-none resize-none align-top focus:ring-1 focus:ring-slate-700 border-0"
                style={{ direction: "ltr", textAlign: "left" }}
                spellCheck="false"
              />
            </div>
          )}Parent

          {/* Column 2: Interactive SVG Playground Canvas */}
          <div 
            className={`flex-1 relative bg-[#030303] flex flex-col items-center justify-center select-none overflow-hidden ${
              isEditing ? "w-1/2" : "w-full"
            }`}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={containerRef}
            id={`canvas-drawing-${diagramId}`}
          >
            {/* Real-time Display Controls */}
            {!error && svgContent && (
              <div className="absolute bottom-4 right-4 flex items-center bg-black/60 border border-white/10 backdrop-blur-sm rounded-lg p-1 z-10 gap-0.5 animate-fade-in">
                <button
                  onClick={handleZoomIn}
                  className="p-1 px-2.5 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer rounded transition-all text-sm font-semibold"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 px-2.5 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer rounded transition-all text-sm font-semibold"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <div className="h-4 w-px bg-white/10 mx-0.5" />
                <button
                  onClick={handleReset}
                  className="p-1 px-2.5 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer rounded transition-all text-xs font-medium flex items-center gap-1"
                  title="Reset Coordinates"
                >
                  <RotateCcw size={12} />
                  <span>{Math.round(zoom * 100)}%</span>
                </button>
              </div>
            )}

            {/* Error Overlay Banner */}
            {error ? (
              <div className="max-w-md w-[80%] mx-auto bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center flex flex-col items-center gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-sans font-semibold text-red-400 text-sm">Mermaid Compile Error</h5>
                  <p className="font-mono text-xs text-red-400 leading-normal max-h-36 overflow-y-auto text-left py-1.5 px-2 bg-black/40 rounded-lg border border-white/5">
                    {error}
                  </p>
                </div>
                {isEditing ? (
                  <p className="text-xs text-white/30 italic">Adjust your indentation or nodes syntax in the editor panel on the left.</p>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-red-600 text-white border border-red-500/20 rounded-lg hover:bg-red-500 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Open Editor to Fix
                  </button>
                )}
              </div>
            ) : svgContent ? (
              /* Actual SVG Canvas Wrapper */
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${panState.x}px, ${panState.y}px) scale(${zoom})`,
                  transformOrigin: "center"
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-white/30">
                <Play size={20} className="stroke-[1.5] animate-pulse" />
                <span className="text-xs font-sans">Booting Diagram Elements...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
