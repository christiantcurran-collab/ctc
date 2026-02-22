import OpenAI from "openai";
import { getEncoding } from "js-tiktoken";
import * as fs from "fs";
import * as path from "path";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const enc = getEncoding("cl100k_base");

function getTokenId(word: string): number {
  const tokens = enc.encode(word);
  return tokens[0];
}

interface CachedResponse {
  id: string;
  params: {
    model: string;
    temperature: number;
    top_p: number;
    max_tokens: number;
    frequency_penalty: number;
    presence_penalty: number;
    system_prompt: string;
    context: string | null;
    stop: string[] | null;
    logit_bias: Record<string, number> | null;
    n: number;
    seed: number | null;
  };
  results: {
    completions: Array<{
      text: string;
      tokens: Array<{
        token: string;
        logprob: number;
        probability: number;
        top_logprobs: Array<{
          token: string;
          logprob: number;
          probability: number;
        }>;
      }>;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    latency_ms: number;
  };
  generated_at: string;
}

const BASE_PROMPT = "Complete this text with the next word only. Do not add punctuation or explanation. Text: The cat is running towards the";

const SYSTEM_PROMPTS: Record<string, string> = {
  default: "You are a helpful assistant.",
  horror: "You are a horror story writer. Everything you write is dark, suspenseful, and unsettling.",
  children: "You are a children's story author. Everything you write is cheerful, colourful, and suitable for ages 3-5.",
  technical: "You are a veterinary scientist. You describe animal behaviour in precise, clinical terms.",
  comedy: "You are a stand-up comedian. Everything you write is unexpected and designed to get a laugh.",
};

const CONTEXTS: Record<string, string | null> = {
  none: null,
  catflap: "Here is some information about the house: The house has a cat flap installed on the back door. The garden contains a fish pond stocked with koi carp. There is a tall oak tree in the front yard.",
  mouse: "Here is some information about the scene: There is a small mouse hiding under the kitchen table. The mouse has been there for several minutes. The kitchen door is wide open.",
  dog: "Here is some information about the situation: A dog is barking loudly in the hallway. The dog is a large German Shepherd and is very excited. The front door is open.",
};

function buildMessages(systemPrompt: string, context: string | null): Array<{role: "system" | "user"; content: string}> {
  const messages: Array<{role: "system" | "user"; content: string}> = [
    { role: "system", content: systemPrompt },
  ];
  let userContent = BASE_PROMPT;
  if (context) {
    userContent = context + "\n\n" + BASE_PROMPT;
  }
  messages.push({ role: "user", content: userContent });
  return messages;
}

async function makeCall(params: CachedResponse["params"]): Promise<CachedResponse> {
  const messages = buildMessages(params.system_prompt, params.context);
  const startTime = Date.now();

  const requestParams: any = {
    model: params.model,
    messages,
    temperature: params.temperature,
    top_p: params.top_p,
    max_tokens: params.max_tokens,
    frequency_penalty: params.frequency_penalty,
    presence_penalty: params.presence_penalty,
    n: params.n,
    logprobs: true,
    top_logprobs: 20,
  };

  if (params.stop) requestParams.stop = params.stop;
  if (params.logit_bias) requestParams.logit_bias = params.logit_bias;
  if (params.seed !== null) requestParams.seed = params.seed;

  const completion = await client.chat.completions.create(requestParams);
  const latency = Date.now() - startTime;

  const completions = completion.choices.map((choice) => {
    const logprobContent = choice.logprobs?.content || [];
    return {
      text: choice.message?.content || "",
      tokens: logprobContent.map((lp) => ({
        token: lp.token,
        logprob: lp.logprob,
        probability: Math.exp(lp.logprob) * 100,
        top_logprobs: (lp.top_logprobs || []).map((tlp) => ({
          token: tlp.token,
          logprob: tlp.logprob,
          probability: Math.exp(tlp.logprob) * 100,
        })),
      })),
    };
  });

  const id = [
    params.model,
    `t${params.temperature}`,
    `p${params.top_p}`,
    `mt${params.max_tokens}`,
    `fp${params.frequency_penalty}`,
    `pp${params.presence_penalty}`,
    params.context ? "ctx" : "noctx",
    params.seed !== null ? `seed${params.seed}` : "noseed",
    `n${params.n}`,
  ].join("_");

  return {
    id,
    params,
    results: {
      completions,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
      latency_ms: latency,
    },
    generated_at: new Date().toISOString(),
  };
}

function baseParams(): CachedResponse["params"] {
  return {
    model: "gpt-4o",
    temperature: 0.7,
    top_p: 1.0,
    max_tokens: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    system_prompt: SYSTEM_PROMPTS.default,
    context: null,
    stop: null,
    logit_bias: null,
    n: 1,
    seed: null,
  };
}

async function generateAll(): Promise<CachedResponse[]> {
  const results: CachedResponse[] = [];
  let callNum = 0;

  async function run(label: string, params: CachedResponse["params"]) {
    callNum++;
    console.log(`[${callNum}] ${label}...`);
    try {
      const result = await makeCall(params);
      results.push(result);
      console.log(`  -> "${result.results.completions[0]?.text}" (${result.results.latency_ms}ms)`);
    } catch (err: any) {
      console.error(`  -> ERROR: ${err.message}`);
    }
    // Small delay to respect rate limits
    await new Promise((r) => setTimeout(r, 200));
  }

  // 1. Temperature sweep
  for (const temp of [0.0, 0.1, 0.3, 0.5, 0.7, 1.0, 1.2, 1.5, 2.0]) {
    await run(`Temperature ${temp}`, { ...baseParams(), temperature: temp });
  }

  // 2. Top-p sweep (temperature 0.7)
  for (const topP of [0.1, 0.3, 0.5, 0.7, 0.9, 1.0]) {
    await run(`Top-p ${topP}`, { ...baseParams(), top_p: topP });
  }

  // 3. Model comparison (temperature 0.7)
  for (const model of ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]) {
    await run(`Model ${model}`, { ...baseParams(), model });
  }

