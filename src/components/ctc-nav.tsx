"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./ctc-nav.css";

const tabs = [
  { href: "/how-ai-works", label: "How an LLM Works" },
  { href: "/insurance-dashboard", label: "Insurance" },
  { href: "/se-trainer", label: "SE Trainer" },
];

export function CTCNav() {
  const pathname = usePathname();

  return (
    <nav className="ctc-nav">
      <div className="ctc-nav-inner">
        <div className="ctc-nav-logo">
          <span className="ctc-nav-logo-text">CTC</span>
          <span className="ctc-nav-logo-sep">|</span>
          <span className="ctc-nav-logo-title">OpenAI | GPT | Codex</span>
        </div>
        <div className="ctc-nav-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`ctc-nav-tab ${pathname === tab.href ? "active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
