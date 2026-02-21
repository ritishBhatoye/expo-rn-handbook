# Chapter 1: Fundamentals & Setup

**TL;DR**
- Use `create-expo-app` (never `expo init`).
- Understand the difference between Expo Go, Dev Client, and Bare Workflow.
- Master the project structure, `app.json`, and TypeScript config.

## Setup Commands

⚠️ **Deprecated:** `expo init`
✅ **Current:** `npx create-expo-app@latest`

```bash
# Create a new project with TypeScript and Expo Router
npx create-expo-app@latest my-app --template tabs
cd my-app
npx expo start
```

## Workflows Explained

1. **Expo Go:** Great for quick prototyping. Limited to pre-compiled native modules.
2. **Development Builds (Dev Client):** The standard for production apps. Allows custom native code while keeping the Expo DX.
3. **Bare Workflow:** You manage the native `ios` and `android` folders directly. Use only if absolutely necessary.

## Folder Structure

```text
my-app/
├── app/               # Expo Router file-based routing
├── assets/            # Images, fonts, etc.
├── components/        # Reusable UI components
├── constants/         # Theme, colors, config
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

## Configuration (`app.json` / `app.config.ts`)

Use `app.json` for static config, or `app.config.ts` if you need environment variables.

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyApp',
  slug: 'my-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.mycompany.myapp',
  },
  android: {
    package: 'com.mycompany.myapp',
  },
});
```

## TypeScript Config

Expo sets up a solid `tsconfig.json` by default. Extend it if needed:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Links
- [Expo Docs: Create a project](https://docs.expo.dev/get-started/create-a-project/)
- [GitHub: expo/expo](https://github.com/expo/expo)

## ⚠️ Gotchas & Common Errors

- **Error:** `Cannot find module 'expo/config'`
  - **Fix:** Ensure you have `@expo/config` installed or use `app.json` instead of `app.config.ts` if you don't need dynamic config.
- **Gotcha:** Forgetting to clear the bundler cache when changing config.
  - **Fix:** Run `npx expo start -c`.

## ⚡ Shortcuts & Speed Tricks

- **Clear Cache:** `npx expo start -c` (fixes 90% of weird Metro issues).
- **Open in iOS Simulator:** Press `i` in the terminal running Expo.
- **Open in Android Emulator:** Press `a` in the terminal running Expo.