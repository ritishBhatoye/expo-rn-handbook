# Chapter 4 — Styling & UI

> **TL;DR**
> - `StyleSheet.create` is optimized at compile time — always use it over inline objects.
> - NativeWind v4 brings Tailwind CSS to RN with full `className` support.
> - Dark mode is one hook away: `useColorScheme()` from `react-native`.

📚 [RN Style Docs](https://reactnative.dev/docs/style) · 🔗 [marklawlor/nativewind](https://github.com/marklawlor/nativewind) · 🔗 [expo/google-fonts](https://github.com/expo/google-fonts)

---

## StyleSheet.create — Why It's Faster

```tsx
import { StyleSheet, View, Text } from "react-native";

export function Card() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fast</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});
```

**Why:** `StyleSheet.create` validates styles at creation time and sends them to native once. Inline `style={{...}}` creates a new object on every render.

**Combine styles:**

```tsx
<View style={[styles.container, { marginTop: 10 }]} />
<View style={[styles.base, isActive && styles.active]} />
```

---

## NativeWind (Tailwind for React Native)

```bash
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
```

### Setup

```bash
# Generate tailwind config
npx tailwindcss init
```

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
// app/_layout.tsx
import "../global.css";
// ... rest of layout
```

### Usage

```tsx
import { View, Text, Pressable } from "react-native";

export function Card() {
  return (
    <View className="flex-1 p-4 bg-zinc-900 rounded-xl">
      <Text className="text-xl font-bold text-white">NativeWind Card</Text>
      <Pressable className="mt-4 bg-blue-600 px-6 py-3 rounded-lg active:opacity-70">
        <Text className="text-white text-center font-semibold">Press Me</Text>
      </Pressable>
    </View>
  );
}
```

**Dark mode with NativeWind:**

```tsx
<View className="bg-white dark:bg-zinc-900">
  <Text className="text-black dark:text-white">Auto dark mode</Text>
</View>
```

---

## Theming and Dark Mode

### Built-in useColorScheme

```tsx
import { useColorScheme } from "react-native";
import { StyleSheet, View, Text } from "react-native";

export function ThemedScreen() {
  const colorScheme = useColorScheme(); // 'light' | 'dark' | null
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <Text style={{ color: isDark ? "#fff" : "#000" }}>
        Current theme: {colorScheme}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
```

### Theme Context Pattern

```tsx
// contexts/ThemeContext.tsx
import { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

const colors = {
  light: { bg: "#ffffff", text: "#000000", card: "#f2f2f7", primary: "#0a84ff" },
  dark: { bg: "#000000", text: "#ffffff", card: "#1c1c1e", primary: "#0a84ff" },
};

const ThemeContext = createContext<{
  theme: Theme;
  colors: typeof colors.dark;
  toggle: () => void;
}>({
  theme: "dark",
  colors: colors.dark,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? "dark";
  const [theme, setTheme] = useState<Theme>(systemScheme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: colors[theme],
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## Platform-Specific Styles

```tsx
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  container: {
    paddingTop: Platform.OS === "ios" ? 44 : 0,
  },
});
```

### Platform-Specific Files

Create separate files — Metro resolves them automatically:

```
Button.tsx          → default
Button.ios.tsx      → iOS override
Button.android.tsx  → Android override
Button.web.tsx      → Web override
```

```tsx
// Importing picks the right file automatically
import { Button } from "@/components/Button";
```

---

## Custom Fonts with expo-font

```bash
npx expo install expo-font expo-splash-screen
```

```tsx
// app/_layout.tsx
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack />;
}
```

Usage:

```tsx
<Text style={{ fontFamily: "Inter-Bold", fontSize: 24 }}>Custom Font</Text>
```

**Google Fonts shortcut:**

```bash
npx expo install @expo-google-fonts/inter expo-font
```

```tsx
import { useFonts, Inter_700Bold } from "@expo-google-fonts/inter";
```

---

## Responsive Design

```tsx
import { useWindowDimensions, StyleSheet } from "react-native";

export function ResponsiveGrid() {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;

  return (
    <FlatList
      data={items}
      numColumns={numColumns}
      key={numColumns} // Force re-render on column change
      renderItem={({ item }) => (
        <View style={{ flex: 1, margin: 4 }}>
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}
```

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Font not loading | Wrong path or not awaiting | Use `useFonts` hook + SplashScreen pattern |
| NativeWind classes not applying | Missing `global.css` import in layout | Import `"../global.css"` in root `_layout.tsx` |
| Shadow not visible on Android | Using iOS shadow props | Use `elevation` for Android |
| `fontWeight` must be a string | RN uses string values | `fontWeight: "700"` not `fontWeight: 700` |
| Styles not updating | Cached inline object reference | Move to `StyleSheet.create` or use `useMemo` |

---

## ⚡ Shortcuts & Speed Tricks

- **`gap` property** works in RN ≥0.71 — stop using `marginBottom` on every child.
- **`@expo-google-fonts/*`** packages — one-liner Google Fonts without manual `.ttf` files.
- **NativeWind** `active:opacity-70` replaces verbose `Pressable` style functions.
- **`useWindowDimensions`** is reactive and re-renders on rotation. `Dimensions.get()` is static — avoid it in components.
- **Platform-specific files** (`.ios.tsx`, `.android.tsx`) are cleaner than `Platform.select` for complex differences.