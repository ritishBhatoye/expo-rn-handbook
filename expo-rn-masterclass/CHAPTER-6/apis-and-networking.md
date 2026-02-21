# Chapter 6 — APIs & Networking

> **TL;DR**
> - Use `fetch` for simple requests. Use Axios only if you need interceptors (token refresh).
> - MMKV is 30x faster than AsyncStorage. Use it for all non-sensitive key-value storage.
> - Use `expo-secure-store` exclusively for tokens and secrets.

📚 [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) · 🔗 [mrousavy/react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) · 🔗 [TanStack/query](https://github.com/TanStack/query)

---

## fetch vs Axios

| Feature | fetch (built-in) | Axios |
|---------|------------------|-------|
| Install | None | `npm install axios` |
| Interceptors | ❌ (manual) | ✅ built-in |
| Request cancellation | `AbortController` | `CancelToken` / `AbortController` |
| Auto JSON parse | ❌ (need `.json()`) | ✅ |
| Timeout | ❌ (manual `AbortController`) | ✅ `timeout` option |
| Verdict | Simple apps | Apps with auth token refresh |

### fetch Pattern

```tsx
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}
```

### Axios with Interceptors

```bash
npm install axios
```

```tsx
// lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — refresh token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync("refresh-token");
      const { data } = await axios.post("https://api.example.com/refresh", {
        refreshToken,
      });
      await SecureStore.setItemAsync("auth-token", data.accessToken);

      // Retry original request
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## REST Patterns with TypeScript

```tsx
// types/api.ts
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface Post {
  id: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
}

// api/posts.ts
import api from "@/lib/api";

export const postsApi = {
  getAll: (page = 1) =>
    api.get<PaginatedResponse<Post>>(`/posts?page=${page}`).then((r) => r.data),

  getById: (id: string) =>
    api.get<Post>(`/posts/${id}`).then((r) => r.data),

  create: (post: Omit<Post, "id" | "createdAt">) =>
    api.post<Post>("/posts", post).then((r) => r.data),

  update: (id: string, post: Partial<Post>) =>
    api.patch<Post>(`/posts/${id}`, post).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/posts/${id}`),
};
```

---

## Supabase Setup

```bash
npx expo install @supabase/supabase-js expo-secure-store react-native-url-polyfill
```

```tsx
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## WebSockets

```tsx
import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => ws.current?.close();
  }, [url]);

  const send = (message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  return { messages, isConnected, send };
}
```

---

## MMKV vs AsyncStorage

| Feature | AsyncStorage | MMKV |
|---------|-------------|------|
| Speed | Slow (async, SQLite) | 30x faster (C++ mmap) |
| API | Async only | Sync + Async |
| Encryption | ❌ | ✅ built-in |
| Expo Go | ✅ | ❌ (needs Dev Client) |
| Install | `npx expo install @react-native-async-storage/async-storage` | `npx expo install react-native-mmkv` |

### MMKV Usage

```tsx
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

// Write (synchronous — no await needed)
storage.set("user.name", "Alice");
storage.set("user.age", 30);
storage.set("user.premium", true);

// Read
const name = storage.getString("user.name");     // "Alice"
const age = storage.getNumber("user.age");         // 30
const isPremium = storage.getBoolean("user.premium"); // true

// Delete
storage.delete("user.name");

// Check existence
storage.contains("user.name"); // false

// Get all keys
const keys = storage.getAllKeys(); // ["user.age", "user.premium"]
```

---

## Secure Storage (expo-secure-store)

For tokens, passwords, API keys — anything sensitive.

```bash
npx expo install expo-secure-store
```

```tsx
import * as SecureStore from "expo-secure-store";

// Save
await SecureStore.setItemAsync("auth-token", "eyJhbGciOiJIUzI1...");

// Read
const token = await SecureStore.getItemAsync("auth-token");

// Delete
await SecureStore.deleteItemAsync("auth-token");
```

⚠️ **SecureStore has a 2048-byte limit per value on iOS.** For larger values, encrypt with a key stored in SecureStore and save the encrypted data in MMKV.

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Network request failed` on Android emulator | Using `localhost` | Use `10.0.2.2` or your machine's IP |
| Axios not throwing on 4xx/5xx | Using `fetch` behavior assumption | Axios throws by default on non-2xx — handle in catch |
| SecureStore value is `null` | Key was never stored or was deleted | Always check for `null` return from `getItemAsync` |
| MMKV crash in Expo Go | Requires native code | Use Dev Client (`expo-dev-client`) |
| Supabase auth not persisting | Missing storage adapter | Pass `ExpoSecureStoreAdapter` to `createClient` |
| `Network Error` with no details | Missing `react-native-url-polyfill` | Add `import 'react-native-url-polyfill/auto'` at app entry |

---

## ⚡ Shortcuts & Speed Tricks

- **Environment variables** in Expo use the `EXPO_PUBLIC_` prefix: `process.env.EXPO_PUBLIC_API_URL`.
- **MMKV listeners** — subscribe to key changes: `storage.addOnValueChangedListener((key) => {...})`.
- **AbortController** with fetch — always cancel requests when a component unmounts to prevent memory leaks.
- **`queryClient.prefetchQuery`** — prefetch data before the user navigates to a screen for instant loading.
- **Rate limiting** — wrap your API client with a queue if you're hitting 429s.