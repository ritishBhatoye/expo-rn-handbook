# Cheatsheet & Shortcuts

**TL;DR**
- Your daily copy-paste reference for Expo and React Native.

## Essential CLI Commands

```bash
# Create project
npx create-expo-app@latest my-app

# Start bundler (clear cache)
npx expo start -c

# Install native module (auto-links and ensures version compatibility)
npx expo install package-name

# Prebuild (generate native folders)
npx expo prebuild --clean

# EAS Build
eas build --profile preview --platform all
```

## Navigation (Expo Router)

```tsx
import { router, useLocalSearchParams } from 'expo-router';

// Push
router.push('/details');

// Replace
router.replace('/home');

// Back
router.back();

// Get Params
const { id } = useLocalSearchParams();
```

## Hooks Quick Reference

- `useState`: Local component state.
- `useEffect`: Side effects (fetching, subscriptions).
- `useCallback`: Memoize functions.
- `useMemo`: Memoize values.
- `useRef`: Mutable reference that doesn't trigger re-renders (or DOM refs).
- `useWindowDimensions`: Get screen width/height.
- `useColorScheme`: Detect dark/light mode.

## Keyboard Shortcuts (Expo Go / Dev Client)

- **iOS Simulator:**
  - `Cmd + D`: Open Dev Menu
  - `Cmd + R`: Reload App
  - `Cmd + Shift + H`: Go to Home Screen
- **Android Emulator:**
  - `Cmd + M` (Mac) / `Ctrl + M` (Win): Open Dev Menu
  - `R + R`: Reload App

## Common Errors & Instant Fixes

1. **"Invariant Violation: View config not found"**
   - *Fix:* You are trying to render a non-React Native component (like a `<div>` or a string outside a `<Text>` tag).
2. **"Metro Bundler stuck / weird caching issues"**
   - *Fix:* `npx expo start -c`
3. **"Pod install failed" (Bare workflow)**
   - *Fix:* `cd ios && pod install --repo-update`

## ⚡ Shortcuts & Speed Tricks
- Use `npx expo-env-info` when reporting bugs to get your exact environment details.
- [GitHub: expo/expo](https://github.com/expo/expo)