export function sanitizeAmountInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function varianceClassName(value: number) {
  if (value > 0) {
    return "text-emerald-300";
  }

  if (value < 0) {
    return "text-red-300";
  }

  return "text-foreground";
}
