/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AIAnalysis } from "../types";
import { 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  Cpu, 
  HardDrive,
  Lightbulb
} from "lucide-react";

interface AnalysisTabProps {
  analysis: AIAnalysis;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ analysis }) => {
  const { 
    missingRequirements = [], 
    designConflicts = [], 
    scalabilityConcerns = [], 
    securityRisks = [], 
    costEstimation 
  } = analysis;

  return (
    <div className="space-y-6" id="ai-audits-and-costs-module">
      
      {/* Top Banner Warning alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Missing Requirements Card */}
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 px-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <HelpCircle size={16} />
            </div>
            <h4 className="font-sans font-bold text-amber-400 text-sm">Gaps & Missing Requirements Analyzed</h4>
          </div>

          {missingRequirements && missingRequirements.length > 0 ? (
            <ul className="space-y-2.5">
              {missingRequirements.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-normal">
                  <span className="h-4 w-4 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-amber-500/20">
                    !
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Full compliance detected: No major requirements gaps found.</span>
            </div>
          )}
        </div>

        {/* Design Conflicts Card */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 px-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <AlertTriangle size={15} />
            </div>
            <h4 className="font-sans font-bold text-red-400 text-sm">Identified Design Conflicts & Trade-offs</h4>
          </div>

          {designConflicts && designConflicts.length > 0 ? (
            <ul className="space-y-2.5">
              {designConflicts.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 animate-ping" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Perfect architectural alignment: No design conflicts identified.</span>
            </div>
          )}
        </div>

      </div>

      {/* Scalability & Security Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Scalability Roadmaps */}
        <div className="border border-white/10 bg-[#0d0d0d] rounded-xl p-5 transition-colors">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="p-2 bg-white/5 text-emerald-400 border border-white/10 rounded-xl">
              <TrendingUp size={16} />
            </div>
            <h4 className="font-sans font-bold text-white/80 text-sm">Scalability Concerns & Bottlenecks</h4>
          </div>

          {scalabilityConcerns && scalabilityConcerns.length > 0 ? (
            <div className="space-y-3">
              {scalabilityConcerns.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-normal bg-black/40 border border-white/5 p-3 rounded-xl">
                  <Cpu size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-white/30 italic">No scalability concerns specified.</div>
          )}
        </div>

        {/* Security audits */}
        <div className="border border-white/10 bg-[#0d0d0d] rounded-xl p-5 transition-colors">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="p-2 bg-white/5 text-red-400 border border-white/10 rounded-xl">
              <ShieldAlert size={16} />
            </div>
            <h4 className="font-sans font-bold text-white/80 text-sm">Security Vulnerabilities & Mitigations</h4>
          </div>

          {securityRisks && securityRisks.length > 0 ? (
            <div className="space-y-3">
              {securityRisks.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-normal bg-black/40 border border-white/5 p-3 rounded-xl">
                  <ShieldAlert size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-white/30 italic">No cybersecurity vulnerabilities detected.</div>
          )}
        </div>

      </div>

      {/* Cost Estimator Section */}
      {costEstimation && (
        <div className="border border-white/10 bg-[#0d0d0d] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <DollarSign size={18} />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white/90 text-base">Operational Cloud Cost Estimator</h4>
                <p className="font-sans text-xs text-white/40 mt-0.5">Rough monthly itemized pricing estimates based on GCP / AWS average resource billing models.</p>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-white/15 rounded-xl p-3 px-5 text-center shrink-0">
              <span className="block text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-widest text-center">TOTAL ESTIMATE</span>
              <span className="font-mono text-xl font-black text-emerald-400">{costEstimation.monthlyEstimate || "Calculating..."}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Infra Breakdown items */}
            <div className="space-y-3.5">
              <h5 className="font-sans font-semibold text-white/80 text-sm flex items-center gap-1.5">
                <HardDrive size={14} className="text-slate-400" />
                <span>Infrastructure Cost Allocation Breakdown</span>
              </h5>
              
              <div className="space-y-2.5">
                {costEstimation.infraBreakdown && costEstimation.infraBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 px-3.5 py-2 rounded-xl text-xs font-sans text-slate-300 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{item.split(":")[0]?.trim()}</span>
                    </div>
                    <span className="font-mono font-semibold text-emerald-400 bg-black/60 px-2 py-0.5 rounded text-[10px] border border-white/5">
                      {item.split(":")[1]?.trim() || "Dynamic Sizing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Tips checkmarks */}
            <div className="space-y-3.5">
              <h5 className="font-sans font-semibold text-white/80 text-sm flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-400" />
                <span>Architecture Cost Optimization Checklist</span>
              </h5>

              <div className="space-y-3">
                {costEstimation.optimizationTips && costEstimation.optimizationTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                    <CheckCircle2 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
