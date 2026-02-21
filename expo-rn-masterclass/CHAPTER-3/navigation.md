# Chapter 3 — Navigation

> **TL;DR**
> - Expo Router is file-based routing built on React Navigation. Use it for all new projects.
> - `_layout.tsx` defines how a group of routes are rendered (Stack, Tabs, Drawer).
> - Protected routes = redirect in `_layout.tsx` based on auth state.

📚 [Expo Router Docs](https://docs.expo.dev/router/introduction/) · 🔗 [react-navigation/react-navigation](https://github.com/react-navigation/react-navigation) · 🔗 [expo/router](https://github.com/expo/router)

---

## Expo Router: File-Based Routing

Files inside `app/` automatically become routes. No manual registration.

```
app/
├── _layout.tsx          → Root layout (Stack or provider)
├── index.tsx            → Route: /
├── settings.tsx         → Route: /settings
├── profile/
│   ├── _layout.tsx      → Nested layout for /profile/*
│   ├── index.tsx        → Route: /profile
│   └── [id].tsx         → Route: /profile/123
├── (auth)/
│   ├── _layout.tsx      → Group layout (no URL segment)
│   ├── login.tsx         → Route: /login
│   └── register.tsx      → Route: /register
├── (tabs)/
│   ├── _layout.tsx      → Tab navigator
│   ├── index.tsx         → Tab: Home
│   └── explore.tsx       → Tab: Explore
└── +not-found.tsx       → 404 catch-all
```

**Naming rules:**
- `index.tsx` = the default route for that directory
- `[param].tsx` = dynamic segment
- `[...slug].tsx` = catch-all segment
- `(group)/` = route group — organizes without adding a URL segment
- `_layout.tsx` = wraps sibling routes
- `+not-found.tsx` = 404 fallback

---

## Stack Navigator

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0d1117" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: "#0d1117" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Details" }}
      />
    </Stack>
  );
}
```

---

## Tab Navigator

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Home, Search, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0a84ff",
        tabBarStyle: { backgroundColor: "#1c1c1e", borderTopWidth: 0 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

---

## Drawer Navigator

```bash
npx expo install @react-navigation/drawer react-native-gesture-handler react-native-reanimated
```

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen name="index" options={{ title: "Home" }} />
        <Drawer.Screen name="settings" options={{ title: "Settings" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
```

---

## Dynamic Routes

```tsx
// app/profile/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#fff", fontSize: 24 }}>Profile: {id}</Text>
    </View>
  );
}
```

Navigate to it:

```tsx
import { Link, useRouter } from "expo-router";

// Declarative
<Link href="/profile/42">Go to Profile 42</Link>

// Imperative
const router = useRouter();
router.push("/profile/42");
router.replace("/profile/42"); // No back button
router.back();                 // Go back
```

---

## Navigation Hooks

| Hook | Purpose | Example |
|------|---------|---------|
| `useRouter()` | Navigate imperatively | `router.push('/settings')` |
| `useLocalSearchParams()` | Read URL params | `const { id } = useLocalSearchParams()` |
| `useGlobalSearchParams()` | Read params from any screen | Same API as local |
| `useSegments()` | Get current route segments | `["(tabs)", "index"]` |
| `usePathname()` | Get current URL path | `/profile/42` |
| `useNavigation()` | Access React Navigation object | `navigation.setOptions({...})` |
| `useFocusEffect()` | Run effect on screen focus | Refresh data on tab switch |

---

## Deep Linking

Expo Router handles deep linking automatically. Your file structure IS your URL scheme.

```json
// app.json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

- `myapp://profile/42` → opens `app/profile/[id].tsx` with `id=42`
- `https://myapp.com/profile/42` → works if you configure universal links

Test deep links:

```bash
# iOS Simulator
npx uri-scheme open "myapp://profile/42" --ios

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://profile/42"
```

---

## Protected Routes (Auth Guard)

```tsx
// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Not logged in and not on auth screen → redirect to login
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Logged in but still on auth screen → redirect to app
      router.replace("/");
    }
  }, [user, segments, isLoading]);

  if (isLoading) return null; // Or a splash screen

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

---

## React Navigation (Traditional — when needed)

If you need more control or are on an older project:

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

```tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

⚠️ For new Expo projects (SDK 50+), stick with Expo Router. React Navigation is the engine under the hood anyway.

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `No route named "X" exists` | File missing or named wrong in `app/` | Check file name matches route exactly |
| Tabs showing wrong content | `name` prop doesn't match filename | `Tabs.Screen name=` must equal the filename without extension |
| `useRouter()` returns undefined | Called outside `<Stack>` or `<Tabs>` | Ensure component is inside a layout |
| `GestureHandler` crash | Missing GestureHandlerRootView | Wrap root layout with `<GestureHandlerRootView>` |
| Deep link not working | Wrong scheme in `app.json` | Must match `scheme` field; rebuild after changing |

---

## ⚡ Shortcuts & Speed Tricks

- **`router.replace()`** instead of `push()` for login → home transitions. Prevents the user pressing back to the login screen.
- **Route groups `(name)`** keep your file tree organized without polluting URLs.
- **`+not-found.tsx`** is free 404 handling. Always add one.
- **Test deep links** with `npx uri-scheme open` — don't manually type URLs on a phone.
- **`useSegments()`** is the easiest way to check "what screen am I on?" for analytics or auth guards.