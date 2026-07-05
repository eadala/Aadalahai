export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMOptions {
  systemPrompt?: string;
  temperature?: number;
}

export interface LLMProvider {
  readonly name: string;
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
  stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string>;
}

export interface Embedder {
  readonly name: string;
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
