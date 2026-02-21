# Chapter 8 — Performance Optimization

> **TL;DR**
> - FlashList replaces FlatList for any list with 50+ items. Set `estimatedItemSize` and you're done.
> - `React.memo`, `useMemo`, `useCallback` are tools — not defaults. Profile first, optimize second.
> - Reanimated 3 runs animations on the UI thread. If your animation stutters, it's probably running on JS.

📚 [RN Performance Docs](https://reactnative.dev/docs/performance) · 🔗 [Shopify/flash-list](https://github.com/Shopify/flash-list) · 🔗 [software-mansion/react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)

---

## FlashList over FlatList

```bash
npx expo install @shopify/flash-list
```

| Feature | FlatList | FlashList |
|---------|---------|-----------|
| Rendering | Creates new views | Recycles views |
| Blank areas | Common during scroll | Rare |
| Performance | ~30fps on complex lists | ~60fps consistently |
| Migration | — | Drop-in replacement |

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={80}       // Average item height in pixels
  keyExtractor={(item) => item.id}
/>
```

### How to Measure `estimatedItemSize`

1. Render your list with FlatList first.
2. Use `onLayout` on one item to log its height.
3. Set the average as `estimatedItemSize`.

**Wrong value?** The list still works — it just recycles slightly less efficiently. Getting within 20% is fine.

### FlatList Optimization Props (if you must use FlatList)

```tsx
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}          // First batch
  maxToRenderPerBatch={10}         // Items per scroll batch
  windowSize={5}                   // Render 5 screens of content
  removeClippedSubviews            // Free offscreen views (Android)
  getItemLayout={(_, index) => ({  // Skip measurement if items are fixed height
    length: 80,
    offset: 80 * index,
    index,
  })}
/>
```

---

## React.memo, useMemo, useCallback

### React.memo — Prevent Component Re-renders

```tsx
import { memo } from "react";

interface ItemProps {
  title: string;
  onPress: () => void;
}

// Only re-renders if title or onPress reference changes
const ItemCard = memo(function ItemCard({ title, onPress }: ItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
});
```

**When to use:** Components that receive stable props but re-render because the parent re-renders.

**When NOT to use:** Components that always get new props. `memo` adds comparison overhead.

### useCallback — Stable Function References

```tsx
// ❌ Bad — creates a new function on every render
<FlatList renderItem={({ item }) => <Text>{item.title}</Text>} />

// ✅ Good — stable reference
const renderItem = useCallback(
  ({ item }: { item: Post }) => <ItemCard title={item.title} onPress={() => openPost(item.id)} />,
  []
);
<FlatList renderItem={renderItem} />
```

### useMemo — Cache Expensive Calculations

```tsx
const filteredItems = useMemo(
  () => items.filter((item) => item.category === selectedCategory),
  [items, selectedCategory]
);
```

**Rule of thumb:** If you're not seeing a perf issue in the profiler, don't add these. They have their own cost.

---

## Reanimated 3

```bash
npx expo install react-native-reanimated
```

```javascript
// babel.config.js — add the plugin LAST
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

### Core Concepts

| Concept | Description |
|---------|-------------|
| `useSharedValue` | State that lives on the UI thread |
| `useAnimatedStyle` | Style that reacts to shared values |
| `withSpring` | Spring physics animation |
| `withTiming` | Duration-based animation |
| `worklet` | Function that runs on UI thread |

### Basic Animation

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Pressable, View, Text } from "react-native";

export function AnimatedBox() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
    opacity: withTiming(opacity.value, { duration: 200 }),
  }));

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={[
          { width: 100, height: 100, backgroundColor: "#0a84ff", borderRadius: 12 },
          animatedStyle,
        ]}
      />
      <Pressable
        onPressIn={() => {
          scale.value = 0.9;
          opacity.value = 0.7;
        }}
        onPressOut={() => {
          scale.value = 1;
          opacity.value = 1;
        }}
      >
        <Text style={{ color: "#fff", marginTop: 20 }}>Press and Hold</Text>
      </Pressable>
    </View>
  );
}
```

### Layout Animations

```tsx
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

// Items animate in/out automatically
{items.map((item) => (
  <Animated.View
    key={item.id}
    entering={FadeIn.duration(300)}
    exiting={FadeOut.duration(200)}
    layout={Layout.springify()}
  >
    <Text>{item.name}</Text>
  </Animated.View>
))}
```

### Gesture + Animation Combo

```bash
npx expo install react-native-gesture-handler
```

```tsx
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          { width: 80, height: 80, backgroundColor: "#ff375f", borderRadius: 16 },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
}
```

---

## Hermes Engine

Hermes is the default JS engine in React Native. It compiles JS to bytecode ahead of time for faster startup and lower memory.

### Verify Hermes is Active

```tsx
const isHermes = () => !!global.HermesInternal;
console.log("Hermes enabled:", isHermes()); // Should print true
```

### What Hermes Does

| Benefit | How |
|---------|-----|
| Faster cold start | AOT bytecode compilation (no JIT at startup) |
| Lower memory | Optimized garbage collector |
| Smaller bundle | Bytecode is smaller than minified JS |

---

## Bundle Size Audit

```bash
# Analyze your bundle
npx react-native-bundle-visualizer

# Or use source-map-explorer
npx expo export --platform ios
npx source-map-explorer dist/bundles/ios-*.js
```

**Common offenders:**
- `moment.js` → Replace with `date-fns` or `dayjs`
- `lodash` → Import specific functions: `import debounce from 'lodash/debounce'`
- Unused imports → Enable tree shaking, use ESLint `no-unused-imports`

---

## Profiling Tools

### React DevTools Profiler

```bash
# Opens the profiler in a standalone window
npx react-devtools
```

1. Press **Record**.
2. Interact with your app.
3. Press **Stop**.
4. Look for components with high render times or frequent re-renders.

### Performance Monitor Overlay

Press `Ctrl+M` (Android) or `Cmd+D` (iOS) → "Show Performance Monitor" → Watch:
- **JS FPS:** Should stay at 60. Drops = expensive JS work.
- **UI FPS:** Should stay at 60. Drops = expensive native rendering.
- **RAM:** Watch for memory leaks (steadily increasing).

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Reanimated `worklet` crash | Missing Babel plugin | Add `react-native-reanimated/plugin` as LAST plugin in `babel.config.js` |
| FlatList stuttering | Rendering complex components | Use `React.memo` on `renderItem` component |
| `useCallback` not helping | Dependency array includes object/array | Stabilize dependencies or use a ref |
| Hermes not active | Using old Expo SDK | Hermes is default in SDK 49+, verify with `global.HermesInternal` |
| Bundle too large | Importing entire libraries | Use tree-shakeable imports: `import { debounce } from 'lodash/debounce'` |

---

## ⚡ Shortcuts & Speed Tricks

- **`estimatedItemSize`** — measure ONE item, set it, get 10x list performance.
- **`removeClippedSubviews`** — free Android memory for offscreen FlatList items.
- **Reanimated `Layout.springify()`** — instant list reorder animations with one line.
- **Profile before optimizing** — `React.memo` everywhere is slower than no memo at all if props always change.
- **`useAnimatedGestureHandler` is deprecated** — use `Gesture.Pan()` from RNGH v2 instead.