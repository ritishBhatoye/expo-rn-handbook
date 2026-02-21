# Chapter 3: Navigation

**TL;DR**
- Use Expo Router (file-based routing) for all new projects.
- Understand Stack, Tabs, and Drawer layouts.
- Master dynamic routes (`[id].tsx`) and deep linking.

## Expo Router Setup

Expo Router is built on top of React Navigation but uses the file system.

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

## File-Based Routing

```text
app/
├── _layout.tsx           # Root layout (usually a Stack)
├── index.tsx             # Matches '/'
├── (tabs)/               # Group without affecting URL
│   ├── _layout.tsx       # Tabs layout
│   ├── index.tsx         # Matches '/(tabs)'
│   └── profile.tsx       # Matches '/(tabs)/profile'
└── user/
    └── [id].tsx          # Dynamic route, matches '/user/123'
```

## Stack Layout (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="user/[id]" options={{ title: 'User Profile' }} />
    </Stack>
  );
}
```

## Navigation & Params

```tsx
// app/index.tsx
import { Link, router } from 'expo-router';
import { View, Pressable, Text } from 'react-native';

export default function Home() {
  return (
    <View>
      {/* Declarative */}
      <Link href="/user/123" asChild>
        <Pressable><Text>Go to User 123</Text></Pressable>
      </Link>

      {/* Imperative */}
      <Pressable onPress={() => router.push('/user/456')}>
        <Text>Go to User 456</Text>
      </Pressable>
    </View>
  );
}
```

```tsx
// app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>User ID: {id}</Text>;
}
```

## Auth Flows (Protected Routes)

Use a custom hook to check auth state and redirect in a layout component.

```tsx
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated } = useAuth(); // Your auth logic
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  return <Slot />;
}
```

## Links
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [GitHub: react-navigation/react-navigation](https://github.com/react-navigation/react-navigation)

## ⚠️ Gotchas & Common Errors

- **Error:** `Unmatched Route` when navigating.
  - **Fix:** Ensure the file exists and the path exactly matches the file structure. Restart the bundler with `-c` if you just added the file.
- **Gotcha:** Deep linking not working in standalone apps.
  - **Fix:** Configure `scheme` in `app.json` and set up associated domains for iOS/Android.

## ⚡ Shortcuts & Speed Tricks

- **Go Back:** `router.back()`
- **Replace:** `router.replace('/path')` (prevents going back to the previous screen).
- **Groups:** Use `(folderName)` to group routes without adding to the URL path.