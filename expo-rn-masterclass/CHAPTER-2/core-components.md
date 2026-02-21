# Chapter 2 — Core Components

> **TL;DR**
> - `Pressable` replaced `TouchableOpacity`. Use it for all tap interactions.
> - `FlatList` is fine for most lists. Switch to `FlashList` when you have 100+ items or complex rows.
> - Flexbox in RN defaults to `column`. Every layout starts from that assumption.

📚 [Core Components Docs](https://reactnative.dev/docs/components-and-apis) · 🔗 [facebook/react-native](https://github.com/facebook/react-native) · 🔗 [Shopify/flash-list](https://github.com/Shopify/flash-list)

---

## View

The fundamental layout container. Equivalent to `<div>` on web.

```tsx
import { View, StyleSheet } from "react-native";

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
  },
});
```

Key props: `style`, `onLayout`, `pointerEvents`, `testID`.

---

## Text

The only way to display strings. You **cannot** place raw text outside a `<Text>` component.

```tsx
import { Text, StyleSheet } from "react-native";

export function Title({ label }: { label: string }) {
  return (
    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
});
```

Key props: `numberOfLines`, `ellipsizeMode`, `selectable`, `onPress`.

**Nesting works** for inline styles:

```tsx
<Text style={{ fontSize: 16 }}>
  Hello <Text style={{ fontWeight: "bold" }}>World</Text>
</Text>
```

---

## Image

```tsx
import { Image, StyleSheet } from "react-native";

// Remote image (always provide width + height)
<Image
  source={{ uri: "https://example.com/photo.jpg" }}
  style={styles.avatar}
  resizeMode="cover"
/>

// Local image (dimensions inferred)
<Image source={require("../assets/logo.png")} style={styles.logo} />

const styles = StyleSheet.create({
  avatar: { width: 80, height: 80, borderRadius: 40 },
  logo: { width: 120, height: 40 },
});
```

⚠️ **Remote images MUST have explicit width and height.** Without them, the image renders at 0×0.

**Better alternative:** Use `expo-image` for caching, blur hashes, and animated formats:

```bash
npx expo install expo-image
```

```tsx
import { Image } from "expo-image";

<Image
  source="https://example.com/photo.jpg"
  placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
  contentFit="cover"
  transition={200}
  style={{ width: 200, height: 200 }}
/>
```

---

## ScrollView

Renders all children at once. **Only use when content is bounded** (e.g., a form, a settings screen).

```tsx
import { ScrollView, Text } from "react-native";

<ScrollView
  contentContainerStyle={{ padding: 16 }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
  <Text>Content here</Text>
</ScrollView>
```

⚠️ **Never use `ScrollView` for long lists.** It renders everything into memory. Use `FlatList` or `FlashList`.

---

## FlatList

Virtualized list — only renders items currently on screen.

```tsx
import { FlatList, Text, View } from "react-native";

interface Item {
  id: string;
  title: string;
}

const DATA: Item[] = Array.from({ length: 1000 }, (_, i) => ({
  id: String(i),
  title: `Item ${i}`,
}));

export function ItemList() {
  return (
    <FlatList
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff" }}>{item.title}</Text>
        </View>
      )}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: "#333" }} />
      )}
    />
  );
}
```

### FlatList vs FlashList

| Feature | FlatList | FlashList |
|---------|---------|-----------|
| Speed | Good | 5-10x faster |
| View recycling | ❌ | ✅ |
| Required prop | `keyExtractor` | `estimatedItemSize` |
| Install | Built-in | `npx expo install @shopify/flash-list` |

```bash
npx expo install @shopify/flash-list
```

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={DATA}
  renderItem={({ item }) => <Text>{item.title}</Text>}
  estimatedItemSize={60}
/>
```

`estimatedItemSize` is the average height (in px) of a single row. FlashList uses this for layout calculations. **Measure once, set it, forget it.**

---

## Pressable

⚠️ `TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback` are **legacy**. Use `Pressable`.

```tsx
import { Pressable, Text, StyleSheet } from "react-native";

export function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      hitSlop={8}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

Key props: `onPress`, `onLongPress`, `onPressIn`, `onPressOut`, `disabled`, `hitSlop`, `android_ripple`.

---

## Modal

```tsx
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

export function ConfirmModal() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <Text>Open Modal</Text>
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={{ color: "#fff", fontSize: 18 }}>Are you sure?</Text>
            <Pressable onPress={() => setVisible(false)}>
              <Text style={{ color: "#0a84ff", marginTop: 16 }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#1c1c1e",
    padding: 24,
    borderRadius: 16,
    width: "80%",
  },
});
```

⚠️ **`onRequestClose` is required on Android.** Without it the hardware back button won't close the modal.

For production, use [@gorhom/bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet) instead of `Modal` for most cases.

---

## SafeAreaView

Avoids content being hidden behind notches, status bars, and home indicators.

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

// Use from react-native-safe-area-context, NOT from react-native
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      {children}
    </SafeAreaView>
  );
}
```

⚠️ **Don't use `SafeAreaView` from `react-native`.** It only works on iOS. Use `react-native-safe-area-context` (included in Expo by default).

---

## KeyboardAvoidingView

Prevents the keyboard from covering inputs.

```tsx
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";

