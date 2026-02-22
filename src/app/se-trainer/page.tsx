"use client";

import { useState, useRef } from "react";

// === Data: 10 Technical Sections ===
const sections = [
  {
    id: 1,
    title: "OpenAI API Architecture",
    icon: "\u26A1",
    content: `The OpenAI API is a RESTful HTTP interface allowing developers to programmatically interact with OpenAI's models. Understanding every endpoint is foundational to the SE role.

**Core Endpoints:**

**Chat Completions (/v1/chat/completions)** \u2014 The primary endpoint. Accepts an array of messages (system, user, assistant roles) and returns a model-generated response. The system message sets behaviour, user messages are input, assistant messages represent prior outputs for multi-turn conversations. Every enterprise integration starts here.

**Assistants API (/v1/assistants)** \u2014 A higher-level abstraction managing conversation state (threads), file handling, and tool execution server-side. OpenAI handles memory and tool routing so the customer doesn't have to build it.

**Embeddings (/v1/embeddings)** \u2014 Converts text into numerical vectors capturing semantic meaning. Returns fixed-length arrays (1536 dims for text-embedding-3-small, 3072 for text-embedding-3-large). Foundation of semantic search and RAG.

**Moderation (/v1/moderations)** \u2014 Content safety classifier returning boolean flags and confidence scores per category (violence, sexual, self-harm, hate). Used as a guardrail layer.

**Fine-tuning (/v1/fine_tuning/jobs)** \u2014 Create customised model versions trained on customer data. Submit JSONL examples, get a custom model checkpoint.

**Batch API (/v1/batches)** \u2014 Submit large volumes asynchronously. 50% cheaper than real-time. Ideal for bulk classification, extraction, overnight processing.

**Streaming (SSE):** With stream: true, the API uses Server-Sent Events to push partial responses token-by-token. First token appears in ~200-500ms. Each SSE event contains a delta object; your app concatenates deltas. Final event is [DONE].

**Error Handling:** 400 = bad request, 401 = invalid key, 429 = rate limit (implement exponential backoff with jitter), 500 = server error, 503 = overloaded. Rate limits apply at RPM and TPM levels.`,
  },
  {
    id: 2,
    title: "Token Economics & Context Windows",
    icon: "\uD83E\uDE99",
    content: `Tokens are the fundamental unit of LLM text processing \u2014 sub-word units determined by the tokenizer (tiktoken, cl100k_base encoding). ~4 characters or ~0.75 words per token in English.

**Pricing (approximate, always verify):**
- GPT-4o: $2.50 input / $10.00 output per 1M tokens (128K window)
- GPT-4o-mini: $0.15 input / $0.60 output per 1M tokens (128K window)
- o1: $15.00 input / $60.00 output per 1M tokens (200K window)
- o3-mini: $1.10 input / $4.40 output per 1M tokens (200K window)

**Context Window** = total tokens the model processes per request (input + output). 128K \u2248 300 pages. Sounds huge but fills fast: system prompt (500) + retrieved docs (20K) + history (5K) + output room.

**Lost in the Middle Effect:** Models attend less to information in the middle of long contexts. Place critical info at the beginning or end.

**Cost Estimation Framework:**
10,000 queries/day \u00D7 2,300 input tokens \u00D7 500 output tokens:
- GPT-4o: ~$107/day ($3,225/month)
- GPT-4o-mini: ~$6.45/day ($194/month)
The 16x cost difference is your key lever. Many use cases work perfectly on mini.

**SE Skill:** Build a cost calculator spreadsheet that takes volume, context size, and model choice \u2192 outputs monthly cost. Incredibly impressive during scoping calls.`,
  },
  {
    id: 3,
    title: "Function Calling & Tool Use",
    icon: "\uD83D\uDD27",
    content: `Function calling lets GPT models interact with external systems. Instead of just generating text, the model decides to call a function, generates correct JSON arguments, and uses the result to respond.

**How It Works:**
1. Define functions in your API request with name, description, and JSON Schema parameters. The description is crucial \u2014 the model uses it to decide when to invoke.
2. User asks something like "What are my recent orders?" \u2192 model returns finish_reason: 'tool_calls' with structured arguments.
3. Your app executes the actual function (queries database, calls API).
4. Send the result back as a 'tool' role message.
5. Model uses the result to generate a natural language response.

**Parallel Function Calling:** GPT-4o+ can call multiple functions simultaneously. "Weather in London AND my calendar today?" \u2192 two tool_calls in one response. Dramatically reduces latency.

**Agentic Workflows:** Function calling is the foundation of AI agents. Loop: model receives input \u2192 decides which tool \u2192 executes \u2192 feeds result back \u2192 repeats until task complete.

**Example Enterprise Agent:** Customer support that can (1) look up account details, (2) check order status, (3) initiate refund, (4) escalate to human, (5) log interaction. Model chains multiple calls based on conversation.

**SE Demo Tip:** Build demos that call live APIs (weather, mock CRM). The model deciding when and how to call functions is far more impressive than static text generation.`,
  },
  {
    id: 4,
    title: "Retrieval-Augmented Generation (RAG)",
    icon: "\uD83D\uDCDA",
    content: `RAG addresses the fundamental LLM limitation: they only know training data. It retrieves relevant information at query time and injects it into the prompt. Like giving someone an open-book exam.

**The Pipeline:**

**Stage 1 \u2014 Document Ingestion & Chunking:** Break documents into smaller pieces. Fixed-size (512 tokens, 50-token overlap), semantic (paragraph boundaries), or recursive (paragraph \u2192 sentence \u2192 word fallback). 512 tokens with 50-100 overlap is the starting point.

**Stage 2 \u2014 Embedding:** Convert each chunk to a vector using text-embedding-3-small (1536 dims) or text-embedding-3-large (3072 dims). "CEO resigned" and "company leader stepped down" produce similar vectors despite different words.

**Stage 3 \u2014 Vector Storage:** Store in Pinecone (managed), Weaviate (open-source), Qdrant (performant), Chroma (prototyping), or pgvector (Postgres). HNSW indexing enables fast approximate nearest-neighbour search.

**Stage 4 \u2014 Retrieval:** Embed the query \u2192 find top-k similar chunks via cosine similarity (angle between vectors, range -1 to 1).

**Stage 5 \u2014 Re-ranking (Recommended):** Cross-encoder (Cohere Rerank) re-scores top-k results considering query-document pair together. Dramatically improves relevance.

**Stage 6 \u2014 Generation:** Insert top chunks into prompt with instruction: "Answer only from context. If not found, say so. Cite sources."

**Common Failures:** Retrieval misses (tune chunk size), context poisoning (add re-ranking), hallucination despite context (stronger prompts), stale data (incremental re-indexing).`,
  },
  {
    id: 5,
    title: "Fine-Tuning vs. Prompting vs. RAG",
    icon: "\u2696\uFE0F",
    content: `Every enterprise customer asks: "Should we fine-tune, prompt engineer, or build RAG?" The answer depends on the goal, and often it's a combination.

**Prompt Engineering:**
- Always the starting point. 80% of use cases solved here.
- Zero setup, instant iteration, works with latest models.
- Weakness: uses context window budget, can be inconsistent for very specific formats.

**RAG:**
- When the model needs proprietary/frequently updated data.
- Data stays current, source attribution possible, scales to millions of docs.
- Weakness: requires infrastructure, retrieval quality = answer quality, adds latency.

**Fine-Tuning:**
- When you need consistent format, specific tone/style, or specialised task performance.
- Consistent behaviour without lengthy prompts, lower per-query costs.
- Weakness: needs quality training data (50+ examples), frozen in time, must retrain on model updates.

**Fine-Tuning Workflow:** Prepare JSONL \u2192 Upload via Files API \u2192 Create job (base model, hyperparameters) \u2192 Monitor (10-60 min) \u2192 Evaluate against held-out test set.

**Decision Matrix:**
- Need new knowledge? \u2192 RAG
- Need consistent format? \u2192 Fine-tuning
- Need specific tone? \u2192 Fine-tuning
- Data changes frequently? \u2192 RAG
- Just getting started? \u2192 Prompt engineering

**SE Guidance:** Most customers jump to "we want to fine-tune." Guide them: start with prompts, add RAG for knowledge, fine-tune only for behavioural requirements that can't be solved otherwise.`,
  },
  {
    id: 6,
    title: "Prompt Engineering at Depth",
    icon: "\u270F\uFE0F",
    content: `Prompt engineering is the skill you use in every customer interaction. During discovery calls, demos, and PoCs \u2014 you're always designing prompts.

**System Message Design:** Structure with Role (who the model is), Task (what to do), Constraints (what not to do), Output Format (structure), Examples (if needed).

**Chain-of-Thought (CoT):** "Think through this step by step." Dramatically improves accuracy on math, logic, multi-step reasoning. The model reasons better when it "thinks out loud."

**Few-Shot vs. Zero-Shot:** Zero-shot = instructions only. Few-shot = 2-5 ideal input/output examples. Few-shot more reliable for specific formats but costs more tokens.

**Structured Outputs:**
- JSON mode: response_format: { type: 'json_object' } \u2192 guarantees valid JSON.
- Structured Outputs: response_format: { type: 'json_schema', json_schema: {...} } \u2192 guarantees exact schema.
- Function calling also returns structured JSON. Many devs use "dummy" functions purely for structured output.

**Reducing Hallucinations:** Explicit "say I don't know" instructions, grounding via RAG, citation requirements, low temperature (0.0-0.3), output validation.

**Temperature & Top-P:** Temperature 0.0 = deterministic. Higher = more creative. Top-P 0.1 = only top 10% probability mass. Use 0-0.3 for factual, 0.7-1.0 for creative. Don't change both.

**SE Demo Tip:** Show the same prompt at temperature 0 and 1. The visual difference in consistency immediately communicates why this parameter matters for production.`,
  },
  {
    id: 7,
    title: "Model Selection & Reasoning Models",
    icon: "\uD83E\uDDE0",
    content: `Understanding model tiers and recommending the right one is one of the most valuable SE skills \u2014 it directly impacts customer costs and performance.

**GPT-4o (Omni):** Flagship multimodal model. Text, images, audio input. Strong across coding, analysis, creative writing, reasoning. Default recommendation for quality-critical use cases.

**GPT-4o-mini:** Smaller, faster, dramatically cheaper. Remarkably capable for straightforward tasks. Best for: classification, extraction, simple Q&A, moderation, summarisation, high-volume use cases.

**o1 & o3 Reasoning Models:** Fundamentally different. Use internal "chain-of-thought" processing \u2014 spending extra compute thinking before responding. Generate invisible "thinking" tokens (billed but not shown). May spend 10,000 thinking tokens on a complex math problem before a 200-token answer.

- o1: Full reasoning. Excels at complex math, science, code debugging, multi-step logic.
- o3-mini: Cheaper reasoning model. Good middle ground.

**Selection Framework:**
- Customer support chatbot \u2192 GPT-4o-mini
- Legal contract analysis \u2192 GPT-4o or o1
- Bulk email classification \u2192 GPT-4o-mini + Batch API
- Financial model auditing \u2192 o1
- Image data extraction \u2192 GPT-4o
- Internal knowledge assistant \u2192 GPT-4o-mini with RAG

**Benchmarking:** Never recommend based on general benchmarks. Take 20-50 real customer examples, run through 2-3 models, compare quality/latency/cost. Empirical approach builds trust.

**SE Demo Tip:** Build a side-by-side comparison tool showing the same prompt across models with results, cost, and latency. Let customers see the difference with their own eyes.`,
  },
  {
    id: 8,
    title: "Assistants API & Stateful Conversations",
    icon: "\uD83D\uDCAC",
    content: `The Assistants API is OpenAI's higher-level abstraction for building AI apps. Chat Completions is stateless (send full history each time). Assistants manages state server-side.

**Core Concepts:**
- **Assistants:** Configured entity with model, instructions, and tools. Created once, persists across conversations.
- **Threads:** A conversation. Stores full message history server-side. Auto-truncates when exceeding context window. Files can be attached.
- **Runs:** Single invocation of an Assistant on a Thread. Can be streamed, may involve multiple steps.

**Built-in Tools:**
- **Code Interpreter:** Writes and executes Python in a sandbox. Upload CSV \u2192 ask questions \u2192 model writes pandas code \u2192 returns results + charts. Pre-installed: numpy, pandas, matplotlib.
- **File Search:** Built-in RAG. Upload files to a Vector Store, attach to Assistant. Handles chunking, embedding, storage, retrieval automatically. Eliminates need for custom RAG pipeline.

**Assistants API vs. Custom Build:**
- State: Automatic (Threads) vs. you manage history
- Tools: Built-in vs. you build the loop
- Files: Built-in File Search vs. you build RAG
- Flexibility: Limited to OpenAI's abstractions vs. full control
- Vendor lock-in: High vs. Low
- Cost visibility: Less transparent vs. full transparency

**SE Demo Tip:** Upload customer's public docs to File Search + Code Interpreter = working knowledge assistant with data analysis in under an hour. Fastest path to a compelling demo.`,
  },
  {
    id: 9,
    title: "Security & Deployment Architecture",
    icon: "\uD83D\uDD12",
    content: `Enterprise sales live and die by security review. The most common deal blocker is the security team's concerns about data handling.

**OpenAI Direct API vs. Azure OpenAI Service:**

**OpenAI Direct:**
- Data processed by OpenAI infrastructure (US-based)
- API data NOT used for training
- 30-day retention for abuse monitoring (zero-retention option available)
- SOC 2 Type II certified
- Always has latest models first

**Azure OpenAI:**
- Data processed within customer's Azure tenant/region
- Data residency guarantees (EU, UK, Asia-Pacific, etc.)
- No data sent to OpenAI \u2014 Microsoft operates models
- VNet integration, Private Endpoints, Managed Identity, Azure AD
- HIPAA, SOC 2, ISO 27001, FedRAMP certified
- Content filtering on by default, configurable

**Common Security Questions:**
- "Will our data train models?" \u2014 No. API data is not used for training (distinct from ChatGPT consumer product).
- "Where is data stored?" \u2014 OpenAI: US (zero-retention available). Azure: customer's chosen region.
- "How to handle PII?" \u2014 Defence in depth: redact before API (Presidio), moderation endpoint, scan outputs, DLP policies.
- "GDPR?" \u2014 DPA available. Right to erasure, data minimisation, transparency about AI processing.

**Regulated industries + data residency = Azure OpenAI, always.**

**SE Tip:** Prepare a one-page security architecture diagram showing data flow, encryption (TLS 1.2+), retention, access controls. Saves weeks in the sales cycle.`,
  },
  {
    id: 10,
    title: "Evaluation & Observability",
    icon: "\uD83D\uDCCA",
    content: `LLM apps are probabilistic, not deterministic. Traditional testing (assert output == expected) doesn't work. You need evaluation frameworks measuring quality at scale.

**Types of Evaluation:**

**Human Evaluation:** Gold standard but expensive. Domain experts rate accuracy, helpfulness, tone, completeness. 3 raters per example, measure inter-rater agreement.

**Model-Graded (LLM-as-Judge):** Use GPT-4o to evaluate GPT-4o-mini outputs. Provide input, expected output, actual output, and a specific rubric. Scales to thousands. Key: write specific rubrics ("rate accuracy 1-5 where 1 = factually incorrect, 5 = completely accurate with citations").

**Automated Metrics:** BLEU/ROUGE (summarisation overlap), exact match/F1 (extraction), precision/recall (classification).

**Key Dimensions:**
- Accuracy: factually correct? (LLM-judge with ground truth)
- Relevance: addresses the question? (LLM-judge with rubric)
- Hallucination: invented facts? (compare against source docs)
- Format compliance: correct structure? (schema validation)
- Latency: time to first token / total time
- Cost: token usage per query
- Groundedness: supported by context? (LLM-judge checking citations)

**Observability Tools:** LangSmith (traces chains, stores pairs, supports eval datasets), Weights & Biases (experiment tracking, prompt comparison), OpenAI Dashboard (basic usage analytics), Custom logging (Datadog, Splunk, BigQuery).

**Eval Pipeline:** Golden dataset (50-200 examples) \u2192 automated eval script \u2192 CI/CD integration \u2192 quality dashboard with regression alerts. Run on: prompt changes, model updates, RAG re-indexing, weekly minimum.`,
  },
];

