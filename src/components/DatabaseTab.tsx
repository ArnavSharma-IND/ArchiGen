/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TableSchema } from "../types";
import { Database, FileCode, Check, Copy, ArrowRight, Table } from "lucide-react";

interface DatabaseTabProps {
  schemas: TableSchema[];
  title: string;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({ schemas, title }) => {
  const [selectedTable, setSelectedTable] = useState<string>(
    schemas[0]?.tableName || ""
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Auto-generate SQL DLL Create Table syntax dynamically
  const generateSQL = (): string => {
    let sqlStr = `-- DDL SQL SCHEMA FOR: ${title.toUpperCase()}\n`;
    sqlStr += `-- Generated dynamically by Requirements-to-Architecture Converter\n\n`;

    schemas.forEach((table) => {
      sqlStr += `CREATE TABLE ${table.tableName} (\n`;
      const cols = table.columns.map((col) => {
        let line = `  ${col.name} ${col.type.toUpperCase()}`;
        if (col.constraints) {
          line += ` ${col.constraints.toUpperCase()}`;
        }
        if (col.references) {
          line += ` REFERENCES ${col.references}`;
        }
        return line;
      });
      sqlStr += cols.join(",\n");
      sqlStr += `\n);\n\n`;
    });

    return sqlStr;
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(generateSQL());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentTable = schemas.find((t) => t.tableName === selectedTable) || schemas[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="db-schema-module">
      
      {/* Tables Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-emerald-400 animate-pulse" />
            <span className="font-sans font-semibold text-white/80 text-xs uppercase tracking-wider">
              Relational Tables ({schemas.length})
            </span>
          </div>
          <p className="font-sans text-xs text-white/40 leading-normal">
            These structural schemas are generated to satisfy transactional rules and relationships outlined in the user brief.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 border border-white/10 rounded-xl p-1.5 bg-black/40">
          {schemas.map((table) => (
            <button
              key={table.tableName}
              onClick={() => setSelectedTable(table.tableName)}
              className={`flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                table.tableName === selectedTable
                  ? "bg-white/10 text-white shadow-sm border border-white/10 font-semibold"
                  : "text-white/60 hover:bg-white/5"
              }`}
              id={`table-selector-btn-${table.tableName}`}
            >
              <div className="flex items-center gap-2">
                <Table size={13} className={table.tableName === selectedTable ? "text-emerald-400" : "text-white/30"} />
                <span>{table.tableName}</span>
              </div>
              <span className="text-[10px] opacity-70">
                {table.columns.length} cols
              </span>
            </button>
          ))}
        </div>

        {/* Generate DDL SQL Block */}
        <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-4 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FileCode size={13} className="text-emerald-400" />
              <span className="text-[10px] font-mono tracking-wide text-white/50">GENERATE DDL SQL</span>
            </div>
            <button
              onClick={handleCopySQL}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Copy entire SQL create statements"
              id="btn-copy-generated-sql"
            >
              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
          <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-56 bg-black/40 p-3.5 rounded-lg border border-white/5">
            {generateSQL()}
          </pre>
        </div>
      </div>

      {/* Selected Table Grid & Preview Cards */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {currentTable ? (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d0d0d]">
            <div className="bg-white/5 border-b border-white/10 px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-white font-bold text-base flex items-center gap-2">
                    <Table size={16} className="text-emerald-400" />
                    <span>{currentTable.tableName}</span>
                  </h3>
                  <p className="font-sans text-white/40 text-xs mt-1">
                    {currentTable.description}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono uppercase font-medium">
                  {title.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] font-sans font-semibold text-white/40 tracking-wider">
                    <th className="px-5 py-3 text-white/40">COLUMN NAME</th>
                    <th className="px-5 py-3 text-white/40">DATATYPE</th>
                    <th className="px-5 py-3 text-white/40">CONSTRAINTS</th>
                    <th className="px-5 py-3 text-white/40">BADGES / RELATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentTable.columns.map((column, idx) => (
                    <tr 
                      key={`${column.name}-${idx}`} 
                      className="hover:bg-white/5 text-xs font-mono text-slate-300"
                    >
                      <td className="px-5 py-3.5 text-slate-200 font-medium">
                        {column.name}
                      </td>
                      <td className="px-5 py-3.5 text-emerald-400 font-semibold">
                        {column.type}
                      </td>
                      <td className="px-5 py-3.5">
                        {column.constraints.split(",").map((c, i) => (
                          <span
                            key={i}
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-sans mr-1 ${
                              c.toLowerCase().includes("primary key")
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                                : c.toLowerCase().includes("not null")
                                ? "bg-white/10 text-slate-300 border border-white/10"
                                : "bg-white/5 text-slate-400"
                            }`}
                          >
                            {c.trim()}
                          </span>
                        ))}
                      </td>
                      <td className="px-5 py-3.5">
                        {column.references ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-sans">
                            <span className="p-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono font-semibold">FK</span>
                            <ArrowRight size={11} className="text-emerald-400" />
                            <span className="font-mono text-[10px] bg-white/5 px-1 py-0.5 rounded text-slate-300 border border-white/5">
                              {column.references}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/20 font-sans text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simulated Data Preview section to make UI highly informative */}
            <div className="border-t border-white/10 px-5 py-4 bg-white/5 text-slate-300">
              <h5 className="font-sans font-semibold text-white/40 text-xs uppercase tracking-wide mb-2.5">
                Simulated JSON Row Specimen
              </h5>
              <pre className="font-mono text-[10px] text-emerald-400 bg-black/60 border border-white/10 rounded-lg p-3 max-h-36 overflow-y-auto">
                {JSON.stringify(
                  currentTable.columns.reduce((acc, col) => {
                    let val: any = "val_placeholder";
                    if (col.name.includes("id")) val = 1;
                    else if (col.name.includes("uuid")) val = "d4e287a9-0fc4-47b6-96cb-847e09214731";
                    else if (col.type.toLowerCase().includes("varchar")) val = `${col.name}_data`;
                    else if (col.type.toLowerCase().includes("timestamp")) val = new Date().toISOString();
                    else if (col.type.toLowerCase().includes("bool")) val = true;
                    else if (col.type.toLowerCase().includes("int")) val = 100;
                    acc[col.name] = val;
                    return acc;
                  }, {} as any),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-white/40 italic">
            Select a table to inspect database constraints
          </div>
        )}
      </div>
    </div>
  );
};
