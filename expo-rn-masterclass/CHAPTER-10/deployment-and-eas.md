# Chapter 10 — Deployment & EAS

> **TL;DR**
> - EAS Build compiles your app in the cloud. No Xcode or Android Studio needed for CI.
> - EAS Update pushes JS/asset changes over-the-air. You cannot change native code via OTA.
> - App signing is automatic by default. Let EAS manage your certificates unless you have a reason not to.

📚 [EAS Docs](https://docs.expo.dev/eas/) · 🔗 [expo/eas-cli](https://github.com/expo/eas-cli)

---

## EAS CLI Setup

```bash
# Install globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize EAS for your project
eas build:configure
```

This creates `eas.json` in your project root.

---

## eas.json — Build Profiles

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Profile Explanations

| Profile | Purpose | Output |
|---------|---------|--------|
| `development` | Testing with Dev Client | Debug builds with dev tools |
| `preview` | Internal testing / QA | APK (Android) or Ad Hoc IPA (iOS) |
| `production` | App Store / Play Store release | Signed AAB (Android) or IPA (iOS) |

---

## Building

```bash
# Build for both platforms
eas build --platform all

# Build iOS only
eas build --platform ios --profile production

# Build Android only (APK for testing)
eas build --platform android --profile preview

# Build for iOS simulator
eas build --platform ios --profile development

# List recent builds
eas build:list

# Cancel a running build
eas build:cancel
```

### Local Builds (No Cloud)

```bash
# Build locally (requires Xcode / Android Studio)
eas build --platform ios --local
eas build --platform android --local
```

---

## Submitting to Stores

### App Store (iOS)

```bash
eas submit --platform ios --profile production
```

Prerequisites:
1. Apple Developer account ($99/year)
2. App created in App Store Connect
3. `appleId`, `ascAppId`, `appleTeamId` in `eas.json`

### Google Play (Android)

```bash
eas submit --platform android --profile production
```

Prerequisites:
1. Google Play Developer account ($25 one-time)
2. App created in Google Play Console
3. Service account key JSON file (download from Google Cloud Console)
4. First upload MUST be done manually through Play Console

---

## OTA Updates (eas update)

Push JavaScript and asset changes directly to users' devices. **No store review needed.**

```bash
# Push an update to production
eas update --branch production --message "Fix login crash"

# Push to preview
eas update --branch preview --message "New onboarding flow"

# List recent updates
eas update:list
```

### What CAN be updated OTA

| Updatable | Not Updatable |
|-----------|---------------|
| JS/TS code | Native modules (Swift/Kotlin) |
| Images/assets | App icon |
| Styles | Splash screen |
| Navigation logic | `app.json` native config |
| API calls | Permissions declarations |
| New screens (JS only) | New native libraries |

### How It Works

```
[ Your Code ] → eas update → [ EAS Servers ]
                                    ↓
                              [ User opens app ]
                                    ↓
                              [ App checks for updates ]
                                    ↓
                              [ Downloads new JS bundle ]
                                    ↓
                              [ Next app launch uses new code ]
```

### Update Configuration

```tsx
// app.config.ts
export default {
  updates: {
    url: "https://u.expo.dev/your-project-id",
    enabled: true,
    fallbackToCacheTimeout: 0,    // Don't block app launch
    checkAutomatically: "ON_LOAD", // Check on every launch
  },
  runtimeVersion: {
    policy: "appVersion",          // Match updates to app version
  },
};
```

---

## Environment Variables

### In EAS (Cloud Builds)

```bash
# Set a secret (not visible in logs)
eas secret:create --name API_KEY --value "sk-abc123" --scope project

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name API_KEY
```

### In Your Code

```tsx
// Use EXPO_PUBLIC_ prefix for client-side variables
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// For build-time only secrets (not in JS bundle)
// Access via app.config.ts extra field
```

### eas.json Environment Per Profile

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.production.com"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.staging.com"
      }
    }
  }
}
```

⚠️ **`EXPO_PUBLIC_` variables are embedded in the JS bundle.** Never put secrets (API keys, passwords) in them. Use `eas secret:create` for true secrets, accessed only at build time.

---

## App Signing

### Automatic (Recommended)

EAS manages all certificates and provisioning profiles for you.

```bash
# EAS handles everything on first build
eas build --platform ios --profile production
# → Prompts to create Apple credentials automatically
```

### Manual (When Required)

```bash
# Manage credentials explicitly
eas credentials

# Options:
# - Download existing certificates
# - Upload your own
# - Set up push notification keys
```

### When to Go Manual

| Scenario | Use |
|----------|-----|
| Solo/small team | ✅ Automatic |
| Enterprise with existing certs | Manual |
| Multiple apps sharing one cert | Manual |
| First time ever | ✅ Automatic |

---

## CI/CD with GitHub Actions

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build for production
        run: eas build --platform all --profile production --non-interactive

      - name: Submit to stores
        if: github.ref == 'refs/heads/main'
        run: eas submit --platform all --profile production --non-interactive
```

### Get EXPO_TOKEN

```bash
# Generate a robot token for CI
npx expo login
# Go to expo.dev → Settings → Access Tokens → Create
# Add as GitHub Secret: EXPO_TOKEN
```

---

## Version Management

```bash
# Auto-increment build number on each build
# In eas.json:
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}

# Or manage manually
eas build:version:set --platform ios --build-number 42
eas build:version:set --platform android --version-code 42
```

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `No credentials found` | First build, no Apple certs | Let EAS create them: answer "Yes" to prompts |
| OTA update not appearing | Wrong branch or runtime version | Check `eas update:list` and verify `runtimeVersion` matches |
| Build fails with `INSTALL_FAILED` | Old APK installed on device | Uninstall the existing app first |
| `eas submit` fails for Android | First upload must be manual | Upload the first AAB manually via Play Console |
| Secrets undefined in app | Using wrong prefix | Runtime: `EXPO_PUBLIC_X`. Build-time: `eas secret:create` |
| Build timeout | Large native dependencies | Use `resourceClass: m-medium` or higher in `eas.json` |

---

## ⚡ Shortcuts & Speed Tricks

- **`--non-interactive`** flag — required for CI. Skips all prompts.
- **`autoIncrement: true`** — never manually bump build numbers again.
- **`eas update`** takes seconds. Store submissions take days. Use OTA for bug fixes.
- **`distribution: "internal"`** — share preview builds via QR code without TestFlight/Play Console.
- **`eas diagnostics`** — run this before filing a build issue. It captures everything EAS support needs.
- **`eas device:create`** — register iOS test devices for ad-hoc builds without UDID hunting.