// === Data: 50 Multiple Choice Questions ===
const questions = [
  // Section 1: API Architecture (Q1-5)
  { id: 1, section: 1, q: "A customer's RAG system returns accurate chunks but the LLM still hallucinates. What's the MOST effective fix?", options: ["Increase the context window size", "Add 'only answer from provided context' to the system prompt and lower temperature to 0", "Switch to a larger embedding model", "Increase retrieved chunks from 5 to 20"], correct: 1, explanation: "The retrieval is already accurate \u2014 the problem is on the generation side. Instructing the model to only use provided context and lowering temperature to 0 makes it more deterministic and grounded. More chunks would add noise and worsen the 'lost in the middle' effect." },
  { id: 2, section: 1, q: "What HTTP status code indicates the OpenAI API rate limit has been exceeded?", options: ["400", "401", "429", "503"], correct: 2, explanation: "429 means 'Too Many Requests' \u2014 the rate limit (RPM or TPM) has been exceeded. Implement exponential backoff with jitter. 400 = bad request, 401 = auth failure, 503 = server overloaded." },
  { id: 3, section: 1, q: "What does SSE streaming change about the API response?", options: ["It reduces total generation time by 50%", "It sends the complete response faster", "It pushes partial responses token-by-token so users see text immediately", "It compresses the response payload"], correct: 2, explanation: "SSE streaming doesn't change total generation time \u2014 it changes perceived latency. Users see the first token in ~200-500ms instead of waiting for the full response. Each chunk contains a delta object to be concatenated." },
  { id: 4, section: 1, q: "Which endpoint would you use to check if user-generated content contains harmful material before processing?", options: ["/v1/chat/completions with a safety prompt", "/v1/moderations", "/v1/embeddings with a safety filter", "/v1/fine_tuning/jobs"], correct: 1, explanation: "The Moderation endpoint (/v1/moderations) is purpose-built for content safety. It classifies text against categories like violence, sexual content, self-harm, and hate, returning boolean flags and confidence scores." },
  { id: 5, section: 1, q: "A customer wants to process 500,000 support tickets overnight for classification. Which approach minimises cost?", options: ["GPT-4o with streaming", "GPT-4o-mini via the Batch API", "o1 reasoning model", "Fine-tuned GPT-4o with real-time calls"], correct: 1, explanation: "GPT-4o-mini is the cheapest model, and the Batch API gives a further 50% discount over real-time pricing. For overnight processing where latency doesn't matter, this is the clear winner." },

  // Section 2: Token Economics (Q6-10)
  { id: 6, section: 2, q: "Approximately how many tokens is the word 'hamburger'?", options: ["1 token", "2 tokens", "4 tokens", "8 tokens"], correct: 1, explanation: "The word 'hamburger' splits into ['ham', 'burger'] \u2014 2 tokens. Tokens are sub-word units, not whole words. On average, 1 token \u2248 4 characters or 0.75 words in English." },
  { id: 7, section: 2, q: "A customer's RAG app sends 2,300 input tokens and receives 500 output tokens per query using GPT-4o-mini. At 10,000 queries/day, what's the approximate daily cost?", options: ["$0.65", "$6.50", "$65.00", "$650.00"], correct: 1, explanation: "Input: 23M tokens \u00D7 $0.15/1M = $3.45. Output: 5M tokens \u00D7 $0.60/1M = $3.00. Total \u2248 $6.45/day. GPT-4o-mini's pricing makes high-volume applications very affordable." },
  { id: 8, section: 2, q: "What is the 'lost in the middle' effect?", options: ["Models lose tokens during streaming", "Models attend less to information in the middle of long contexts", "Context windows lose data when exceeded", "Tokens in the middle of words are less accurate"], correct: 1, explanation: "Research shows models pay the most attention to information at the beginning and end of the context window, attending less to middle content. This is why placing critical info at the start or end improves quality." },
  { id: 9, section: 2, q: "What's the approximate context window of GPT-4o?", options: ["8K tokens", "32K tokens", "128K tokens", "1M tokens"], correct: 2, explanation: "GPT-4o has a 128K token context window, roughly equivalent to 300 pages. The o1 reasoning model extends to 200K tokens." },
  { id: 10, section: 2, q: "Why is output pricing typically higher than input pricing?", options: ["Output tokens are larger", "Generating new tokens requires more compute than processing input tokens", "Output tokens are higher quality", "It's a marketing decision"], correct: 1, explanation: "Generating each output token requires running the full model forward pass and sampling, which is more compute-intensive than processing pre-existing input tokens in parallel." },

  // Section 3: Function Calling (Q11-15)
  { id: 11, section: 3, q: "The model returns finish_reason: 'tool_calls'. What does your application do next?", options: ["Display the tool_calls JSON to the user", "Execute the function locally and send the result back as a 'tool' role message", "Retry with higher temperature", "Parse it as the final answer"], correct: 1, explanation: "When finish_reason is 'tool_calls', the model wants to call a function. Your app executes it, then sends the result back as a 'tool' role message so the model can use it for its final response." },
  { id: 12, section: 3, q: "What's the most important part of a function definition for the model?", options: ["The parameter types", "The function name", "The description field", "The required parameters list"], correct: 2, explanation: "The description is crucial because the model uses it to decide WHEN to invoke the function. A vague description means the model won't know when the function is appropriate." },
  { id: 13, section: 3, q: "What is parallel function calling?", options: ["Running the same function on multiple inputs simultaneously", "The model calling multiple different functions in a single response", "Two users calling the same function at once", "Splitting a function across multiple servers"], correct: 1, explanation: "GPT-4o+ can return multiple tool_calls in a single response. If a user asks about weather AND calendar, both calls come back together, reducing round-trip latency." },
  { id: 14, section: 3, q: "An 'agentic workflow' in the context of function calling means:", options: ["A pre-scripted sequence of API calls", "A loop where the model decides which tools to use and chains calls until the task is complete", "A workflow managed by a human agent", "A single function call with multiple parameters"], correct: 1, explanation: "An agent loops: receive input \u2192 decide tool \u2192 execute \u2192 feed result back \u2192 repeat until complete. The model acts as the 'brain' planning and orchestrating, functions are the 'hands'." },
  { id: 15, section: 3, q: "Why might a developer define a 'dummy' function that never actually gets called externally?", options: ["To test error handling", "To get structured JSON output from the model via function calling", "To increase the model's context window", "To bypass rate limits"], correct: 1, explanation: "Function calling inherently returns structured JSON matching your schema. Many developers define functions purely to get predictable structured output, even when they don't need to call external systems." },

  // Section 4: RAG (Q16-20)
  { id: 16, section: 4, q: "What is the primary purpose of chunking in a RAG pipeline?", options: ["To reduce storage costs", "To break documents into smaller pieces for more precise retrieval", "To speed up embedding generation", "To comply with data regulations"], correct: 1, explanation: "Chunking breaks documents into smaller pieces so you can retrieve the most relevant section, not the entire document. It also keeps chunks within embedding model token limits." },
  { id: 17, section: 4, q: "What does cosine similarity measure in vector search?", options: ["The length difference between two vectors", "The angle between two vectors, normalised for magnitude", "The number of matching dimensions", "The Euclidean distance between vectors"], correct: 1, explanation: "Cosine similarity measures the angle between vectors (range -1 to 1). Score of 1.0 = identical direction. It's insensitive to vector length, making it ideal for semantic similarity." },
  { id: 18, section: 4, q: "Why is re-ranking recommended after initial vector retrieval?", options: ["Vector databases are unreliable", "Cross-encoder re-rankers score query-document pairs more accurately than independent embedding comparison", "It reduces the number of API calls", "It's required by OpenAI's terms of service"], correct: 1, explanation: "Vector similarity compares embeddings independently. A re-ranker (cross-encoder) considers the query-document pair together, using more compute for significantly better relevance scoring." },
  { id: 19, section: 4, q: "A customer's RAG system answers most questions well but fails on recent events. What's the likely issue?", options: ["The embedding model is too small", "The model's temperature is too high", "Document embeddings are stale and haven't been re-indexed", "The context window is too small"], correct: 2, explanation: "If documents change but embeddings aren't updated, the RAG system returns outdated information. Implement an incremental re-indexing pipeline that tracks document changes." },
  { id: 20, section: 4, q: "What chunk size and overlap would you recommend as a starting point?", options: ["128 tokens, no overlap", "512 tokens with 50-100 token overlap", "2048 tokens with 500 token overlap", "Entire documents, no chunking"], correct: 1, explanation: "512 tokens with 50-100 token overlap is the standard starting point. It balances precision (not too large) with context (not too small). Overlap prevents splitting important context across chunk boundaries." },

  // Section 5: Fine-tuning vs Prompting vs RAG (Q21-25)
  { id: 21, section: 5, q: "A customer says 'We want the model to know about our internal docs.' What do you recommend?", options: ["Fine-tuning on the documents", "RAG pipeline", "Longer system prompts", "A bigger model"], correct: 1, explanation: "RAG is the correct solution for giving models access to proprietary knowledge. Fine-tuning teaches behaviour patterns, not knowledge. RAG retrieves relevant docs at query time." },
  { id: 22, section: 5, q: "When is fine-tuning the RIGHT choice over prompt engineering?", options: ["Always \u2014 it's more powerful", "When you need access to proprietary data", "When you need consistent output format/tone that prompt engineering can't achieve reliably", "When you want to reduce hallucinations"], correct: 2, explanation: "Fine-tuning excels at consistent behaviour: specific output formats, domain-specific tone, or specialised tasks. It's not for adding knowledge (use RAG) and doesn't eliminate hallucinations." },
  { id: 23, section: 5, q: "What's the minimum recommended number of training examples for fine-tuning?", options: ["5-10", "50-100", "10,000+", "1 million+"], correct: 1, explanation: "OpenAI recommends at least 50-100 high-quality examples, though more is better. Quality matters far more than quantity \u2014 100 excellent examples beat 10,000 mediocre ones." },
  { id: 24, section: 5, q: "What format does OpenAI require for fine-tuning data?", options: ["CSV with columns", "JSONL with messages arrays", "Plain text files", "XML with tags"], correct: 1, explanation: "Fine-tuning data must be in JSONL format where each line is a JSON object with a 'messages' array containing system, user, and assistant roles \u2014 representing ideal conversation turns." },
  { id: 25, section: 5, q: "A customer has frequently changing product data and needs consistent JSON output. What combination do you recommend?", options: ["Fine-tuning only", "RAG only", "RAG for knowledge + structured outputs for format consistency", "Prompt engineering only"], correct: 2, explanation: "RAG handles the changing data (re-index when products update), and structured outputs (JSON schema) guarantee the output format. This combo addresses both requirements elegantly." },

  // Section 6: Prompt Engineering (Q26-30)
  { id: 26, section: 6, q: "What does a temperature of 0.0 do?", options: ["Makes the model refuse to answer", "Makes the model always pick the most likely next token (deterministic)", "Disables the model entirely", "Makes responses shorter"], correct: 1, explanation: "Temperature 0.0 makes the model deterministic \u2014 it always picks the highest probability token. Use 0-0.3 for factual tasks and 0.7-1.0 for creative tasks." },
  { id: 27, section: 6, q: "What is chain-of-thought (CoT) prompting?", options: ["Linking multiple API calls together", "Instructing the model to reason step-by-step before answering", "Training the model on reasoning examples", "Using multiple models in sequence"], correct: 1, explanation: "CoT prompting asks the model to 'think step by step' before giving its final answer. This dramatically improves accuracy on math, logic, and multi-step reasoning because the model reasons better when it thinks out loud." },
  { id: 28, section: 6, q: "What's the difference between JSON mode and Structured Outputs?", options: ["They're the same thing", "JSON mode guarantees valid JSON; Structured Outputs guarantees it matches your exact schema", "Structured Outputs is faster", "JSON mode is more accurate"], correct: 1, explanation: "JSON mode ({ type: 'json_object' }) guarantees valid JSON but not a specific structure. Structured Outputs ({ type: 'json_schema' }) guarantees the output matches your exact schema definition." },
  { id: 29, section: 6, q: "Which prompting approach is more reliable for enforcing specific output formats?", options: ["Zero-shot with detailed instructions", "Few-shot with 2-3 examples showing the exact format", "Higher temperature", "Longer system prompts"], correct: 1, explanation: "Few-shot examples showing the exact desired format are more reliable than instructions alone. The model learns the pattern from examples. Even better: combine few-shot with structured outputs." },
  { id: 30, section: 6, q: "A customer's model outputs are too verbose. What's the best prompt engineering fix?", options: ["Increase temperature", "Add explicit length constraints and brevity instructions to the system prompt", "Switch to a smaller model", "Remove the system prompt"], correct: 1, explanation: "Adding explicit instructions like 'Respond in 2-3 sentences maximum' or 'Be concise and direct' in the system prompt is the most effective way to control verbosity." },

  // Section 7: Model Selection (Q31-35)
  { id: 31, section: 7, q: "What makes o1/o3 reasoning models fundamentally different from GPT-4o?", options: ["They're faster", "They use internal chain-of-thought 'thinking' tokens before responding", "They're multimodal", "They have larger context windows"], correct: 1, explanation: "Reasoning models spend extra compute on internal 'thinking' tokens (billed but invisible). They may use 10,000 thinking tokens on a complex problem before a 200-token answer, making them more accurate but more expensive." },
  { id: 32, section: 7, q: "A customer wants to classify 1 million emails into 5 categories. Best model choice?", options: ["o1 for maximum accuracy", "GPT-4o for quality", "GPT-4o-mini for cost efficiency on a straightforward task", "text-embedding-3-large"], correct: 2, explanation: "Email classification into predefined categories is a straightforward task. GPT-4o-mini handles it well at a fraction of the cost. Save o1/GPT-4o for complex reasoning tasks." },
  { id: 33, section: 7, q: "How should you recommend a model to a customer?", options: ["Always recommend the most powerful model", "Recommend the cheapest model", "Benchmark 20-50 of their real examples across 2-3 models and compare", "Match what their competitor uses"], correct: 2, explanation: "Never recommend based on general benchmarks. Use the customer's actual data: run 20-50 representative examples through candidate models and compare quality, latency, and cost. Data-driven recommendations build trust." },
  { id: 34, section: 7, q: "GPT-4o accepts which input types?", options: ["Text only", "Text and images", "Text, images, and audio", "Text, images, audio, and video"], correct: 2, explanation: "GPT-4o (Omni) is multimodal: it accepts text, images, and audio as input. This makes it the right choice for tasks involving image interpretation, chart reading, or audio transcription." },
  { id: 35, section: 7, q: "When would you recommend o1 over GPT-4o?", options: ["For simple classification tasks", "For complex multi-step reasoning, math, or code debugging", "For high-volume chatbots", "For image analysis"], correct: 1, explanation: "o1 excels at tasks requiring deep reasoning: complex math, scientific analysis, multi-step logic, and intricate code debugging. It's overkill (and expensive) for simpler tasks." },

  // Section 8: Assistants API (Q36-40)
  { id: 36, section: 8, q: "What is a 'Thread' in the Assistants API?", options: ["A programming thread for parallel execution", "A conversation that stores message history server-side", "A connection to the API", "A type of fine-tuning job"], correct: 1, explanation: "A Thread represents a conversation with server-side state management. It stores the full message history so you don't need to re-send everything with each call. Auto-truncates when exceeding context limits." },
  { id: 37, section: 8, q: "What can Code Interpreter do in the Assistants API?", options: ["Only run pre-defined code snippets", "Write and execute Python code in a sandboxed environment, including data analysis and chart generation", "Compile and run any programming language", "Edit the customer's production code"], correct: 1, explanation: "Code Interpreter writes and runs Python in a sandbox with numpy, pandas, matplotlib pre-installed. Upload a CSV \u2192 ask questions \u2192 it writes pandas code \u2192 returns results and charts. Powerful for data analysis demos." },
  { id: 38, section: 8, q: "What advantage does File Search provide over building your own RAG?", options: ["It's always more accurate", "It handles chunking, embedding, storage, and retrieval automatically", "It's cheaper per query", "It supports more file types"], correct: 1, explanation: "File Search is OpenAI's built-in RAG solution. Upload files to a Vector Store and it handles everything automatically. Trades customisation for speed-to-market \u2014 great for PoCs." },
  { id: 39, section: 8, q: "What's the main disadvantage of the Assistants API vs. custom Chat Completions?", options: ["It's more expensive", "Higher vendor lock-in and less flexibility/control", "It doesn't support streaming", "It can't use GPT-4o"], correct: 1, explanation: "The Assistants API ties you to OpenAI's abstractions. You get less control over retrieval strategies, context management, and tool orchestration. Custom builds offer full flexibility and portability." },
  { id: 40, section: 8, q: "When would you recommend the Assistants API over a custom build?", options: ["Always \u2014 it's superior", "For PoCs and fast time-to-market where customisation isn't critical", "Only for small startups", "Never \u2014 custom is always better"], correct: 1, explanation: "Assistants API is ideal for rapid prototyping and PoCs. Get a working demo in under an hour. For production with specific requirements around retrieval quality, latency, or vendor independence, custom builds are better." },

  // Section 9: Security (Q41-45)
  { id: 41, section: 9, q: "A healthcare customer needs EU data residency and HIPAA compliance. What do you recommend?", options: ["OpenAI direct API with zero-retention", "Azure OpenAI Service in an EU region", "Self-hosted open-source model", "OpenAI API behind an EU API gateway"], correct: 1, explanation: "Azure OpenAI provides data residency guarantees (data stays in chosen region), HIPAA BAA, and enterprise compliance certifications. OpenAI direct processes data in the US \u2014 zero-retention doesn't solve residency." },
  { id: 42, section: 9, q: "Does OpenAI use API data to train models?", options: ["Yes, all data is used for training", "No \u2014 API data is not used for model training", "Only if the customer opts in", "Only for free tier users"], correct: 1, explanation: "OpenAI's API data usage policy explicitly states API data is NOT used for training. This is distinct from the ChatGPT consumer product, which uses conversations by default (with opt-out)." },
  { id: 43, section: 9, q: "What's the best approach for handling PII in API requests?", options: ["Trust OpenAI's built-in PII handling", "Defence in depth: redact before API, moderate outputs, scan for leaks, DLP policies", "Just use zero-retention mode", "Encrypt the PII within the prompt text"], correct: 1, explanation: "Defence in depth: Layer 1 \u2014 redact PII before API (Presidio/Comprehend). Layer 2 \u2014 moderation endpoint. Layer 3 \u2014 scan outputs for leaked PII. Layer 4 \u2014 network-level DLP. No single layer is sufficient." },
  { id: 44, section: 9, q: "What is the key advantage of Azure OpenAI's Private Endpoints?", options: ["Faster response times", "Traffic between the customer's VNet and Azure OpenAI never touches the public internet", "Access to newer models", "Lower pricing"], correct: 1, explanation: "Private Endpoints ensure all traffic stays within the customer's virtual network and Microsoft's backbone \u2014 never traversing the public internet. Critical for financial services and healthcare." },
  { id: 45, section: 9, q: "A customer asks 'Can you guarantee our data is completely deleted after processing?'", options: ["Yes \u2014 OpenAI deletes everything immediately", "Explain zero-retention option (no storage after processing) for direct API, or Azure OpenAI for full data control", "No \u2014 data is stored permanently", "Refer them to legal"], correct: 1, explanation: "Be accurate: OpenAI offers zero-retention for qualifying customers. Azure OpenAI gives the customer full control within their tenant. Never over-promise \u2014 frame it as options with trade-offs." },

  // Section 10: Evaluation (Q46-50)
  { id: 46, section: 10, q: "Why can't you use traditional unit tests (assert output == expected) for LLM applications?", options: ["LLMs are too slow for testing", "LLMs are probabilistic \u2014 the same prompt can produce different valid outputs", "Unit test frameworks don't support LLMs", "LLM outputs are too long to compare"], correct: 1, explanation: "LLMs are probabilistic, not deterministic. Multiple different outputs can all be correct. You need evaluation frameworks that measure quality dimensions (accuracy, relevance, groundedness) rather than exact string matching." },
  { id: 47, section: 10, q: "What is 'LLM-as-Judge' evaluation?", options: ["A legal review of LLM outputs", "Using a capable model (e.g., GPT-4o) to score outputs from another model using a rubric", "The LLM judging user input quality", "A benchmark leaderboard"], correct: 1, explanation: "LLM-as-Judge uses a more capable model to evaluate outputs against a specific rubric. It scales to thousands of evaluations automatically and can run in CI/CD pipelines." },
  { id: 48, section: 10, q: "What makes a good LLM evaluation rubric?", options: ["'Rate quality 1-5'", "Specific criteria like 'rate accuracy 1-5 where 1 = factually incorrect, 3 = partially correct, 5 = accurate with citations'", "Just pass/fail", "Natural language descriptions without scores"], correct: 1, explanation: "Specific rubrics with concrete definitions for each score dramatically improve evaluation consistency. Vague rubrics like 'rate quality' produce inconsistent and unreliable scores." },
  { id: 49, section: 10, q: "How often should production LLM evaluation pipelines run?", options: ["Once, during initial development", "Monthly", "Weekly minimum, plus on every prompt/model/data change", "Only when users complain"], correct: 2, explanation: "Run evals on: prompt changes, model updates, RAG data re-indexing, AND on a regular schedule (weekly minimum). This catches regressions before users do." },
  { id: 50, section: 10, q: "What's the recommended size for a golden evaluation dataset?", options: ["5-10 examples", "50-200 representative examples", "10,000+ examples", "As many as possible"], correct: 1, explanation: "50-200 examples is the practical sweet spot. Enough to catch most failure modes, small enough to curate carefully. Quality and representativeness matter more than volume." },
];

