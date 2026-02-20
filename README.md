# 📱 Ultimate Expo & React Native Handbook

[![Last Updated](https://img.shields.io/badge/Last_Updated-2026--02--20-blue.svg)](#-changelog)

> **⚡ TL;DR:** The only resource you need to go from zero to production with Expo and React Native.

---

## 1️⃣ Quick Start
> **⚡ TL;DR:** Get up and running in under 5 minutes.

```bash
# Install Expo CLI and create a new project
npx create-expo-app@latest my-app
cd my-app

# Start the development server
npx expo start
```

**Shortcuts (Press in terminal):**
- `r` - Reload app
- `m` - Toggle developer menu
- `i` - Open in iOS simulator
- `a` - Open in Android emulator
- `w` - Open in web browser

*Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS) to run on a physical device.*

---

## 2️⃣ Project Structure
> **⚡ TL;DR:** Standard Expo Router file-based routing structure.

```text
my-app/
├── app/                # Expo Router file-based routes (screens)
│   ├── (tabs)/         # Grouped routes (e.g., bottom tabs)
│   ├── _layout.tsx     # Global layout wrapper
│   └── index.tsx       # Entry point (Home screen)
├── assets/             # Static files (images, fonts)
├── components/         # Reusable UI components
├── constants/          # Theme, colors, and config values
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── app.json            # Expo configuration file
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

---

## 3️⃣ Core Concepts Cheatsheet
> **⚡ TL;DR:** Essential React Native components and their web equivalents.

| Component | What it does | Example |
|-----------|--------------|---------|
| `View` | Container (like `div`) | `<View style={styles.container}>...</View>` |
| `Text` | Displays text (like `p` or `span`) | `<Text>Hello World</Text>` |
| `Image` | Displays images | `<Image source={{uri: '...'}} />` |
| `ScrollView` | Scrollable container | `<ScrollView>...</ScrollView>` |
| `FlatList` | Performant list for large data | `<FlatList data={data} renderItem={...} />` |
| `TouchableOpacity` | Button that dims on press | `<TouchableOpacity onPress={...}>...</TouchableOpacity>` |
| `Pressable` | Modern, customizable button | `<Pressable onPress={...}>...</Pressable>` |
| `TextInput` | Input field | `<TextInput value={text} onChangeText={...} />` |
| `Modal` | Overlay screen | `<Modal visible={true}>...</Modal>` |
| `SafeAreaView` | Avoids notches/status bars | `<SafeAreaView>...</SafeAreaView>` |
| `KeyboardAvoidingView` | Moves content above keyboard | `<KeyboardAvoidingView behavior="padding">...</KeyboardAvoidingView>` |
| `StatusBar` | Controls device status bar | `<StatusBar style="auto" />` |

---

## 4️⃣ Styling Cheatsheet
> **⚡ TL;DR:** Use `StyleSheet.create` for performance, or NativeWind for Tailwind utility classes.

**StyleSheet vs Inline:**
```tsx
// Good (Cached, performant)
const styles = StyleSheet.create({ text: { color: 'red' } });
<Text style={styles.text}>Hello</Text>

// Bad (Recreated every render)
<Text style={{ color: 'red' }}>Hello</Text>
```

**Flexbox Quick Reference:**
| Property | What it does | Common Values |
|----------|--------------|---------------|
| `flexDirection` | Main axis direction | `'column'` (default), `'row'` |
| `justifyContent` | Align along main axis | `'flex-start'`, `'center'`, `'space-between'` |
| `alignItems` | Align along cross axis | `'stretch'` (default), `'center'`, `'flex-start'` |
| `flex` | Grow to fill space | `1` (fill available), `0` (auto) |

**NativeWind (Tailwind) Usage:**
```tsx
import { View, Text } from 'react-native';
// Just use className!
export default () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold text-blue-500">Tailwind in RN!</Text>
  </View>
);
```

---

## 5️⃣ Navigation (Expo Router)
> **⚡ TL;DR:** File-based routing. Folders/files become URLs.

**File Structure:**
```text
app/
├── _layout.tsx         # Stack navigator
├── index.tsx           # '/'
└── details/[id].tsx    # '/details/1'
```

**Stack Layout (`app/_layout.tsx`):**
```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="details/[id]" options={{ title: 'Details' }} />
    </Stack>
  );
}
```

**Dynamic Routes & Linking (`app/index.tsx`):**
```tsx
import { Link, router } from 'expo-router';
import { View, Button } from 'react-native';

