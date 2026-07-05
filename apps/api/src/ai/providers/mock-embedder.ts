import type { Embedder } from "../types.js";

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / magnitude);
}

export class MockEmbedder implements Embedder {
  readonly name = "mock";

  constructor(readonly dimensions: number = 384) {}

  async embed(text: string): Promise<number[]> {
    const vector = new Array(this.dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      const idx = (hashString(text.slice(i, i + 8)) + i) % this.dimensions;
      vector[idx] += text.charCodeAt(i) / 255;
    }
    return normalize(vector);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