// === Styles ===
const colors = {
  bg: "#0D0F14",
  surface: "#151820",
  surfaceHover: "#1C2030",
  card: "#181C28",
  border: "#252A3A",
  borderHover: "#3A4060",
  accent: "#6C63FF",
  accentGlow: "rgba(108,99,255,0.15)",
  accentDim: "#4A44B0",
  green: "#2ECB71",
  greenGlow: "rgba(46,203,113,0.15)",
  red: "#E74C5A",
  redGlow: "rgba(231,76,90,0.15)",
  orange: "#F2994A",
  orangeGlow: "rgba(242,153,74,0.12)",
  text: "#E8E6F0",
  textDim: "#8A8AA0",
  textMuted: "#5A5A72",
};

// === Components ===
const Badge = ({ children, color = colors.accent, bg = colors.accentGlow }: { children: React.ReactNode; color?: string; bg?: string }) => (
  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, color, background: bg, letterSpacing: 0.5 }}>{children}</span>
);

const ProgressRing = ({ progress, size = 48, stroke = 4 }: { progress: number; size?: number; stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;
  const col = progress >= 80 ? colors.green : progress >= 50 ? colors.orange : colors.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.border} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={col}
        fontSize={12} fontWeight={700} style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

// === Main Page ===
export default function SETrainerPage() {
  const [tab, setTab] = useState("docs");
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [quizState, setQuizState] = useState("menu");
  const [quizSection, setQuizSection] = useState<number | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [communityQs, setCommunityQs] = useState<Array<{ id: number; text: string; author: string; time: string }>>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [expandingId, setExpandingId] = useState<number | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, string>>({});
  const quizRef = useRef<HTMLDivElement>(null);

  const filteredQuestions = quizSection ? questions.filter((q) => q.section === quizSection) : questions;

  const startQuiz = (section: number | null) => {
    setQuizSection(section);
    setCurrentQ(0);
    setAnswers({});
    setShowExplanation(false);
    setQuizState("active");
  };

  const selectAnswer = (qId: number, optionIdx: number) => {
    if (answers[qId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ < filteredQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      setQuizState("review");
    }
  };

  const score = Object.entries(answers).filter(([qId, ans]) => {
    const q = questions.find((q) => q.id === parseInt(qId));
    return q && ans === q.correct;
  }).length;

  const totalAnswered = Object.keys(answers).length;

  const expandQuestion = async (id: number) => {
    const cq = communityQs.find((q) => q.id === id);
    if (!cq) return;
    setExpandingId(id);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are an expert on OpenAI's products and the role of an AI Sales Engineer. A user submitted this interview practice question: "${cq.text}"\n\nProvide a detailed, structured answer that would help someone preparing for an OpenAI Sales Engineer interview. Include: (1) why an interviewer asks this, (2) a strong model answer, (3) one key tip. Keep it concise but thorough. Use plain text, no markdown.` }],
        }),
      });
      const data = await resp.json();
      const answer = data.content?.map((c: { text?: string }) => c.text || "").join("\n") || "Unable to generate answer. Please try again.";
      setExpandedAnswers((prev) => ({ ...prev, [id]: answer }));
    } catch {
      setExpandedAnswers((prev) => ({ ...prev, [id]: "Error connecting to API. Please try again." }));
    }
    setExpandingId(null);
  };

  const addCommunityQuestion = () => {
    if (!newQuestion.trim()) return;
    setCommunityQs((prev) => [...prev, { id: Date.now(), text: newQuestion.trim(), author: "Contributor", time: new Date().toLocaleString() }]);
    setNewQuestion("");
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ margin: line === "" ? "8px 0" : "4px 0", lineHeight: 1.7 }}>
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} style={{ color: colors.accent, fontWeight: 600 }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Internal Tabs */}
      <div style={{ borderBottom: `1px solid ${colors.border}`, background: colors.surface }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { key: "docs", label: "\uD83D\uDCC4 Documentation", desc: "10 Technical Areas" },
            { key: "quiz", label: "\uD83E\uDDEA Quiz", desc: "50 Questions" },
            { key: "community", label: "\uD83D\uDC65 Community", desc: "Submit Questions" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                if (t.key !== "docs") setSelectedSection(null);
              }}
              style={{
                padding: "14px 24px",
                background: tab === t.key ? colors.accentGlow : "transparent",
                border: "none",
                borderBottom: tab === t.key ? `2px solid ${colors.accent}` : "2px solid transparent",
                color: tab === t.key ? colors.accent : colors.textDim,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {t.label} <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>
        {/* DOCUMENTATION TAB */}
        {tab === "docs" && !selectedSection && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: colors.textDim }}>Core Technical Knowledge Areas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSection(s.id)}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: "20px 22px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    color: colors.text,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accentDim;
                    e.currentTarget.style.background = colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.card;
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <Badge>Section {s.id}</Badge>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{s.title}</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.textDim, lineHeight: 1.5 }}>{s.content.substring(0, 120)}...</p>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: `radial-gradient(circle at top right, ${colors.accentGlow}, transparent)`,
                      pointerEvents: "none",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "docs" && selectedSection && (
          <div>
            <button
              onClick={() => setSelectedSection(null)}
              style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600, marginBottom: 20, padding: 0 }}
            >
              \u2190 Back to all sections
            </button>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px 36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <span style={{ fontSize: 36 }}>{sections[selectedSection - 1].icon}</span>
                <div>
                  <Badge>Section {selectedSection}</Badge>
                  <h2 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700 }}>{sections[selectedSection - 1].title}</h2>
                </div>
              </div>
              <div style={{ fontSize: 15, color: colors.text, lineHeight: 1.8 }}>{renderContent(sections[selectedSection - 1].content)}</div>
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${colors.border}`, display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setTab("quiz");
                    startQuiz(selectedSection);
                  }}
                  style={{ padding: "10px 20px", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 14 }}
                >
                  \uD83E\uDDEA Quiz this section ({questions.filter((q) => q.section === selectedSection).length} questions)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {tab === "quiz" && quizState === "menu" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: colors.textDim }}>Choose Your Quiz</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              <button
                onClick={() => startQuiz(null)}
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}22, ${colors.card})`,
                  border: `1px solid ${colors.accent}55`,
                  borderRadius: 14,
                  padding: "24px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: colors.text,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${colors.accent}55`)}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"\uD83C\uDFC6"}</div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.accent }}>Full Assessment</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: colors.textDim }}>All 50 questions across all 10 sections</p>
              </button>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startQuiz(s.id)}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    padding: "24px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    color: colors.text,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderHover;
                    e.currentTarget.style.background = colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.card;
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{s.title}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.textDim }}>
                    {questions.filter((q) => q.section === s.id).length} questions
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "quiz" && quizState === "active" && filteredQuestions[currentQ] && (
          <div ref={quizRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button
                onClick={() => {
                  setQuizState("menu");
                  setQuizSection(null);
                }}
                style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: 0 }}
              >
                \u2190 Exit quiz
              </button>
              <span style={{ fontSize: 13, color: colors.textDim }}>
                Question {currentQ + 1} of {filteredQuestions.length}
                {totalAnswered > 0 && ` \u00B7 Score: ${score}/${totalAnswered}`}
              </span>
            </div>
            <div style={{ height: 4, background: colors.border, borderRadius: 2, marginBottom: 28 }}>
              <div
                style={{
                  height: "100%",
                  width: `${((currentQ + 1) / filteredQuestions.length) * 100}%`,
                  background: colors.accent,
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <Badge>{sections[filteredQuestions[currentQ].section - 1]?.title}</Badge>
                <Badge color={colors.textDim} bg={colors.surface}>
                  Q{filteredQuestions[currentQ].id}
                </Badge>
              </div>
              <h3 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{filteredQuestions[currentQ].q}</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredQuestions[currentQ].options.map((opt, i) => {
                  const answered = answers[filteredQuestions[currentQ].id] !== undefined;
                  const selected = answers[filteredQuestions[currentQ].id] === i;
                  const isCorrect = i === filteredQuestions[currentQ].correct;
                  let borderCol = colors.border;
                  let bgCol = colors.surface;
                  let icon = String.fromCharCode(65 + i);
                  if (answered) {
                    if (isCorrect) {
                      borderCol = colors.green;
                      bgCol = colors.greenGlow;
                      icon = "\u2713";
                    } else if (selected) {
                      borderCol = colors.red;
                      bgCol = colors.redGlow;
                      icon = "\u2717";
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(filteredQuestions[currentQ].id, i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 18px",
                        background: bgCol,
                        border: `1px solid ${borderCol}`,
                        borderRadius: 10,
                        cursor: answered ? "default" : "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        color: colors.text,
                        fontSize: 14,
                        lineHeight: 1.5,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!answered) {
                          e.currentTarget.style.borderColor = colors.accentDim;
                          e.currentTarget.style.background = colors.surfaceHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!answered) {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.background = colors.surface;
                        }
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          background: answered && isCorrect ? colors.green : answered && selected ? colors.red : colors.border,
                          color: answered && (isCorrect || selected) ? "#fff" : colors.textDim,
                        }}
                      >
                        {icon}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div style={{ marginTop: 20, padding: "16px 20px", background: colors.accentGlow, border: `1px solid ${colors.accent}44`, borderRadius: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: colors.accent, marginBottom: 6 }}>
                    {answers[filteredQuestions[currentQ].id] === filteredQuestions[currentQ].correct ? "\u2713 Correct!" : "\u2717 Incorrect"}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.6 }}>{filteredQuestions[currentQ].explanation}</p>
                </div>
              )}

              {showExplanation && (
                <button
                  onClick={nextQuestion}
                  style={{
                    marginTop: 20,
                    padding: "12px 28px",
                    background: colors.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  {currentQ < filteredQuestions.length - 1 ? "Next Question \u2192" : "View Results \u2192"}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "quiz" && quizState === "review" && (
          <div>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px", textAlign: "center", marginBottom: 24 }}>
              <ProgressRing progress={(score / totalAnswered) * 100} size={80} stroke={6} />
              <h2 style={{ margin: "16px 0 6px", fontSize: 22, fontWeight: 700 }}>
                {score >= totalAnswered * 0.8 ? "Excellent!" : score >= totalAnswered * 0.5 ? "Good Progress" : "Keep Studying"}
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: colors.textDim }}>
                You scored <strong style={{ color: colors.accent }}>{score}</strong> out of <strong>{totalAnswered}</strong>
              </p>
              <button
                onClick={() => {
                  setQuizState("menu");
                  setQuizSection(null);
                }}
                style={{ marginTop: 20, padding: "10px 24px", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 14 }}
              >
                Back to Quiz Menu
              </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textDim, marginBottom: 14 }}>Review Answers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredQuestions.map((q) => {
                const userAns = answers[q.id];
                const correct = userAns === q.correct;
                return (
                  <div key={q.id} style={{ background: colors.card, border: `1px solid ${correct ? colors.green + "44" : colors.red + "44"}`, borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          background: correct ? colors.green : colors.red,
                          color: "#fff",
                        }}
                      >
                        {correct ? "\u2713" : "\u2717"}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        Q{q.id}: {q.q.substring(0, 80)}...
                      </span>
                    </div>
                    {!correct && (
                      <p style={{ margin: "6px 0 0 32px", fontSize: 13, color: colors.textDim }}>
                        Your answer: {q.options[userAns]} \u2014 Correct: <span style={{ color: colors.green }}>{q.options[q.correct]}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMMUNITY TAB */}
        {tab === "community" && (
          <div>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>{"\uD83D\uDC65"} Community Question Bank</h2>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: colors.textDim }}>
                Submit interview questions. Click &quot;Expand&quot; to generate a detailed AI-powered answer.
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCommunityQuestion()}
                  placeholder="Type an interview question..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    color: colors.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
                <button
                  onClick={addCommunityQuestion}
                  style={{
                    padding: "12px 22px",
                    background: colors.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add Question
                </button>
              </div>
            </div>

            {communityQs.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: colors.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{"\uD83D\uDCA1"}</div>
                <p style={{ fontSize: 15 }}>No community questions yet. Be the first to contribute!</p>
                <p style={{ fontSize: 13 }}>Submit a question above and click &quot;Expand&quot; to get an AI-generated detailed answer.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {communityQs.map((cq) => (
                <div key={cq.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{cq.text}</p>
                      <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>
                        Added by {cq.author} \u00B7 {cq.time}
                      </p>
                    </div>
                    {!expandedAnswers[cq.id] && (
                      <button
                        onClick={() => expandQuestion(cq.id)}
                        disabled={expandingId === cq.id}
                        style={{
                          padding: "8px 16px",
                          background: expandingId === cq.id ? colors.surface : colors.accentGlow,
                          border: `1px solid ${colors.accent}44`,
                          borderRadius: 8,
                          color: colors.accent,
                          cursor: expandingId === cq.id ? "wait" : "pointer",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {expandingId === cq.id ? "\u23F3 Generating..." : "\uD83E\uDD16 Expand with AI"}
                      </button>
                    )}
                  </div>
                  {expandedAnswers[cq.id] && (
                    <div style={{ marginTop: 16, padding: "16px 20px", background: colors.accentGlow, border: `1px solid ${colors.accent}33`, borderRadius: 10 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: colors.accent }}>{"\uD83E\uDD16"} AI-Generated Answer</p>
                      <div style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{expandedAnswers[cq.id]}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
