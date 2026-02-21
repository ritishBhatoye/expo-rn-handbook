# Chapter 2: Core Components

**TL;DR**
- Master `View`, `Text`, `Image`, and `ScrollView` for basic layouts.
- Always prefer `FlashList` over `FlatList` for performance.
- Use `Pressable` instead of `TouchableOpacity` for modern interactions.

## Basic Layout Components

React Native uses Flexbox for layout. The default is `flexDirection: 'column'`.

```tsx
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function LayoutExample() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.box}>
          <Text style={styles.text}>Hello World</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: { padding: 20, backgroundColor: '#007AFF', borderRadius: 8 },
  text: { color: '#fff', fontWeight: 'bold' },
});
```

## Lists: FlatList vs FlashList

⚠️ **Deprecated/Slow:** `FlatList` (for large lists)
✅ **Current:** `@shopify/flash-list`

```bash
npx expo install @shopify/flash-list
```

```tsx
import { FlashList } from '@shopify/flash-list';
import { View, Text } from 'react-native';

const DATA = [{ id: '1', title: 'Item 1' }, { id: '2', title: 'Item 2' }];

export default function ListExample() {
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={DATA}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        estimatedItemSize={50} // CRITICAL for performance
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
```

## Interactions: Pressable

⚠️ **Deprecated:** `TouchableOpacity`, `TouchableWithoutFeedback`
✅ **Current:** `Pressable`

```tsx
import { Pressable, Text, StyleSheet } from 'react-native';

export default function Button() {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed
      ]}
      onPress={() => console.log('Pressed!')}
    >
      <Text style={styles.text}>Press Me</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8 },
  pressed: { opacity: 0.7 },
  text: { color: '#fff' }
});
```

## Links
- [React Native Docs: Core Components](https://reactnative.dev/docs/components-and-apis)
- [GitHub: Shopify/flash-list](https://github.com/Shopify/flash-list)

## ⚠️ Gotchas & Common Errors

- **Error:** `FlashList` items overlapping or rendering incorrectly.
  - **Fix:** Ensure `estimatedItemSize` is set accurately to the average height of your items.
- **Gotcha:** `KeyboardAvoidingView` not working on Android.
  - **Fix:** Android often handles keyboard avoiding natively if `windowSoftInputMode` is set in `app.json`. Use `behavior="height"` or omit it on Android.

## ⚡ Shortcuts & Speed Tricks

- **Flexbox:** Remember `flex: 1` makes a component fill available space.
- **Absolute Positioning:** `StyleSheet.absoluteFillObject` is a quick way to make a view cover its parent.