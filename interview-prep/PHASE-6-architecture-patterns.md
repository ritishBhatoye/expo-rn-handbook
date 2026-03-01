# Phase 6 — Architecture & Patterns

> Senior developers must design scalable architectures. This phase covers modular design, offline-first patterns, error handling, design patterns, and scaling strategies.

---

## Table of Contents

1. [Modular & Feature-Sliced Codebase](#1-modular--feature-sliced-codebase)
2. [Offline-First Architecture](#2-offline-first-architecture)
3. [Retry, Backoff, & Idempotent Network Calls](#3-retry-backoff--idempotent-network-calls)
4. [Error Handling Patterns](#4-error-handling-patterns)
5. [Design Patterns in Mobile Context](#5-design-patterns-in-mobile-context)
6. [Scaling Large Apps](#6-scaling-large-apps)

---

## 1. Modular & Feature-Sliced Codebase

**Interview Question:** "How do you structure a large React Native codebase? What's your approach to code organization?"

### Feature-Sliced Design

```
src/
├── app/                    # App configuration, providers
│   ├── providers/
│   ├── routes/
│   └── index.tsx
├── pages/                  # Page components (screens)
│   ├── HomePage/
│   ├── ProfilePage/
│   └── SettingsPage/
├── widgets/                # Independent UI blocks
│   ├── Header/
│   ├── Footer/
│   └── Sidebar/
├── features/               # Business logic (feature slices)
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── index.ts
│   ├── products/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── index.ts
│   └── cart/
├── entities/              # Core domain entities
│   ├── User/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   ├── Product/
│   └── Order/
├── shared/                 # Shared utilities
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── process/               # Cross-feature processes
    └── onboarding/
```

### Layer Structure

```typescript
// features/auth/index.ts - Feature barrel export
export { AuthProvider, useAuth } from "./ui/AuthProvider";
export { useLogin, useLogout, useRegister } from "./model/useAuthActions";
export type { AuthUser, AuthCredentials } from "./model/types";

// features/auth/model/types.ts
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// features/auth/api/authApi.ts
import { api } from "@/shared/api";
import type { AuthUser, AuthCredentials } from "../model/types";

export const authApi = {
  login: async (credentials: AuthCredentials) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>(
      "/auth/login",
      credentials
    );
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post<{ token: string }>("/auth/refresh", {
      refreshToken,
    });
    return data.token;
  },

  getCurrentUser: async () => {
    const { data } = await api.get<AuthUser>("/auth/me");
    return data;
  },
};
```

---

## 2. Offline-First Architecture

**Interview Question:** "How do you design an offline-first mobile application?"

### Offline-First Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    OFFLINE-FIRST ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│  │   UI Layer  │ ←→  │ Sync Engine │ ←→  │ Local Store │     │
│  │             │     │             │     │   (MMKV)    │     │
│  └─────────────┘     └─────────────┘     └─────────────┘     │
│         ↓                   ↓                                    │
│  ┌─────────────┐     ┌─────────────┐                          │
│  │   Cache    │ ←→  │   Network   │ ←→  │    Remote    │    │
│  │  (TanStack)│     │   Layer     │     │    Server    │    │
│  └─────────────┘     └─────────────┘     └─────────────┘     │
│                                                                 │
│  Strategy:                                                      │
│  1. Read from local cache first                                │
│  2. Return cached data immediately                             │
│  3. Fetch from network in background                          │
│  4. Update cache with fresh data                              │
│  5. Queue mutations for when online                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Offline-First Implementation

```typescript
// offline-first/OfflineProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OfflineStore {
  isOnline: boolean;
  pendingMutations: Mutation[];
  addMutation: (mutation: Mutation) => void;
  removeMutation: (id: string) => void;
  processMutations: () => Promise<void>;
}

interface Mutation {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  data: any;
  timestamp: number;
}

const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      isOnline: true,
      pendingMutations: [],

      addMutation: (mutation) => {
        set((state) => ({
          pendingMutations: [...state.pendingMutations, mutation],
        }));
      },

      removeMutation: (id) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.filter((m) => m.id !== id),
        }));
      },

      processMutations: async () => {
        const { pendingMutations } = get();
        const failed: Mutation[] = [];

        for (const mutation of pendingMutations) {
          try {
            await processMutation(mutation);
            get().removeMutation(mutation.id);
          } catch (error) {
            failed.push(mutation);
          }
        }

        // Retry failed mutations later
        if (failed.length > 0) {
          console.warn("Failed to process mutations:", failed.length);
        }
      },
    }),
    {
      name: "offline-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to automatically sync when online
function useOfflineSync() {
  const { isOnline, processMutations } = useOfflineStore();
  const netInfo = useNetInfo();

  useEffect(() => {
    const online = netInfo.isConnected ?? false;
    useOfflineStore.setState({ isOnline: online });

    if (online) {
      processMutations();
    }
  }, [netInfo.isConnected]);

  return { isOnline: netInfo.isConnected ?? false };
}

// Offline-capable data hook
function useOfflineQuery<T>(
  key: string[],
  fetchFn: () => Promise<T>,
  getCached: () => T | null,
  setCached: (data: T) => void
) {
  const [data, setData] = useState<T | null>(getCached());
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    if (isOnline) {
      refresh();
    }
  }, [isOnline]);

  const refresh = async () => {
    try {
      setIsLoading(true);
      const fresh = await fetchFn();
      setCached(fresh);
      setData(fresh);
      setError(null);
    } catch (err) {
      setError(err as Error);
      // Use cached data on error
      const cached = getCached();
      if (cached) {
        setData(cached);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch: refresh };
}

// Mutation with offline support
function useOfflineMutation<T>(
  mutationFn: (data: T) => Promise<any>,
  invalidateQuery: () => void
) {
  const { isOnline, addMutation } = useOfflineStore();

  const mutate = async (data: T) => {
    if (isOnline) {
      try {
        await mutationFn(data);
        invalidateQuery();
      } catch (error) {
        // Queue for retry
        addMutation({
          id: crypto.randomUUID(),
          type: "CREATE",
          entity: "item",
          data,
          timestamp: Date.now(),
        });
      }
    } else {
      // Queue for later
      addMutation({
        id: crypto.randomUUID(),
        type: "CREATE",
        entity: "item",
        data,
        timestamp: Date.now(),
      });
    }
  };

  return { mutate };
}
```

---

## 3. Retry, Backoff, & Idempotent Network Calls

**Interview Question:** "How do you handle network failures gracefully?"

### Retry with Exponential Backoff

```typescript
// utils/retry.ts

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      // Retry on network errors or 5xx
      if (error.code === "NETWORK_ERROR" || error.status >= 500) {
        return true;
      }
      return false;
    },
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage
const data = await retryWithBackoff(
  () => fetchUser(userId),
  {
    maxRetries: 5,
    initialDelay: 1000,
    shouldRetry: (error) => error.status >= 500 || error.code === "ETIMEDOUT",
  }
);
```

### Idempotent Requests

```typescript
// api/createPost.ts

// Use idempotency keys to prevent duplicate creations
const idempotencyKeys = new Map<string, string>();

async function createPost(data: CreatePostData): Promise<Post> {
  // Generate or retrieve idempotency key
  const key = `create-post-${data.title}-${Date.now()}`;
  
  if (idempotencyKeys.has(key)) {
    return idempotencyKeys.get(key)!;
  }

  const promise = api.post<Post>("/posts", data, {
    headers: {
      "Idempotency-Key": key,
    },
  });

  idempotencyKeys.set(key, promise);
  return promise;
}

// Optimistic updates with rollback
async function createPostWithOptimisticUpdate(
  data: CreatePostData,
  queryClient: QueryClient
) {
  // Generate temporary ID
  const tempId = `temp-${Date.now()}`;
  
  // Optimistic update
  const optimisticPost = { ...data, id: tempId, status: "pending" };
  
  queryClient.setQueryData(["posts"], (old: Post[] = []) => [
    ...old,
    optimisticPost,
  ]);

  try {
    const realPost = await createPost(data);
    
    // Replace optimistic with real
    queryClient.setQueryData(["posts"], (old: Post[] = []) =>
      old.map((p) => (p.id === tempId ? realPost : p))
    );
    
    return realPost;
  } catch (error) {
    // Rollback on error
    queryClient.setQueryData(["posts"], (old: Post[] = []) =>
      old.filter((p) => p.id !== tempId)
    );
    throw error;
  }
}
```

---

## 4. Error Handling Patterns

### Error Boundary Pattern

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <Button title="Try Again" onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ErrorBoundary;
```

### Result Type Pattern

```typescript
// types/result.ts

type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function fetchUserSafe(userId: string): Promise<Result<User>> {
  try {
    const user = await fetchUser(userId);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Handle result
function UserComponent() {
  const { data, isLoading } = useQuery(["user", id]);

  if (isLoading) return <Loading />;

  if (!data) return <Error message="User not found" />;

  return <UserProfile user={data} />;
}

// Error union types
type ApiError =
  | { code: "NETWORK_ERROR"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "UNAUTHORIZED"; message: string }
  | { code: "VALIDATION_ERROR"; errors: ValidationError[] }
  | { code: "UNKNOWN"; message: string };

function handleApiError(error: ApiError) {
  switch (error.code) {
    case "NETWORK_ERROR":
      return showNetworkError();
    case "NOT_FOUND":
      return showNotFoundError();
    case "UNAUTHORIZED":
      return redirectToLogin();
    case "VALIDATION_ERROR":
      return showValidationErrors(error.errors);
    default:
      return showGenericError();
  }
}
```

---

## 5. Design Patterns in Mobile Context

### Singleton Pattern (Store)

```typescript
// stores/createAppStore.ts
import { create } from "zustand";

const store = create<AppState>()((set) => ({
  // ... state and actions
}));

// Singleton - always returns same store instance
export const useAppStore = store;
export { store as appStore };
```

### Observer Pattern (Subscriptions)

```typescript
// Event bus for decoupled communication
class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  publish(event: string, data?: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

export const eventBus = new EventBus();

// Usage - decoupled components
function ProductList() {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe("product-updated", (product) => {
      // Handle update
    });
    return unsubscribe;
  }, []);
}

function ProductDetail() {
  const handleUpdate = () => {
    eventBus.publish("product-updated", updatedProduct);
  };
}
```

### Factory Pattern (Component Factory)

```typescript
// components/Button/factory.tsx
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // ... other props
}

function createButton(Component: React.ComponentType<ButtonProps>) {
  return function Button({
    variant = "primary",
    size = "medium",
    ...props
  }: ButtonProps) {
    return (
      <Component
        variant={variant}
        size={size}
        {...props}
      />
    );
  };
}

// Create specialized buttons
export const PrimaryButton = createButton(BaseButton);
export const SecondaryButton = createButton(BaseButton);
```

### Repository Pattern

```typescript
// repositories/userRepository.ts
interface IUserRepository {
  getById(id: string): Promise<User>;
  getAll(): Promise<User[]>;
  create(user: CreateUserDTO): Promise<User>;
  update(id: string, user: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

class UserRepository implements IUserRepository {
  private api: API;
  private cache: Cache;

  async getById(id: string): Promise<User> {
    // Check cache first
    const cached = this.cache.get(`user:${id}`);
    if (cached) return cached;

    // Fetch from API
    const user = await this.api.get(`/users/${id}`);
    this.cache.set(`user:${id}`, user);
    return user;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user = await this.api.post("/users", data);
    this.cache.invalidate("users:all");
    return user;
  }
}

export const userRepository = new UserRepository();
```

---

## 6. Scaling Large Apps

### Monorepo Structure

```
├── apps/
│   ├── mobile/              # React Native app
│   ├── admin/               # Admin dashboard
│   └── web/                 # Web app
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Shared utilities
│   ├── types/               # Shared TypeScript types
│   ├── api-client/          # API client
│   └── constants/           # Shared constants
├── tools/                   # Build tools, scripts
├── package.json
├── turbo.json              # Turborepo config
└── tsconfig.base.json
```

### Code Splitting

```typescript
// Lazy load screens
const SettingsScreen = lazy(() => import("./screens/SettingsScreen"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <SettingsScreen />
    </Suspense>
  );
}

// Lazy load heavy components
const HeavyChart = lazy(() => import("./components/HeavyChart"));

function AnalyticsScreen() {
  return (
    <View>
      <Text>Analytics</Text>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart data={data} />
        </Suspense>
      )}
    </View>
  );
}
```

### Dynamic Imports

```typescript
// Load modules on demand
async function loadAnalytics() {
  const { Analytics } = await import("./analytics");
  return Analytics;
}

// Use in component
function AnalyticsButton() {
  const handlePress = async () => {
    const Analytics = await loadAnalytics();
    Analytics.track("button_clicked");
  };

  return <Button onPress={handlePress}>Track</Button>;
}
```

---

## Summary

Architecture skills for senior developers:

1. **Modular structure** - Feature-sliced design for maintainability
2. **Offline-first** - Local-first with background sync
3. **Retry patterns** - Exponential backoff for reliability
4. **Error handling** - Boundaries, result types, graceful degradation
5. **Design patterns** - Singleton, observer, factory, repository
6. **Scaling** - Monorepo, code splitting, lazy loading

Next: Phase 7 covers real-world case studies and failure analysis.
