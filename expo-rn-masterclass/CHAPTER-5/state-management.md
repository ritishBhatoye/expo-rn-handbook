# Chapter 5: State Management

**TL;DR**
- Use `useState` for local state.
- Use Zustand for global client state (simpler than Redux).
- Use TanStack Query for server state (caching, fetching).

## Local State: useState & useReducer

Keep state as close to where it's used as possible.

```tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <View>
      <Text>{count}</Text>
      <Pressable onPress={() => setCount(c => c + 1)}>
        <Text>Increment</Text>
      </Pressable>
    </View>
  );
}
```

## Global State: Zustand

Zustand is fast, boilerplate-free, and works perfectly with React Native.

```bash
npm install zustand
```

```tsx
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

// Usage in component
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);
  // ...
}
```

## Server State: TanStack Query v5

For anything involving an API, use TanStack Query. It handles caching, retries, and loading states.

```bash
npm install @tanstack/react-query
```

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}

function Todos() {
  const { isPending, error, data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('https://api.example.com/todos').then(res => res.json()),
  });

  if (isPending) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <Text>{JSON.stringify(data)}</Text>;
}
```

## Atomic State: Jotai (Intro)

Great for complex, derived state where Context would cause too many re-renders.

```bash
npm install jotai
```

```tsx
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  // ...
}
```

## Links
- [GitHub: pmndrs/zustand](https://github.com/pmndrs/zustand)
- [GitHub: TanStack/query](https://github.com/TanStack/query)

## ⚠️ Gotchas & Common Errors

- **Error:** Zustand state not persisting across app restarts.
  - **Fix:** Use Zustand's `persist` middleware combined with MMKV or AsyncStorage.
- **Gotcha:** React Context causing massive re-renders.
  - **Fix:** Only use Context for low-frequency updates (like theme or auth). Use Zustand/Jotai for high-frequency state.

## ⚡ Shortcuts & Speed Tricks

- **Zustand Selectors:** Always select only the state you need to prevent unnecessary re-renders: `const bears = useStore(state => state.bears)`.