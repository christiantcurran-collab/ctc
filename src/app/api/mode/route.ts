import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/openai";

export async function GET() {
  return NextResponse.json({ mode: isDemoMode() ? "demo" : "live" });
}
