# Phase 10 — Roadmap & Level-Specific Checklist

> This final phase provides a structured 12-week preparation roadmap and level-specific checklists for progressing from L0 (beginner) to L4/L5 (senior/staff engineer).

---

## Table of Contents

1. [Level-Specific Checklists](#1-level-specific-checklists)
2. [12-Week Preparation Roadmap](#2-12-week-preparation-roadmap)
3. [Quick Revision Cheat Sheet](#3-quick-revision-cheat-sheet)

---

## 1. Level-Specific Checklists

### L0 — Absolute Beginner

```
┌─────────────────────────────────────────────────────────────────┐
│                 L0 - ABSOLUTE BEGINNER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FUNDAMENTALS                                                   │
│  □ Understand what React Native is                             │
│  □ Understand what Expo is                                     │
│  □ Can create a new Expo project                                │
│  □ Understand JavaScript basics                                 │
│  □ Understand TypeScript basics                                 │
│                                                                 │
│  CORE COMPONENTS                                                │
│  □ Can use View, Text, Image, Pressable                        │
│  □ Understands Flexbox layout                                   │
│  □ Can create basic forms                                      │
│                                                                 │
│  NAVIGATION                                                    │
│  □ Can set up Expo Router                                       │
│  □ Can create basic navigation screens                          │
│                                                                 │
│  STATE                                                         │
│  □ Can use useState                                             │
│  □ Can use useEffect                                            │
│                                                                 │
│  TOOLS                                                         │
│  □ Can run app in Expo Go                                       │
│  □ Can use development build                                     │
│                                                                 │
│  DELIVERABLE: Basic todo app with navigation                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### L1 — Beginner

```
┌─────────────────────────────────────────────────────────────────┐
│                    L1 - BEGINNER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REACT FUNDAMENTALS                                            │
│  □ Understands Virtual DOM                                       │
│  □ Can explain component lifecycle                              │
│  □ Proficient with all basic hooks                             │
│  □ Understands controlled vs uncontrolled components           │
│                                                                 │
│  STATE MANAGEMENT                                              │
│  □ Can use Context API                                          │
│  □ Understands when to use different state approaches          │
│  □ Can implement global state with Zustand                     │
│                                                                 │
│  NAVIGATION                                                    │
│  □ Can implement nested navigators                              │
│  □ Can handle deep linking                                     │
│  □ Can pass parameters between screens                         │
│                                                                 │
│  API & NETWORKING                                              │
│  □ Can fetch data with fetch/axios                             │
│  □ Can implement error handling                                │
│  □ Understands local storage options                           │
│                                                                 │
│  NATIVE FEATURES                                               │
│  □ Can request permissions                                      │
│  □ Can implement push notifications                            │
│  □ Can access device location                                   │
│                                                                 │
│  STYLING                                                       │
│  □ Proficient with StyleSheet                                  │
│  □ Can implement responsive layouts                            │
│  □ Can use NativeWind                                           │
│                                                                 │
│  DELIVERABLE: Production-ready app with auth, API calls        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### L2 — Intermediate

```
┌─────────────────────────────────────────────────────────────────┐
│                   L2 - INTERMEDIATE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PERFORMANCE                                                   │
│  □ Can optimize FlatList rendering                             │
│  □ Can use FlashList effectively                               │
│  □ Understands memoization strategies                          │
│  □ Can identify and fix memory leaks                           │
│                                                                 │
│  STATE MANAGEMENT                                              │
│  □ Can implement TanStack Query                                 │
│  □ Can implement optimistic updates                             │
│  □ Can handle offline data                                      │
│  □ Understands when to use each solution                       │
│                                                                 │
│  TESTING                                                       │
│  □ Can write unit tests with Jest                              │
│  □ Can write component tests with RNTL                         │
│  □ Can mock API calls                                           │
│  □ Understands testing pyramid                                 │
│                                                                 │
│  ANIMATIONS                                                    │
│  □ Can use Reanimated 3                                        │
│  □ Can implement gesture handling                              │
│  □ Can optimize animations for UI thread                        │
│                                                                 │
│  DEPLOYMENT                                                    │
│  □ Can configure EAS builds                                     │
│  □ Can submit to App/Play Store                                │
│  □ Can implement OTA updates                                   │
│  □ Can set up CI/CD                                             │
│                                                                 │
│  ERROR HANDLING                                                │
│  □ Can implement error boundaries                               │
│  □ Can set up error monitoring (Sentry)                         │
│  □ Can handle network errors gracefully                         │
│                                                                 │
│  DELIVERABLE: Production app with full feature set             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### L3 — Advanced

```
┌─────────────────────────────────────────────────────────────────┐
│                   L3 - ADVANCED                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ARCHITECTURE                                                  │
│  □ Can design feature-sliced codebase                          │
│  □ Can implement offline-first architecture                    │
│  □ Can design scalable state management                         │
│  □ Understands monorepo patterns                               │
│                                                                 │
│  PERFORMANCE                                                   │
│  □ Can profile and diagnose performance issues                │
│  □ Can optimize large lists and complex UI                      │
│  □ Understands Hermes and bytecode compilation                 │
│  □ Can implement code splitting                                │
│                                                                 │
│  ADVANCED NATIVE                                               │
│  □ Can create custom native modules                            │
│  □ Can use JSI for performance-critical code                  │
│  □ Understands new architecture (Fabric/TurboModules)          │
│                                                                 │
│  DATA & SYNC                                                  │
│  □ Can implement conflict resolution                           │
│  □ Can design data synchronization strategies                  │
│  □ Understands CRDT concepts                                   │
│                                                                 │
│  SECURITY                                                      │
│  □ Can implement secure storage                                │
│  □ Can implement certificate pinning                           │
│  □ Understands mobile security best practices                  │
│                                                                 │
│  DELIVERABLE: Complex production app (chat, e-commerce)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### L4/L5 — Senior/Staff Engineer

```
┌─────────────────────────────────────────────────────────────────┐
│                L4/L5 - SENIOR / STAFF                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TECHNICAL LEADERSHIP                                          │
│  □ Can set technical direction for team                        │
│  □ Can design system architecture                              │
│  □ Can make build vs buy decisions                             │
│  □ Understands platform trade-offs                             │
│                                                                 │
│  CODE QUALITY                                                 │
│  □ Can establish coding standards                              │
│  □ Can implement comprehensive testing strategy                │
│  □ Can mentor junior developers                                │
│                                                                 │
│  DELIVERY                                                     │
│  □ Can lead large feature development                         │
│  □ Can manage technical debt                                  │
│  □ Can drive performance initiatives                           │
│                                                                 │
│  COMMUNICATION                                                │
│  □ Can translate business requirements to technical design   │
│  □ Can present to stakeholders                                │
│  □ Can collaborate across teams                                │
│                                                                 │
│  INNOVATION                                                   │
│  □ Can evaluate new technologies                              │
│  □ Can implement best practices from industry                 │
│  □ Can drive architectural improvements                       │
│                                                                 │
│  DELIVERABLE: Multiple shipped products, technical vision     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 12-Week Preparation Roadmap

### Weeks 1-3: Fundamentals

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEEKS 1-3: FUNDAMENTALS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 1: React Basics                                         │
│  □ Virtual DOM and reconciliation                              │
│  □ Components (functional vs class)                           │
│  □ Props and state                                             │
│  □ Basic hooks (useState, useEffect)                         │
│                                                                 │
│  Week 2: Deep Hooks & Patterns                                │
│  □ useContext and context optimization                        │
│  □ useCallback and useMemo                                    │
│  □ Custom hooks                                                │
│  □ Controlled vs uncontrolled                                  │
│                                                                 │
│  Week 3: Navigation                                           │
│  □ Expo Router fundamentals                                    │
│  □ React Navigation                                            │
│  □ Deep linking configuration                                  │
│  □ Navigation state management                                 │
│                                                                 │
│  Practice: Build a multi-screen app with navigation           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Weeks 4-6: State & Data

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEEKS 4-6: STATE & DATA                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 4: State Management                                      │
│  □ Context API deep dive                                       │
│  □ Zustand fundamentals                                        │
│  □ When to use each solution                                   │
│                                                                 │
│  Week 5: Server State                                         │
│  □ TanStack Query basics                                       │
│  □ Mutations and optimistic updates                           │
│  □ Pagination and infinite scroll                             │
│                                                                 │
│  Week 6: Networking & Storage                                  │
│  □ Axios and fetch                                             │
│  □ MMKV vs AsyncStorage                                        │
│  □ Secure storage                                              │
│                                                                 │
│  Practice: Build app with full state management               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Weeks 7-9: Platform & Performance

```
┌─────────────────────────────────────────────────────────────────┐
│                WEEKS 7-9: PLATFORM & PERFORMANCE               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 7: Native Features                                       │
│  □ Permissions handling                                         │
│  □ Push notifications                                          │
│  □ Location and sensors                                        │
│                                                                 │
│  Week 8: Performance                                          │
│  □ FlatList/FlashList optimization                            │
│  □ Memory management                                           │
│  □ Memoization strategies                                      │
│                                                                 │
│  Week 9: Animations                                           │
│  □ Reanimated 3 basics                                        │
│  □ Gesture Handler                                             │
│  □ Performance best practices                                  │
│                                                                 │
│  Practice: Add complex animations to previous projects         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Weeks 10-12: Testing, Deployment & Advanced

```
┌─────────────────────────────────────────────────────────────────┐
│           WEEKS 10-12: TESTING, DEPLOYMENT & ADVANCED          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 10: Testing                                             │
│  □ Jest unit testing                                           │
│  □ React Native Testing Library                                │
│  □ MSW for API mocking                                         │
│                                                                 │
│  Week 11: Deployment                                          │
│  □ EAS build configuration                                    │
│  □ App Store submission                                        │
│  □ OTA updates                                                 │
│  □ CI/CD setup                                                 │
│                                                                 │
│  Week 12: Architecture & Review                               │
│  □ Feature-sliced design                                       │
│  □ Offline-first patterns                                      │
│  □ Error handling patterns                                     │
│  □ Final project review                                        │
│                                                                 │
│  Deliverable: Complete production-ready app                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Quick Revision Cheat Sheet

### React Fundamentals

| Topic | Key Points |
|-------|------------|
| Virtual DOM | In-memory representation, diffing algorithm, O(n) complexity |
| Reconciliation | Component type comparison, key usage |
| useState | Triggers re-render, functional updates |
| useEffect | Runs after render, cleanup function, dependency array |
| useCallback | Memoizes function reference |
| useMemo | Memoizes computed value |
| useRef | Mutable ref, doesn't trigger render |
| useContext | Subscribes to context changes |

### State Management

| Solution | Use Case |
|----------|----------|
| useState | Local component state |
| useReducer | Complex state transitions |
| Context | Low-frequency global (theme, auth) |
| Zustand | Global client state |
| TanStack Query | Server state, caching, sync |

### Performance

| Optimization | When to Use |
|--------------|-------------|
| FlashList | 50+ items |
| getItemLayout | Fixed-height items |
| useCallback | Stable function refs |
| useMemo | Expensive computations |
| React.memo | Expensive components |
| Worklet animations | Smooth 60fps animations |

### Navigation

| Feature | Configuration |
|---------|---------------|
| URL Scheme | app.json → scheme |
| Universal Links | app.json → ios.associatedDomains |
| App Links | app.json → android.intentFilters |
| Params | useLocalSearchParams() |

### Testing

| Level | Tool | What to Test |
|-------|------|--------------|
| Unit | Jest | Utilities, stores |
| Component | RNTL | UI behavior |
| Integration | MSW | API calls |
| E2E | Maestro | User flows |

### Deployment

| Task | Command |
|------|---------|
| Build iOS | eas build --platform ios |
| Build Android | eas build --platform android |
| Submit iOS | eas submit --platform ios |
| Submit Android | eas submit --platform android |
| OTA Update | eas update --branch production |

---

## Summary

Your roadmap to senior mobile developer:

1. **L0-L1** - Master fundamentals and basic features
2. **L2** - Add performance, testing, deployment skills
3. **L3** - Architecture and complex system design
4. **L4-L5** - Technical leadership and mentorship

This comprehensive guide covers everything from beginner to senior level. Practice consistently, build real projects, and never stop learning.

Good luck with your interviews!
