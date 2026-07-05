import { AppError } from "../lib/errors.js";

export class OpenAIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

export function toAppError(error: OpenAIError): AppError {
  if (error.status === 401) {
    return new AppError("OPENAI_UNAUTHORIZED", "مفتاح OpenAI غير صالح", 502);
  }
  if (error.status === 429) {
    return new AppError("OPENAI_RATE_LIMIT", "تم تجاوز حد طلبات OpenAI، حاول لاحقًا", 503);
  }
  if (error.status >= 500) {
    return new AppError("OPENAI_UNAVAILABLE", "خدمة OpenAI غير متاحة حاليًا", 503);
  }
  return new AppError("OPENAI_ERROR", error.message, 502);
}
