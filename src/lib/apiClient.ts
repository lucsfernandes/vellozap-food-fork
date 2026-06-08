import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * REST API base URL. Defaults to the local backend; override with VITE_API_URL.
 * The trailing `/api` prefix matches the backend `API_PREFIX`.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3333/api";

const ACCESS_TOKEN_KEY = "vz_access_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Send/receive the httpOnly refresh cookie.
  withCredentials: true,
});

// Attach the Bearer access token on every request.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Single-flight refresh so concurrent 401s share one refresh round-trip.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = res.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

// On 401, try to refresh once and replay the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes("/auth/");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      // Single-flight: a 401 arriving mid-refresh must reuse the in-flight
      // promise rather than start a second refresh. Reset only when this exact
      // promise settles, via .finally() chained on the promise itself (L2).
      if (!refreshPromise) {
        const flight = refreshAccessToken();
        refreshPromise = flight;
        void flight.finally(() => {
          if (refreshPromise === flight) {
            refreshPromise = null;
          }
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  },
);