export default function Home() {
  return (
    <View>
      {/* Declarative */}
      <Link href="/details/42">Go to Details</Link>
      {/* Imperative */}
      <Button title="Go" onPress={() => router.push('/details/42')} />
    </View>
  );
}
```

**Reading Params (`app/details/[id].tsx`):**
```tsx
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function Details() {
  const { id } = useLocalSearchParams();
  return <Text>Details for ID: {id}</Text>;
}
```

---

## 6️⃣ State Management
> **⚡ TL;DR:** Use `useState` for local state, Zustand for global state.

**When to use what:**
- `useState`: Simple, component-local state (e.g., form inputs, toggles).
- `useReducer`: Complex local state with multiple sub-values.
- `Zustand`: Global state (user session, theme, cart).

**Zustand Setup (< 10 lines):**
```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

// Usage in component
const { count, inc } = useStore();
```

---

## 7️⃣ Data Fetching
> **⚡ TL;DR:** Use TanStack Query for caching, loading states, and retries.

**TanStack Query Setup:**
```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyComponent />
    </QueryClientProvider>
  );
}
```

**useQuery Example:**
```tsx
function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('https://api.example.com/todos').then(res => res.json()),
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <FlatList data={data} renderItem={({item}) => <Text>{item.title}</Text>} />;
}
```

---

## 8️⃣ Common Hooks Cheatsheet
> **⚡ TL;DR:** Essential React and Expo Router hooks.

| Hook | Purpose | One-liner example |
|------|---------|-------------------|
| `useState` | Local state | `const [count, setCount] = useState(0);` |
| `useEffect` | Side effects | `useEffect(() => { fetch() }, []);` |
| `useRef` | Mutable ref / DOM access | `const inputRef = useRef(null);` |
| `useCallback` | Memoize functions | `const memoizedCb = useCallback(() => doSomething(a), [a]);` |
| `useMemo` | Memoize values | `const memoizedVal = useMemo(() => compute(a), [a]);` |
| `useContext` | Consume context | `const theme = useContext(ThemeContext);` |
| `useFocusEffect` | Run when screen focused | `useFocusEffect(useCallback(() => { /* focused */ }, []));` |
| `useNavigation` | Imperative navigation | `const navigation = useNavigation(); navigation.goBack();` |
| `useLocalSearchParams` | Get route params | `const { id } = useLocalSearchParams();` |

---

## 9️⃣ Expo APIs Cheatsheet
> **⚡ TL;DR:** Access native device features easily.

| API | Import | What it does |
|-----|--------|--------------|
| `expo-camera` | `import { Camera } from 'expo-camera'` | Take photos and record videos |
| `expo-location` | `import * as Location from 'expo-location'` | Get GPS coordinates and geofencing |
| `expo-notifications` | `import * as Notifications from 'expo-notifications'` | Push and local notifications |
| `expo-image-picker` | `import * as ImagePicker from 'expo-image-picker'` | Select images/videos from gallery |
| `expo-secure-store` | `import * as SecureStore from 'expo-secure-store'` | Encrypted key-value storage (tokens) |
| `expo-file-system` | `import * as FileSystem from 'expo-file-system'` | Read/write files to device storage |
| `expo-av` | `import { Audio, Video } from 'expo-av'` | Play audio and video |
| `expo-sensors` | `import { Accelerometer } from 'expo-sensors'` | Access device sensors (gyro, accel) |
| `expo-haptics` | `import * as Haptics from 'expo-haptics'` | Trigger device vibrations |
| `expo-clipboard` | `import * as Clipboard from 'expo-clipboard'` | Read/write to device clipboard |
| `expo-font` | `import * as Font from 'expo-font'` | Load custom fonts |
| `expo-splash-screen` | `import * as SplashScreen from 'expo-splash-screen'` | Control splash screen visibility |
| `expo-linking` | `import * as Linking from 'expo-linking'` | Deep linking and opening URLs |
| `expo-constants` | `import Constants from 'expo-constants'` | System info (manifest, device ID) |
| `expo-device` | `import * as Device from 'expo-device'` | Device hardware info (model, OS) |

---

## 🔟 Keyboard Shortcuts & CLI Commands
> **⚡ TL;DR:** Essential commands for development and building.

| Command | What it does |
|---------|--------------|
| `npx expo start` | Start Metro bundler |
| `npx expo start -c` | Start and clear cache |
| `npx expo install [pkg]` | Install package with compatible version |
| `npx expo prebuild` | Generate native android/ios directories |
| `eas build -p ios` | Build for iOS |
| `eas build -p android` | Build for Android |
| `eas submit -p ios` | Submit to App Store |
| `eas update` | Publish OTA update |

**Metro Bundler Shortcuts:**
- `r` - Reload
- `m` - Toggle menu
- `shift + m` - Performance monitor
- `j` - Open debugger

---

## 1️⃣1️⃣ Debugging Tips
> **⚡ TL;DR:** Tools and techniques to fix bugs fast.

- **Tools:** Use React Native Debugger, Flipper, or Chrome DevTools (press `j` in Metro).
- **Console:** `console.log(JSON.stringify(obj, null, 2))` for readable objects.
- **Error Boundaries:** Wrap your app to catch render errors gracefully.

**Common Errors & Fixes:**
| Error | Fix |
|-------|-----|
| `Invariant Violation: View config not found` | You rendered a string outside a `<Text>` component. |
| `Cannot read property 'X' of undefined` | Check for nulls before accessing properties (use `?.`). |
| `Metro bundler stuck / weird caching issues` | Run `npx expo start -c` to clear cache. |
| `EAS Build fails on iOS` | Check provisioning profiles and certificates in Expo dashboard. |

---

## 1️⃣2️⃣ Performance Tips
> **⚡ TL;DR:** Keep your app running at 60fps.

- **FlatList Optimization:**
  ```tsx
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
    windowSize={5} // Render fewer items off-screen
  />
  ```
- **useMemo / useCallback:** Use only for expensive calculations or when passing props to memoized child components. Don't overuse.
- **Animations:** Use `react-native-reanimated` instead of `Animated` for complex, 60fps animations that run on the UI thread.

---

## 1️⃣3️⃣ EAS Build & Deployment
> **⚡ TL;DR:** Build and deploy to app stores using Expo Application Services.

**Quick Commands:**
```bash
eas login
eas build:configure
eas build --platform all
eas submit --platform all
```

**app.json Key Fields:**
```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "version": "1.0.0",
    "ios": { "bundleIdentifier": "com.company.myapp" },
    "android": { "package": "com.company.myapp" }
  }
}
```

**OTA Updates:**
Run `eas update --branch preview` to push instant updates to users without app store review.

---

## 1️⃣4️⃣ Testing
> **⚡ TL;DR:** Ensure reliability with Jest and Detox.

**Jest + Testing Library Setup:**
```bash
npx expo install jest-expo @testing-library/react-native
```

**Working Test Example (`App.test.tsx`):**
```tsx
import { render, screen } from '@testing-library/react-native';
import App from './App';

test('renders hello world', () => {
  render(<App />);
  expect(screen.getByText('Hello World')).toBeTruthy();
});
```

**Detox (E2E) Setup:**
```bash
npm install -g detox-cli && npm install detox --save-dev
```

---

## 1️⃣5️⃣ Best Practices & Folder Patterns
> **⚡ TL;DR:** Structure for scale and maintainability.

- **Absolute Imports:** Configure `tsconfig.json` to use `@/components/Button` instead of `../../components/Button`.
  ```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
  ```
- **Environment Variables:** Use `.env` files. Expo automatically loads variables prefixed with `EXPO_PUBLIC_`.
  ```env
  EXPO_PUBLIC_API_URL=https://api.example.com
  ```
- **TypeScript:** Always use TS. Define interfaces for your API responses and component props.

---

## 🗓️ Last Updated: 2026-02-20

### CHANGELOG

| Date | What changed |
|------|--------------|
| 2026-02-20 | Initial creation of the Ultimate Expo & React Native Handbook. |
