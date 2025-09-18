export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ConvexFetchOptions<TBody = unknown> {
  method?: HttpMethod;
  baseUrl: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: TBody;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface ConvexFetchResponse<T = unknown> {
  status: number;
  ok: boolean;
  headers: Headers;
  data: T;
}

function buildUrl(baseUrl: string, path: string, query?: ConvexFetchOptions["query"]): string {
  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(trimmedBase + trimmedPath);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function convexFetch<TResponse = unknown, TBody = unknown>(options: ConvexFetchOptions<TBody>): Promise<ConvexFetchResponse<TResponse>> {
  const {
    method = "GET",
    baseUrl,
    path,
    query,
    body,
    headers,
    timeoutMs = 30000,
  } = options;

  const url = buildUrl(baseUrl, path, query);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    signal: controller.signal,
  };

  if (body !== undefined && method !== "GET") {
    (requestInit as any).body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestInit);
    const contentType = response.headers.get("content-type") || "";
    let data: any;
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => "");
    }

    if (!response.ok) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      throw new Error(`Request failed ${response.status}: ${message || response.statusText}`);
    }
    if (typeof data === "object" && data.status === "error") {
      throw new Error(data.errorMessage);
    }
    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data: data as TResponse,
    };
  } finally {
    clearTimeout(timeout);
  }
}