<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
  keyboardVerticalOffset={80}
>
  <TextInput
    placeholder="Type here..."
    placeholderTextColor="#888"
    style={{ height: 48, borderWidth: 1, borderColor: "#333", color: "#fff", padding: 12 }}
  />
</KeyboardAvoidingView>
```

⚠️ Set `keyboardVerticalOffset` to the height of your header/navigation bar. Otherwise the input will be offset incorrectly.

---

## Flexbox in React Native vs Web

| Property | Web Default | RN Default |
|----------|-------------|------------|
| `flexDirection` | `row` | `column` |
| `alignContent` | `stretch` | `flex-start` |
| `flexShrink` | `1` | `0` |

### The Mental Model

```
flexDirection: 'column' (default)
┌─────────────────┐
│     [Child A]    │  ← Main axis: vertical
│     [Child B]    │  ← Cross axis: horizontal
│     [Child C]    │
└─────────────────┘

flexDirection: 'row'
┌─────────────────────────┐
│ [A]   [B]   [C]         │  ← Main axis: horizontal
└─────────────────────────┘
```

### All Flexbox Properties

| Property | Values | Purpose |
|----------|--------|---------|
| `flex` | number | Expand to fill space |
| `flexDirection` | `row`, `column`, `row-reverse`, `column-reverse` | Main axis direction |
| `justifyContent` | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` | Distribute children along main axis |
| `alignItems` | `flex-start`, `center`, `flex-end`, `stretch`, `baseline` | Align children along cross axis |
| `alignSelf` | Same as alignItems | Override parent's alignItems for one child |
| `flexWrap` | `wrap`, `nowrap` | Allow children to wrap |
| `gap` | number | Space between children (supported in RN 0.71+) |
| `rowGap` / `columnGap` | number | Direction-specific gap |

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Text strings must be rendered within a <Text>` | Raw string outside `<Text>` | Wrap all text in `<Text>` |
| `VirtualizedLists should never be nested` | FlatList inside ScrollView | Remove the ScrollView or use `ListHeaderComponent` |
| Image renders at 0×0 | Remote image without explicit size | Always set `width` and `height` for URI sources |
| `onRequestClose` crash on Android | Missing prop on Modal | Always provide `onRequestClose` |
| `SafeAreaView` not working on Android | Using the RN built-in version | Use `react-native-safe-area-context` instead |

---

## ⚡ Shortcuts & Speed Tricks

- **`expo-image`** is always better than `Image` from RN. It caches, transitions, and handles blurhash.
- **`FlashList`** is a drop-in for FlatList. The only change is adding `estimatedItemSize`.
- **`gap`** works in RN ≥0.71. Stop using margin hacks for spacing between flex children.
- **`hitSlop={8}`** on every `Pressable` — saves users from rage-tapping on small targets.
- **`removeClippedSubviews`** on FlatList frees offscreen views from memory on Android.