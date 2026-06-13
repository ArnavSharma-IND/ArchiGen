/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColumnSchema {
  name: string;
  type: string;
  constraints: string;
  references?: string;
}

export interface TableSchema {
  tableName: string;
  description: string;
  columns: ColumnSchema[];
}

export interface APIContract {
  path: string;
  method: string;
  summary: string;
  requestBody: string;
  responseBody: string;
  headers?: string[];
}

export interface SystemComponent {
  name: string;
  type: string;
  description: string;
  tech: string;
  responsibilities: string[];
}

export interface MermaidDiagrams {
  architecture: string;
  databaseER: string;
  sequence: string;
  dataflow: string;
}

export interface DeploymentConfig {
  summary: string;
  dockerCompose: string;
  k8sManifest: string;
}

export interface CostEstimation {
  infraBreakdown: string[];
  monthlyEstimate: string;
  optimizationTips: string[];
}

export interface AIAnalysis {
  missingRequirements: string[];
  designConflicts: string[];
  scalabilityConcerns: string[];
  securityRisks: string[];
  costEstimation: CostEstimation;
}

export interface ArcConverterOutput {
  title: string;
  overview: string;
  designPatterns: string[];
  diagrams: MermaidDiagrams;
  components: SystemComponent[];
  databaseSchema: TableSchema[];
  apis: APIContract[];
  deployment: DeploymentConfig;
  aiAnalysis: AIAnalysis;
}

export interface ConversionState {
  loading: boolean;
  error: string | null;
  data: ArcConverterOutput | null;
}

export interface LibrarySample {
  id: string;
  title: string;
  description: string;
  content: string;
  techPreferences: {
    database: string;
    backend: string;
    frontend: string;
    cloudEnv: string;
  };
}
