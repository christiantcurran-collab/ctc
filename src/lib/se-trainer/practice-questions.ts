import type { PracticeQuestion } from "./types";

export const practiceQuestions: PracticeQuestion[] = [
  // ── Discovery ──
  {
    id: 1, section: 0, category: "discovery", difficulty: "junior",
    prompt: "A potential customer says they want to 'add AI to their product.' Walk me through how you would run the first 30 minutes of a discovery call.",
    guidancePoints: [
      "Ask about the specific problem AI should solve, not just 'add AI'",
      "Understand current workflow and pain points",
      "Identify data sources and volume",
      "Ask about success metrics — how will they measure if AI is working?",
      "Discuss timeline and team (who will build and maintain it?)",
      "Avoid jumping to solutions before understanding the problem",
    ],
  },
  {
    id: 2, section: 0, category: "discovery", difficulty: "mid",
    prompt: "A financial services firm wants to build an internal tool that helps compliance officers review regulatory filings. What questions do you ask in discovery, and what architecture would you suggest?",
    guidancePoints: [
      "Ask about data: what documents, how many, how often updated, what format",
      "Ask about compliance requirements: data residency, PII handling, audit trails",
      "Understand the current manual process and its pain points",
      "Suggest RAG architecture for document Q&A with citations",
      "Recommend Azure OpenAI for financial services compliance needs",
      "Discuss evaluation: how do they validate the tool's accuracy against domain experts?",
    ],
  },
  {
    id: 3, section: 0, category: "discovery", difficulty: "senior",
    prompt: "You're meeting with a CTO who is evaluating OpenAI against building on open-source models (Llama, Mistral). How do you position OpenAI's value proposition without dismissing their concerns?",
    guidancePoints: [
      "Acknowledge open-source strengths: control, customisation, no vendor dependency",
      "Position OpenAI's advantages: frontier model quality, managed infrastructure, rapid iteration, enterprise support",
      "Discuss total cost of ownership: hosting, GPU management, model updates, security",
      "Highlight features hard to replicate: Structured Outputs, Assistants API, prompt caching, Realtime API",
      "Suggest a bake-off: test both approaches on their actual use case with a golden eval set",
      "Be honest about trade-offs rather than dismissive",
    ],
  },
  {
    id: 4, section: 0, category: "discovery", difficulty: "mid",
    prompt: "A customer currently uses a competitor's API and is considering switching to OpenAI. What do you need to understand before proposing a migration plan?",
    guidancePoints: [
      "Understand why they want to switch: quality, cost, features, support?",
      "Map their current usage: endpoints, models, volume, latency requirements",
      "Identify integration points: SDKs, prompt formats, function calling differences",
      "Assess risk: what's the cost of a failed migration?",
      "Propose a parallel-run approach: test OpenAI alongside current provider",
      "Discuss feature gaps or differences that might affect the migration",
    ],
  },
  {
    id: 5, section: 0, category: "discovery", difficulty: "junior",
    prompt: "What are the 5 most important questions to ask in the first 10 minutes of any SE discovery call?",
    guidancePoints: [
      "What specific problem are you trying to solve?",
      "Who are the end users and what does their workflow look like today?",
      "What data/content will the AI work with?",
      "How will you measure success?",
      "What is your timeline for implementation?",
      "Keep questions open-ended, not yes/no",
    ],
  },
  {
    id: 6, section: 0, category: "discovery", difficulty: "senior",
    prompt: "A large enterprise wants to deploy AI across 15 different teams with different use cases. How do you scope this engagement and avoid the 'boil the ocean' trap?",
    guidancePoints: [
      "Start with 1-2 high-impact, well-defined use cases as pilots",
      "Identify a champion team with clear success metrics",
      "Build a platform/shared infrastructure that other teams can adopt later",
      "Create a maturity model: crawl (prompting) → walk (RAG) → run (fine-tuning, agents)",
      "Set clear success criteria for the pilot before expanding",
      "Build internal capability: train their team, don't just build for them",
    ],
  },

  // ── Objection Handling ──
  {
    id: 7, section: 9, category: "objection-handling", difficulty: "mid",
    prompt: "A customer's security team is blocking the API integration because they're concerned about data being used for training. How do you respond?",
    guidancePoints: [
      "Directly address the concern: API data is NOT used for model training",
      "Explain retention policy: 30-day retention for abuse monitoring, then deleted",
      "Mention enterprise options: zero-day retention available",
      "If needed, propose Azure OpenAI with Private Endpoints for maximum control",
      "Offer to join a call with the security team to address specific concerns",
      "Provide documentation: OpenAI's data usage policy, SOC 2 report, DPA",
    ],
  },
  {
    id: 8, section: 2, category: "objection-handling", difficulty: "junior",
    prompt: "A customer says 'OpenAI is too expensive for our use case — we process millions of documents per day.' How do you handle this objection?",
    guidancePoints: [
      "Ask about the specific task: classification, extraction, summarisation?",
      "Recommend GPT-4o-mini for high-volume tasks (~15x cheaper than GPT-4o)",
      "Introduce the Batch API for 50% cost reduction on non-real-time processing",
      "Explain prompt caching for additional savings on repeated prefixes",
      "Calculate the actual cost: volume × tokens × price per token",
      "Discuss model routing: use expensive models only where quality requires it",
    ],
  },
  {
    id: 9, section: 7, category: "objection-handling", difficulty: "senior",
    prompt: "A technical lead argues that GPT-4o is 'not good enough' for their use case and they need to fine-tune a model from scratch. How do you handle this?",
    guidancePoints: [
      "Ask for specific failure examples: where exactly does GPT-4o fall short?",
      "Check if prompt engineering has been properly explored (few-shot, structured outputs, chain-of-thought)",
      "Suggest a systematic evaluation: golden dataset with measurable criteria",
      "If quality genuinely falls short, discuss fine-tuning as the right next step",
      "Explore whether RAG could address the gap (grounding in domain knowledge)",
      "Be willing to agree if their evidence supports the need for fine-tuning",
    ],
  },
  {
    id: 10, section: 9, category: "objection-handling", difficulty: "mid",
    prompt: "A customer asks: 'What happens if OpenAI has an outage? Our application can't go down.' How do you address this availability concern?",
    guidancePoints: [
      "Acknowledge the concern — availability is critical for production systems",
      "Discuss OpenAI's uptime track record and status page",
      "Recommend Azure OpenAI for SLA-backed availability",
      "Suggest architecture patterns: graceful degradation, fallback responses, queuing",
      "Propose multi-region deployment on Azure for high availability",
      "Discuss caching strategies for frequently asked questions",
    ],
  },
  {
    id: 11, section: 9, category: "objection-handling", difficulty: "senior",
    prompt: "A CISO says: 'We can't send any customer data to external APIs. Period.' How do you navigate this hard no?",
    guidancePoints: [
      "Respect the constraint — don't argue against security policy",
      "Explore what 'external' means to them: is Azure within their trust boundary?",
      "Propose Azure OpenAI with Private Endpoints inside their VNet",
      "Discuss PII redaction: strip sensitive data before API calls, re-hydrate after",
      "Explore if non-sensitive data (e.g. internal knowledge, documentation) could be sent",
      "If truly no external API is possible, discuss Azure OpenAI on dedicated infrastructure",
    ],
  },

  // ── Technical Depth ──
  {
    id: 12, section: 4, category: "technical-depth", difficulty: "mid",
    prompt: "A customer's RAG system has good retrieval (relevant chunks are found) but the model still produces inaccurate answers. Diagnose the likely issues and propose fixes.",
    guidancePoints: [
      "System prompt likely lacks grounding instructions",
      "Add explicit instructions: 'Only answer from provided context, say I don't know if unsure'",
      "Check temperature: set to 0 for factual tasks",
      "Verify chunk ordering: most relevant first to counter 'lost in the middle' effect",
      "Consider if chunks provide enough context or if chunking strategy needs adjustment",
      "Add citation requirements to the prompt to force source grounding",
    ],
  },
  {
    id: 13, section: 3, category: "technical-depth", difficulty: "senior",
    prompt: "Design an agentic customer support system with tool use. Describe the architecture, tools, safety guardrails, and evaluation approach.",
    guidancePoints: [
      "Define 5-8 specific tools: search_knowledge_base, lookup_order, create_ticket, escalate_to_human, send_email, etc.",
      "Implement maximum iteration limits to prevent infinite loops",
      "Use a router agent to classify intent before delegating to specialist agents",
      "Add guardrails: confirmation before destructive actions, escalation when confidence is low",
      "Implement output validation before executing any real-world actions",
      "Evaluate with a golden dataset of support scenarios, measuring resolution rate and safety",
    ],
  },
  {
    id: 14, section: 5, category: "technical-depth", difficulty: "mid",
    prompt: "A customer wants to fine-tune GPT-4o-mini for their specific classification task. Walk them through the end-to-end process, from data preparation to deployment.",
    guidancePoints: [
      "Data preparation: collect 50-100+ high-quality examples in JSONL format",
      "Split data: 80% training, 20% validation",
      "Upload via Files API with purpose 'fine-tune'",
      "Create fine-tuning job with hyperparameters",
      "Monitor training/validation loss via job events",
      "Evaluate on held-out test set before deployment",
      "Use the fine-tuned model ID in production API calls",
    ],
  },
  {
    id: 15, section: 6, category: "technical-depth", difficulty: "junior",
    prompt: "Write a system prompt for an AI assistant that helps customers troubleshoot Wi-Fi connectivity issues. The assistant should be friendly, systematic, and escalate to human support if it can't resolve the issue.",
    guidancePoints: [
      "Define a clear role: 'You are a friendly Wi-Fi support specialist'",
      "Provide a systematic troubleshooting flow (restart router → check connections → firmware → ISP)",
      "Include constraints: 'Don't ask for sensitive information like passwords'",
      "Add an escalation trigger: 'If the issue persists after 3 troubleshooting steps, offer to connect to a human agent'",
      "Set a friendly, patient tone",
      "Define output format for each step",
    ],
  },
  {
    id: 16, section: 10, category: "technical-depth", difficulty: "senior",
    prompt: "Design an evaluation pipeline for a production RAG system that includes automated daily checks, weekly quality reports, and continuous improvement loops.",
    guidancePoints: [
      "Golden dataset of 100+ queries with reference answers, versioned in source control",
      "Daily automated runs: LLM-as-Judge scoring faithfulness, relevance, completeness",
      "Weekly quality reports: aggregate scores, trend analysis, worst-performing queries",
      "Alerts on score regressions beyond defined thresholds",
      "Continuous improvement: add new failure cases to golden dataset, iterate prompts",
      "A/B testing for prompt changes with 10% traffic routing",
      "Human audit of 20-50 random samples monthly",
    ],
  },
  {
    id: 17, section: 4, category: "technical-depth", difficulty: "mid",
    prompt: "Compare three vector database options (Pinecone, pgvector, OpenAI Vector Stores) for a mid-size company with an existing PostgreSQL database. Recommend one and explain why.",
    guidancePoints: [
      "pgvector: zero new infrastructure (PostgreSQL extension), familiar tooling, but self-managed scaling",
      "Pinecone: fully managed, purpose-built for vectors, but adds a new service dependency",
      "OpenAI Vector Stores: fully managed RAG with Assistants API, but tied to OpenAI ecosystem",
      "For a company already on Postgres, pgvector creates least friction",
      "Consider scale: pgvector works well up to millions of vectors, Pinecone scales further",
      "Consider the team's expertise and maintenance capacity",
    ],
  },
  {
    id: 18, section: 2, category: "technical-depth", difficulty: "senior",
    prompt: "A customer processes 5M API calls per day. Design a cost optimisation strategy that maintains quality while reducing their bill by 50% or more.",
    guidancePoints: [
      "Analyse the call distribution: what percentage are simple vs complex?",
      "Implement model routing: classify with GPT-4o-mini, route simple calls to mini",
      "Use Batch API for non-real-time tasks (50% discount)",
      "Maximise prompt caching: move static content to prompt prefix",
      "Consider distillation: fine-tune GPT-4o-mini on GPT-4o outputs for key tasks",
      "Implement response caching for identical/similar queries",
      "Show the math: before and after cost projections",
    ],
  },

  // ── Demo Design ──
  {
    id: 19, section: 0, category: "demo-design", difficulty: "mid",
    prompt: "Design a 30-minute demo for a financial services customer interested in document intelligence (extracting data from contracts and regulatory filings).",
    guidancePoints: [
      "Open with their pain point: manual document review is slow and error-prone (2 min)",
      "Show a live extraction demo using their actual document type if possible (10 min)",
      "Demonstrate Structured Outputs for guaranteed JSON extraction schema (5 min)",
      "Show accuracy: compare model output to ground truth on 3-5 documents (5 min)",
      "Discuss architecture: RAG for regulatory knowledge, fine-tuning for format consistency (5 min)",
      "Close with next steps: POC scope, timeline, success criteria (3 min)",
    ],
  },
  {
    id: 20, section: 0, category: "demo-design", difficulty: "junior",
    prompt: "A customer has never used the OpenAI API. Design a 20-minute introductory demo that showcases the most impressive capabilities.",
    guidancePoints: [
      "Start with Chat Completions: show a simple prompt and response (3 min)",
      "Show function calling with a live API integration (5 min)",
      "Demonstrate GPT-4o vision: upload an image and ask questions about it (3 min)",
      "Show Structured Outputs: extract data into a precise JSON schema (3 min)",
      "Side-by-side model comparison: GPT-4o vs GPT-4o-mini on same query (3 min)",
      "Close with cost examples and next steps (3 min)",
    ],
  },
  {
    id: 21, section: 0, category: "demo-design", difficulty: "senior",
    prompt: "A healthcare company wants to see how AI can assist with clinical documentation. Design a demo that addresses both the technical capabilities and the compliance concerns.",
    guidancePoints: [
      "Lead with compliance: Azure OpenAI, HIPAA BAA, data residency, PII handling (5 min)",
      "Show a clinical note summarisation demo with de-identified data (8 min)",
      "Demonstrate Structured Outputs for coding/billing extraction (5 min)",
      "Show RAG with medical reference documents for decision support (5 min)",
      "Discuss guardrails: 'This is a draft for physician review, not a diagnosis' (3 min)",
      "Address evaluation: how to validate accuracy against clinician gold standard (4 min)",
    ],
  },
  {
    id: 22, section: 0, category: "demo-design", difficulty: "mid",
    prompt: "Design a demo showing the value of model routing to a cost-conscious customer who is currently sending all traffic to GPT-4o.",
    guidancePoints: [
      "Show current cost: their volume × GPT-4o pricing (2 min)",
      "Live demo: run 10 real queries through both GPT-4o and GPT-4o-mini (5 min)",
      "Highlight queries where mini matches 4o quality (classification, extraction) (5 min)",
      "Show where 4o pulls ahead (complex reasoning, nuanced analysis) (3 min)",
      "Build the routing logic live: a simple classifier prompt (5 min)",
      "Calculate projected savings: 60-80% cost reduction with minimal quality loss (3 min)",
      "Discuss next steps: implement routing, monitor quality, iterate (2 min)",
    ],
  },

  // ── Customer Success ──
  {
    id: 23, section: 0, category: "customer-success", difficulty: "mid",
    prompt: "A customer's POC was successful, but they've stalled for 3 months on moving to production. What do you do to unstick them?",
    guidancePoints: [
      "Diagnose the blocker: is it technical, organisational, budget, or security?",
      "If technical: offer architecture review, help with scaling, production-readiness checklist",
      "If organisational: find the internal champion, help them build the business case",
      "If security: proactively schedule a call with their security team",
      "If budget: help quantify ROI from the POC results",
      "Create urgency: share customer stories, product roadmap updates, competitive intelligence",
    ],
  },
  {
    id: 24, section: 0, category: "customer-success", difficulty: "junior",
    prompt: "A customer's engineering team is frustrated because the AI's output quality is inconsistent. How do you help them?",
    guidancePoints: [
      "Ask for specific examples of inconsistency",
      "Review their prompts: are they using system messages, structured outputs, few-shot examples?",
      "Check temperature settings: lower temperature for more consistent output",
      "Suggest building an evaluation pipeline to measure consistency objectively",
      "Help them implement Structured Outputs for format consistency",
      "If prompting isn't enough, discuss fine-tuning for behaviour consistency",
    ],
  },
  {
    id: 25, section: 0, category: "customer-success", difficulty: "senior",
    prompt: "A key customer is up for renewal but their champion just left the company. Their usage has dropped 40% in the last quarter. What's your plan to save the account?",
    guidancePoints: [
      "Identify the new stakeholder: who inherited the project?",
      "Schedule an executive-level meeting to re-establish the relationship",
      "Analyse usage data: which features/endpoints are they still using?",
      "Prepare a value summary: what has the AI delivered since implementation?",
      "Offer a workshop to onboard the new team and re-engage",
      "Identify new use cases to expand value beyond the original implementation",
      "Bring in leadership if the account is at risk",
    ],
  },
  {
    id: 26, section: 0, category: "customer-success", difficulty: "mid",
    prompt: "A customer is live in production but has poor end-user adoption. Internal users prefer the old manual workflow. How do you drive adoption?",
    guidancePoints: [
      "Understand why: is it UX friction, trust issues, or lack of training?",
      "If UX: work with their team to reduce friction (fewer clicks, better defaults)",
      "If trust: implement transparency features (show sources, confidence indicators)",
      "Gather user feedback directly (surveys, interviews with end users)",
      "Identify power users and turn them into internal champions",
      "Measure and share wins: time saved, errors reduced, output quality improvements",
    ],
  },
  {
    id: 27, section: 0, category: "customer-success", difficulty: "senior",
    prompt: "You're conducting a quarterly business review (QBR) with a large enterprise customer. What do you prepare, present, and propose?",
    guidancePoints: [
      "Prepare: usage trends, cost analysis, quality metrics, support tickets",
      "Present: value delivered (ROI), reliability stats, feature adoption rates",
      "Show what's new: relevant product updates, new models, features they could benefit from",
      "Discuss their roadmap: what are their next 6-month AI priorities?",
      "Propose: expansion opportunities, new use cases, architecture improvements",
      "Agree on action items with owners and deadlines",
    ],
  },
  {
    id: 28, section: 0, category: "customer-success", difficulty: "junior",
    prompt: "A customer reports that API latency has increased significantly over the past week. How do you triage and resolve this?",
    guidancePoints: [
      "Check the OpenAI status page for any ongoing incidents",
      "Ask the customer: has their request volume or prompt size changed?",
      "Check if they're hitting rate limits (429 errors)",
      "Review their model selection: did they switch to a more expensive/slower model?",
      "Check if context window usage has increased (longer prompts = slower generation)",
      "If it's an OpenAI issue, escalate through support channels with specific data",
    ],
  },

  // ── Additional Technical Depth ──
  {
    id: 29, section: 8, category: "technical-depth", difficulty: "mid",
    prompt: "A customer wants to build a document Q&A chatbot. Compare using the Assistants API with File Search vs. building a custom RAG pipeline. What factors drive the decision?",
    guidancePoints: [
      "Assistants + File Search: faster to build, managed chunking/embedding/retrieval, up to 10K files",
      "Custom RAG: full control over chunking strategy, vector DB choice, retrieval logic",
      "Decision factors: team expertise, timeline, document count, accuracy requirements",
      "If under 10K docs and no specific retrieval needs: Assistants is the fastest path",
      "If they need hybrid search, custom re-ranking, or specific vector DBs: custom RAG",
      "Can start with Assistants and migrate to custom later if needed",
    ],
  },
  {
    id: 30, section: 7, category: "technical-depth", difficulty: "senior",
    prompt: "Design a model routing system for a customer with diverse AI use cases: customer support chat, document classification, content generation, and code review. Which model for each and why?",
    guidancePoints: [
      "Customer support: GPT-4o for quality, with function calling for backend integration",
      "Document classification: GPT-4o-mini for cost efficiency at high volume",
      "Content generation: GPT-4o for creative quality",
      "Code review: o1 or o3 for deep reasoning about code logic and bugs",
      "Build a query classifier that routes based on use case type",
      "Monitor quality per use case and adjust model assignments based on data",
    ],
  },
  {
    id: 31, section: 6, category: "technical-depth", difficulty: "mid",
    prompt: "A customer's prompt for extracting structured data from invoices works 90% of the time but fails on edge cases. How do you get it to 98%+ accuracy?",
    guidancePoints: [
      "Collect the failing edge cases and analyse common patterns",
      "Add few-shot examples that specifically cover the failure modes",
      "Use Structured Outputs (json_schema) to guarantee the output format",
      "Implement a two-pass approach: extraction pass + validation pass",
      "Consider fine-tuning if prompt engineering plateaus",
      "Build an evaluation pipeline to measure accuracy on a golden dataset of 100+ invoices",
    ],
  },
  {
    id: 32, section: 3, category: "technical-depth", difficulty: "mid",
    prompt: "Explain how you would design an AI agent that can book meetings by checking calendar availability, sending invites, and handling rescheduling requests.",
    guidancePoints: [
      "Define tools: check_calendar_availability, create_event, send_invite, reschedule_event, cancel_event",
      "System prompt: define the agent's role, permissions, and conversational style",
      "Implement confirmation before booking: 'I found these available slots, which works for you?'",
      "Handle multi-step flows: check availability → suggest slots → user confirms → create event → send invite",
      "Add guardrails: maximum bookings per day, business hours only, no double-booking",
      "Implement error handling: what if the calendar API is down?",
    ],
  },

  // ── Additional Discovery ──
  {
    id: 33, section: 0, category: "discovery", difficulty: "mid",
    prompt: "A customer says their team has been 'experimenting with AI for 6 months but nothing has made it to production.' What questions do you ask and what do you suspect?",
    guidancePoints: [
      "Ask what they've tried and what specific blockers they hit",
      "Suspect: no clear success criteria, scope too broad, no champion, security blockers",
      "Ask: who owns the project? Is there executive sponsorship?",
      "Ask: do they have an evaluation framework? How do they know if it's working?",
      "Suggest narrowing to one well-defined use case with measurable success criteria",
      "Offer to help structure their POC with a clear path to production",
    ],
  },

  // ── Additional Objection Handling ──
  {
    id: 34, section: 0, category: "objection-handling", difficulty: "mid",
    prompt: "A customer says: 'We tried the API and the quality wasn't good enough.' How do you respond without being defensive?",
    guidancePoints: [
      "Ask for specifics: which model, what prompts, what task, what quality issues?",
      "Review their prompts: most quality issues stem from poor prompt engineering",
      "Suggest structured improvements: system message, few-shot examples, Structured Outputs",
      "Offer to do a joint prompt engineering session",
      "If they tested an old model, show the latest (quality improves with each release)",
      "Suggest building an eval pipeline so quality can be measured objectively",
    ],
  },

  // ── Additional Customer Success ──
  {
    id: 35, section: 0, category: "customer-success", difficulty: "mid",
    prompt: "A customer wants to expand their AI deployment from one team to five teams. How do you help them scale without things breaking?",
    guidancePoints: [
      "Build a shared platform layer: common API wrapper, auth, logging, cost tracking",
      "Create prompt templates and best practices documentation for new teams",
      "Implement per-team cost tracking and budgeting",
      "Set up a shared evaluation framework",
      "Identify a platform team that owns the shared infrastructure",
      "Run enablement workshops for each new team",
      "Phase the rollout: one team at a time, not all at once",
    ],
  },

  // ── Additional Demo Design ──
  {
    id: 36, section: 0, category: "demo-design", difficulty: "senior",
    prompt: "A customer's CEO will attend a 15-minute executive briefing. They care about business impact, not technical details. Design the session.",
    guidancePoints: [
      "Open with their business problem and how AI addresses it (2 min)",
      "Show ONE impressive live demo using their actual data/use case (5 min)",
      "Present ROI: cost savings, time savings, quality improvements with real numbers (3 min)",
      "Show a customer story from a similar company (2 min)",
      "Close with a simple next step: 'Let's run a 2-week POC' (3 min)",
      "Avoid: jargon, multiple demos, technical architecture, pricing details",
    ],
  },

  // ── Additional Technical Depth ──
  {
    id: 37, section: 1, category: "technical-depth", difficulty: "senior",
    prompt: "A customer wants to build a real-time voice AI agent for their call centre. Describe the architecture, API choices, and key considerations.",
    guidancePoints: [
      "Use the Realtime API with WebSocket for low-latency bidirectional audio",
      "Implement function calling for CRM lookups, order status, ticket creation mid-conversation",
      "Voice Activity Detection (VAD) for natural turn-taking",
      "Design fallback: graceful handoff to human agent when the AI can't resolve",
      "Consider latency budget: aim for sub-500ms response time",
      "Address compliance: call recording consent, PII handling in voice data",
    ],
  },
  {
    id: 38, section: 10, category: "technical-depth", difficulty: "mid",
    prompt: "Design a 'prompt regression test' that runs in CI/CD. What does the pipeline look like, what metrics do you track, and what triggers a build failure?",
    guidancePoints: [
      "Golden dataset of 50-100 queries with expected outputs, versioned in git",
      "CI step runs all queries against the new prompt",
      "LLM-as-Judge scores each output on accuracy, format compliance, and completeness",
      "Track aggregate scores: mean, P10 (worst decile), failure rate",
      "Build fails if: mean score drops >5%, any P10 score drops below threshold, failure rate >10%",
      "Results logged as CI artifacts for review",
    ],
  },

  // ── Additional Objection Handling ──
  {
    id: 39, section: 0, category: "objection-handling", difficulty: "junior",
    prompt: "A customer says: 'AI will hallucinate and we can't afford inaccurate outputs.' How do you address this concern?",
    guidancePoints: [
      "Acknowledge the concern — hallucination is a real challenge",
      "Explain mitigation strategies: RAG for grounding, system prompt with escape hatches, Structured Outputs",
      "Show how temperature 0 reduces randomness for factual tasks",
      "Discuss evaluation: how to measure and monitor hallucination rates",
      "Suggest a human-in-the-loop approach: AI drafts, human reviews",
      "Share that the latest models have significantly lower hallucination rates than earlier versions",
    ],
  },
  {
    id: 40, section: 0, category: "customer-success", difficulty: "senior",
    prompt: "A customer is considering building their own AI team and bringing everything in-house. They ask if they still need OpenAI. How do you respond?",
    guidancePoints: [
      "Acknowledge their maturity — building internal capability is a sign of success",
      "Position OpenAI as a force multiplier for their team, not a replacement",
      "Highlight what's hard to replicate: frontier model quality, rapid improvement cycle, managed infrastructure",
      "Discuss their team's time: do they want to manage GPUs and model training, or build products?",
      "Propose a hybrid approach: use OpenAI for inference, build in-house for domain-specific work",
      "Show TCO comparison: hosting and maintaining models vs. API costs",
    ],
  },
];
