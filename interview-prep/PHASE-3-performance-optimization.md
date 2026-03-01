# Phase 3 — Performance & Optimization

> Performance is what separates senior developers from juniors. This phase covers critical optimization techniques for React Native apps, including list rendering, image handling, memory management, and animations.

---

## Table of Contents

1. [FlatList and SectionList Optimization](#1-flatlist-and-sectionlist-optimization)
2. [Image & Media Optimization](#2-image--media-optimization)
3. [Memory Leak Prevention](#3-memory-leak-prevention)
4. [useMemo, React.memo, and useCallback](#4-usememo-reactmemo-and-usecallback)
5. [Performance Profiling Tools](#5-performance-profiling-tools)
6. [Animations with Reanimated](#6-animations-with-reanimated)

---

## 1. FlatList and SectionList Optimization

**Interview Question:** "How would you optimize a FlatList that's rendering slowly? What are the key optimization props?"

### FlatList Deep Dive

```tsx
import { FlatList, View, Text, RefreshControl } from "react-native";
import { useCallback, useMemo, useState } from "react";

interface Item {
  id: string;
  title: string;
  subtitle: string;
  avatarUrl: string;
}

interface OptimizedFlatListProps {
  data: Item[];
  onItemPress: (id: string) => void;
  onRefresh?: () => void;
}

// ❌ Unoptimized - causes frequent re-renders
function UnoptimizedFlatList({ data, onItemPress }: OptimizedFlatListProps) {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <ListItem
          item={item}
          onPress={() => onItemPress(item.id)}
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

// ✅ Optimized with all best practices
function OptimizedFlatList({
  data,
  onItemPress,
  onRefresh,
}: OptimizedFlatListProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Memoize renderItem to maintain reference stability
  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <MemoizedListItem
        item={item}
        onPress={onItemPress}
      />
    ),
    [onItemPress]
  );

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: Item) => item.id, []);

  // Provide itemLayout for fixed-height items - skip measurement
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80, // Item height in pixels
      offset: 80 * index,
      index,
    }),
    []
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  }, [onRefresh]);

  // Separators are more efficient than mapping
  const ItemSeparator = useCallback(
    () => <View style={{ height: 1, backgroundColor: "#eee" }} />,
    []
  );

  // List empty component
  const ListEmpty = useCallback(
    () => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No items</Text>
      </View>
    ),
    []
  );

  // List header
  const ListHeader = useCallback(
    () => (
      <View style={{ padding: 16, backgroundColor: "#f5f5f5" }}>
        <Text style={{ fontWeight: "bold" }}>
          {data.length} items
        </Text>
      </View>
    ),
    [data.length]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}

      // Window size - how many screens to render
      windowSize={5}

      // Initial render count
      initialNumToRender={10}

      // Items per batch
      maxToRenderPerBatch={10}

      // Remove off-screen items (Android)
      removeClippedSubviews={true}

      // Disable virtualized list warnings
      virtualizedListProps={{
        getItem: undefined, // Prevents warnings when using getItemLayout
      }}

      // Refresh control
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }

      // Separators
      ItemSeparatorComponent={ItemSeparator}

      // Empty state
      ListEmptyComponent={ListEmpty}

      // Header
      ListHeaderComponent={ListHeader}

      // Optimizations
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}

      // Accessibility
      accessibilityLabel="Item list"
      accessibilityHint="Swipe up or down to browse items"
    />
  );
}

// Memoize the item component
const MemoizedListItem = memo(
  function ListItem({
    item,
    onPress,
  }: {
    item: Item;
    onPress: (id: string) => void;
  }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemContainer,
          pressed && styles.itemPressed,
        ]}
        onPress={() => onPress(item.id)}
      >
        <Image
          source={{ uri: item.avatarUrl }}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </Pressable>
    );
  },
  // Custom comparison
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.item.subtitle === nextProps.item.subtitle
    );
  }
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    height: 80,
    alignItems: "center",
  },
  itemPressed: {
    backgroundColor: "#f0f0f0",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});
```

### FlashList (Shopify)

```tsx
import { FlashList } from "@shopify/flash-list";

function FlashListExample({ data }: { data: Item[] }) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <ListItem item={item} />
      )}
      estimatedItemSize={80} // Required! Average item height in pixels
      keyExtractor={(item) => item.id}

      // Additional optimizations
      numColumns={2} // For grid layouts
      initialScrollIndex={0} // Start at specific index

      // Performance tuning
      drawDistance={200} // How far below viewport to render

      // Override estimated size for specific items
      getItemType={(item) => item.isFeatured ? "featured" : "regular"}
    />
  );
}

// With different item types
function MixedFlashList({ data }: { data: Item[] }) {
  return (
    <FlashList
      data={data}
      renderItem={({ item, index }) => {
        if (item.type === "featured") {
          return <FeaturedItem item={item} />;
        }
        return <RegularItem item={item} />;
      }}
      estimatedItemSize={200} // Average
      keyExtractor={(item) => item.id}
      getItemType={(item) => item.type === "featured" ? "featured" : "regular"}
    />
  );
}
```

### SectionList Optimization

```tsx
import { SectionList, SectionListData } from "react-native";

interface Section {
  title: string;
  data: Item[];
}

function OptimizedSectionList({ sections }: { sections: Section[] }) {
  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<Item, Section> }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ListItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  // Sticky section headers
  const stickySectionHeadersEnabled = true;

  return (
    <SectionList
      sections={sections}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      keyExtractor={keyExtractor}

      // Section-specific optimization
      stickySectionHeadersEnabled={stickySectionHeadersEnabled}

      // Initial render
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}

      // Item layout - important for sections too!
      getItemLayout={(data, index) => {
        // Calculate section offset first
        // Then item offset within section
        return {
          length: 60,
          offset: 60 * index,
          index,
        };
      }}
    />
  );
}
```

---

## 2. Image & Media Optimization

**Interview Question:** "What strategies would you use to optimize image loading in React Native? How does expo-image improve performance?"

### expo-image Component

```tsx
import { Image } from "expo-image";
import { useState } from "react";

function OptimizedImage({
  uri,
  placeholder,
  style,
}: {
  uri: string;
  placeholder?: string;
  style?: ViewStyle;
}) {
  return (
    <Image
      source={{ uri }}
      style={style}

      // Content fit
      contentFit="cover" // cover, contain, fill, none, scale-down

      // Transition animation
      transition={300}

      // Blur placeholder
      placeholder={placeholder}
      blurRadius={10}

      // Caching
      cachePolicy="memory-disk" // memory, disk, none

      // Priority (for images above fold)
      priority="high"

      // Resize
      resizeMode="cover"

      // Native events
      onLoad={(event) => {
        console.log("Image loaded:", event.source);
      }}
      onError={(error) => {
        console.error("Image load error:", error);
      }}
    />
  );
}

// Blur hash placeholder
const blurHash = "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.";

function ImageWithBlurHash({ uri }: { uri: string }) {
  return (
    <Image
      source={{ uri }}
      placeholder={{ blurHash }}
      style={{ width: 200, height: 200 }}
      transition={200}
    />
  );
}

// Lazy loading images
function LazyImageList({ images }: { images: string[] }) {
  return (
    <FlatList
      data={images}
      renderItem={({ item }) => (
        <OptimizedImage uri={item} style={{ height: 200 }} />
      )}
      keyExtractor={(item) => item}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={3}
    />
  );
}
```

### Image Caching Strategy

```tsx
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "image-cache" });

interface CachedImageProps {
  uri: string;
  fallbackUri?: string;
  style?: ViewStyle;
}

function CachedImage({ uri, fallbackUri, style }: CachedImageProps) {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCachedImage();
  }, [uri]);

  const loadCachedImage = async () => {
    try {
      // Check cache first
      const cached = storage.getString(`image:${uri}`);
      if (cached) {
        setCachedUri(cached);
        setLoading(false);
        return;
      }

      // Cache miss - use original
      setCachedUri(uri);
      setLoading(false);
    } catch (error) {
      setCachedUri(fallbackUri ?? uri);
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={[style, { backgroundColor: "#eee" }]} />;
  }

  return (
    <Image
      source={{ uri: cachedUri ?? fallbackUri }}
      style={style}
      cachePolicy="disk"
    />
  );
}

// Prefetching images
function prefetchImages(uris: string[]) {
  Image.prefetch(uris);
}

// Clear image cache
function clearImageCache() {
  storage.clearAll();
}
```

### Video Optimization

```tsx
import { Video, ResizeMode } from "expo-av";

function OptimizedVideo({
  uri,
  posterUri,
}: {
  uri: string;
  posterUri?: string;
}) {
  return (
    <Video
      source={{ uri }}
      style={{ width: 300, height: 200 }}

      // Poster image while loading
      posterSource={{ uri: posterUri }}
      usePoster={!!posterUri}

      // Resize mode
      resizeMode={ResizeMode.COVER}

      // Controls
      useNativeControls

      // Looping
      isLooping

      // Playback
      shouldPlay={false}
      isMuted={false}
      volume={1.0}

      // Optimization
      progressUpdateIntervalMillis={500}

      // Events
      onLoad={(status) => {
        console.log("Video loaded:", status);
      }}
      onError={(error) => {
        console.error("Video error:", error);
      }}
    />
  );
}

// Video thumbnails
async function generateVideoThumbnail(videoUri: string) {
  const asset = await MediaLibrary.createAssetAsync(videoUri);
  return asset.uri;
}
```

---

## 3. Memory Leak Prevention

**Interview Question:** "How do you identify and prevent memory leaks in React Native? What are common causes?"

### Common Memory Leaks

```tsx
import { useEffect, useRef, useCallback } from "react";
import { Timer } from "react-native";

// ❌ Memory leak: setInterval not cleared
function LeakyComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Tick");
    }, 1000);
    // Missing: return () => clearInterval(interval);
  }, []);

  return <Text>Leaking...</Text>;
}

// ✅ Fixed: Clear interval on unmount
function FixedComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Tick");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Text>Fixed!</Text>;
}

// ❌ Memory leak: Event listener not removed
function LeakyEventComponent() {
  useEffect(() => {
    const subscription = someEvent.subscribe((data) => {
      console.log(data);
    });
    // Missing: return () => subscription.unsubscribe();
  }, []);

  return <Text>Leaking...</Text>;
}

// ✅ Fixed: Remove event listener
function FixedEventComponent() {
  useEffect const subscription = someEvent.subscribe((data(() => {
   ) => {
      console.log(data);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <Text>Fixed!</Text>;
}

// ❌ Memory leak: Stale closure in timer
function LeakyClosureComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Count:", count); // Always 0!
    }, 1000);
  }, []);

  return <Text>{count}</Text>;
}

// ✅ Fixed: Use functional update or ref
function FixedClosureComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Use ref to capture current value
      // Or use functional update: setCount(c => c + 1)
    }, 1000);
  }, []);

  return <Text>{count}</Text>;
}
```

### Proper Cleanup Patterns

```tsx
// Network request cancellation
function useCancellableFetch(url: string) {
  const abortController = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortController.current?.abort();
    abortController.current = new AbortController();

    try {
      const response = await fetch(url, {
        signal: abortController.current.signal,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request cancelled");
      }
      throw error;
    }
  }, [url]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  return fetchData;
}

// Subscription cleanup
function useSubscription<T>(subscribe: (callback: (value: T) => void) => () => void) {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe(setValue);
    return () => unsubscribe();
  }, [subscribe]);

  return value;
}

// WebSocket cleanup
function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => console.log("Connected");
    ws.current.onclose = () => console.log("Disconnected");

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const send = useCallback((message: any) => {
    ws.current?.send(JSON.stringify(message));
  }, []);

  return { send };
}
```

### Memory Monitoring

```tsx
import { Platform, NativeModules } from "react-native";

function getMemoryInfo() {
  if (Platform.OS === "android") {
    const { MemoryInfo } = NativeModules;
    return MemoryInfo?.getMemoryInfo?.() ?? null;
  }
  return null;
}

function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const info = getMemoryInfo();
      if (info) {
        setMemoryUsage(info.jsHeapSizeUsed / 1024 / 1024); // MB
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}
```

---

## 4. useMemo, React.memo, and useCallback

**Interview Question:** "Explain when to use useMemo, useCallback, and React.memo. What are the performance implications of overusing them?"

### When to Use Each

```tsx
import { memo, useMemo, useCallback, useState, useEffect } from "react";

// ✅ useMemo - Expensive calculations
function ExpensiveComponent({ items }: { items: number[] }) {
  // Recalculates only when items changes
  const sorted = useMemo(
    () => items.sort((a, b) => a - b),
    [items]
  );

  const filtered = useMemo(
    () => items.filter((x) => x > 10),
    [items]
  );

  const sum = useMemo(
    () => items.reduce((a, b) => a + b, 0),
    [items]
  );

  return <Text>Sum: {sum}</Text>;
}

// ✅ useMemo - Object/array creation
function ConfigComponent() {
  // New object every render - BAD if passed as prop
  const config = { threshold: 0.5 }; // ❌

  // Memoized - same reference until deps change
  const config = useMemo(
    () => ({ threshold: 0.5 }),
    []
  );

  return <ChildComponent config={config} />;
}

// ✅ useCallback - Stable function references
function ParentComponent() {
  const [count, setCount] = useState(0);

  // New function every render - causes child to re-render
  const handlePress = () => console.log("pressed"); // ❌

  // Stable reference
  const handlePressStable = useCallback(() => {
    console.log("pressed");
  }, []);

  // With dependency - changes when count changes
  const handlePressWithDep = useCallback(
    (id: string) => console.log("pressed", id, count),
    [count]
  );

  return <Child onPress={handlePressStable} />;
}

// ✅ React.memo - Prevent unnecessary re-renders
const Child = memo(
  function Child({ name, onPress }: { name: string; onPress: () => void }) {
    console.log("Child rendered");
    return <Pressable onPress={onPress}><Text>{name}</Text></Pressable>;
  },
  // Custom comparison
  (prevProps, nextProps) => {
    return prevProps.name === nextProps.name;
  }
);

// ❌ Don't overuse - can make it worse
function OverOptimizedComponent() {
  // Unnecessary memoization
  const value = useMemo(() => 1 + 1, []); // ❌
  const fn = useCallback(() => console.log("hi"), []); // ❌
  const Component = memo(function Unnecessary() {
    return <Text>Hi</Text>;
  }); // ❌

  return <Text>{value}</Text>;
}
```

### Performance Impact Table

| Technique | When to Use | When NOT to Use |
|-----------|-------------|-----------------|
| `useMemo` | Expensive calculations, object/array props | Simple values |
| `useCallback` | Function props to memoized components | Functions used once |
| `memo` | Expensive component trees, list items | Components that always get new props |

### Custom Memoization Hooks

```tsx
// Memoize expensive hook computations
function useExpensiveComputation(input: number) {
  return useMemo(() => {
    // Expensive calculation
    return Array.from({ length: input }, (_, i) => i * 2);
  }, [input]);
}

// Debounced value
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback
function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        lastRun.current = Date.now();
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}
```

---

## 5. Performance Profiling Tools

**Interview Question:** "What tools do you use to profile React Native performance? How do you interpret the results?"

### React DevTools Profiler

```bash
# Start profiler
npx react-devtools

# Or in app
import { ReactProfiler } from "react-devtools-inline";
```

### Performance Monitor

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE MONITOR                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  JS FPS:  ████████████████████ 60                             │
│           Should stay at 60fps                                  │
│           Drops indicate expensive JS work                     │
│                                                                 │
│  UI FPS:  ██████████████████████ 60                             │
│           Should stay at 60fps                                  │
│           Drops indicate native rendering issues               │
│                                                                 │
│  RAM:     ████████████░░░░░░░░░  245 MB                        │
│           Watch for steady increase (memory leak)              │
│                                                                 │
│  Views:   1,234                                                │
│           Number of native views                               │
│                                                                 │
│  UI Dest: 12                                                   │
│           Views added/removed per second                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Hermes Profiler

```tsx
// Enable Hermes profiling
// In app.json:
// "hermes": { "profiler": { "enabled": true } }

// Generate trace
const trace = await Hermes.getPerformanceMetrics();

// Analyze
console.log(trace);
```

### Flipper

```bash
# Install Flipper
brew install flipper

# Run Flipper
open /Applications/Flipper.app
```

Flipper provides:
- Layout Inspector
- Network Inspector
- Database Inspector
- Redux DevTools
- React DevTools

### Custom Performance Monitoring

```tsx
import { Platform, PerformanceLogger } from "react-native";

const perfLogger = {
  start: (label: string) => {
    if (__DEV__) {
      console.time(label);
    }
    PerformanceLogger?.startTimespan?.(label);
  },
  end: (label: string) => {
    if (__DEV__) {
      console.timeEnd(label);
    }
    PerformanceLogger?.stopTimespan?.(label);
  },
};

// Usage
function ProfileComponent() {
  perfLogger.start("component-render");

  // Component logic
  const data = expensiveOperation();

  perfLogger.end("component-render");

  return <View>{data}</View>;
}

// Render count tracking
let renderCount = 0;

function TrackedComponent() {
  useEffect(() => {
    renderCount++;
    console.log("Render count:", renderCount);
  });

  return <Text>Render {renderCount}</Text>;
}
```

---

## 6. Animations with Reanimated

**Interview Question:** "How does Reanimated 3 differ from the legacy Animated API? What are the benefits of running animations on the UI thread?"

### Reanimated 3 Core

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
  runOnUI,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Pressable, View, Text } from "react-native";

// Basic animation
function AnimatedBox() {
  const animatedValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animatedValue.value * 200 }],
    opacity: 1 - animatedValue.value * 0.5,
  }));

  return (
    <View>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Pressable
        onPress={() => {
          animatedValue.value = withSpring(1, {
            damping: 10,
            stiffness: 100,
          });
        }}
      >
        <Text>Animate</Text>
      </Pressable>
    </View>
  );
}

