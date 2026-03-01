# Phase 8 — Interview & Whiteboard Prep

> This phase provides comprehensive interview preparation with common questions, whiteboard walkthroughs, and communication guidance.

---

## Table of Contents

1. [Common Interview Questions](#1-common-interview-questions)
2. [Follow-up Questions & Answers](#2-follow-up-questions--answers)
3. [Whiteboard Walkthroughs](#3-whiteboard-walkthroughs)
4. [Common Mistakes Candidates Make](#4-common-mistakes-candidates-make)
5. [Behavioral & Technical Communication](#5-behavioral--technical-communication)

---

## 1. Common Interview Questions

### React Fundamentals

**Q1: Explain the difference between Virtual DOM and Real DOM.**

> The Virtual DOM is an in-memory representation of the Real DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous (diffing), and only updates the necessary parts of the Real DOM. This is more efficient than directly manipulating the Real DOM for every change.

**Q2: What is reconciliation in React?**

> Reconciliation is React's algorithm for diffing the Virtual DOM trees and determining which changes need to be applied to the Real DOM. It uses heuristics and runs in O(n) complexity.

**Q3: When does a component re-render?**

> A component re-renders when:
> - Parent re-renders
> - Props change
> - State changes via setState
> - Context value changes
> - useEffect/useMemo/useCallback dependencies change

**Q4: Explain useEffect dependency array behavior.**

> - `[]` - Runs on mount and unmount only
> - `[dep]` - Runs on mount and when dep changes
> - No array - Runs on every render (anti-pattern)

---

### State Management

**Q5: Compare Redux, Zustand, and Context API.**

| Aspect | Redux | Zustand | Context |
|--------|-------|---------|---------|
| Boilerplate | High | Low | Low |
| Performance | Good | Excellent | Poor for frequent updates |
| DevTools | Built-in | Optional | None |
| Learning curve | High | Low | Low |
| Use case | Large apps | Most apps | Theme/auth only |

**Q6: When would you use TanStack Query?**

> TanStack Query is ideal for:
> - Server state (API data)
> - Caching and deduplication
> - Optimistic updates
> - Pagination/infinite scroll
> - Background refetching

**Q7: How do you prevent stale closures in useEffect?**

```typescript
// Problem
useEffect(() => {
  setInterval(() => {
    console.log(count); // Always logs 0!
  }, 1000);
}, []);

// Solution 1: Functional update
useEffect(() => {
  setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);
}, []);

// Solution 2: Use ref
const countRef = useRef(0);
useEffect(() => {
  const interval = setInterval(() => {
    countRef.current += 1;
    console.log(countRef.current);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

---

### Performance

**Q8: How would you optimize a slow FlatList?**

1. Use FlashList instead of FlatList
2. Provide `estimatedItemSize`
3. Memoize `renderItem` and `keyExtractor`
4. Use `getItemLayout` for fixed-height items
5. Set `removeClippedSubviews={true}` on Android
6. Adjust `windowSize`, `initialNumToRender`, `maxToRenderPerBatch`

**Q9: When should you NOT use React.memo?**

- When props always change between renders
- When the component is very simple (memoization overhead > render time)
- When comparing props is expensive

**Q10: What's the difference between useMemo and useCallback?**

```typescript
// useMemo - caches a computed VALUE
const memoizedValue = useMemo(() => expensiveCalculation(a, b), [a, b]);

// useCallback - caches a FUNCTION REFERENCE
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

---

### Navigation

**Q11: Explain React Navigation vs Expo Router.**

> React Navigation is a traditional navigation library with imperative API. You manually define routes and navigate programmatically. Expo Router is file-based - file structure determines routes. It's built on React Navigation and recommended for new Expo projects.

**Q12: How do you handle deep linking?**

1. Configure URL scheme in app.json
2. For iOS universal links, configure associatedDomains
3. For Android app links, configure intentFilters
4. Expo Router handles automatically; React Navigation needs linking config

---

### Testing

**Q13: What testing strategies do you use?**

- Unit tests: Jest for utilities, stores, business logic
- Component tests: React Native Testing Library for UI
- Integration tests: MSW for API mocking
- E2E tests: Maestro for user flows

**Q14: How do you mock modules in Jest?**

```typescript
// Mock entire module
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock specific function
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));
```

---

## 2. Follow-up Questions & Answers

### Deep Dives

**Q: Why does React.memo not prevent re-renders when props contain objects?**

> Because React.memo does shallow comparison. If you pass a new object each render, it will always be "different."

```typescript
// Won't prevent re-renders
function Parent() {
  return <Child style={{ color: "red" }} />; // New object each render
}

// Solution 1: Memoize the object
function Parent() {
  const style = useMemo(() => ({ color: "red" }), []);
  return <Child style={style} />;
}

// Solution 2: Pass primitive values
function Parent() {
  return <Child color="red" />; // Child compares primitives
}

// Solution 3: Custom comparison
const Child = memo(
  Component,
  (prev, next) => prev.color === next.color
);
```

**Q: Explain the difference between optimistic updates and pessimistic updates.**

> **Optimistic:** Update UI immediately before server responds. Rollback if server fails.
>
> **Pessimistic:** Wait for server response before updating UI.
>
> Use optimistic for better UX on fast networks; pessimistic for critical operations (payments).

---

## 3. Whiteboard Walkthroughs

### 45-Minute Walkthrough: Build a Product Listing

**Time allocation:**
- 5 min: Clarify requirements
- 10 min: Architecture design
- 15 min: Implementation details
- 10 min: Edge cases and optimizations
- 5 min: Q&A

```
┌─────────────────────────────────────────────────────────────────┐
│                 45-MINUTE WHITEBOARD STRUCTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REQUIREMENTS CLARIFICATION (5 min)                         │
│     - User stories                                             │
│     - Features needed                                          │
│     - Platform requirements                                    │
│                                                                 │
│  2. ARCHITECTURE (10 min)                                      │
│     ┌──────────────┐                                          │
│     │  UI Layer    │                                            │
│     │  FlatList    │                                           ──────┬ │
│     └───────┘                                          │
│            ↓                                                   │
│     ┌──────────────┐                                          │
│     │  State       │ ─→ Zustand + TanStack Query              │
│     │  Management  │                                            │
│     └──────┬───────┘                                          │
│            ↓                                                   │
│     ┌──────────────┐                                          │
│     │  API Layer   │                                            │
│     └──────────────┘                                          │
│                                                                 │
│  3. IMPLEMENTATION (15 min)                                    │
│     - Component structure                                       │
│     - Data fetching                                            │
│     - State updates                                            │
│                                                                 │
│  4. EDGE CASES (10 min)                                        │
│     - Empty states                                             │
│     - Error handling                                           │
│     - Offline support                                          │
│     - Performance                                              │
│                                                                 │
│  5. Q&A (5 min)                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 30-Minute Walkthrough: Offline-First Data Sync

**Time allocation:**
- 3 min: Problem understanding
- 7 min: Design
- 12 min: Code walkthrough
- 5 min: Conflict resolution
- 3 min: Q&A

---

## 4. Common Mistakes Candidates Make

### Technical Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Not considering performance | Bad UX | Profile before optimizing |
| Over-engineering solutions | Wasted time | Start simple |
| Not handling errors | Crashes | Always use try/catch |
| Skipping tests | Bugs | Test critical paths |
| Not asking clarifying questions | Wrong solution | Ask before coding |

### Communication Mistakes

- **Not thinking out loud** - Interviewer can't assess your process
- **Jumping to code** - Without explaining the approach
- **Ignoring feedback** - When interviewer hints at better solution
- **Not admitting what you don't know** - Be honest, show willingness to learn

---

## 5. Behavioral & Technical Communication

### STAR Method for Behavioral Questions

```
Situation: Set the context
Task: Describe your responsibility  
Action: Explain what you did
Result: Share the outcome
```

**Example: "Tell me about a time you fixed a performance issue."**

> **Situation:** At my previous job, we had a product listing screen that would freeze when users scrolled through more than 100 items.
>
> **Task:** As the lead mobile developer, I needed to identify and fix the performance bottleneck.
>
> **Action:** I profiled the app using React DevTools and found that `renderItem` was creating new function references on every render. I:
> 1. Memoized the renderItem using useCallback
> 2. Switched from FlatList to FlashList for better recycling
> 3. Added getItemLayout to skip measurement
>
> **Result:** The scroll framerate improved from 30fps to 60fps, and user complaints about the listing screen dropped by 80%.

### Technical Communication Tips

1. **Use precise terminology** - "useCallback returns a memoized function" not "it makes the function faster"
2. **Draw diagrams** - Visualize architecture before code
3. **Ask clarifying questions** - "What platform?" "What's the scale?"
4. **Think out loud** - Share your reasoning process
5. **Admit uncertainty** - "I'm not 100% sure, but I'd investigate..."

---

## Summary

Interview preparation checklist:

1. **Fundamentals** - Virtual DOM, hooks, reconciliation
2. **State management** - When to use each solution
3. **Performance** - Profiling, optimization strategies
4. **Testing** - Unit, component, E2E approaches
5. **Communication** - STAR method, thinking out loud
6. **Whiteboard** - Structure your walkthroughs

Next: Phase 9 covers visuals and documentation patterns.
