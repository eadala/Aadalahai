#!/usr/bin/env node
/**
 * OpenAI live validation — requires OPENAI_API_KEY
 * Usage: OPENAI_API_KEY=sk-... node scripts/openai-smoke.mjs
 */

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

if (!API_KEY) {
  console.error("[openai-smoke] OPENAI_API_KEY is required");
  process.exit(1);
}

const log = (msg) => console.log(`[openai-smoke] ${msg}`);
const fail = (msg) => {
  console.error(`[openai-smoke] FAIL: ${msg}`);
  process.exit(1);
};

async function openaiRequest(path, body) {
  const start = Date.now();
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const latency = Date.now() - start;
  const data = await res.json();
  if (!res.ok) {
    fail(`${path} → ${res.status}: ${data?.error?.message ?? JSON.stringify(data)}`);
  }
  return { data, latency };
}

async function run() {
  log(`Model: ${MODEL} | Embedding: ${EMBEDDING_MODEL}`);

  // 1. Chat completion — Arabic legal
  const systemPrompt = `أنت مساعد قانوني عربي. أجب بالعربية الفصحى باختصار.
استخدم السياق: المادة 77: للعامل الحق في إجازة سنوية.
أضف تنبيهًا استشاريًا في النهاية.`;

  const chat = await openaiRequest("/chat/completions", {
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "ما حق العامل في الإجازة؟" },
    ],
  });

  const content = chat.data.choices?.[0]?.message?.content ?? "";
  if (content.length < 30) fail("Chat response too short");
  log(`OK: chat completion (${chat.latency}ms, ${content.length} chars)`);
  log(`  Preview: ${content.slice(0, 80)}...`);

  const usage = chat.data.usage;
  if (usage) {
    log(`  Tokens: prompt=${usage.prompt_tokens} completion=${usage.completion_tokens}`);
  }

  // 2. Embeddings
  const emb = await openaiRequest("/embeddings", {
    model: EMBEDDING_MODEL,
    input: ["المادة 77 من نظام العمل"],
    dimensions: 384,
  });

  const vector = emb.data.data?.[0]?.embedding;
  if (!Array.isArray(vector) || vector.length !== 384) {
    fail(`Expected 384-dim embedding, got ${vector?.length}`);
  }
  log(`OK: embeddings (${emb.latency}ms, dim=${vector.length})`);

  log("All OpenAI live checks passed");
}

run().catch((err) => {
  console.error("[openai-smoke] Fatal:", err.message);
  process.exit(1);
});
