"use client";

import { useState } from "react";
import type { RAGConfig, QueryResult } from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/types";
import { ConfigPanel } from "@/components/config-panel/config-panel";
import { ResultsPanel } from "./results-panel";

interface ComparisonViewProps {
  configA: RAGConfig;
  onConfigAChange: (config: RAGConfig) => void;
}

export function ComparisonView({ configA, onConfigAChange }: ComparisonViewProps) {
  const [configB, setConfigB] = useState<RAGConfig>({
    ...DEFAULT_CONFIG,
    chunkSize: 200,
    temperature: 0.8,
    generationModel: "gpt-3.5-turbo",
  });
  const [resultA, setResultA] = useState<QueryResult | null>(null);
  const [resultB, setResultB] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    try {
      // Run both configs in parallel via the API
      const [resA, resB] = await Promise.all([
        fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, config: configA }),
        }),
        fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, config: configB }),
        }),
      ]);
      const dataA = await resA.json();
      const dataB = await resB.json();
      setResultA(resA.ok ? dataA : null);
      setResultB(resB.ok ? dataB : null);
    } catch {
      setResultA(null);
      setResultB(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Config A */}
      <div className="w-72 border-r border-border shrink-0 overflow-y-auto">
        <ConfigPanel config={configA} onChange={onConfigAChange} label="Config A" />
      </div>
      {/* Results A */}
      <div className="flex-1 border-r border-border min-w-0">
        <div className="p-2 bg-secondary/30 border-b border-border text-xs font-semibold text-center text-emerald-400">
          Configuration A
        </div>
        <ResultsPanel result={resultA} isLoading={isLoading} onQuery={handleQuery} />
      </div>
      {/* Results B */}
      <div className="flex-1 border-r border-border min-w-0">
        <div className="p-2 bg-secondary/30 border-b border-border text-xs font-semibold text-center text-blue-400">
          Configuration B
        </div>
        <ResultsPanel result={resultB} isLoading={isLoading} onQuery={handleQuery} />
      </div>
      {/* Config B */}
      <div className="w-72 shrink-0 overflow-y-auto">
        <ConfigPanel config={configB} onChange={setConfigB} label="Config B" />
      </div>
    </div>
  );
}
