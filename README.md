# 🧠 react-native-daily

![Updated Daily](https://img.shields.io/badge/Updated-Daily-brightgreen)
![Expo SDK Latest](https://img.shields.io/badge/Expo%20SDK-55%20(Beta)-blue)
![React Native Latest](https://img.shields.io/badge/React%20Native-0.84-cyan)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange)

The single deepest repository for Expo & React Native mastery. Zero fluff. Pure implementation. Covering everything from Level 0 to Staff/Architect level.

---

## 📋 Table of Contents
- [📚 INTERVIEW PREP GUIDE](#-interview-prep-guide)
- [🟢 LEVEL 0 — ABSOLUTE BEGINNER](#-level-0--absolute-beginner)
- [🟡 LEVEL 1 — BEGINNER](#-level-1--beginner)
- [🟠 LEVEL 2 — INTERMEDIATE](#-level-2--intermediate)
- [🔴 LEVEL 3 — ADVANCED](#-level-3--advanced)
- [🟣 LEVEL 4 — PRODUCTION & DEPLOYMENT](#-level-4--production--deployment)
- [⚫ LEVEL 5 — STAFF / ARCHITECT LEVEL](#-level-5--staff--architect-level)
- [⚡ MASTER COMMAND REFERENCE](#-master-command-reference)
- [✂️ THE SNIPPET VAULT](#-the-snippet-vault)
- [🐛 DEBUGGING GOLDBANK](#-debugging-goldbank)

---

# 📚 INTERVIEW PREP GUIDE

> A comprehensive 10-phase interview preparation guide covering everything from fundamentals to senior-level topics.

## 📖 Phases

| Phase | Topic | File |
|-------|-------|------|
| 1 | Core React & React Native Fundamentals | [PHASE-1-core-react-fundamentals.md](interview-prep/PHASE-1-core-react-fundamentals.md) |
| 2 | Expo & Platform Integrations | [PHASE-2-expo-platform-integrations.md](interview-prep/PHASE-2-expo-platform-integrations.md) |
| 3 | Performance & Optimization | [PHASE-3-performance-optimization.md](interview-prep/PHASE-3-performance-optimization.md) |
| 4 | Testing & QA | [PHASE-4-testing-qa.md](interview-prep/PHASE-4-testing-qa.md) |
| 5 | Deployment & Production | [PHASE-5-deployment-production.md](interview-prep/PHASE-5-deployment-production.md) |
| 6 | Architecture & Patterns | [PHASE-6-architecture-patterns.md](interview-prep/PHASE-6-architecture-patterns.md) |
| 7 | Case Studies & Failure Analysis | [PHASE-7-case-studies-failure-analysis.md](interview-prep/PHASE-7-case-studies-failure-analysis.md) |
| 8 | Interview & Whiteboard Prep | [PHASE-8-interview-whiteboard-prep.md](interview-prep/PHASE-8-interview-whiteboard-prep.md) |
| 9 | Visuals & Documentation | [PHASE-9-visuals-documentation.md](interview-prep/PHASE-9-visuals-documentation.md) |
| 10 | Roadmap & Level Checklist | [PHASE-10-roadmap-checklist.md](interview-prep/PHASE-10-roadmap-checklist.md) |

---

# 🟢 LEVEL 0 — ABSOLUTE BEGINNER
**Difficulty:** 🟢 Beginner | **Badge:** � Newbie

## A — What is React Native & Expo?
- **React Native:** A framework that compiles JavaScript to native platform primitives. It is NOT a webview.
- **Expo:** A full-featured framework built on top of React Native. It handles the "native" complexity for you using a Managed Workflow.
- **EAS:** Cloud build and submission suite.
- **Decision:** In 2026, 99.9% of apps should start with Expo.

## B — Environment Setup (Mac/Win/Linux)
1. **Node.js (LTS v22+):** `brew install node`
2. **Watchman:** `brew install watchman` (Mac only, avoids file sync errors).
3. **Ruby & Cocoapods:** `sudo gem install cocoapods` (Required for iOS local builds).
4. **IDEs:** VS Code + [Expo Tools Extension] is the industry standard.

## C — First App in 5 Minutes (Implementation)
```bash
npx create-expo-app@latest MyApp --template blank-typescript
cd MyApp
npx expo start
```
- **Structure:**
  - `/app`: Files for Expo Router.
  - `app.json`: Global configuration.
  - `node_modules`: Dependencies.

## D — JS/TS Essentials
- **Arrow Functions:** `const Component = () => ...`
- **Optional Chaining:** `user?.profile?.id`
- **Destructuring:** `const { item } = props;`
- **Async/Await:** `const res = await api.get();`

---

# 🟡 LEVEL 1 — BEGINNER
**Difficulty:** 🟡 Intermediate | **Badge:** 🧱 Builder

## E — Core Components Deep Dive

### 1. View
- **What:** The equivalent of `<div>`.
- **When:** Layout, grouping, containers.
- **Key Props:** `style`, `onLayout`, `pointerEvents`.
```tsx
<View style={{ flex: 1, backgroundColor: '#f0f0f0' }}> ... </View>
```

### 2. Text
- **What:** The only way to show strings.
- **When:** Any typography.
- **Key Props:** `numberOfLines`, `selectable`, `ellipsizeMode`.
```tsx
<Text numberOfLines={2} style={{ fontSize: 18 }}>Truncated long text...</Text>
```

### 3. Image
- **What:** Displays local/remote images.
- **When:** Photos, icons, backgrounds.
- **Key Props:** `source`, `resizeMode`, `onLoad`.
```tsx
<Image source={{ uri: 'https://...' }} style={{ width: 100, height: 100 }} />
```

### 4. FlatList (Performance Lists)
- **What:** Optimized list renderer.
- **When:** Any list longer than 10 items.
- **Key Props:** `data`, `renderItem`, `keyExtractor`, `initialNumToRender`.
```tsx
<FlatList
  data={Array(100).fill({id: '1'})}
  renderItem={({item}) => <Text>{item.id}</Text>}
  keyExtractor={item => item.id}
/>
```

## F — Styling: Flexbox and Dimensions
- **Flex Direction:** `column` (default in RN), `row`.
- **Justify Content:** `center`, `flex-start`, `space-between`, `space-around`.
- **Align Items:** `center`, `stretch`, `flex-end`.
- **ASCII Diagram:**
```text
column (Vertical)          row (Horizontal)
+-----+                    +-----------+
| [A] |                    | [A] [B] [C] |
| [B] |                    +-----------+
| [C] |
+-----+
```

## G — Hooks Masterclass

| Hook | Definition | When to Use | Code Snippet |
|------|------------|-------------|--------------|
| `useState` | Local reactive state | Toggles, counters, inputs | `const [val, set] = useState(0);` |
| `useEffect`| Lifecycle management | API calls, subscriptions | `useEffect(() => { load() }, []);` |
| `useRef` | Direct reference | Input focus, animation vals | `const inputRef = useRef(null);` |
| `useMemo` | Cached value | Heavy calculations | `const val = useMemo(() => calc(a), [a]);` |

---

# 🟠 LEVEL 2 — INTERMEDIATE
**Difficulty:** 🟠 Advanced | **Badge:** 🚀 Rocket

## H — Navigation: Expo Router (The 2026 Way)
- **File-based Routing:** Folders/files in `/app` map to URLs.
- **Tabs Layout:**
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
export default () => <Tabs />;
```
- **Dynamic Routes:** `app/user/[id].tsx` accessible via `useLocalSearchParams()`.
- **Linking:** `import { Link } from 'expo-router';`

## I — State Management: Zustand vs TanStack
- **Zustand (Global Store):**
```typescript
import { create } from 'zustand';
const useStore = create((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}));
```
- **TanStack Query (Async Cache):**
```typescript
const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
```

## J — Data Fetching: API Patterns
- **Axios Interceptors:** Global token injection.
- **Error Handling:** Centralized logging with Sentry.
- **Offline First:** Cache query data with `persistQueryClient`.

## K — Forms: React Hook Form + Zod
- **Validation:** Type-safe forms with `zodResolver`.
```tsx
const schema = z.object({ email: z.string().email() });
const { control, handleSubmit } = useForm({ resolver: zodResolver(schema) });
```

---

# 🔴 LEVEL 3 — ADVANCED
**Difficulty:** 🔴 Expert | **Badge:** 🪄 Wizard

## M — Animations: Reanimated 3
- **Shared Values:** `useSharedValue(0)` - Runs on UI thread.
- **Animated Styles:** `useAnimatedStyle(() => ({ opacity: withTiming(sv.value) }))`.
- **Springs:** `withSpring(1, { damping: 10 })`.

## N — Gestures: Gesture Handler (RNGH)
- **PanGesture:** Drag items around.
- **TapGesture:** Complex double/triple tap logic.
```tsx
const pan = Gesture.Pan().onUpdate((e) => { offset.value = e.translationX; });
```

## O — Performance Optimization
- **FlashList:**shopify/flash-list. 10x faster than FlatList.
- **VirtualizedList:** Rule of thumb - don't nest ScrollViews.
- **Hermes:** Check `global.HermesInternal` to ensure bytecode execution.

## P — Native Modules & Nitro
- **Expo Modules API:** Swift/Kotlin code wrapped in TS.
- **Nitro Modules (2026):** Zero-bridge native calls via JSI/C++.

---

# 🟣 LEVEL 4 — PRODUCTION & DEPLOYMENT
**Difficulty:** 🟣 Staff | **Badge:** 🚢 Captain

## R — EAS: Build, Submit, Update
- **Builds:** `eas build --platform all --profile production`.
- **Updates:** `eas update`. Pushes bugfixes to users instantly.
- **Store Submission:** `eas submit`. Automated Play/App Store logic.

## S — Security Best Practices
- **SecureStore:** For JWTs and sensitive data.
- **Certificate Pinning:** Protect against Man-in-the-Middle.
- **JSCore Isolation:** Prevent script injection.

## U — Auth Flows: Social + JWT
- `expo-auth-session` is the gold standard for Google/Apple/Facebook login.

---

# ⚫ LEVEL 5 — STAFF / ARCHITECT LEVEL
**Difficulty:** ⚫ Architect | **Badge:** 🏛️ Architect

## W — Architecture: Feature-Sliced Design
- `src/features/feature-name`
  - `/api`
  - `/components`
  - `/hooks`
  - `/store`

## X — Testing Strategy
- **Jest:** Unit testing logic.
- **React Native Testing Library (RNTL):** Component interaction tests.
- **Maestro:** E2E user flow tests (Recommended over Detox in 2026).

---

# ⚡ MASTER COMMAND REFERENCE

| Command | Definition |
|---------|------------|
| `npx expo install <pkg>` | Installs version-synced package |
| `npx expo doctor` | Checks SDK/dependency health |
| `npx expo prebuild` | Generates /ios and /android folders |
| `eas build:list` | Show cloud build history |

---

# ✂️ THE SNIPPET VAULT
**Haptic Trigger:**
```typescript
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
```

**Dark Mode Hook:**
```typescript
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
```

---

# 🐛 DEBUGGING GOLDBANK
- **Issue:** `Network Request Failed` (Android).
- **Fix:** Map `localhost` to `10.0.2.2`.
- **Issue:** `Invariant Violation: Text strings must be rendered within a <Text> component`.
- **Fix:** Wrap floating text or comments `{} // comment` inside `<Text>`.

---

## 🏗️ Contributing
PRs must include: Level, Section, and Definition -> Usage -> Code block.

---
*Maintained by the React Native Daily Staff. Feb 21, 2026.*
