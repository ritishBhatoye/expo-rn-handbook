# Chapter 8: Performance Optimization

**TL;DR**
- Enable Hermes engine (it's on by default in modern Expo).
- Use `FlashList` instead of `FlatList`.
- Use Reanimated 3 for 60fps animations on the UI thread.

## Hermes Engine

Hermes is an open-source JavaScript engine optimized for React Native. It reduces app size, decreases memory usage, and improves startup time.

Verify it's enabled in `app.json`:
```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

## React.memo, useMemo, useCallback

Only use these when necessary. Premature optimization is the root of all evil.

- **`React.memo`**: Wrap components that receive complex props but rarely change.
- **`useMemo`**: Cache expensive calculations.
- **`useCallback`**: Cache functions passed as props to memoized child components.

```tsx
import React, { useCallback, useState } from 'react';
import { View, Button } from 'react-native';

const ExpensiveChild = React.memo(({ onPress }: { onPress: () => void }) => {
  // ... expensive render
  return <Button title="Press" onPress={onPress} />;
});

export default function Parent() {
  const [count, setCount] = useState(0);

  // Prevents ExpensiveChild from re-rendering when count changes
  const handlePress = useCallback(() => {
    console.log('Pressed');
  }, []);

  return (
    <View>
      <ExpensiveChild onPress={handlePress} />
    </View>
  );
}
```

## Reanimated 3

For complex animations, use `react-native-reanimated`. It runs animations on the UI thread, preventing JS thread drops.

```bash
npx expo install react-native-reanimated
```

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';

export default function AnimatedBox() {
  const width = useSharedValue(100);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <Pressable onPress={() => (width.value = withSpring(width.value + 50))}>
      <Animated.View style={[{ height: 100, backgroundColor: 'violet' }, animatedStyle]} />
    </Pressable>
  );
}
```

## Links
- [GitHub: software-mansion/react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)
- [React Native Performance Docs](https://reactnative.dev/docs/performance)

## ⚠️ Gotchas & Common Errors

- **Error:** Reanimated babel plugin not found.
  - **Fix:** Add `react-native-reanimated/plugin` to your `babel.config.js` and clear the cache (`npx expo start -c`).
- **Gotcha:** Inline functions in `FlatList` `renderItem` causing massive re-renders.
  - **Fix:** Extract the `renderItem` function outside the component or wrap it in `useCallback`.

## ⚡ Shortcuts & Speed Tricks

- **Console.log:** Remove all `console.log` statements in production. Use a babel plugin like `babel-plugin-transform-remove-console`.
- **Image Optimization:** Use `expo-image` instead of the standard `Image` component for aggressive caching and better performance.