export type RetrievalSource = "user" | "legislation";

export interface RetrievedChunk {
  chunkId: string;
  source: RetrievalSource;
  documentId: string | null;
  legislationId: string | null;
  documentTitle: string;
  articleRef: string | null;
  category: string | null;
  content: string;
  similarity: number;
}
