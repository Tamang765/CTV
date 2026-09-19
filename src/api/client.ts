export async function request<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(
      response.statusText || `Request failed (${response.status})`,
    );

  return (await response.json()) as T;
}