// Spring animation options
const springConfig = {
  damping: 15,      // Lower = more oscillation
  stiffness: 150,   // Higher = faster
  mass: 1,         // Higher = slower response
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

// Timing animation
function TimingAnimation() {
  const opacity = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeOut = () => {
    opacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  };

  return (
    <Animated.View style={style}>
      <Pressable onPress={fadeOut}><Text>Fade Out</Text></Pressable>
    </Animated.View>
  );
}

// Repeated animation
function RepeatedAnimation() {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  return <Animated.View style={[styles.box, style]} />;
}
```

### Gesture Handler Integration

```tsx
function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

// Pinch to zoom
function PinchableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.Image
        source={{ uri }}
        style={[styles.image, animatedStyle]}
      />
    </GestureDetector>
  );
}
```

### Shared Values and Derived Values

```tsx
function DerivedAnimation() {
  const progress = useSharedValue(0);

  // Derived value - automatically updates when progress changes
  const animatedWidth = useDerivedValue(() => {
    return progress.value * 300;
  });

  // Use in animated style
  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }));

  return (
    <View>
      <Animated.View style={[styles.bar, animatedStyle]} />
      <Slider
        value={progress.value}
        onChange={(v) => (progress.value = v)}
      />
    </View>
  );
}
```

### Layout Animations

```tsx
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
  Layout,
  LinearTransition,
} from "react-native-reanimated";

