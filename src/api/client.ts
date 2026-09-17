import { REQUEST_TIMEOUT_MS } from "../constants/config";

export async function request<T>(url: string, signal: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal.throwIfAborted();
  signal.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "This archive could not be found. Choose another category or retry."
          : `The archive returned an error (${response.status}). Please try again.`,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    if (signal.aborted) throw error;
    if (timedOut)
      throw new Error(
        "The archive took too long to respond. Please try again.",
        { cause: error },
      );
    if (error instanceof SyntaxError)
      throw new Error(
        "The archive returned unreadable data. Please try again.",
        { cause: error },
      );
    if (error instanceof TypeError)
      throw new Error(
        "The archive is unreachable. Check your connection and try again.",
        { cause: error },
      );
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}