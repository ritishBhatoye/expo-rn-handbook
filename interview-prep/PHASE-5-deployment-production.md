# Phase 5 — Deployment & Production

> Senior developers must understand the full deployment lifecycle. This phase covers Expo vs bare workflow, EAS build and update, store submission, CI/CD pipelines, and error monitoring.

---

## Table of Contents

1. [Expo vs Bare Workflow](#1-expo-vs-bare-workflow)
2. [EAS Build & Update](#2-eas-build--update)
3. [App Store & Play Store Submission](#3-app-store--play-store-submission)
4. [OTA Updates & Versioning](#4-ota-updates--versioning)
5. [CI/CD Pipelines](#5-cicd-pipelines)
6. [Error Monitoring & Crash Reporting](#6-error-monitoring--crash-reporting)

---

## 1. Expo vs Bare Workflow

**Interview Question:** "When would you choose Expo managed workflow over bare React Native? What are the trade-offs?"

### Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKFLOW COMPARISON                          │
├─────────────────────┬───────────────────┬───────────────────────┤
│ Aspect             │ Managed Workflow  │ Bare Workflow         │
├─────────────────────┼───────────────────┼───────────────────────┤
│ Native code        │ Via config plugins│ Direct access         │
│ Build process      │ EAS (cloud)       │ Local or CI           │
│ OTA updates        │ ✅ Built-in        │ Manual implementation │
│ Custom fonts       │ expo-font         │ Direct linking        │
│ Native modules     │ Limited           │ Full                  │
│ Development speed  │ Fast              │ Slower                │
│ Debugging          │ Expo DevTools     │ Full native debug     │
│ App Store review   │ Standard          │ Standard              │
│ Custom native      ❌                  │ ✅                    │
│ Push notifications │ Expo Notifs       │ Direct APNs/FCM       │
└─────────────────────┴───────────────────┼───────────────────────┘
```

### Migration: Managed to Bare

```bash
# Generate native directories
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean

# Now you can:
# - Add custom native modules
# - Edit native code directly
# - Build with Xcode/Android Studio
```

### When to Use Each

| Scenario | Recommended Workflow |
|----------|-------------------|
| New app, MVP, prototyping | Managed (Expo) |
| Standard app with common features | Managed (Expo) |
| Need custom native modules | Bare |
| Complex background processing | Bare |
| Legacy native code to integrate | Bare |
| Heavy media processing | Bare |
| Need fine-tuned native performance | Bare |

---

## 2. EAS Build & Update

### EAS Build Configuration

```json
// eas.json
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
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "enterpriseProvisioning": "automatic"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "image": "latest"
      },
      "android": {
        "image": "latest"
      }
    },
    "device-builds": {
      "extends": "production",
      "ios": {
        "deviceGroup": "team-devices"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### EAS Update Configuration

```typescript
// app.config.ts
export default {
  updates: {
    url: "https://u.expo.dev/your-project-id",
    enabled: true,
    fallbackToCacheTimeout: 2000,
    checkAutomatically: "ON_LOAD",
  },
  runtimeVersion: {
    policy: "appVersion", // or "sdkVersion", "nativeVersion"
  },
};
```

### Update Strategies

```typescript
// Different update strategies
const updateStrategies = {
  // Check on every app load
  onLoad: {
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
  },

  // Check in background, don't block
  onForeground: {
    checkAutomatically: "ON_ERROR_RECOVERY",
    fallbackToCacheTimeout: 2000,
  },

  // Manual check only
  manual: {
    checkAutomatically: "NEVER",
  },
};
```

---

## 3. App Store & Play Store Submission

### iOS Submission Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                 APP STORE SUBMISSION CHECKLIST                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. App Information                                             │
│     □ App name (localized)                                      │
│     □ Description                                               │
│     □ Keywords                                                  │
│     □ Screenshots (multiple sizes)                               │
│     □ App preview videos                                         │
│                                                                 │
│  2. Build                                                       │
│     □ Production build created                                  │
│     □ TestFlight internal testing complete                      │
│     □ No debug symbols in release                                │
│                                                                 │
│  3. Metadata                                                    │
│     □ Copyright                                                 │
│     □ Support URL                                               │
│     □ Privacy Policy URL                                        │
│     □ Age rating completed                                      │
│                                                                 │
│  4. Signatures                                                  │
│     □ Distribution certificate valid                             │
│     □ Provisioning profile valid                                 │
│     □ Push notification certificate                             │
│                                                                 │
│  5. Testing                                                     │
│     □ Beta testers notified                                     │
│     □ All features tested                                       │
│     □ Crash-free                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Android Submission Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                 PLAY STORE SUBMISSION CHECKLIST                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. App Information                                             │
│     □ App name                                                  │
│     □ Short description                                         │
│     □ Full description                                          │
│     □ Screenshots (Phone + Tablet)                              │
│     □ Feature graphic                                           │
│     □ Promotional graphics                                      │
│                                                                 │
│  2. Build                                                      │
│     □ AAB (Android App Bundle)                                  │
│     □ Signed with release key                                   │
│     □ Version code incremented                                  │
│                                                                 │
│  3. Store Listing                                              │
│     □ Privacy Policy URL (required if collecting data)         │
│     □ Email address                                             │
│     □ Category and content rating                               │
│                                                                 │
│  4. Release                                                    │
│     □ Testing tracks completed                                  │
│     □ Pre-launch report issues resolved                        │
│     □ App access instructions (if needed)                       │
│                                                                 │
│  5. Compliance                                                 │
│     □ Data safety form completed                                │
│     □ Ads declaration                                           │
│     □ Target audience selected                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. OTA Updates & Versioning

### Version Management

```bash
# Auto-increment version
eas build --platform ios --profile production --autoIncrement

# Manual version
eas build:version:set --platform android --version-code 42

# Check versions
eas build:version:list
```

### Update Rollout Strategy

```typescript
// Phased rollout for updates
const updateRollout = {
  // Start with 10%
  initial: {
    percentage: 10,
    releaseGroups: ["early-adopters"],
  },

  // Expand to 50%
  expansion: {
    percentage: 50,
    criteria: "no critical issues in 24h",
  },

  // Full rollout
  full: {
    percentage: 100,
    criteria: "no critical issues in 48h",
  },
};

// Rollback function
async function rollbackUpdate(updateId: string) {
  // Get previous build
  const builds = await easBuildList({ limit: 5 });
  const stableBuild = builds.find(b => b.status === "finished" && b.isStable);

  // Point update to stable build
  await easUpdateRollback({
    channel: "production",
    runtimeVersion: stableBuild.runtimeVersion,
  });
}
```

---

## 5. CI/CD Pipelines

### GitHub Actions - Full Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Stores

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  EXPO_PROJECT_ID: ${{ secrets.EXPO_PROJECT_ID }}
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npx tsc --noEmit

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
      - run: eas build --platform ios --profile production --autoIncrement --non-interactive
      - run: echo "BUILD_ID=$(eas build:list --platform ios --limit 1 --json | jq -r '.[0].id')" >> $GITHUB_ENV

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
      - run: eas build --platform android --profile production --autoIncrement --non-interactive

  submit-ios:
    needs: build-ios
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
      - run: eas submit --platform ios --profile production --non-interactive

  submit-android:
    needs: build-android
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
      - run: eas submit --platform android --profile production --non-interactive
```

---

## 6. Error Monitoring & Crash Reporting

### Sentry Integration

```bash
npx expo install @sentry/react-native
```

```typescript
// sentry.config.ts
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? "development" : "production",
  release: `myapp@${process.env.APP_VERSION}`,
  dist: process.env.BUILD_NUMBER,
  
  // Enable auto instrumentation
  integrations: [
    Sentry.reactNativeTracingIntegration({
      tracingOrigins: ["myapp.com", "api.myapp.com"],
    }),
  ],
  
  // Sampling rates
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  profilesSampleRate: __DEV__ ? 1.0 : 0.1,
  
  // Filter events
  beforeSend(event) {
    // Don't send events in development
    if (__DEV__) {
      return null;
    }
    
    // Filter specific errors
    if (event.exception?.values?.[0]?.type === "NetworkError") {
      // Handle network errors differently
    }
    
    return event;
  },
});

// Wrap App
function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorScreen />}>
      <YourApp />
    </Sentry.ErrorBoundary>
  );
}
```

### Firebase Crashlytics

```bash
npx expo install @react-native-firebase/app @react-native-firebase/crashlytics
```

```typescript
// firebase.config.ts
import { firebase } from "@react-native-firebase/app";
import crashlytics from "@react-native-firebase/crashlytics";

const app = firebase.initializeApp({
  // Your Firebase config
});

// Enable crashlytics
crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
```

### Custom Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Log crash
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry, but something unexpected happened.
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false, error: null })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### Performance Monitoring

```typescript
// Performance tracking
import * as Sentry from "@sentry/react-native";

// Track custom performance metrics
function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startInactiveSpan({
    name,
    op: "function",
  });

  return operation()
    .then((result) => {
      transaction.setStatus("ok");
      return result;
    })
    .catch((error) => {
      transaction.setStatus("error");
      throw error;
    })
    .finally(() => {
      transaction.end();
    });
}

// Usage
const data = await measureAsyncOperation("fetchUser", () => fetchUser(id));
```

---

## Summary

Deployment knowledge for senior developers:

1. **Workflow choice** - Use Expo for most apps, bare for complex native needs
2. **EAS** - Master build, update, and submit commands
3. **Store submission** - Complete all required metadata and assets
4. **OTA updates** - Use staged rollouts and implement rollback
5. **CI/CD** - Automate testing, building, and submission
6. **Error monitoring** - Integrate Sentry or Crashlytics for production

Next: Phase 6 covers architecture patterns and best practices.