  // 4. RAG context variations
  for (const [key, ctx] of Object.entries(CONTEXTS)) {
    await run(`Context: ${key}`, { ...baseParams(), context: ctx });
  }

  // 5. System prompt variations
  for (const [key, prompt] of Object.entries(SYSTEM_PROMPTS)) {
    await run(`System prompt: ${key}`, { ...baseParams(), system_prompt: prompt });
  }

  // 6. Frequency penalty sweep (max_tokens 30)
  for (const fp of [0.0, 0.5, 1.0, 1.5, 2.0]) {
    await run(`Freq penalty ${fp}`, { ...baseParams(), frequency_penalty: fp, max_tokens: 30 });
  }

  // 7. Presence penalty sweep (max_tokens 30)
  for (const pp of [0.0, 0.5, 1.0, 1.5, 2.0]) {
    await run(`Pres penalty ${pp}`, { ...baseParams(), presence_penalty: pp, max_tokens: 30 });
  }

  // 8. Max tokens sweep
  for (const mt of [1, 5, 10, 20, 50]) {
    await run(`Max tokens ${mt}`, { ...baseParams(), max_tokens: mt });
  }

  // 9. Stop sequences (max_tokens 50)
  for (const stop of [null, ["."], [","], ["\n"]]) {
    const label = stop ? `Stop: "${stop[0]}"` : "Stop: none";
    await run(label, { ...baseParams(), max_tokens: 50, stop });
  }

  // 10. Logit bias
  const doorId = String(getTokenId(" door"));
  const volcanoId = String(getTokenId(" volcano"));
  const fishId = String(getTokenId(" fish"));
  const pondId = String(getTokenId(" pond"));
  const dogId = String(getTokenId(" dog"));
  const gardenId = String(getTokenId(" garden"));

  const logitBiasConfigs: Array<{ label: string; bias: Record<string, number> | null }> = [
    { label: "No bias", bias: null },
    { label: "Suppress door", bias: { [doorId]: -100 } },
    { label: "Boost volcano", bias: { [volcanoId]: 5 } },
    { label: "Boost fish+pond", bias: { [fishId]: 3, [pondId]: 3 } },
    { label: "Suppress top 3", bias: { [doorId]: -100, [dogId]: -100, [gardenId]: -100 } },
  ];

  for (const { label, bias } of logitBiasConfigs) {
    await run(`Logit bias: ${label}`, { ...baseParams(), logit_bias: bias });
  }

  // 11. N completions
  const nConfigs = [
    { n: 1, temperature: 0.7, max_tokens: 5 },
    { n: 5, temperature: 0.1, max_tokens: 5 },
    { n: 5, temperature: 0.7, max_tokens: 5 },
    { n: 5, temperature: 1.5, max_tokens: 5 },
    { n: 10, temperature: 0.7, max_tokens: 5 },
  ];
  for (const cfg of nConfigs) {
    await run(`N=${cfg.n} temp=${cfg.temperature}`, {
      ...baseParams(),
      n: cfg.n,
      temperature: cfg.temperature,
      max_tokens: cfg.max_tokens,
    });
  }

  // 12. Seed tests
  for (let i = 0; i < 3; i++) {
    await run(`Seed 42 run ${i + 1}`, { ...baseParams(), seed: 42, max_tokens: 10 });
  }
  for (let i = 0; i < 3; i++) {
    await run(`No seed run ${i + 1}`, { ...baseParams(), seed: null, max_tokens: 10 });
  }

  return results;
}

async function main() {
  console.log("Generating How AI Works cache...\n");
  const results = await generateAll();
  const outPath = path.join(__dirname, "..", "src", "data", "how-ai-works-cache.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! ${results.length} entries saved to ${outPath}`);
}

main().catch(console.error);
