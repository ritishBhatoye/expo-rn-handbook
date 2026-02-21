# 📋 Cheatsheet — Everything in One Place

> **TL;DR**
> - This is your command palette. Search (Ctrl+F) for what you need.
> - Every CLI command, every hook, every shortcut, every common fix.
> - Pin this file.

---

## Expo CLI Commands

```bash
# Dev Server
npx expo start                          # Start Metro bundler
npx expo start --clear                  # Start + clear cache
npx expo start --tunnel                 # Tunnel through ngrok
npx expo start --offline                # Skip network checks
npx expo start --port 8082              # Custom port

# Build & Run Locally
npx expo run:ios                        # Build + run on iOS simulator
npx expo run:android                    # Build + run on Android emulator
npx expo run:ios --device               # Run on physical device

# Dependencies
npx expo install <pkg>                  # Install Expo-compatible version
npx expo install --fix                  # Fix version mismatches
npx expo install --check                # Check without fixing

# Project Health
npx expo doctor                         # Diagnose issues
npx expo config --type public           # Print resolved config
npx expo lint                           # Run ESLint

# Native Project
npx expo prebuild                       # Generate /ios and /android
npx expo prebuild --clean               # Regenerate from scratch
npx expo prebuild --platform ios        # iOS only

# Export
npx expo export                         # Export for production
npx expo export --platform web          # Web export
```

## EAS CLI Commands

```bash
# Auth
eas login                               # Login to Expo account
eas whoami                              # Check logged-in user

# Build
eas build --platform all                # Build iOS + Android
eas build --platform ios                # iOS only
eas build --platform android            # Android only
eas build --profile development         # Dev client build
eas build --profile preview             # QA / internal build
eas build --profile production          # Store-ready build
eas build --local                       # Build on your machine
eas build:list                          # List recent builds
eas build:cancel                        # Cancel running build

# Submit
eas submit -p ios                       # Submit to App Store
eas submit -p android                   # Submit to Play Store

# Update (OTA)
eas update                              # Push OTA update
eas update --branch production          # Target branch
eas update --message "fix bug"          # With message
eas update:list                         # List updates
eas update:rollback                     # Rollback last update

# Credentials & Secrets
eas credentials                         # Manage certs/keys
eas secret:create --name X --value Y    # Add env secret
eas secret:list                         # List secrets
eas secret:delete --name X              # Remove secret

# Devices
eas device:create                       # Register test device
eas device:list                         # List registered devices

# Diagnostics
eas diagnostics                         # Debug EAS issues
```

## Metro Bundler Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `r` | Reload app |
| `m` | Toggle dev menu |
| `i` | Open iOS simulator |
| `a` | Open Android emulator |
| `w` | Open web browser |
| `j` | Open debugger |
| `s` | Switch between Expo Go / Dev Client |
| `shift+i` | Select iOS device |
| `shift+a` | Select Android device |

## Navigation Methods (Expo Router)

```tsx
import { useRouter, Link, Redirect } from "expo-router";

const router = useRouter();

// Navigate
router.push("/profile/42");          // Push (adds to stack)
router.replace("/home");             // Replace (no back)
router.back();                       // Go back
router.canGoBack();                  // Check if back is possible
router.dismiss();                    // Dismiss modal
router.dismissAll();                 // Dismiss all modals

// Declarative
<Link href="/settings">Settings</Link>
<Link href="/profile/42" asChild>
  <Pressable><Text>Profile</Text></Pressable>
</Link>

// Redirect (in components)
<Redirect href="/login" />
```

## Hooks Reference

