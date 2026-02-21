# Chapter 5 — State Management

> **TL;DR**
> - `useState` + `useReducer` handle 80% of state needs. Don't over-engineer.
> - Zustand for global client state. TanStack Query for server/async state.
> - Context API is for low-frequency updates only (theme, auth). Never use it for high-frequency data.

📚 [React State Docs](https://react.dev/learn/managing-state) · 🔗 [pmndrs/zustand](https://github.com/pmndrs/zustand) · 🔗 [TanStack/query](https://github.com/TanStack/query) · 🔗 [pmndrs/jotai](https://github.com/pmndrs/jotai)

---

## useState & useReducer — When They're Enough

### useState

Use for simple, independent values.

```tsx
import { useState } from "react";
import { View, Text, Pressable } from "react-native";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text style={{ color: "#fff", fontSize: 48 }}>{count}</Text>
      <Pressable onPress={() => setCount((c) => c + 1)}>
        <Text style={{ color: "#0a84ff" }}>Increment</Text>
      </Pressable>
    </View>
  );
}
```

### useReducer

Use when state transitions depend on the previous state or multiple values update together.

```tsx
import { useReducer } from "react";

interface FormState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "SUBMIT" }
  | { type: "SUCCESS" }
  | { type: "FAILURE"; error: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, error: null };
    case "SUBMIT":
      return { ...state, isLoading: true, error: null };
    case "SUCCESS":
      return { ...state, isLoading: false };
    case "FAILURE":
      return { ...state, isLoading: false, error: action.error };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(formReducer, {
  email: "",
  password: "",
  isLoading: false,
  error: null,
});
```

---

## Zustand — The Client State Standard

```bash
npx expo install zustand
```

### Basic Store

```tsx
// stores/useAuthStore.ts
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Usage in Components

```tsx
import { useAuthStore } from "@/stores/useAuthStore";

export function ProfileHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;
  return <Text>{user.name}</Text>;
}
```

### Persistence with MMKV

```bash
npx expo install react-native-mmkv
```

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface SettingsState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### Slices Pattern (Large Apps)

```tsx
// stores/slices/userSlice.ts
import { StateCreator } from "zustand";

export interface UserSlice {
  user: { name: string } | null;
  setUser: (user: { name: string }) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});

// stores/slices/cartSlice.ts
export interface CartSlice {
  items: string[];
  addItem: (item: string) => void;
}

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
});

// stores/useAppStore.ts
import { create } from "zustand";
import { createUserSlice, UserSlice } from "./slices/userSlice";
import { createCartSlice, CartSlice } from "./slices/cartSlice";

export const useAppStore = create<UserSlice & CartSlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}));
```

---

## TanStack Query v5 — Server State

```bash
npx expo install @tanstack/react-query
```

### Setup

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

### useQuery — Fetching Data

```tsx
import { useQuery } from "@tanstack/react-query";

interface Post {
  id: number;
  title: string;
  body: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function PostList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
}
```

### useMutation — Creating/Updating Data

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: { title: string; body: string }) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
```

### useInfiniteQuery — Pagination

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: ({ pageParam }) =>
    fetch(`/api/posts?page=${pageParam}`).then((r) => r.json()),
  initialPageParam: 1,
  getNextPageParam: (lastPage, pages) => lastPage.nextPage ?? undefined,
});

// In FlatList
<FlatList
  data={data?.pages.flatMap((page) => page.items)}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
/>
```

---

## Context API — Correct Use Cases

**Use Context for:**
- Theme (changes rarely)
- Auth state (changes rarely)
- Locale/i18n (changes rarely)

**Never use Context for:**
- Cart items, form state, or anything that updates frequently. Every update re-renders ALL consumers.

```tsx
import { createContext, useContext, useState } from "react";

interface Auth {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<Auth>({
  token: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        token,
        login: (t) => setToken(t),
        logout: () => setToken(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Jotai — Atomic State

```bash
npx expo install jotai
```

```tsx
import { atom, useAtom } from "jotai";

// Atoms (smallest unit of state)
const countAtom = atom(0);
const doubledAtom = atom((get) => get(countAtom) * 2); // Derived

export function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubled] = useAtom(doubledAtom);

  return (
    <View>
      <Text>{count} (doubled: {doubled})</Text>
      <Pressable onPress={() => setCount((c) => c + 1)}>
        <Text>+1</Text>
      </Pressable>
    </View>
  );
}
```

---

## Decision Table

| Need | Solution |
|------|----------|
| One component's toggle/input | `useState` |
| Complex form with multiple fields | `useReducer` |
| Global client state (auth, settings) | **Zustand** |
| Server data (API calls, caching) | **TanStack Query** |
| Theme/locale | Context API |
| Granular atomic state | Jotai |
| Large team, strict conventions | Redux Toolkit (not covered — rarely needed with Zustand) |

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Zustand selector re-renders on every change | Selecting entire store | Select individual fields: `useStore(s => s.count)` |
| TanStack Query refetches on every focus | Default `refetchOnWindowFocus: true` | Set `refetchOnWindowFocus: false` for mobile |
| Context causing performance issues | Putting form state in Context | Move to Zustand or local state |
| Jotai atoms re-creating | Defining atoms inside components | Always define atoms at module level |
| Stale closures in Zustand actions | Using `state` directly instead of `set` callback | Use `set((state) => ...)` pattern |

---

## ⚡ Shortcuts & Speed Tricks

- **Zustand selectors** — always select the smallest piece: `useStore(s => s.count)`, never `useStore()`.
- **TanStack Query `staleTime: Infinity`** — for data that never changes (user profile, app config).
- **Combine Zustand + TanStack Query** — Zustand for UI state (modals, navigation), TanStack for server state (API data).
- **Devtools** — `import { devtools } from 'zustand/middleware'` wraps your store for React DevTools inspection.
- **`queryClient.setQueryData`** — update the cache directly after a mutation for instant UI feedback (optimistic update).