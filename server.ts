import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK
// API key is accessed secure server-side.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Middlewares
app.use(express.json({ limit: "15mb" }));

// Conversions API route
app.post("/api/convert", async (req, res) => {
  const { requirements, stackPreferences } = req.body;

  if (!requirements || requirements.trim().length === 0) {
    return res.status(400).json({ error: "Requirements text is required." });
  }

  const dbPref = stackPreferences?.database || "PostgreSQL";
  const backendPref = stackPreferences?.backend || "FastAPI";
  const frontendPref = stackPreferences?.frontend || "Next.js";
  const cloudPref = stackPreferences?.cloudEnv || "Docker Compose/Cloud Run";

  const systemInstruction = `You are an expert Principal Software Architect & Systems Designer.
Your task is to ingest a user request, requirements document, PRD, or SRS, and output a complete, pristine, production-ready system architecture and design package.
Model the output architecture using the user's stack preferences: Database: ${dbPref}, Backend: ${backendPref}, Frontend: ${frontendPref}, Cloud Environment: ${cloudPref}.

Ensure all fields in the JSON response are populated with realistic, detailed engineering content, rather than placeholder descriptions:
1. Provide correct, valid Mermaid diagram codes in standard syntax.
2. In the diagrams object, ensure:
   - "architecture": a clean flowchart showing containers/clients interacting with gateway, backend microservices or layers, database, caches, and queues. Use standard flowchart tags like 'graph TD'.
   - "databaseER": a complete Entity-Relationship diagram showing actual tables, attributes, and relationships (e.g. users ||--o{ orders : places). Use standard mermaid 'erDiagram' syntax.
   - "sequence": a realistic client-to-server-to-db request/response flow. Use standard 'sequenceDiagram' syntax.
   - "dataflow": a granular operational diagram showing ingestion / data processes. Use 'graph TD'.
3. Detail database schema and API contracts precisely, reflecting the business rules specified in the requirements.
4. Deployment configs must show full, production-hardened files. For dockerCompose, provide a workable docker-compose.yml file with database setups, volume configurations, custom networks, and healthchecks. For k8sManifest, provide standard YAML resource limits, services, and dynamic setups.
5. In AI analysis, conduct a deep assessment of system issues: design flaws, conflicting specifications, security vulnerabilities, horizontal scaling issues, and a detailed line-item cost estimate for hosting this system.`;

  const userPrompt = `Convert the following software requirements into a comprehensive system design and architecture according to the stack preferences:
- Database: ${dbPref}
- Backend: ${backendPref}
- Frontend: ${frontendPref}
- Cloud Target: ${cloudPref}

=== SOFTWARE REQUIREMENTS / SRS ===
${requirements}
=============================

Return the output strictly matching the provided JSON schema. Ensure all Mermaid blocks do NOT have backticks inside the JSON fields, they must be clean, un-wrapped raw strings containing formatting codes matching standard Mermaid notation (e.g. "graph TD\\n  A --> B").`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: "Elegant and descriptive title of the architecture" 
            },
            overview: { 
              type: Type.STRING, 
              description: "High-level visual-architectural overview paragraph of the resulting system layout" 
            },
            designPatterns: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Technical design patterns utilized (e.g., CQRS, Microservices, Layered, Event-Driven)" 
            },
            diagrams: {
              type: Type.OBJECT,
              properties: {
                architecture: { 
                  type: Type.STRING, 
                  description: "Mermaid.js code for System Architecture flowchart. ALWAYS start with graph TD (or LR). Do NOT include markdown backticks." 
                },
                databaseER: { 
                  type: Type.STRING, 
                  description: "Mermaid.js code for Database ER Diagram. ALWAYS start with erDiagram. Do NOT include markdown backticks." 
                },
                sequence: { 
                  type: Type.STRING, 
                  description: "Mermaid.js code for a Key Core Flow Sequence Diagram. ALWAYS start with sequenceDiagram. Do NOT include markdown" 
                },
                dataflow: { 
                  type: Type.STRING, 
                  description: "Mermaid.js code for Operational data flow processes. ALWAYS start with graph TD. Do NOT include markdown" 
                }
              },
              required: ["architecture", "databaseER", "sequence", "dataflow"]
            },
            components: {
              type: Type.ARRAY,
              description: "List of system architectural components",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Compute service, Database, Queue, Proxy, Load Balancer, etc." },
                  description: { type: Type.STRING },
                  tech: { type: Type.STRING, description: "Technology choice (e.g. FastAPI, Next.js, Redis, PostgreSQL)" },
                  responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "type", "description", "tech", "responsibilities"]
              }
            },
            databaseSchema: {
              type: Type.ARRAY,
              description: "Structured database schemas reflecting relational tables or collections",
              items: {
                type: Type.OBJECT,
                properties: {
                  tableName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  columns: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, description: "e.g., VARCHAR(255), BIGINT, TIMESTAMP, uuid" },
                        constraints: { type: Type.STRING, description: "e.g., PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT now()" },
                        references: { type: Type.STRING, description: "Nullable. Reference in format table_name(column_name) if dynamic" }
                      },
                      required: ["name", "type", "constraints"]
                    }
                  }
                },
                required: ["tableName", "description", "columns"]
              }
            },
            apis: {
              type: Type.ARRAY,
              description: "List of core API Endpoint Contracts",
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING, description: "Endpoint URL path e.g. /api/v1/auth/login" },
                  method: { type: Type.STRING, description: "HTTP verb, uppercase (GET, POST, etc.)" },
                  summary: { type: Type.STRING },
                  requestBody: { type: Type.STRING, description: "Descriptive JSON body template or structure parameters" },
                  responseBody: { type: Type.STRING, description: "Descriptive success JSON payload details" },
                  headers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific headers needed e.g. Authorization" }
                },
                required: ["path", "method", "summary", "requestBody", "responseBody"]
              }
            },
            deployment: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: "Overview of instructions for deploying this pipeline" },
                dockerCompose: { type: Type.STRING, description: "Full working copy-paste ready docker-compose.yml" },
                k8sManifest: { type: Type.STRING, description: "Full comprehensive Kubernetes deploy and service YAML" }
              },
              required: ["summary", "dockerCompose", "k8sManifest"]
            },
            aiAnalysis: {
              type: Type.OBJECT,
              properties: {
                missingRequirements: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Gaps found in user requirements that are critical for high scale engineering" 
                },
                designConflicts: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Potential logic conflicts or architecture trade-offs identified in specifications" 
                },
                scalabilityConcerns: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Where this system faces bottleneck points under load, and how to scale dynamically" 
                },
                securityRisks: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Core vulnerabilities (OWASP top ten) and exact mitigation advice" 
                },
                costEstimation: {
                  type: Type.OBJECT,
                  properties: {
                    infraBreakdown: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "Detailed itemized list of components with resources and cost allocations" 
                    },
                    monthlyEstimate: { type: Type.STRING, description: "Overall monthly sum, e.g., $150 - $220 USD" },
                    optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["infraBreakdown", "monthlyEstimate", "optimizationTips"]
                }
              },
              required: ["missingRequirements", "designConflicts", "scalabilityConcerns", "securityRisks", "costEstimation"]
            }
          },
          required: [
            "title", "overview", "designPatterns", "diagrams", "components", "databaseSchema", "apis", "deployment", "aiAnalysis"
          ]
        }
      }
    });

    const stringResult = response.text;
    if (!stringResult) {
      throw new Error("Empty response received from the conversion model.");
    }

    const data = JSON.parse(stringResult);
    return res.json(data);
  } catch (err: any) {
    console.error("Conversion error: ", err);
    return res.status(500).json({ 
      error: "Failed to convert requirement description to architecture.",
      details: err?.message || err 
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Static Asset Loading
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application active and serving on http://0.0.0.0:${PORT}`);
  });
}

startServer();
