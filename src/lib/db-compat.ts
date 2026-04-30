type DbError = { code?: string; message?: string; details?: string | null } | null | undefined;

export function isMissingColumn(error: DbError, column?: string): boolean {
  if (!error) return false;
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return error.code === "42703" && (!column || text.includes(column.toLowerCase()));
}

export function logDbError(scope: string, error: unknown) {
  console.error(`[${scope}] database request failed:`, error);
}