| Hook | Package | When to Use |
|------|---------|-------------|
| `useState` | react | Simple local state |
| `useEffect` | react | Side effects on mount/update |
| `useRef` | react | Persistent value without re-render |
| `useMemo` | react | Cache expensive calculation |
| `useCallback` | react | Stable function reference |
| `useReducer` | react | Complex state transitions |
| `useContext` | react | Access context value |
| `useLayoutEffect` | react | Measure before paint |
| `useRouter` | expo-router | Imperative navigation |
| `useLocalSearchParams` | expo-router | Read URL params (typed) |
| `useGlobalSearchParams` | expo-router | Read params from any screen |
| `useSegments` | expo-router | Current route segments |
| `usePathname` | expo-router | Current URL path |
| `useFocusEffect` | @react-navigation | Run code on screen focus |
| `useNavigation` | @react-navigation | Access navigator object |
| `useColorScheme` | react-native | System dark/light mode |
| `useWindowDimensions` | react-native | Reactive screen size |
| `useSharedValue` | react-native-reanimated | UI thread animation value |
| `useAnimatedStyle` | react-native-reanimated | Animated style object |
| `useCameraPermissions` | expo-camera | Camera permission state |
| `useFonts` | expo-font | Load custom fonts |
| `useQuery` | @tanstack/react-query | Fetch + cache server data |
| `useMutation` | @tanstack/react-query | Mutate server data |
| `useInfiniteQuery` | @tanstack/react-query | Paginated/infinite data |

## Common Errors + Instant Fixes

| Error | Fix |
|-------|-----|
| `Unable to resolve module` | `npx expo start --clear` |
| `Text strings must be rendered within <Text>` | Wrap raw strings in `<Text>` |
| `VirtualizedLists should never be nested` | Remove parent ScrollView, use `ListHeaderComponent` |
| `Network request failed` (Android) | Use `10.0.2.2` instead of `localhost` |
| `SDK version mismatch` | `npx expo install --fix` |
| `Cannot find module` | Delete `node_modules`, run `npm install` |
| `Invariant Violation` | Check for undefined component imports |
| `Metro can't resolve` | Check `tsconfig.json` paths, clear `cache` |
| `Gradle build failed` | `cd android && ./gradlew clean` |
| `Xcode signing error` | `eas credentials` → regenerate |
| Reanimated crash | Add `react-native-reanimated/plugin` as LAST plugin in babel |
| Image 0×0 size | Add explicit `width` and `height` for URI images |
| `onRequestClose` crash | Add `onRequestClose` prop to `<Modal>` |
| Push token null | Must use physical device, not simulator |

## NPM Scripts Template

```json
{
  "scripts": {
    "start": "npx expo start",
    "dev": "npx expo start --clear",
    "ios": "npx expo run:ios",
    "android": "npx expo run:android",
    "web": "npx expo start --web",
    "build:dev": "eas build --profile development",
    "build:preview": "eas build --profile preview",
    "build:prod": "eas build --profile production --platform all",
    "submit:ios": "eas submit -p ios",
    "submit:android": "eas submit -p android",
    "update": "eas update --branch production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "npx expo lint",
    "doctor": "npx expo doctor",
    "clean": "rm -rf node_modules .expo && npm install"
  }
}
```

## File Extension Conventions

| Extension | Purpose |
|-----------|---------|
| `.tsx` | React components with JSX |
| `.ts` | Pure TypeScript (utils, types, stores) |
| `.ios.tsx` | iOS-only component |
| `.android.tsx` | Android-only component |
| `.web.tsx` | Web-only component |
| `.native.tsx` | iOS + Android (not web) |
| `.test.tsx` | Jest test file |
| `.d.ts` | TypeScript declaration file |

---

## ⚡ Shortcuts & Speed Tricks

- **`Cmd+Shift+P` → "Restart TS Server"** in VS Code when types are broken.
- **`npx expo install`** — always use this instead of `npm install` for Expo packages.
- **`.env.local`** for local-only env vars. Add to `.gitignore`.
- **`console.log(JSON.stringify(obj, null, 2))`** — readable logs in Metro terminal.
- **`⌘D` (iOS) / `Ctrl+M` (Android)** — open dev menu on device.