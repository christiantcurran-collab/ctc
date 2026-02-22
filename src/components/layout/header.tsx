"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, BookOpen, User, FlaskConical, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Database },
  { href: "/playground", label: "Playground", icon: FlaskConical },
  { href: "/how-ai-works", label: "How AI Works", icon: Lightbulb },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/about", label: "About", icon: User },
];

export function Header() {
  const pathname = usePathname();
  const [mode, setMode] = useState<"demo" | "live">("demo");

  useEffect(() => {
    fetch("/api/mode")
      .then((res) => res.json())
      .then((data) => setMode(data.mode))
      .catch(() => setMode("demo"));
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center">
            <Database className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">RAG Playground</span>
            <span className="text-[10px] text-muted-foreground leading-tight">FCA Handbook</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {mode === "live" ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Mode
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Demo Mode
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
