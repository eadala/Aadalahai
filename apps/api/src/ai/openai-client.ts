import { OpenAIError } from "./openai-errors.js";

interface OpenAIErrorBody {
  error?: { message?: string; type?: string; code?: string };
}

export interface OpenAIFetchOptions {
  apiKey: string;
  timeoutMs: number;
  maxRetries?: number;
}

export async function openaiFetch(
  url: string,
  init: RequestInit,
  options: OpenAIFetchOptions
): Promise<Response> {
  const maxRetries = options.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
          ...(init.headers as Record<string, string>),
        },
      });

      if (response.ok || !shouldRetry(response.status) || attempt === maxRetries) {
        if (!response.ok) {
          throw await parseOpenAIError(response);
        }
        return response;
      }

      lastError = await parseOpenAIError(response);
      await backoff(attempt);
    } catch (error) {
      if (error instanceof OpenAIError) {
        if (!shouldRetry(error.status) || attempt === maxRetries) throw error;
        lastError = error;
        await backoff(attempt);
        continue;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenAIError(408, "TIMEOUT", "انتهت مهلة طلب OpenAI");
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new OpenAIError(500, "UNKNOWN", "فشل طلب OpenAI");
}

async function parseOpenAIError(response: Response): Promise<OpenAIError> {
  let message = `OpenAI API error: ${response.status}`;
  let code = "OPENAI_ERROR";

  try {
    const body = (await response.json()) as OpenAIErrorBody;
    if (body.error?.message) message = body.error.message;
    if (body.error?.code) code = body.error.code;
    else if (body.error?.type) code = body.error.type;
  } catch {
    // ignore JSON parse errors
  }

  return new OpenAIError(response.status, code, message);
}

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

function backoff(attempt: number): Promise<void> {
  const delay = Math.min(1000 * 2 ** attempt, 8000);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