function AnimatedList({ items, onRemove }: ListProps) {
  return (
    <Animated.View
      // Enter animation
      entering={FadeIn.duration(300)}
      // Exit animation
      exiting={FadeOut.duration(200)}
      // Layout animation - animates position changes
      layout={Layout.springify()}
    >
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={SlideInDown.springify()}
          exiting={SlideOutUp.duration(200)}
        >
          <ListItem item={item} onRemove={onRemove} />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

// Using with FlatList
function AnimatedFlatList({ data }: { data: Item[] }) {
  return (
    <Animated.FlatList
      data={data}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeIn.delay(index * 50)}
          exiting={FadeOut}
          layout={Layout.springify()}
        >
          <Item item={item} />
        </Animated.View>
      )}
      keyExtractor={(item) => item.id}
      itemLayoutAnimation={LinearTransition.springify()}
    />
  );
}
```

### Common Pitfalls

```tsx
// ❌ Pitfall 1: Running worklet on JS thread
function BadAnimation() {
  const value = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    // Heavy computation blocks UI thread!
    const result = heavyComputation(value.value);
    return { opacity: result };
  });
}

// ✅ Fix: Run heavy computation outside worklet
function GoodAnimation() {
  const value = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    return { opacity: value.value };
  });

  useFrameCallback((frameInfo) => {
    // Heavy work here runs on JS thread
    const result = heavyComputation(frameInfo.timeSincePreviousFrame);
    value.value = result;
  });
}

