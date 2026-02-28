# Phase 1 — Core React & React Native Fundamentals

> This phase covers the essential React and React Native concepts that every senior developer must understand deeply. These form the foundation for all advanced topics and are heavily tested in interviews.

---

## Table of Contents

1. [React Fundamentals](#1-react-fundamentals)
   - [Virtual DOM, Reconciliation, and Diffing](#virtual-dom-reconciliation-and-diffing)
   - [Hooks Deep Dive](#hooks-deep-dive)
   - [Controlled vs Uncontrolled Components](#controlled-vs-uncontrolled-components)
   - [Functional vs Class Components](#functional-vs-class-components)
   - [Component Re-rendering and Memoization](#component-re-rendering-and-memoization)
2. [State Management](#2-state-management)
   - [Context API](#context-api)
   - [Redux Architecture](#redux-architecture)
   - [Zustand Patterns](#zustand-patterns)
   - [Async State and Caching](#async-state-and-caching)
   - [Performance Implications](#performance-implications)
3. [Navigation & Routing](#3-navigation--routing)
   - [React Navigation & Expo Router](#react-navigation--expo-router)
   - [Nested Navigators](#nested-navigators)
   - [Deep Linking & Universal Links](#deep-linking--universal-links)
   - [Navigation Lifecycle Events](#navigation-lifecycle-events)
   - [Params, State Reset, and History](#params-state-reset-and-history)
4. [Async & Offline Data](#4-async--offline-data)
   - [AsyncStorage, MMKV, SQLite](#asyncstorage-mmkv-sqlite)
   - [Offline-First Strategy](#offline-first-strategy)
   - [Conflict Resolution Patterns](#conflict-resolution-patterns)

---

## 1. React Fundamentals

### Virtual DOM, Reconciliation, and Diffing

**Interview Question:** "Explain how React's Virtual DOM works and why it improves performance."

**Key Concept:**
The Virtual DOM is an in-memory representation of the actual DOM. When state changes, React creates a new virtual DOM tree, compares it with the previous one (diffing), and calculates the minimum number of changes needed to update the real DOM (reconciliation).

```
┌─────────────────────────────────────────────────────────────────┐
│                     STATE CHANGE EVENT                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RENDER PHASE (Fast)                             │
│  React.createElement() → New Virtual DOM Tree                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DIFF PHASE (O(n) algorithm)                     │
│  Compare oldTree vs newTree → Find minimum changes              │
│                                                                  │
│  Rules:                                                         │
│  - Different element types = full replace                       │
│  - Same type = compare props/children                           │
│  - Keys identify stable elements across renders                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 COMMIT PHASE (Slow)                             │
│  Apply minimal DOM mutations                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Why it's faster:**
- Direct DOM manipulation is expensive (reflows, repaints)
- Virtual DOM batches updates and minimizes real DOM operations
- React 16+ uses Fiber architecture with incremental rendering

**Key Interview Points:**
- Virtual DOM is NOT the same as shadow DOM
- Keys must be stable, unique, and consistent across renders
- Reconciliation algorithm complexity is O(n) not O(n³)
- React 16's Fiber enables async rendering and priority levels

```tsx
// Example: Why keys matter
// BAD - Keys cause unnecessary re-creation
{items.map((item, index) => (
  <ListItem key={index} {...item} />  // ❌ Index is unstable
))}

// GOOD - Keys enable efficient reuse
{items.map((item) => (
  <ListItem key={item.id} {...item} />  // ✅ Stable identity
))}
```

---

### Hooks Deep Dive

**Interview Question:** "Explain the difference between useState and useRef. When would you choose one over the other?"

#### useState

```tsx
import { useState } from "react";

interface CounterProps {
  initialValue?: number;
}

function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const increment = () => setCount((prev) => prev + 1);

  const updateUser = () => {
    // Functional update - safe from stale closures
    setUser((prev) => prev ? { ...prev, name: "Alice" } : { name: "Alice" });
  };

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={increment} />
    </View>
  );
}
```

**Key Points:**
- Returns `[state, setter]` tuple
- Setter can take value OR function (functional update)
- Triggers re-render when called
- Initial value lazy-evaluated (can be expensive computation)

```tsx
// Lazy initialization - expensive computation runs once
const [data, setData] = useState(() => {
  const initial = expensiveComputation();
  return initial;
});
```

#### useEffect

```tsx
import { useEffect, useState } from "react";

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const data = await api.getUser(userId);
        if (!cancelled) {
          setUser(data);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    // Cleanup function - runs on unmount AND before effect re-runs
    return () => {
      cancelled = true;
    };
  }, [userId]); // Dependency array controls when effect runs

  if (loading) return <Spinner />;
  return <Text>{user?.name}</Text>;
}
```

**Dependency Array Behavior:**

| Array | Runs |
|-------|------|
| `[]` | Once on mount, once on unmount |
| `[dep]` | On mount + when `dep` changes |
| No array | Every render (anti-pattern) |
| Omitted | Every render (anti-pattern) |

**Common Mistakes:**

```tsx
// ❌ Stale closure - timer sees old count
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // Always logs 0!
  }, 1000);
  return () => clearInterval(timer);
}, []); // Missing count dependency

// ✅ Fixed with functional update OR proper dependency
useEffect(() => {
  const timer = setInterval(() => {
    setCount((c) => c + 1); // Functional update avoids stale closure
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

#### useContext

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Context Performance Gotcha:**

```tsx
// ❌ All consumers re-render on ANY context change
const ValueContext = createContext(defaultValue);

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  // Both value objects recreated every render
  return (
    <ValueContext.Provider value={{ user, theme, setUser, setTheme }}>
      <AppContent />
    </ValueContext.Provider>
  );
}

// ✅ Split contexts - only relevant consumers re-render
const UserContext = createContext(null);
const ThemeContext = createContext("dark");

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  // Each provider has stable reference
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <AppContent />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

#### useCallback

```tsx
import { useCallback, useState } from "react";

// useCallback returns a memoized callback
// Reference equality is preserved across renders

function ParentComponent() {
  const [count, setCount] = useState(0);

  // ❌ New function every render - causes child to re-render
  const handlePress = () => {
    console.log("pressed");
  };

  // ✅ Stable reference - only changes when deps change
  const handlePressMemoized = useCallback(() => {
    console.log("pressed", count);
  }, [count]);

  // ✅ For event handlers that don't need deps
  const handleReset = useCallback(() => {
    setCount(0);
  }, []); // Stable forever

  return <ChildComponent onPress={handlePressMemoized} onReset={handleReset} />;
}

const ChildComponent = memo(({ onPress, onReset }: any) => {
  // Only re-renders when onPress or onReset reference changes
  return (
    <View>
      <Pressable onPress={onPress}><Text>Press</Text></Pressable>
      <Pressable onPress={onReset}><Text>Reset</Text></Pressable>
    </View>
  );
});
```

#### useMemo

```tsx
import { useMemo } from "react";

function ExpensiveComponent({ items, filter }: Props) {
  // ❌ Recalculates every render
  const filtered = items.filter((item) => item.category === filter);

  // ✅ Only recalculates when items or filter changes
  const filtered = useMemo(
    () => items.filter((item) => item.category === filter),
    [items, filter]
  );

  // ✅ For expensive computations
  const sorted = useMemo(() => {
    return items
      .filter((item) => item.category === filter)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filter]);

  // ✅ Object/array creation - prevents new reference every render
  const config = useMemo(
    () => ({
      threshold: 0.5,
      rootMargin: "50px",
    }),
    []
  );

  return <FlatList data={filtered} renderItem={renderItem} />;
}
```

#### useRef

```tsx
import { useRef, useEffect } from "react";

function TextInputWithFocus() {
  const inputRef = useRef<TextInput>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View>
      <TextInput ref={inputRef} />
      <Button title="Focus" onPress={focusInput} />
    </View>
  );
}

function Timer() {
  const countRef = useRef(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      countRef.current += 1;
      setDisplay(countRef.current); // Trigger render
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Text>{display}</Text>;
}

function PreviousValue() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(count);

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const prevCount = prevCountRef.current;

  return (
    <View>
      <Text>Current: {count}</Text>
      <Text>Previous: {prevCount}</Text>
    </View>
  );
}
```

**useRef vs useState:**

| Aspect | useState | useRef |
|--------|----------|--------|
| Triggers re-render | Yes | No |
| Persists across renders | Yes | Yes |
| Initial value shown | Yes | No (first render) |
| Use case | UI that updates | DOM access, timers, mutable values |

---

### Controlled vs Uncontrolled Components

**Interview Question:** "What's the difference between a controlled and uncontrolled TextInput? When would you choose each?"

#### Controlled Component

```tsx
import { useState } from "react";
import { TextInput } from "react-native";

function ControlledInput() {
  const [text, setText] = useState("");

  // ✅ Single source of truth - React state
  return (
    <TextInput
      value={text}
      onChangeText={setText}
      placeholder="Type here..."
    />
  );
}
```

**Characteristics:**
- Value is driven by React state
- Single source of truth
- Easier to validate and transform input
- Can implement custom validation logic
- Better for form validation (with react-hook-form)

#### Uncontrolled Component

```tsx
import { useRef } from "react";
import { TextInput } from "react-native";

function UncontrolledInput() {
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    // ✅ Access value directly from DOM
    const value = inputRef.current?.value;
    console.log("Submitted:", value);
  };

  // ❌ Value managed by native input
  return (
    <View>
      <TextInput ref={inputRef} placeholder="Type here..." />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
```

**Characteristics:**
- Value managed by native input
- Use ref to access value when needed
- Less code for simple cases
- Better performance (no re-render on typing)
- Suitable for simple forms or when you don't need validation

**When to Use Each:**

| Scenario | Controlled | Uncontrolled |
|----------|------------|--------------|
| Form validation | ✅ | ❌ |
| Real-time formatting | ✅ | ❌ |
| Instant search | ✅ | ❌ |
| Simple login form | ✅ | ✅ |
| Performance-critical input | ❌ | ✅ |
| Default value needed | ✅ | ✅ |

---

### Functional vs Class Components

**Interview Question:** "Why do modern React/React Native projects predominantly use functional components over class components?"

```tsx
// ❌ CLASS COMPONENT (Legacy)
class Counter extends React.Component {
  state = { count: 0 };

  componentDidMount() {
    console.log("Mounted");
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.count !== this.state.count) {
      console.log("Count changed");
    }
  }

  componentWillUnmount() {
    console.log("Unmounting");
  }

  render() {
    return (
      <View>
        <Text>{this.state.count}</Text>
        <Button
          title="Increment"
          onPress={() => this.setState({ count: this.state.count + 1 })}
        />
      </View>
    );
  }
}

// ✅ FUNCTIONAL COMPONENT (Modern)
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Mounted");
    return () => console.log("Unmounting");
  }, []);

  useEffect(() => {
    console.log("Count changed");
  }, [count]);

  return (
    <View>
      <Text>{count}</Text>
      <Button title="Increment" onPress={() => setCount(c => c + 1)} />
    </View>
  );
}
```

**Advantages of Functional Components:**

1. **Less boilerplate** - No `this` keyword, no `render()` method
2. **Easier to understand** - Logic flows top-to-bottom
3. **Better performance** - Less code to execute
4. **Hooks** - Can use `useState`, `useEffect`, `useContext`, etc.
5. **Easier testing** - Pure functions are simpler to test
6. **No `this` binding issues**
7. **Better TypeScript integration**

**When Classes Might Still Be Needed:**

```tsx
// Legacy libraries that require class components
// Error boundaries (must be class components)
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong</Text>;
    }
    return this.props.children;
  }
}
```

---

### Component Re-rendering and Memoization

**Interview Question:** "Explain the React component lifecycle and when re-renders occur. How can you optimize unnecessary re-renders?"

#### When Does Re-render Happen?

```
┌─────────────────────────────────────────────────────────────────┐
│                    RE-RENDER TRIGGERS                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Parent component re-renders                                 │
│  2. Props change                                                │
│  3. State changes (useState setter)                            │
│  4. Context changes (any provider value change)                │
│  5. Hook dependencies change (useEffect, useMemo, etc.)        │
│  6. Force render (not recommended)                             │
└─────────────────────────────────────────────────────────────────┘
```

#### Render Commit Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER PHASE                                 │
│  React calculates Virtual DOM                                   │
│  - Component function runs                                      │
│  - JSX is returned                                             │
│  - No DOM changes yet!                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMMIT PHASE                                 │
│  React applies changes to DOM                                  │
│  - Updates actual DOM nodes                                     │
│  - Runs useLayoutEffect callbacks                              │
│  - Browser paints                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EFFECT PHASE                                 │
│  After paint - runs asynchronously                              │
│  - useEffect callbacks                                          │
└─────────────────────────────────────────────────────────────────┘
```

#### Memoization Strategies

```tsx
import { memo, useMemo, useCallback, useState } from "react";

// ✅ React.memo - HOC for memoizing components
const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onPress
}: {
  data: Item[];
  onPress: () => void;
}) {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <Pressable onPress={onPress}>
          <Text>{item.name}</Text>
        </Pressable>
      )}
    />
  );
});

// ✅ useMemo - memoize expensive calculations
function ListWithSorting({ items }: { items: Item[] }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  return <FlatList data={sortedItems} renderItem={renderItem} />;
}

// ✅ useCallback - memoize callback references
function Parent() {
  const [count, setCount] = useState(0);

  const handleItemPress = useCallback((id: string) => {
    console.log("Pressed:", id);
  }, []); // Stable reference

  const handleRefresh = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <List
      onItemPress={handleItemPress}
      onRefresh={handleRefresh}
    />
  );
}

// ✅ Selective context consumption
// Instead of consuming entire context
const { user, theme, setUser } = useContext(AppContext);

// Subscribe to specific value
const user = useContext(AppContext).user; // Still re-renders on any change!

// Solution: Split contexts or use subscription pattern
```

#### Common Re-render Pitfalls

```tsx
// ❌ Pitfall 1: Creating objects in render
function Component() {
  const config = {               // New object every render!
    threshold: 0.5,
    rootMargin: "10px"
  };

  return <HeavyComponent config={config} />;
}

// ✅ Fix: Use useMemo or define outside
const CONFIG = { threshold: 0.5, rootMargin: "10px" };

function Component() {
  return <HeavyComponent config={CONFIG} />;
}

// ❌ Pitfall 2: Inline arrow functions in JSX
function Component() {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Item onPress={() => handlePress(item.id)} /> // New function!
      )}
    />
  );
}

// ✅ Fix: Use useCallback
const handlePress = useCallback((id: string) => {
  // handler
}, []);

function Component() {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Item onPress={handlePress} />
      )}
    />
  );
}

// ❌ Pitfall 3: Context with object value
const AppContext = createContext<AppContextType>(null!);

function App() {
  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      {/* Any state change causes ALL consumers to re-render */}
    </AppContext.Provider>
  );
}

// ✅ Fix: Split contexts
const UserContext = createContext<UserContextType>(null!);
const ThemeContext = createContext<ThemeContextType>(null!);
```

---

## 2. State Management

### Context API

**Interview Question:** "When should you use React Context for state management? What are its limitations?"

```tsx
// Simple context for low-frequency updates
import { createContext, useContext, useState, useCallback } from "react";

interface Theme {
  primary: string;
  background: string;
  text: string;
}

const lightTheme: Theme = {
  primary: "#0a84ff",
  background: "#ffffff",
  text: "#000000",
};

const darkTheme: Theme = {
  primary: "#0a84ff",
  background: "#000000",
  text: "#ffffff",
};

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme,
    }),
    [isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

**When Context is Appropriate:**
- Theme (changes rarely)
- Auth token (changes at login/logout)
- Locale/language preference
- App-wide settings

**When NOT to Use Context:**
- Form state
- Cart items
- Any data that updates frequently
- Anything that needs computed/derived values

---

### Redux Architecture

**Interview Question:** "Explain the Redux data flow. How does it compare to Zustand or React Context?"

```tsx
import { createStore, applyMiddleware, combineReducers, Action } from "redux";
import { createLogger } from "redux-logger";

// Action Types
const INCREMENT = "counter/INCREMENT";
const DECREMENT = "counter/DECREMENT";
const SET_USER = "user/SET_USER";

// Action Creators
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });
const setUser = (user: User) => ({ type: SET_USER, payload: user });

// Reducers
function counterReducer(state = { count: 0 }, action: Action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

function userReducer(state = { user: null }, action: any) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// Store
const rootReducer = combineReducers({
  counter: counterReducer,
  user: userReducer,
});

const store = createStore(rootReducer, applyMiddleware(createLogger()));

// Usage in React
function Counter() {
  const count = useSelector((state: RootState) => state.counter.count);
  const dispatch = useDispatch();

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="+" onPress={() => dispatch(increment())} />
    </View>
  );
}
```

#### Redux Toolkit (Recommended)

```tsx
import { createSlice, configureStore, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for API calls
const fetchUser = createAsyncThunk("user/fetch", async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
    },
    clearUser: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch";
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// Typed hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
```

#### Redux Selectors

```tsx
import { createSelector } from "@reduxjs/toolkit";

// Base selector
const selectUser = (state: RootState) => state.user.data;

// Derived selector (memoized)
const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name ?? "Guest"
);

// Complex selector
const selectUserPermissions = createSelector(
  [selectUser, (state: RootState) => state.permissions],
  (user, permissions) => {
    if (!user) return [];
    return permissions.filter((p) => p.userId === user.id);
  }
);

// Usage
function UserName() {
  const name = useAppSelector(selectUserName);
  return <Text>{name}</Text>;
}
```

---

### Zustand Patterns

**Interview Question:** "How does Zustand compare to Redux? When would you choose one over the other?"

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

// Basic store
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));

// With persistence (MMKV)
const storage = new MMKV();

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "dark",
      notificationsEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);

// Slices pattern for large apps
import { StateCreator } from "zustand";

interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
}

interface CartSlice {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const createUserSlice: StateCreator<Store, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const createCartSlice: StateCreator<Store, [], [], CartSlice> = (set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  clearCart: () => set({ items: [] }),
}));

type Store = UserSlice & CartSlice;

const useStore = create<Store>()((...args) => ({
  ...createUserSlice(...args),
  ...createCartSlice(...args),
}));

// Usage
function CartBadge() {
  const itemCount = useStore((state) => state.items.length);
  return <Badge count={itemCount} />;
}
```

**Zustand vs Redux:**

| Aspect | Zustand | Redux |
|--------|---------|-------|
| Boilerplate | Minimal | Significant |
| Performance | Excellent (selector-based) | Good |
| DevTools | Optional | Built-in |
| Learning curve | Low | Moderate |
| Middleware | Manual | Built-in |
| Best for | Most React Native apps | Large teams, complex state |

---

### Async State and Caching

**Interview Question:** "How would you implement caching for API responses in React Native? What strategies would you use?"

#### TanStack Query (React Query)

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Basic fetch
function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    enabled: !!userId, // Only fetch when userId exists
  });
}

// With cache + stale-while-revalidate
function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
  });
}

// Optimistic updates
function useAddPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update
      queryClient.setQueryData(["posts"], (old: Post[]) => [
        ...old,
        { ...newPost, id: "temp" },
      ]);

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // Rollback on error
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Infinite scroll
function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
}
```

---

### Performance Implications

**Interview Question:** "Compare the performance characteristics of different state management approaches. When would each cause performance issues?"

```
┌─────────────────────────────────────────────────────────────────┐
│              STATE MANAGEMENT PERFORMANCE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOCAL STATE (useState)                                        │
│  ├── Re-renders: Component + children only                    │
│  ├── Impact: Minimal - scoped to component                     │
│  └── Best for: UI state, form inputs                           │
│                                                                 │
│  CONTEXT API                                                   │
│  ├── Re-renders: ALL consumers when value changes              │
│  ├── Impact: Can be significant for large trees                │
│  └── Best for: Theme, auth, locale (rare updates)              │
│                                                                 │
│  ZUSTAND                                                       │
│  ├── Re-renders: Only components selecting changed state       │
│  ├── Impact: Minimal - selector-based subscription             │
│  └── Best for: Most global client state                        │
│                                                                 │
│  TANSTACK QUERY                                                │
│  ├── Re-renders: Only on data changes                         │
│  ├── Impact: Minimal - built-in caching                        │
│  └── Best for: Server state, API data                          │
│                                                                 │
│  REDUX                                                         │
│  ├── Re-renders: Only with selectors                           │
│  ├── Impact: Good with proper selectors                        │
│  └── Best for: Large apps with complex state needs            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Navigation & Routing

### React Navigation & Expo Router

**Interview Question:** "Compare React Navigation with Expo Router. When would you choose each?"

#### React Navigation (Traditional)

```tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="Modal"
          component={ModalScreen}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### Expo Router (File-based)

```
app/
├── _layout.tsx          # Root layout
├── index.tsx           # / (home)
├── (tabs)/
│   ├── _layout.tsx     # Tab navigator
│   ├── index.tsx      # / (feed tab)
│   └── profile.tsx    # /profile
├── details/
│   └── [id].tsx       # /details/:id
└── (modals)/
    └── share.tsx      # /share (modal presentation)
```

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="details/[id]"
        options={{ headerShown: true, title: "Details" }}
      />
      <Stack.Screen
        name="(modals)/share"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}

// app/(tabs)/index.tsx
import { useLocalSearchParams, Link } from "expo-router";

export default function FeedScreen() {
  const { sort } = useLocalSearchParams();

  return (
    <View>
      <Link href="/details/123">Go to detail</Link>
    </View>
  );
}
```

**Comparison:**

| Aspect | React Navigation | Expo Router |
|--------|-----------------|-------------|
| Setup | Manual | Automatic | 
| Routing | Code-based | File-based |
| Deep linking | Manual config | Automatic |
| TypeScript | Manual types | Built-in |
| Learning curve | Moderate | Low |
| Flexibility | Full control | Convention-based |

---

### Nested Navigators

```tsx
// React Navigation nested navigators
function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Post" component={PostScreen} />
    </Stack.Navigator>
  );
}
```

---

### Deep Linking & Universal Links

**Interview Question:** "How do you implement deep linking in React Native? What are universal links and how do they differ from custom URL schemes?"

#### Custom URL Scheme

```json
// app.json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

```
myapp://profile/123
myapp://settings/notifications
```

#### Universal Links (iOS)

```json
// app.json
{
  "expo": {
    "extra": {
      "eas": { "projectId": "xxx" }
    }
  },
  "ios": {
    "associatedDomains": [
      "applinks:myapp.com",
      "applinks:staging.myapp.com"
    ]
  }
}
```

```
https://myapp.com/profile/123
```

#### App Links (Android)

```json
// app.json
{
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          { "scheme": "https", "host": "myapp.com", "pathPrefix": "/" }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

#### Handling Deep Links

```tsx
// expo-router handles this automatically
// For React Navigation:

import { useLinking } from "@react-navigation/native";

const linking = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      Home: "home",
      Profile: "profile/:id",
      Settings: {
        path: "settings",
        screens: {
          Notifications: "notifications",
          Privacy: "privacy",
        },
      },
    },
  },
};

function App() {
  const ref = useRef();

  useLinking(ref, linking);

  return <NavigationContainer ref={ref}>{/* ... */}</NavigationContainer>;
}
```

---

### Navigation Lifecycle Events

```tsx
import { useFocusEffect, useNavigation, useNavigationState } from "@react-navigation/native";
import { useCallback } from "react";

function ScreenWithLifecycle() {
  const navigation = useNavigation();

  // Runs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused");

      // Refresh data when screen becomes active
      fetchData();

      return () => {
        console.log("Screen unfocused");
        // Cleanup
      };
    }, [])
  );

  // Alternative: navigation events
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Focused");
    });

    return unsubscribe;
  }, [navigation]);

  // Get current route name
  const routeName = useNavigationState(
    (state) => state.routes[state.index].name
  );

  return <View />;
}
```

---

### Params, State Reset, and History

```tsx
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  // Navigate with params
  const goToProduct = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Pass state (available in navigation.state)
  const goWithState = () => {
    router.push({
      pathname: "/product/123",
      params: { from: "search" },
    });
  };

  // Reset navigation state
  const resetToHome = () => {
    router.reset({
      index: 0,
      routes: [{ name: "(tabs)" }],
    });
  };

  // Go back
  const goBack = () => {
    router.back();
  };

  // Check if can go back
  const canGoBack = navigation.canGoBack();

  return <View />;
}
```

---

## 4. Async & Offline Data

### AsyncStorage, MMKV, SQLite

**Interview Question:** "Compare AsyncStorage, MMKV, and SQLite. When would you use each?"

```tsx
// AsyncStorage - simple key-value, slow
import AsyncStorage from "@react-native-async-storage/async-storage";

// Save
await AsyncStorage.setItem("user", JSON.stringify(user));

// Read
const userJson = await AsyncStorage.getItem("user");
const user = userJson ? JSON.parse(userJson) : null;

// Multiple
await AsyncStorage.multiSet([
  ["user", JSON.stringify(user)],
  ["token", token],
]);

// Clear
await AsyncStorage.clear();

// MMKV - fast key-value, synchronous
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({
  id: "app-storage",
  encryptionKey: "encryption-key",
});

storage.set("user", JSON.stringify(user));
const userJson = storage.getString("user");
storage.delete("user");

// SQLite - relational data
import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("app.db");

// Create table
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    created_at INTEGER
  );
`);

// Insert
await db.runAsync(
  "INSERT INTO posts (id, title, body, created_at) VALUES (?, ?, ?, ?)",
  [post.id, post.title, post.body, Date.now()]
);

// Query
const posts = await db.getAllAsync<Post>(
  "SELECT * FROM posts ORDER BY created_at DESC"
);

// SQLite with SQL.js (pure JS, no native)
import initSqlJs from "sql.js";
```

**Comparison:**

| Feature | AsyncStorage | MMKV | SQLite |
|---------|--------------|------|--------|
| Speed | Slow | Fast | Medium |
| Type | Async | Sync | Async |
| Encryption | No | Yes | No |
| Query | No | No | Yes |
| Size limit | 6MB | Unlimited | Unlimited |
| Use case | Small config | User prefs, tokens | Offline data |

---

### Offline-First Strategy

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSync } from "./useSync";

// Offline-first data hook
function useOfflinePosts() {
  const queryClient = useQueryClient();

  // Fetch from API with local fallback
  const query = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const data = await fetchPosts();
        // Cache locally
        await cachePosts(data);
        return data;
      } catch (error) {
        // Return cached data on failure
        return getCachedPosts();
      }
    },
    staleTime: Infinity,
  });

  // Optimistic mutations with sync
  const mutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old: Post[]) => [
        ...old,
        { ...newPost, id: "temp", pending: true },
      ]);

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      // Queue for retry
      queueOfflineMutation({ type: "create", data: newPost });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { query, mutation };
}

// Sync queue for offline mutations
const OFFLINE_MUTATIONS_KEY = "offline_mutations";

async function queueOfflineMutation(mutation: OfflineMutation) {
  const queue = await AsyncStorage.getItem(OFFLINE_MUTATIONS_KEY);
  const mutations = queue ? JSON.parse(queue) : [];
  mutations.push({ ...mutation, timestamp: Date.now() });
  await AsyncStorage.setItem(OFFLINE_MUTATIONS_KEY, JSON.stringify(mutations));
}

async function processOfflineMutations() {
  const queue = await AsyncStorage.getItem(OFFLINE_MUTATIONS_KEY);
  if (!queue) return;

  const mutations: OfflineMutation[] = JSON.parse(queue);

  for (const mutation of mutations) {
    try {
      await processMutation(mutation);
    } catch (error) {
      console.error("Failed to process mutation:", mutation);
    }
  }

  await AsyncStorage.removeItem(OFFLINE_MUTATIONS_KEY);
}
```

---

### Conflict Resolution Patterns

```tsx
// Last-Write-Wins (simplest)
async function resolveConflict<T>(local: T, remote: T): Promise<T> {
  // Compare timestamps
  if (local.updatedAt > remote.updatedAt) {
    return local;
  }
  return remote;
}

// Merge strategy for arrays
function mergeArrays<T>(local: T[], remote: T[], key: keyof T): T[] {
  const merged = new Map();

  [...local, ...remote].forEach((item) => {
    const existing = merged.get(item[key]);
    if (!existing || item.updatedAt > existing.updatedAt) {
      merged.set(item[key], item);
    }
  });

  return Array.from(merged.values());
}

// CRDT-like merge for documents
interface CRDTDocument {
  id: string;
  content: string;
  vector: Map<string, number>; // Vector clock
}

function mergeDocuments(local: CRDTDocument, remote: CRDTDocument): CRDTDocument {
  // Simple last-write-wins for each field
  return {
    id: local.id,
    content: local.updatedAt > remote.updatedAt ? local.content : remote.content,
    vector: mergeVectors(local.vector, remote.vector),
  };
}

function mergeVectors(
  local: Map<string, number>,
  remote: Map<string, number>
): Map<string, number> {
  const merged = new Map(local);

  remote.forEach((value, key) => {
    const localValue = merged.get(key);
    if (!localValue || value > localValue) {
      merged.set(key, value);
    }
  });

  return merged;
}

// Three-way merge for git-like conflicts
interface Version {
  id: string;
  parentId: string | null;
  content: string;
}

function threeWayMerge(base: Version, local: Version, remote: Version): string {
  if (local.content === base.content) return remote.content;
  if (remote.content === base.content) return local.content;

  // Conflict - return both with markers
  return `<<<<<<< LOCAL\n${local.content}\n=======\n${remote.content}\n>>>>>>> REMOTE`;
}
```

---

## Interview Discussion Points

### Why is React Native different from web React?

1. **No DOM** - Uses native views instead of HTML elements
2. **Different primitives** - `<View>` not `<div>`, `<Text>` not `<span>`
3. **Single thread** - JS runs on main thread (unless using worker)
4. **Platform differences** - iOS/Android APIs differ
5. **No CSS** - Flexbox-based layout system

### How does React Native bridge work?

```
┌─────────────────────────────────────────────────────────────────┐
│                      JAVASCRIPT LAYER                          │
│  React Components → Virtual DOM → Bridge API                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BRIDGE (Async)                          │
│  Serializes calls → sends to native thread                     │
│  - Batch updates                                                │
│  - Event bubbling                                               │
│  - Native module calls                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NATIVE LAYER                               │
│  iOS: UIKit views                                               │
│  Android: Android Views                                         │
│  Creates actual native UI components                            │
└─────────────────────────────────────────────────────────────────┘
```

### New Architecture (Fabric + TurboModules)

- **JSI (JavaScript Interface)** - Synchronous native calls, no bridge
- **Fabric** - New rendering system with concurrent features
- **TurboModules** - Lazy-loaded native modules

---

## Summary

This foundational knowledge is critical for senior-level interviews. Focus on:

1. **Deep understanding of hooks** - Not just API, but mental model and gotchas
2. **State management trade-offs** - When to use each approach
3. **Performance implications** - How each choice affects render cycles
4. **Real-world patterns** - The code examples show production patterns

Next: Phase 2 covers Expo-specific integrations and platform features.
