import { describe, it, expect } from "vitest";
import { chunkText } from "../src/lib/chunking.js";
import { MockEmbedder } from "../src/ai/providers/mock-embedder.js";

describe("Chunking", () => {
  it("should split text into chunks with overlap", () => {
    const text = "أ".repeat(1000);
    const chunks = chunkText(text, 500, 50);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(500);
  });

  it("should return empty for empty text", () => {
    expect(chunkText("   ")).toEqual([]);
  });
});

describe("MockEmbedder", () => {
  it("should produce normalized vectors", async () => {
    const embedder = new MockEmbedder(384);
    const vector = await embedder.embed("نص قانوني تجريبي");
    expect(vector).toHaveLength(384);
    const magnitude = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it("should produce similar vectors for similar text", async () => {
    const embedder = new MockEmbedder(384);
    const v1 = await embedder.embed("المادة 77 نظام العمل");
    const v2 = await embedder.embed("المادة 77 نظام العمل");
    const v3 = await embedder.embed("نص مختلف تماما عن القانون");
    expect(v1).toEqual(v2);
    const sim12 = v1.reduce((s, v, i) => s + v * v2[i], 0);
    const sim13 = v1.reduce((s, v, i) => s + v * v3[i], 0);
    expect(sim12).toBeGreaterThan(sim13);
  });
});
