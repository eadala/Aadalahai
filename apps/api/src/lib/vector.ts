import { customType } from "drizzle-orm/pg-core";

export function vector(dimensions: number) {
  return customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value: number[]): string {
      return `[${value.join(",")}]`;
    },
    fromDriver(value: string): number[] {
      const cleaned = value.replace(/^\[|\]$/g, "");
      if (!cleaned) return [];
      return cleaned.split(",").map(Number);
    },
  });
}

export function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}
