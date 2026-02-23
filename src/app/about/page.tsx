import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { User, ExternalLink, Database, Code, Brain, Shield, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">About</h1>
          </div>
          <p className="text-muted-foreground mb-10">
            A demonstration of OpenAI, GPT, and Codex-aligned AI deployment and enablement capabilities.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Project Context</h2>
            <div className="border border-border rounded-lg p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                This RAG Playground demonstrates the kind of tool an <strong className="text-foreground">AI Success Engineer</strong> would
                build to help enterprise clients optimise their AI deployments. It showcases:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Deep RAG understanding</strong> - every parameter is surfaced with clear explanations of how it affects output quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <Code className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">API proficiency</strong> - embeddings, chat completions, cost tracking, and model comparison</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Domain expertise</strong> - UK financial regulation (FCA Handbook) as a realistic enterprise knowledge base</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Technical enablement</strong> - the comparison mode lets clients see exactly how config changes affect quality and cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Client-facing design</strong> - clean, accessible interface that non-technical stakeholders can use</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Technical Stack</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Framework", value: "Next.js 15 (App Router)" },
                { label: "Language", value: "TypeScript" },
                { label: "Styling", value: "Tailwind CSS + shadcn/ui" },
                { label: "AI", value: "OpenAI API + GPT models + Codex workflows" },
                { label: "Vector Search", value: "In-memory cosine similarity" },
                { label: "Deployment", value: "Vercel" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between p-3 rounded-md bg-secondary/30 border border-border">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Repository</h2>
            <div className="space-y-3">
              <a
                href="https://github.com/christiantcurran-collab/ctc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    CTC OpenAI GPT Codex Portfolio
                  </div>
                  <div className="text-sm text-muted-foreground">OpenAI, GPT, and Codex focused financial services AI use cases</div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <div className="border border-border rounded-lg p-6 text-sm text-muted-foreground">
              <p className="mb-3">
                If you&apos;d like to discuss this project or my experience with AI deployment
                and financial services technology:
              </p>
              <div className="space-y-1">
                <p><strong className="text-foreground">CTC</strong></p>
                <p>
                  <a
                    href="https://github.com/christiantcurran-collab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    github.com/christiantcurran-collab
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