// ❌ Pitfall 2: Missing runOnJS for callbacks
function BadGesture() {
  const gesture = Gesture.Tap().onEnd(() => {
    doHeavyWork(); // ❌ Runs on UI thread!
  });
}

// ✅ Fix: Use runOnJS
function GoodGesture() {
  const gesture = Gesture.Tap().onEnd(() => {
    runOnJS(doHeavyWork)();
  });
}

// ❌ Pitfall 3: Not using useAnimatedScrollHandler
function BadScroll() {
  const [scrollY, setScrollY] = useState(0);

  const onScroll = (event) => {
    setScrollY(event.nativeEvent.contentOffset.y); // ❌ Causes re-render
  };

  return <FlatList onScroll={onScroll} />;
}

// ✅ Fix: Use useAnimatedScrollHandler
function GoodScroll() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value * 0.5 }],
  }));

  return (
    <Animated.FlatList
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    />
  );
}
```

---

## Summary

Performance optimization skills are essential for senior developers:

1. **FlatList** - Use FlashList for large lists, memoize renderItem, provide getItemLayout
2. **Images** - Use expo-image for caching, blurhash, and optimized loading
3. **Memory** - Always clean up subscriptions, timers, and network requests
4. **Memoization** - Profile before optimizing, don't overuse
5. **Profiling** - Use React DevTools, Flipper, and Performance Monitor
6. **Animations** - Use Reanimated 3 for UI-thread animations, avoid JS-thread work

Next: Phase 4 covers testing strategies and QA practices.
