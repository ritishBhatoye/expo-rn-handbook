# Chapter 4: Styling & UI

**TL;DR**
- Use `StyleSheet.create()` for performance, or NativeWind for Tailwind utility classes.
- Handle theming and dark mode with `useColorScheme`.
- Load custom fonts efficiently with `expo-font`.

## StyleSheet vs Inline Styles

Always use `StyleSheet.create()`. It sends the style object over the bridge only once.

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function StyledComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fast Styling</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  text: { fontSize: 16, color: '#333' }
});
```

## NativeWind (Tailwind for RN)

NativeWind brings Tailwind CSS to React Native.

```bash
npm install nativewind
npm install --save-dev tailwindcss
npx tailwindcss init
```

Configure `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Usage:
```tsx
import { View, Text } from 'react-native';

export default function TailwindComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold text-blue-500">Tailwind in RN!</Text>
    </View>
  );
}
```

## Theming & Dark Mode

Use React Native's `useColorScheme`.

```tsx
import { Text, View, useColorScheme, StyleSheet } from 'react-native';

export default function ThemedComponent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      <Text style={isDark ? styles.darkText : styles.lightText}>
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lightBg: { backgroundColor: '#ffffff' },
  darkBg: { backgroundColor: '#000000' },
  lightText: { color: '#000000' },
  darkText: { color: '#ffffff' },
});
```

## Custom Fonts

```bash
npx expo install expo-font
```

```tsx
import { useFonts } from 'expo-font';
import { Text } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });

  if (!fontsLoaded) return null;

  return <Text style={{ fontFamily: 'Inter-Black' }}>Custom Font!</Text>;
}
```

## Links
- [NativeWind Docs](https://www.nativewind.dev/)
- [GitHub: marklawlor/nativewind](https://github.com/marklawlor/nativewind)
- [Expo Fonts](https://docs.expo.dev/versions/latest/sdk/font/)

## ⚠️ Gotchas & Common Errors

- **Error:** Fonts not loading or showing default font.
  - **Fix:** Ensure the font file path is correct and you are waiting for `fontsLoaded` to be true before rendering text that uses it.
- **Gotcha:** NativeWind classes not applying.
  - **Fix:** Check your `tailwind.config.js` content paths. Ensure Babel plugin is configured if using older NativeWind versions.

## ⚡ Shortcuts & Speed Tricks

- **Platform Specific Styles:** Use `Platform.select({ ios: { ... }, android: { ... } })`.
- **Hairline Width:** `StyleSheet.hairlineWidth` gives the thinnest possible line on the device.