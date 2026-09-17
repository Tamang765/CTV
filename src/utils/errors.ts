export function errorMessage(error: unknown): string {
  return error instanceof Error && !(error instanceof TypeError)
    ? error.message
    : "Unable to read the archive. Please try again.";
}
