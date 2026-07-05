type Labels = Record<string, string>;

function formatLabels(labels?: Labels): string {
  if (!labels || Object.keys(labels).length === 0) return "";
  const parts = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`);
  return `{${parts.join(",")}}`;
}

class Counter {
  private values = new Map<string, number>();

  inc(name: string, labels?: Labels, amount = 1) {
    const key = `${name}${formatLabels(labels)}`;
    this.values.set(key, (this.values.get(key) ?? 0) + amount);
  }

  render(): string[] {
    return [...this.values.entries()].map(([key, value]) => `${key} ${value}`);
  }
}

class Histogram {
  private values = new Map<string, number[]>();

  observe(name: string, value: number, labels?: Labels) {
    const key = `${name}${formatLabels(labels)}`;
    const bucket = this.values.get(key) ?? [];
    bucket.push(value);
    this.values.set(key, bucket);
  }

  render(name: string): string[] {
    const lines: string[] = [];
    for (const [key, values] of this.values.entries()) {
      if (values.length === 0) continue;
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const base = key.replace(name, name);
      lines.push(`${base}_sum ${sum}`);
      lines.push(`${base}_count ${count}`);
    }
    return lines;
  }
}

export const metrics = {
  httpRequests: new Counter(),
  httpErrors: new Counter(),
  llmRequests: new Counter(),
  llmErrors: new Counter(),
  embeddingRequests: new Counter(),
  embeddingErrors: new Counter(),
  httpDurationMs: new Histogram(),
  llmDurationMs: new Histogram(),
  embeddingDurationMs: new Histogram(),
  ragDurationMs: new Histogram(),

  toPrometheus(): string {
    const lines = [
      ...metrics.httpRequests.render(),
      ...metrics.httpErrors.render(),
      ...metrics.llmRequests.render(),
      ...metrics.llmErrors.render(),
      ...metrics.embeddingRequests.render(),
      ...metrics.embeddingErrors.render(),
      ...metrics.httpDurationMs.render("adalah_http_duration_ms"),
      ...metrics.llmDurationMs.render("adalah_llm_duration_ms"),
      ...metrics.embeddingDurationMs.render("adalah_embedding_duration_ms"),
      ...metrics.ragDurationMs.render("adalah_rag_duration_ms"),
    ];

    return lines.length > 0 ? `${lines.join("\n")}\n` : "# No metrics yet\n";
  },
};
