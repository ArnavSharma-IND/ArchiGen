/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Settings, 
  Play, 
  RefreshCw, 
  ChevronRight, 
  Download, 
  Copy, 
  Check, 
  HelpCircle, 
  Layers, 
  Code2, 
  Database as DbIcon, 
  Network, 
  Zap,
  Cpu, 
  Sparkles, 
  FolderDown, 
  Info, 
  UploadCloud,
  Upload,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import { ArcConverterOutput, ConversionState, LibrarySample } from "./types";
import { SAMPLE_REQUIREMENTS } from "./utils/samples";
import { DiagramRenderer } from "./components/DiagramRenderer";
import { DatabaseTab } from "./components/DatabaseTab";
import { APITab } from "./components/APITab";
import { DeploymentTab } from "./components/DeploymentTab";
import { AnalysisTab } from "./components/AnalysisTab";

export default function App() {
  const [requirements, setRequirements] = useState<string>("");
  const [dbPref, setDbPref] = useState<string>("PostgreSQL");
  const [backendPref, setBackendPref] = useState<string>("FastAPI (Python)");
  const [frontendPref, setFrontendPref] = useState<string>("Next.js (App Router)");
  const [cloudPref, setCloudPref] = useState<string>("Docker Compose");

  const [state, setState] = useState<ConversionState>({
    loading: false,
    error: null,
    data: null,
  });

  // Dynamic loading message shifts to keep the user engaged
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const loadingMessages = [
    "Analyzing software brief specifications...",
    "Drafting relational database schemas & keys...",
    "Defining REST API endpoints & headers...",
    "Synthesizing low-level system designs...",
    "Generating structural Mermaid.js codeblocks...",
    "Drafting docker-compose & Kubernetes configs...",
    "Calculating operational cost valuations...",
    "Assembling final architectural package..."
  ];

  useEffect(() => {
    let interval: any;
    if (state.loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [state.loading]);

  // Load sample requirement document on demand
  const handleSelectSample = (sample: LibrarySample) => {
    setRequirements(sample.content);
    setDbPref(sample.techPreferences.database);
    // Rough match helper
    if (sample.techPreferences.backend.includes("FastAPI")) setBackendPref("FastAPI (Python)");
    else if (sample.techPreferences.backend.includes("Express")) setBackendPref("Express (Node.js)");
    else setBackendPref(sample.techPreferences.backend);

    if (sample.techPreferences.frontend.includes("Next.js")) setFrontendPref("Next.js (App Router)");
    else if (sample.techPreferences.frontend.includes("React")) setFrontendPref("React Client SPA");
    else setFrontendPref(sample.techPreferences.frontend);

    setCloudPref(sample.techPreferences.cloudEnv);
  };

  // Drag and Drop files parsing on client side
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setRequirements(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setRequirements(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Convert CTA logic
  const handleConvert = async () => {
    if (!requirements || requirements.trim().length === 0) {
      setState((prev) => ({ ...prev, error: "Please enter or paste your software requirements document first." }));
      return;
    }

    setState({
      loading: true,
      error: null,
      data: null
    });

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements,
          stackPreferences: {
            database: dbPref,
            backend: backendPref,
            frontend: frontendPref,
            cloudEnv: cloudPref
          }
        })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload?.error || "An unexpected error occurred during requirements conversion.");
      }

      const architectureDoc = await response.json();
      setState({
        loading: false,
        error: null,
        data: architectureDoc
      });
    } catch (err: any) {
      console.error(err);
      setState({
        loading: false,
        error: err?.message || "Failed to query requirements conversion API. Verify backend configurations.",
        data: null
      });
    }
  };

  // Exporters Logic
  const [isCopiedText, setIsCopiedText] = useState<boolean>(false);
  const handleCopyMarkdown = () => {
    if (!state.data) return;
    const doc = state.data;
    let md = `# SYSTEMS ARCHITECTURE DOCUMENT: ${doc.title.toUpperCase()}\n\n`;
    md += `## OVERVIEW\n${doc.overview}\n\n`;
    md += `## TARGET STACK\n- Frontend: ${frontendPref}\n- Backend: ${backendPref}\n- Database: ${dbPref}\n- Cloud: ${cloudPref}\n\n`;
    md += `## DESIGN PATTERNS\n${doc.designPatterns.map(p => `* ${p}`).join("\n")}\n\n`;
    md += `## SYSTEM COMPONENTS\n`;
    doc.components.forEach(c => {
      md += `### ${c.name} (${c.type})\n* **Tech**: ${c.tech}\n* **Responsibilities**:\n${c.responsibilities.map(r => `  - ${r}`).join("\n")}\n\n`;
    });
    md += `## DATABASE TABLES\n`;
    doc.databaseSchema.forEach(t => {
      md += `### Table: ${t.tableName} (${t.description})\n`;
      t.columns.forEach(col => {
        md += `* \`${col.name}\` — \`${col.type}\` (${col.constraints})${col.references ? ` references ${col.references}` : ""}\n`;
      });
      md += "\n";
    });
    md += `## API CONTRACT ENVELOPES\n`;
    doc.apis.forEach(api => {
      md += `### ${api.method} ${api.path}\n* **Summary**: ${api.summary}\n* **Request**:\n\`\`\`json\n${api.requestBody}\n\`\`\`\n* **Response (200 OK)**:\n\`\`\`json\n${api.responseBody}\n\`\`\`\n\n`;
    });

    navigator.clipboard.writeText(md);
    setIsCopiedText(true);
    setTimeout(() => setIsCopiedText(false), 2000);
  };

  // Download complete code bundle dynamically
  const handleDownloadBundle = () => {
    if (!state.data) return;
    const doc = state.data;

    const filesToDownload = [
      { name: "docker-compose.yml", content: doc.deployment.dockerCompose },
      { name: "kubernetes_manifest.yaml", content: doc.deployment.k8sManifest },
      { name: "system_topology.mermaid", content: doc.diagrams.architecture },
      { name: "database_schema.mermaid", content: doc.diagrams.databaseER },
      { name: "sequence_workflow.mermaid", content: doc.diagrams.sequence },
    ];

    filesToDownload.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.title.toLowerCase().replace(/\s+/g, "_")}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  // Sub-tabs in the display panels
  const [activeMainTab, setActiveMainTab] = useState<"high" | "low" | "db" | "api" | "deploy" | "audit">("high");
  // Sub-diagram choices
  const [highDiagramType, setHighDiagramType] = useState<"topology" | "dataflow">("topology");
  const [lowDiagramType, setLowDiagramType] = useState<"erd" | "sequence">("erd");

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-slate-200" id="main-panel">
      
      {/* Brand Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-sm shrink-0 relative">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md">
              <div className="w-4 h-4 border-2 border-black rotate-45"></div>
            </div>
            <div>
              <h1 className="font-display font-light text-white text-base md:text-lg tracking-widest uppercase">
                Archigen <span className="text-white/40">// SRS.to.Arch</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-[10px] uppercase tracking-tighter text-white/50">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                System Ready
              </span>
              <span className="hidden sm:inline">Claude-3.5 Linked</span>
              <span className="hidden md:inline">Session: 0x8F22A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Side: Requirements & Options Panel (lg:col-span-4) */}
        <div className="lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-0 lg:pr-1" id="input-control-panel">
          
          {/* Section: SRS Inputs */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <h2 className="font-sans font-bold text-slate-200 text-sm">Requirements Document</h2>
              </div>
              <span className="font-mono text-[10px] text-white/30 font-medium">SRS / PRD / TEXT BRIEF</span>
            </div>

            {/* In-Browser Document Dropzone and Loader */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragOver 
                  ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "border-white/10 hover:border-white/20 bg-white/5"
              }`}
            >
              <UploadCloud size={24} className={isDragOver ? "text-emerald-400 animate-bounce" : "text-white/40"} />
              <div className="text-xs">
                <label className="font-semibold text-slate-300 hover:text-emerald-400 cursor-pointer block">
                  Drag and drop file here, or <span className="text-emerald-400 underline">browse files</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-white/30 block mt-1">Supports UTF-8 text formats: .txt, .md, .json, .csv</span>
              </div>
            </div>

            {/* Quick Presets / Selection */}
            <div>
              <span className="block text-[10px] font-sans font-bold text-white/40 uppercase tracking-widest mb-2.5">
                Quick Sample Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_REQUIREMENTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(s)}
                    className="flex flex-col text-left p-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/35 rounded-xl transition-all cursor-pointer text-xs"
                    id={`btn-sample-preset-${s.id}`}
                  >
                    <span className="font-sans font-bold text-slate-200 truncate block w-full">{s.title.split(":")[0]}</span>
                    <span className="text-[9px] text-white/40 mt-0.5 truncate block w-full">Load brief specs</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea brief editor */}
            <div className="flex flex-col">
              <span className="block text-[10px] font-sans font-bold text-white/40 uppercase tracking-widest mb-2">
                Requirements Editor
              </span>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Paste your Software Requirements Specification (SRS), product brief, user stories, or architecture goals here..."
                className="w-full min-h-[220px] p-4 bg-black/40 rounded-xl border border-white/10 text-xs font-mono focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-200 resize-y leading-relaxed"
                id="text-requirements-input"
              />
            </div>
          </div>

          {/* Section: Architectural Tech Options */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-slate-400" />
              <h2 className="font-sans font-bold text-slate-200 text-sm">Architectural Stack Preferences</h2>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Database selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">Database Platform</label>
                <select
                  value={dbPref}
                  onChange={(e) => setDbPref(e.target.value)}
                  className="px-3 py-2 bg-black/60 border border-white/10 text-xs text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  id="select-database-pref"
                >
                  <option value="PostgreSQL" className="bg-[#0f0f0f]">PostgreSQL</option>
                  <option value="PostgreSQL with Redis Cache" className="bg-[#0f0f0f]">PostgreSQL + Redis</option>
                  <option value="PostgreSQL (PostGIS)" className="bg-[#0f0f0f]">PostgreSQL (PostGIS)</option>
                  <option value="MongoDB" className="bg-[#0f0f0f]">MongoDB Atlas (NoSQL)</option>
                  <option value="MySQL Server" className="bg-[#0f0f0f]">MySQL Server</option>
                  <option value="Firebase Firestore" className="bg-[#0f0f0f]">Firebase Firestore</option>
                  <option value="SQLite Local" className="bg-[#0f0f0f]">SQLite Local File</option>
                </select>
              </div>

              {/* Backend framework */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">Backend Gateway</label>
                <select
                  value={backendPref}
                  onChange={(e) => setBackendPref(e.target.value)}
                  className="px-3 py-2 bg-black/60 border border-white/10 text-xs text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  id="select-backend-pref"
                >
                  <option value="FastAPI (Python)" className="bg-[#0f0f0f]">FastAPI (Python)</option>
                  <option value="Express (Node.js)" className="bg-[#0f0f0f]">Express (Node.js)</option>
                  <option value="Next.js API Server" className="bg-[#0f0f0f]">Next.js API Server</option>
                  <option value="Go (Gin API framework)" className="bg-[#0f0f0f]">Go (Gin framework)</option>
                  <option value="Spring Boot (Java)" className="bg-[#0f0f0f]">Spring Boot (Java)</option>
                  <option value="Django Rest Framework" className="bg-[#0f0f0f]">Django (Python)</option>
                </select>
              </div>

              {/* Frontend framework */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">Frontend App</label>
                <select
                  value={frontendPref}
                  onChange={(e) => setFrontendPref(e.target.value)}
                  className="px-3 py-2 bg-black/60 border border-white/10 text-xs text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  id="select-frontend-pref"
                >
                  <option value="Next.js (App Router)" className="bg-[#0f0f0f]">Next.js (App Router)</option>
                  <option value="React Client SPA" className="bg-[#0f0f0f]">React Client (Vite)</option>
                  <option value="VueNuxt Client" className="bg-[#0f0f0f]">Nuxt.js (Vue)</option>
                  <option value="SvelteKit SPA" className="bg-[#0f0f0f]">SvelteKit SPA</option>
                  <option value="React Native App" className="bg-[#0f0f0f]">React Native Mobile</option>
                </select>
              </div>

              {/* Cloud target */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">Orchestrator Target</label>
                <select
                  value={cloudPref}
                  onChange={(e) => setCloudPref(e.target.value)}
                  className="px-3 py-2 bg-black/60 border border-white/10 text-xs text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  id="select-cloud-pref"
                >
                  <option value="Docker Compose" className="bg-[#0f0f0f]">Docker Compose</option>
                  <option value="Kubernetes Cluster" className="bg-[#0f0f0f]">Kubernetes Cluster</option>
                  <option value="AWS Elastic Container Service (ECS)" className="bg-[#0f0f0f]">AWS ECS (Fargate)</option>
                  <option value="Google Cloud Run" className="bg-[#0f0f0f]">Google Cloud Run</option>
                  <option value="Vercel serverless functions" className="bg-[#0f0f0f]">Vercel Serverless</option>
                </select>
              </div>

            </div>

            {/* Run Button CTA Trigger */}
            <button
              onClick={handleConvert}
              disabled={state.loading}
              className="w-full mt-2.5 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-950/40 disabled:text-emerald-500/40 text-black rounded-xl shadow-lg hover:shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer font-sans font-bold text-xs uppercase tracking-wider transition-all border border-emerald-400/20"
              id="btn-convert-cta"
            >
              {state.loading ? (
                <RefreshCw size={14} className="animate-spin text-black" />
              ) : (
                <Play size={13} className="fill-black stroke-black" />
              )}
              <span>{state.loading ? "Processing Architecture..." : "Synthesize Architectural Blueprint"}</span>
            </button>
          </div>

        </div>

        {/* Right Side: Tabbed Presentation & Canvas Playground (lg:col-span-8) */}
        <div className="lg:col-span-7 flex flex-col gap-5 overflow-y-auto">
          {state.loading ? (
            /* Highly reassuring engaging Loading Screen state */
            <div className="flex-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]" id="loading-state-panel">
              <div className="relative mb-6">
                <div className="h-20 w-20 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={24} className="text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-2 max-w-sm">
                <h3 className="font-sans font-bold text-white text-base">Architect.AI is Synthesizing...</h3>
                <p className="font-mono text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-1.5 border border-emerald-500/20 inline-block">
                  {loadingMessages[loadingStep]}
                </p>
                <p className="font-sans text-xs text-white/40 leading-relaxed">
                  Our neural deep engine parses requirements, designs database ER schemas, builds REST covenants, and drafts Mermaid diagram vectors recursively.
                </p>
              </div>
            </div>
          ) : state.error ? (
            /* Rich Error display panel */
            <div className="flex-1 bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[500px]" id="error-state-panel">
              <div className="h-14 w-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <AlertTriangle size={24} className="animate-bounce" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="font-sans font-bold text-white text-base">Architect Conversion Blocked</h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20 text-left">
                  {state.error}
                </p>
                <p className="font-sans text-xs text-white/40">
                  Please verify your system prompt is not empty, check your connection parameters, and try re-submitting your request specs.
                </p>
              </div>
            </div>
          ) : state.data ? (
            /* Actual Conversion Deliverables Workspace Workspace! */
            <div className="flex-1 flex flex-col gap-5" id="output-workspace-panel">
              
              {/* Deliverable summary header */}
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={11} className="text-emerald-500 shrink-0" />
                    <span>SYNTHESIS COMPLETE</span>
                  </span>
                  <h2 className="font-sans font-extrabold text-white text-base md:text-lg leading-tight">
                    {state.data.title}
                  </h2>
                </div>

                {/* Exporters and copying */}
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    id="btn-copy-markdown-summary"
                  >
                    {isCopiedText ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{isCopiedText ? "Copied Spec" : "Copy MD Spec"}</span>
                  </button>

                  <button
                    onClick={handleDownloadBundle}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-black px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border border-emerald-400/20"
                    id="btn-download-bundle"
                  >
                    <FolderDown size={13} className="stroke-black" />
                    <span>Download Bundle</span>
                  </button>
                </div>
              </div>

              {/* Main Tab Controls bar */}
              <div className="flex items-center border-b border-white/15 overflow-x-auto whitespace-nowrap scrollbar-none select-none bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveMainTab("high")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === "high"
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-btn-high-level"
                >
                  <Layers size={13} />
                  <span>High-Level Architecture</span>
                </button>

                <button
                  onClick={() => setActiveMainTab("low")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === "low"
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-btn-low-level"
                >
                  <Code2 size={13} />
                  <span>Low-Level Design</span>
                </button>

                <button
                  onClick={() => setActiveMainTab("db")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === "db"
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-btn-database"
                >
                  <DbIcon size={13} />
                  <span>Database Schema</span>
                </button>

                <button
                  onClick={() => setActiveMainTab("api")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === "api"
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-btn-apis"
                >
                  <Network size={13} />
                  <span>API Contracts</span>
                </button>

                <button
                  onClick={() => setActiveMainTab("deploy")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === "deploy"
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-btn-deploy"
                >
                  <Zap size={13} />
                  <span>Deployment Configurations</span>
                </button>

                <button
                  onClick={() => setActiveMainTab("audit")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === "audit"
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-btn-audits"
                >
                  <Sparkles size={13} />
                  <span>AI Audits & Costs</span>
                </button>
              </div>

              {/* Tab Outputs Displays */}
              <div className="flex-1">
                               {/* TAB 1: High Level Architecture */}
                {activeMainTab === "high" && (
                  <div className="space-y-5" id="output-high-tab">
                    
                    {/* Visual Text summary */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-widest block">SYSTEM LAYOUT SUMMARY</span>
                        <p className="font-sans text-xs text-slate-300 leading-relaxed">
                          {state.data.overview}
                        </p>
                      </div>

                      {/* Design pattern badges */}
                      <div className="border-t border-white/5 pt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-sans font-bold text-white/40 tracking-wider mr-1">Pattern Choices:</span>
                        {state.data.designPatterns.map((pat, idx) => (
                          <span 
                            key={idx} 
                            className="bg-white/5 border border-white/10 text-slate-300 font-sans text-[11px] px-2 py-0.5 rounded-lg"
                          >
                            {pat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Architectural Components Grid cards */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-sans font-bold text-white/50 text-xs uppercase tracking-wider">Modular Containers & Components</h4>
                        <span className="text-[10px] font-mono text-white/30">{state.data.components.length} microelements</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {state.data.components.map((comp, idx) => (
                          <div 
                            key={idx} 
                            className="bg-[#0f0f0f] border border-white/10 p-4.5 rounded-xl flex flex-col gap-3.5 hover:border-white/20 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                              <div>
                                <h5 className="font-sans font-bold text-white/90 text-xs">{comp.name}</h5>
                                <span className="text-[9px] font-mono text-white/30 block mt-0.5">{comp.type}</span>
                              </div>
                              <span className="bg-white/5 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded border border-white/10">
                                {comp.tech}
                              </span>
                            </div>

                            <p className="font-sans text-white/60 text-[11px] leading-relaxed">
                              {comp.description}
                            </p>

                            <div className="space-y-1">
                              <span className="text-[9px] font-sans font-bold text-white/30 uppercase tracking-widest block font-bold text-slate-200">Responsibilities</span>
                              <div className="flex flex-col gap-1">
                                {comp.responsibilities.map((resp, rIdx) => (
                                  <div key={rIdx} className="flex gap-1.5 text-[11px] text-white/60 leading-normal">
                                    <ChevronRight size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{resp}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RENDER SYSTEM ARCHITECTURE VIEW FLOWCHART */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Network size={14} className="text-slate-400" />
                          <h4 className="font-sans font-bold text-white/50 text-xs uppercase tracking-wider">High-Level Flow Diagrams</h4>
                        </div>

                        {/* Diagram selector */}
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                          <button
                            onClick={() => setHighDiagramType("topology")}
                            className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded cursor-pointer transition-all ${
                              highDiagramType === "topology" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-white/40"
                            }`}
                          >
                            Topology Flowchart
                          </button>
                          <button
                            onClick={() => setHighDiagramType("dataflow")}
                            className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded cursor-pointer transition-all ${
                              highDiagramType === "dataflow" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-white/40"
                            }`}
                          >
                            Operational Ingestion
                          </button>
                        </div>
                      </div>

                      {highDiagramType === "topology" ? (
                        <DiagramRenderer 
                          key="system-topology-diag"
                          initialCode={state.data.diagrams.architecture} 
                          diagramId="system-topology"
                          title="System Interactive Architecture Topology"
                        />
                      ) : (
                        <DiagramRenderer 
                          key="operational-dataflow-diag"
                          initialCode={state.data.diagrams.dataflow} 
                          diagramId="operational-dataflow"
                          title="Granular Operational Dataflow Diagram"
                        />
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 2: Low-Level Design */}
                {activeMainTab === "low" && (
                  <div className="space-y-5" id="output-low-tab">
                    
                    {/* Visual indicators */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-5 text-xs leading-relaxed text-white/60 space-y-2">
                      <h4 className="font-sans font-bold text-white/80 text-sm">Low-Level System Flows & Key Relations</h4>
                      <p>
                        This view isolates state models and sequence interactions inside component boundaries. It helps engineers construct physical entities, align messaging protocols, and define key data properties.
                      </p>
                    </div>

                    {/* Low level diagram selectors */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Code2 size={14} className="text-slate-400 animate-pulse" />
                          <h4 className="font-sans font-bold text-white/50 text-xs uppercase tracking-wider">Logical Interface Graphics</h4>
                        </div>

                        {/* Diagram selector */}
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                          <button
                            onClick={() => setLowDiagramType("erd")}
                            className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded cursor-pointer transition-all ${
                              lowDiagramType === "erd" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-white/40"
                            }`}
                          >
                            Database ERD
                          </button>
                          <button
                            onClick={() => setLowDiagramType("sequence")}
                            className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded cursor-pointer transition-all ${
                              lowDiagramType === "sequence" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-white/40"
                            }`}
                          >
                            API Call Sequence
                          </button>
                        </div>
                      </div>

                      {lowDiagramType === "erd" ? (
                        <DiagramRenderer 
                          key="database-erd-diag"
                          initialCode={state.data.diagrams.databaseER} 
                          diagramId="database-erd"
                          title="Logical Database Entity-Relationship Diagram"
                        />
                      ) : (
                        <DiagramRenderer 
                          key="sequence-workflow-diag"
                          initialCode={state.data.diagrams.sequence} 
                          diagramId="sequence-workflow"
                          title="Core client-to-server interaction sequence flow"
                        />
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 3: Database Schema module */}
                {activeMainTab === "db" && (
                  <DatabaseTab schemas={state.data.databaseSchema} title={state.data.title} />
                )}

                {/* TAB 4: API contracts specs */}
                {activeMainTab === "api" && (
                  <APITab apis={state.data.apis} />
                )}

                {/* TAB 5: Deployment configs */}
                {activeMainTab === "deploy" && (
                  <DeploymentTab 
                    config={state.data.deployment} 
                    techPreferences={{
                      database: dbPref,
                      backend: backendPref,
                      frontend: frontendPref,
                      cloudEnv: cloudPref
                    }} 
                  />
                )}

                {/* TAB 6: AI Audits analysis */}
                {activeMainTab === "audit" && (
                  <AnalysisTab analysis={state.data.aiAnalysis} />
                )}

              </div>

            </div>
          ) : (
            /* Elegant brand-spanking-new empty state landing dashboard */
            <div className="flex-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]" id="empty-state-panel">
              <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-5 text-emerald-400 relative">
                <Sparkles size={28} className="animate-pulse" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="text-center space-y-2 max-w-sm mb-6">
                <h3 className="font-sans font-light text-white text-base tracking-widest uppercase">No Architecture Compiled</h3>
                <p className="font-sans text-xs text-white/40 leading-relaxed">
                  Enter, paste, or upload your SRS software requirements document on the left, adjust your architectural choices, and trigger the AI converter.
                </p>
              </div>

              {/* Informative list cards to make empty state awesome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                <div className="bg-white/5 px-4 py-3.5 rounded-xl border border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1">
                    <BookOpen size={13} className="text-emerald-400" />
                    <span className="font-bold text-white/80">1. Document Parsing</span>
                  </div>
                  <span className="text-white/40 leading-normal block text-[11px]">Paste requirements text, or easily drag-and-drop raw briefs directly.</span>
                </div>

                <div className="bg-white/5 px-4 py-3.5 rounded-xl border border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1">
                    <Code2 size={13} className="text-emerald-400" />
                    <span className="font-bold text-white/80">2. Complete Deliverables</span>
                  </div>
                  <span className="text-white/40 leading-normal block text-[11px]">Assembles topologies, sequence graphs, SQL DDLs, deployment scripts, and billings.</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
