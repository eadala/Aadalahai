import type { Embedder } from "../types.js";

interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

export class OpenAIEmbedder implements Embedder {
  readonly name = "openai";

  constructor(
    private readonly apiKey: string,
    readonly dimensions: number = 384
  ) {}

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts,
        dimensions: this.dimensions,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Embeddings API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenAIEmbeddingResponse;
    return data.data.map((d) => d.embedding);
  }
}
