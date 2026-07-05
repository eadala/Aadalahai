import type { Embedder } from "../types.js";
import { openaiFetch, type OpenAIFetchOptions } from "../openai-client.js";

interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

export class OpenAIEmbedder implements Embedder {
  readonly name = "openai";

  constructor(
    private readonly fetchOptions: OpenAIFetchOptions,
    private readonly embeddingModel: string,
    readonly dimensions: number = 384
  ) {}

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await openaiFetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        body: JSON.stringify({
          model: this.embeddingModel,
          input: texts,
          dimensions: this.dimensions,
        }),
      },
      this.fetchOptions
    );

    const data = (await response.json()) as OpenAIEmbeddingResponse;
    return data.data.map((d) => d.embedding);
  }
}
