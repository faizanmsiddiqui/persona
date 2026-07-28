export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const csrf = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1];
  const response = await fetch(`/api/v1${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": decodeURIComponent(csrf) } : {}),
      ...init.headers,
    },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => null))?.detail ??
        `Request failed (${response.status})`,
    );
  return response.status === 204 ? (undefined as T) : response.json();
}
