/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { APIContract } from "../types";
import { Globe, Shield, ChevronsUpDown, Info, Key, Check, Copy } from "lucide-react";

interface APITabProps {
  apis: APIContract[];
}

export const APITab: React.FC<APITabProps> = ({ apis }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const getMethodStyle = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "POST":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "PUT":
      case "PATCH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  const handleCopyEndpoint = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="flex flex-col gap-5" id="api-contracts-module">
      
      {/* Top Banner stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-black/40 border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <Globe size={18} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-white/80 text-sm">REST API Contract Specifications</h4>
            <p className="font-sans text-xs text-white/40 mt-0.5">Specifications detailing absolute paths, HTTP verbs, and data interface envelopes.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0d0d0d] p-1.5 border border-white/10 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 font-mono">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-300 font-semibold">{apis.filter(a => a.method === "POST").length} POST</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 font-mono border-l border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-semibold">{apis.filter(a => a.method === "GET").length} GET</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 font-mono border-l border-white/10">
            <span className="text-white/40 font-medium">{apis.length} total endpoints</span>
          </div>
        </div>
      </div>

      {/* Accordion List items */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d0d0d] divide-y divide-white/10">
        {apis.map((api, idx) => {
          const isOpen = activeIdx === idx;
          const fullEndpoint = `${api.method.toUpperCase()} ${api.path}`;

          return (
            <div 
              key={`${api.path}-${idx}`} 
              className={`transition-all ${isOpen ? "bg-white/5" : "hover:bg-white/5"}`}
            >
              {/* Accordion Trigger row */}
              <div 
                onClick={() => setActiveIdx(isOpen ? null : idx)}
                className="flex items-center justify-between p-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 overflow-hidden mr-4">
                  <span className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded border ${getMethodStyle(api.method)}`}>
                    {api.method.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs font-bold text-white/90 truncate">
                    {api.path}
                  </span>
                  <span className="hidden md:inline font-sans text-xs text-white/30 font-medium truncate">
                    — {api.summary}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyEndpoint(fullEndpoint, idx);
                    }}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all cursor-pointer border border-transparent hover:border-white/10"
                    title="Copy API Spec"
                  >
                    {copiedIdx === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                  <ChevronsUpDown size={14} className="text-white/40" />
                </div>
              </div>

              {/* Collapsed container */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-white/5 bg-[#0f0f0f]">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2">
                    
                    {/* Headers & Specs column */}
                    <div className="md:col-span-4 flex flex-col gap-4">
                      {/* Technical Summary info */}
                      <div className="bg-black/40 p-4.5 rounded-xl border border-white/10">
                        <h5 className="font-sans font-semibold text-white/80 text-xs flex items-center gap-1.5 mb-2">
                          <Info size={13} className="text-emerald-400" />
                          <span>Endpoint Summary</span>
                        </h5>
                        <p className="font-sans text-xs text-white/60 leading-normal">
                          {api.summary}
                        </p>
                      </div>

                      {/* Header values spec cards */}
                      <div className="bg-black/40 p-4.5 rounded-xl border border-white/10">
                        <h5 className="font-sans font-semibold text-white/80 text-xs flex items-center gap-1.5 mb-2.5">
                          <Shield size={13} className="text-emerald-400" />
                          <span>Required HTTP Headers</span>
                        </h5>
                        {api.headers && api.headers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {api.headers.map((hdr, hIdx) => {
                              const isAuth = hdr.toLowerCase().includes("auth") || hdr.toLowerCase().includes("token");
                              return (
                                <span 
                                  key={hIdx} 
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border ${
                                    isAuth 
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-semibold" 
                                      : "bg-white/5 text-slate-300 border-white/10"
                                  }`}
                                >
                                  {isAuth && <Key size={9} />}
                                  {hdr}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[11px] font-sans text-white/30 italic">
                            No custom HTTP headers defined (uses standard Content-Type).
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request/Response spec codeblocks */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Request Specs */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-sans font-semibold text-white/40 tracking-wider mb-2 uppercase">
                          Request Parameter Envelope
                        </span>
                        <div className="bg-slate-950 rounded-xl overflow-hidden border border-white/5 flex flex-col flex-1">
                          <pre className="p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-auto max-h-72 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                            {api.requestBody || "// No Request Body required (GET endpoint)"}
                          </pre>
                        </div>
                      </div>

                      {/* Response Specs */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-sans font-semibold text-white/40 tracking-wider mb-2 uppercase">
                          Response Payload (200 OK)
                        </span>
                        <div className="bg-slate-950 rounded-xl overflow-hidden border border-white/5 flex flex-col flex-1">
                          <pre className="p-3.5 font-mono text-[11px] leading-relaxed text-emerald-400 overflow-auto max-h-72 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                            {api.responseBody}
                          </pre>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
