# Chapter 1 — Fundamentals & Setup

> **TL;DR**
> - Use `npx create-expo-app@latest` — `expo init` is deprecated.
> - Expo Go is for prototyping. Dev Client is for production. Bare workflow is for escape hatches.
> - `app.config.ts` is more powerful than `app.json` — use it from day one.

📚 [Expo Docs](https://docs.expo.dev/) · 🔗 [expo/expo](https://github.com/expo/expo) · 🔗 [expo/examples](https://github.com/expo/examples)

---

## Creating a New Project

⚠️ `expo init` is **deprecated**. Use `create-expo-app`.

```bash
# Create a new Expo app with the default template (includes Expo Router, TypeScript)
npx create-expo-app@latest my-app

# Create with a specific template
npx create-expo-app@latest my-app --template blank-typescript

# Start the dev server
cd my-app
npx expo start
```

What each command does:
- `create-expo-app`: Scaffolds the project, installs deps, sets up TypeScript.
- `npx expo start`: Boots **Metro Bundler**, which compiles your TS/JS and serves it to your connected device or simulator.

---

## Expo Go vs Dev Client vs Bare Workflow

| Feature | Expo Go | Dev Client | Bare Workflow |
|---------|---------|------------|---------------|
| Setup time | 0 min | 5 min | 30+ min |
| Custom native code | ❌ | ✅ | ✅ |
| Native modules (MMKV, etc.) | ❌ | ✅ | ✅ |
| OTA updates | ✅ | ✅ | Manual |
| Use case | Prototyping | Production | Escape hatch |

**Rule of thumb:** Start with Expo Go. Switch to Dev Client the moment you need a single native module not in Expo SDK. Use Bare Workflow only if you're forking native code.

```bash
# Create a development build (Dev Client)
npx expo install expo-dev-client
eas build --profile development --platform ios
```

---

## Full Folder Structure

After `create-expo-app` with the default template:

```
my-app/
├── app/                    # Expo Router — file-based routing
│   ├── (tabs)/             # Tab group layout
│   │   ├── _layout.tsx     # Tab navigator config
│   │   ├── index.tsx       # Home screen ("/")
│   │   └── explore.tsx     # Explore screen ("/explore")
│   ├── _layout.tsx         # Root layout (providers, fonts, splash)
│   └── +not-found.tsx      # 404 catch-all
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable components
├── constants/              # Theme colors, config values
├── hooks/                  # Custom hooks
├── app.json                # Static config (or app.config.ts)
├── babel.config.js         # Babel preset (babel-preset-expo)
├── package.json
└── tsconfig.json           # TypeScript config
```

**Key rules:**
- Files in `app/` become routes. `app/settings.tsx` → `/settings`.
- `_layout.tsx` wraps its sibling routes (think: providers, headers, tabs).
- Underscored files (`_layout.tsx`, `+not-found.tsx`) are NOT routes.

---

## app.json vs app.config.ts

`app.json` is static. `app.config.ts` is dynamic and lets you use environment variables and logic.

### app.config.ts (recommended)

```typescript
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "My App",
  slug: "my-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "myapp",                        // Deep linking scheme
  userInterfaceStyle: "automatic",        // Supports dark mode
  newArchEnabled: true,                   // Enable Fabric + TurboModules
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.company.myapp",
    infoPlist: {
      NSCameraUsageDescription: "We need camera access for photos.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.company.myapp",
    permissions: ["CAMERA", "ACCESS_FINE_LOCATION"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-camera",
      { cameraPermission: "Allow camera access for scanning." },
    ],
  ],
  extra: {
    apiUrl: process.env.API_URL ?? "https://api.example.com",
    eas: { projectId: "your-project-id" },
  },
});
```

### Key fields explained

| Field | Purpose |
|-------|---------|
| `slug` | URL-safe name, used by EAS and Expo Go |
| `scheme` | Custom URL scheme for deep linking (`myapp://`) |
| `newArchEnabled` | Enables the New Architecture (JSI, Fabric) |
| `plugins` | Config plugins that modify native code at prebuild |
| `extra` | Runtime values accessible via `expo-constants` |
| `ios.bundleIdentifier` | Unique ID for App Store |
| `android.package` | Unique ID for Play Store |

---

## TypeScript Config

The default `tsconfig.json` is fine. Key settings:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

**Path aliases** (`@/components/Button`) are supported out of the box with Expo Router. No extra Metro config needed.

---

## Essential CLI Commands

```bash
# Dev server
npx expo start                       # Start Metro
npx expo start --clear               # Start + clear Metro cache
npx expo start --tunnel              # Use ngrok tunnel (corporate wifi)
npx expo start --offline             # No network checks

# Platform-specific
npx expo run:ios                     # Build and run on iOS simulator
npx expo run:android                 # Build and run on Android emulator

# Dependencies
npx expo install react-native-reanimated   # Installs Expo-compatible version
npx expo install --fix                     # Fix mismatched versions

# Diagnostics
npx expo doctor                      # Check project health
npx expo config --type public        # Print resolved config

# Native project
npx expo prebuild                    # Generate /ios and /android folders
npx expo prebuild --clean            # Regenerate from scratch (destructive)

# Linting
npx expo lint                        # Run ESLint with Expo config
```

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `expo init is not a command` | `expo init` removed in SDK 50+ | Use `npx create-expo-app@latest` |
| `Unable to resolve module` | Metro cache stale | `npx expo start --clear` |
| `SDK version mismatch` | Expo Go version != project SDK | Update Expo Go, or run `npx expo install --fix` |
| `Command not found: eas` | EAS CLI not installed globally | `npm install -g eas-cli` |
| `Could not connect to development server` | Firewall or wrong network | Use `--tunnel` flag or check wifi |
| `ios/android folder missing` | Managed workflow (expected) | Run `npx expo prebuild` only if you need them |

---

## ⚡ Shortcuts & Speed Tricks

- **Skip Expo Go entirely** for production apps — go straight to Dev Client with `expo-dev-client`.
- **Path aliases** (`@/components/X`) work out of the box. Don't waste time configuring Babel for this.
- **`npx expo install`** always picks the right version for your SDK. Never use raw `npm install` for Expo-compatible packages.
- **`npx expo doctor`** catches 90% of config issues. Run it before filing a bug.
- **Press `j`** in the Metro terminal to open the debugger. Way faster than setting up Flipper.