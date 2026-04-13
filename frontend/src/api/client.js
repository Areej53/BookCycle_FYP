import axios from "axios";

function getBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "/api/v1";
}

const DEFAULT_ERROR = "Something went wrong. Please try again.";

function isProxyOrBackendDownPayload(data) {
  if (typeof data !== "string") return false;
  const t = data.toLowerCase();
  return (
    t.includes("econnrefused") ||
    t.includes("econnreset") ||
    t.includes("socket hang up") ||
    t.includes("connect refused") ||
    t.includes("proxy error") ||
    t.includes("bad gateway")
  );
}

/** Ensure toast/UI never gets an empty string or unusable value */
function normalizeUserMessage(raw, fallback = DEFAULT_ERROR) {
  if (raw == null) return fallback;
  if (typeof raw === "string") {
    const s = raw.trim();
    return s.length ? s.slice(0, 500) : fallback;
  }
  if (typeof raw === "number" && !Number.isNaN(raw)) return String(raw);
  if (Array.isArray(raw)) {
    const joined = raw
      .filter((v) => v != null)
      .map((v) => (typeof v === "string" ? v : String(v)))
      .join(". ")
      .trim();
    return joined.length ? joined.slice(0, 500) : fallback;
  }
  if (typeof raw === "object") {
    const nested =
      raw.msg ?? raw.message ?? raw.error ?? raw.description;
    if (nested != null) return normalizeUserMessage(nested, fallback);
  }
  return fallback;
}

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// A lightweight HTTP GET cache to eliminate DB load during rapid page navigations
const getCache = new Map();
const ongoingGets = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds

const originalGet = api.get;

api.get = async (url, config = {}) => {
  // Try not to cache volatile search queries heavily, but do cache static routes
  const isSearch = url.includes('/search') || config.params?.q;
  const key = url + JSON.stringify(config.params || {}) + JSON.stringify(config.headers || {});
  
  if (!isSearch && getCache.has(key)) {
    const cached = getCache.get(key);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve(cached.res);
    }
  }

  // Prevent duplicate concurrent requests immediately starting alongside each other
  if (ongoingGets.has(key)) {
    return ongoingGets.get(key);
  }

  const promise = originalGet.call(api, url, config).then(res => {
    if (!isSearch) {
      getCache.set(key, { res, timestamp: Date.now() });
    }
    ongoingGets.delete(key);
    return res;
  }).catch(err => {
    ongoingGets.delete(key);
    throw err;
  });

  ongoingGets.set(key, promise);
  return promise;
};

const BACKEND_DOWN =
  "Backend is not running or the dev server cannot reach it. Open a terminal, run: cd backend && npm run dev — then check that PORT in backend/.env matches VITE_PROXY_TARGET in frontend/.env (both 5000). Restart frontend after changing .env (npm run dev).";

const MONGO_AND_API =
  "API error. (1) Backend terminal: if you see MongoDB errors, fix MONGO_URI in backend/.env and in Atlas: Network Access → allow your IP (or 0.0.0.0/0 for testing). (2) If the backend is not running, use: cd backend && npm run dev. (3) Test in browser: http://127.0.0.1:PORT/api/v1/health (PORT = value in backend/.env).";

export function getApiErrorMessage(err, fallback) {
  const fb = fallback || DEFAULT_ERROR;
  const data = err?.response?.data;

  if (typeof data === "string" && isProxyOrBackendDownPayload(data)) {
    return BACKEND_DOWN;
  }

  if (data != null && typeof data === "object") {
    return normalizeUserMessage(
      data.msg ?? data.message ?? data.error,
      fb
    );
  }

  if (typeof data === "string") {
    const t = data.trim();
    if (t.startsWith("{")) {
      try {
        const parsed = JSON.parse(t);
        return normalizeUserMessage(
          parsed?.msg ?? parsed?.message ?? parsed?.error,
          fb
        );
      } catch {
        /* not JSON */
      }
    }
    if (t.length > 0 && t.length <= 500 && !t.includes("<!DOCTYPE")) {
      if (isProxyOrBackendDownPayload(t)) return BACKEND_DOWN;
      return t;
    }
  }

  if (
    err?.code === "ERR_NETWORK" ||
    err?.message === "Network Error" ||
    err?.code === "ECONNABORTED"
  ) {
    return BACKEND_DOWN;
  }

  const status = err?.response?.status;

  if (status === 401) {
    return normalizeUserMessage(err?.response?.data?.msg, "Please log in again.");
  }
  if (status === 403) return "You are not allowed to do that.";
  if (status === 404) {
    return "API not found. Check that the backend is running on the expected port.";
  }
  if (status === 502 || status === 503 || status === 504) {
    return BACKEND_DOWN;
  }
  if (status != null && status >= 500) {
    if (typeof data === "string" && isProxyOrBackendDownPayload(data)) {
      return BACKEND_DOWN;
    }
    return MONGO_AND_API;
  }

  if (status != null) {
    return normalizeUserMessage(
      err?.response?.data?.msg,
      `Request failed (${status}). Please check your details and try again.`
    );
  }

  return fb;
}

export function getApiSuccessMessage(data, fallback = DEFAULT_ERROR) {
  return normalizeUserMessage(data?.msg ?? data?.message, fallback);
}
