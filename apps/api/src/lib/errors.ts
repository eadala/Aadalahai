export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Array<{ field: string; issue: string }>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function formatError(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details ?? [],
    },
  };
}
