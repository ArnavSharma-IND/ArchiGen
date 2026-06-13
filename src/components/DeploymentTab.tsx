/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DeploymentConfig } from "../types";
import { Server, Copy, Check, FileCode, CheckCircle, Terminal } from "lucide-react";

interface DeploymentTabProps {
  config: DeploymentConfig;
  techPreferences: {
    database: string;
    backend: string;
    frontend: string;
    cloudEnv: string;
  };
}

export const DeploymentTab: React.FC<DeploymentTabProps> = ({ 
  config, 
  techPreferences 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"compose" | "k8s">("compose");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeCode = activeSubTab === "compose" ? config.dockerCompose : config.k8sManifest;
  const activeFileName = activeSubTab === "compose" ? "docker-compose.yml" : "kubernetes-manifest.yaml";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="deployment-module">
      
      {/* Side column: blueprint setup summary */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Quick Tech Recap card */}
        <div className="border border-white/10 bg-black/40 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3.5">
            <Server size={16} className="text-emerald-400 animate-pulse" />
            <span className="font-sans font-bold text-white/80 text-xs uppercase tracking-wider">
              Deployment Blueprint
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs">
              <span className="block text-[10px] font-sans font-semibold text-white/30 uppercase tracking-wider">Cluster Orchestrator</span>
              <span className="font-sans font-medium text-white/80">{techPreferences.cloudEnv}</span>
            </div>
            <div className="text-xs border-t border-white/5 pt-2.5">
              <span className="block text-[10px] font-sans font-semibold text-white/30 uppercase tracking-wider">Storage Platform</span>
              <span className="font-sans font-medium text-white/80">{techPreferences.database}</span>
            </div>
            <div className="text-xs border-t border-white/5 pt-2.5">
              <span className="block text-[10px] font-sans font-semibold text-white/30 uppercase tracking-wider">Backend Gateway Run</span>
              <span className="font-sans font-medium text-white/80">{techPreferences.backend}</span>
            </div>
            <div className="text-xs border-t border-white/5 pt-2.5">
              <span className="block text-[10px] font-sans font-semibold text-white/30 uppercase tracking-wider">Frontend App Server</span>
              <span className="font-sans font-medium text-white/80">{techPreferences.frontend}</span>
            </div>
          </div>
        </div>

        {/* Deploy Checklist */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 rounded-xl">
          <h5 className="font-sans font-semibold text-white/80 text-xs uppercase tracking-wider mb-3">
            Quick Initialization Commands
          </h5>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="font-sans text-slate-300">
                <p className="font-semibold text-white/85">1. Setup env values</p>
                <p className="text-[11px] text-white/40 mt-0.5">Copy variables from `.env.example` into a local storage file.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs border-t border-white/5 pt-2.5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="font-sans text-slate-300">
                <p className="font-semibold text-white/85">2. Boot local Docker</p>
                <p className="text-[11px] text-emerald-400 font-mono bg-black/60 p-1.5 rounded border border-white/10 mt-1.5 block">
                  docker-compose up -d --build
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs border-t border-white/5 pt-2.5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="font-sans text-slate-300">
                <p className="font-semibold text-white/85">3. Apply K8s cluster</p>
                <p className="text-[11px] text-emerald-400 font-mono bg-black/60 p-1.5 rounded border border-white/10 mt-1.5 block">
                  kubectl apply -f manifest.yaml
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main column: copyable YAML codes */}
      <div className="lg:col-span-8 flex flex-col gap-3.5">
        
        {/* Tech Overview Statement */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4.5 text-xs leading-relaxed text-white/40">
          <span className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">Architectural Strategy Description</span>
          <p className="text-slate-300">
            {config.summary || "Your custom deployment configurations mapping services to containers, healthchecks, networks, and persistent volume mount structures."}
          </p>
        </div>

        {/* Tab Selector & Code Container */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          
          {/* Header Subtabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/60">
            <div className="flex items-center gap-1 bg-white/5 p-1 border border-white/10 rounded-lg">
              <button 
                onClick={() => setActiveSubTab("compose")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeSubTab === "compose"
                    ? "bg-white/10 text-emerald-400 border border-white/10 shadow-sm"
                    : "text-white/40 hover:text-white"
                }`}
                id="btn-subtab-docker-compose"
              >
                <Terminal size={12} />
                <span>docker-compose.yml</span>
              </button>
              <button 
                onClick={() => setActiveSubTab("k8s")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeSubTab === "k8s"
                    ? "bg-white/10 text-indigo-400 border border-white/10 shadow-sm"
                    : "text-white/40 hover:text-white"
                }`}
                id="btn-subtab-k8s"
              >
                <FileCode size={12} />
                <span>k8s-manifest.yaml</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-mono text-[10px] text-white/30">{activeFileName}</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium cursor-pointer border border-white/10 transition-all"
                id="btn-copy-deployment-code"
              >
                {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{isCopied ? "Copied" : "Copy Source"}</span>
              </button>
            </div>
          </div>

          {/* Actual Code Viewer */}
          <div className="relative">
            <pre className="p-5 font-mono text-[11.5px] leading-relaxed text-emerald-400 bg-black/40 overflow-x-auto max-h-[480px]">
              {activeCode}
            </pre>
            <div className="absolute top-2 right-2 flex pointer-events-none opacity-20">
              <span className="font-mono text-xs uppercase select-none text-white/50">{activeSubTab} spec</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
