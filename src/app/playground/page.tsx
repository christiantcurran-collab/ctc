"use client";

import { useState } from "react";
import type { RAGConfig, QueryResult } from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { ConfigPanel } from "@/components/config-panel/config-panel";
import { ResultsPanel } from "@/components/results/results-panel";
import { ComparisonView } from "@/components/results/comparison-view";
import { Button } from "@/components/ui/button";
import { GitCompare, Columns2 } from "lucide-react";

export default function PlaygroundPage() {
  const [config, setConfig] = useState<RAGConfig>({ ...DEFAULT_CONFIG });
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, config }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Query failed");
        setResult(null);
      } else {
        setResult(data as QueryResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (compareMode) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2 text-sm">
            <GitCompare className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">Comparison Mode</span>
            <span className="text-muted-foreground">— Same query, different configs</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCompareMode(false)}>
            <Columns2 className="h-3.5 w-3.5 mr-1.5" />
            Standard Mode
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ComparisonView configA={config} onConfigAChange={setConfig} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2 text-sm">
          <Columns2 className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">Standard Mode</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCompareMode(true)}>
          <GitCompare className="h-3.5 w-3.5 mr-1.5" />
          Compare Mode
        </Button>
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Config Panel — Left Sidebar */}
        <div className="w-80 border-r border-border shrink-0 overflow-y-auto">
          <ConfigPanel config={config} onChange={setConfig} />
        </div>
        {/* Results Panel — Main Area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ResultsPanel result={result} isLoading={isLoading} onQuery={handleQuery} />
        </div>
      </div>
    </div>
  );
}
