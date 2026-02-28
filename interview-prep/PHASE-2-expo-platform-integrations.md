# Phase 2 — Expo & Platform Integrations

> This phase covers the critical platform-specific features that distinguish mobile development from web. Senior developers must understand permissions, notifications, deep linking, background processing, and hardware access.

---

## Table of Contents

1. [Permissions Handling](#1-permissions-handling)
2. [Push Notifications](#2-push-notifications)
3. [Linking & Deep Linking](#3-linking--deep-linking)
4. [Background Tasks & Headless JS](#4-background-tasks--headless-js)
5. [App Lifecycle](#5-app-lifecycle)
6. [Device Sensors & Hardware Access](#6-device-sensors--hardware-access)

---

## 1. Permissions Handling

**Interview Question:** "How do you handle permissions in React Native? What's the pattern for requesting permissions gracefully?"

### Permission Pattern

```tsx
import { Platform, Alert, Linking } from "react-native";
import * as Permissions from "expo-permissions";

type PermissionStatus = "granted" | "undetermined" | "denied";

interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  granted: boolean;
}

async function checkAndRequestPermission(
  permission: Permissions.PermissionType
): Promise<boolean> {
  const { status: existingStatus } = await Permissions.getAsync(permission);

  if (existingStatus === "granted") {
    return true;
  }

  if (existingStatus === "denied") {
    // User previously denied - can't ask again
    Alert.alert(
      "Permission Required",
      "This feature requires permission. Please enable it in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  // First time asking
  const { status } = await Permissions.askAsync(permission);
  return status === "granted";
}

// Usage for camera
async function requestCameraPermission(): Promise<boolean> {
  return checkAndRequestPermission(Permissions.CAMERA);
}

// Usage for location
async function requestLocationPermission(): Promise<boolean> {
  const { status: foregroundStatus } = await Permissions.getAsync(
    Permissions.LOCATION_FOREGROUND
  );

  if (foregroundStatus !== "granted") {
    const { status } = await Permissions.askAsync(Permissions.LOCATION_FOREGROUND);
    return status === "granted";
  }

  return true;
}
```

### Granular Location Permissions

```tsx
import * as Location from "expo-location";

async function requestLocationPermissions() {
  // Foreground location (always required first)
  const fgPermission = await Location.requestForegroundPermissionsAsync();

  if (fgPermission.status !== "granted") {
    return { foreground: false, background: false };
  }

  // Background location (optional, requires extra)
  const bgPermission = await Location.requestBackgroundPermissionsAsync();

  return {
    foreground: fgPermission.status === "granted",
    background: bgPermission.status === "granted",
  };
}

function LocationComponent() {
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { foreground } = await requestLocationPermissions();
      setHasPermission(foreground);

      if (foreground) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc);
      }
    })();
  }, []);

  if (!hasPermission) {
    return <Text>Location permission required</Text>;
  }

  return <Text>Location: {location?.coords.latitude}</Text>;
}
```

### Permission Hook

```tsx
import { useState, useEffect, useCallback } from "react";
import * as Permissions from "expo-permissions";

type PermissionHook = {
  status: PermissionStatus;
  isGranted: boolean;
  isDenied: boolean;
  isUndetermined: boolean;
  request: () => Promise<boolean>;
  check: () => Promise<void>;
};

function usePermission(permissionType: Permissions.PermissionType): PermissionHook {
  const [status, setStatus] = useState<PermissionStatus>("undetermined");

  const check = useCallback(async () => {
    const { status } = await Permissions.getAsync(permissionType);
    setStatus(status);
  }, [permissionType]);

  const request = useCallback(async () => {
    const { status } = await Permissions.askAsync(permissionType);
    setStatus(status);
    return status === "granted";
  }, [permissionType]);

  useEffect(() => {
    check();
  }, [check]);

  return {
    status,
    isGranted: status === "granted",
    isDenied: status === "denied",
    isUndetermined: status === "undetermined",
    request,
    check,
  };
}

// Usage
function CameraScreen() {
  const { isGranted, request } = usePermission(Permissions.CAMERA);

  if (!isGranted) {
    return (
      <View>
        <Text>Camera permission required</Text>
        <Button title="Grant Permission" onPress={request} />
      </View>
    );
  }

  return <CameraView />;
}
```

### Permission Configuration in app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera for scanning."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location for tracking.",
          "locationAlwaysPermission": "Allow $(PRODUCT_NAME) to use your location in the background."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "cameraPermission": "Allow $(PRODUCT_NAME) to take photos."
        }
      ]
    ]
  }
}
```

---

## 2. Push Notifications

**Interview Question:** "Explain the flow of push notifications in React Native. How do you handle device tokens and notification responses?"

### Push Notification Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUSH NOTIFICATION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REGISTER                                                   │
│     App → Expo Push Service → Get Device Token                │
│              ↑                                                 │
│     Device Token stored on your server                         │
│                                                                 │
│  2. SEND                                                       │
│     Your Server → Expo Push Service → APNs / FCM → Device      │
│                                                                 │
│  3. RECEIVE                                                    │
│     Device → App (foreground) / System (background)            │
│                                                                 │
│  4. INTERACT                                                   │
│     User taps → App opens with notification data              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Complete Push Notification Setup

```tsx
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? null))
      .catch((error) => console.error("Failed to get push token:", error));

    // Notification received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        // Handle notification data
        const { data } = notification.request.content;
        console.log("Notification received:", data);
      }
    );

    // User tapped on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        console.log("Notification tapped:", data);
        // Navigate based on notification data
        handleNotificationTap(data);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Failed to get push token for notifications");
    return null;
  }

  // Configure Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });

    // Create separate channel for important notifications
    await Notifications.setNotificationChannelAsync("important", {
      name: "Important",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    console.warn("No projectId configured");
    return null;
  }

  try {
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return pushToken;
  } catch (error) {
    console.error("Failed to get Expo push token:", error);
    return null;
  }
}

function handleNotificationTap(data: any) {
  // Navigate based on notification data
  const { type, id, screen } = data;
  console.log("Navigate to:", screen, "with id:", id);
}
```

### Sending Push Notifications (Backend)

```tsx
// Example: Node.js backend to send push notifications
interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: "normal" | "high";
  channelId?: string;
}

async function sendPushNotification(token: string, message: ExpoPushMessage) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      title: message.title,
      body: message.body,
      data: message.data,
      sound: message.sound ?? "default",
      priority: message.priority ?? "high",
      channelId: message.channelId ?? "default",
    }),
  });

  return response.json();
}

// Batch send
async function sendBatchNotifications(tokens: string[], title: string, body: string) {
  const messages = tokens.map((token) => ({
    to: token,
    title,
    body,
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  return response.json();
}
```

### Local Notifications

```tsx
import * as Notifications from "expo-notifications";

async function scheduleLocalNotification() {
  // Schedule for later
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder",
      body: "Don't forget to check your tasks!",
      data: { screen: "/tasks", taskId: "123" },
      sound: "default",
    },
    trigger: {
      seconds: 60 * 60, // 1 hour from now
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return id;
}

async function scheduleRepeatingNotification() {
  // Repeating notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Reminder",
      body: "Check your daily goals!",
    },
    trigger: {
      hour: 9,
      minute: 0,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

### Notification Badges

```tsx
// Set badge count
await Notifications.setBadgeCountAsync(5);

// Get badge count
const count = await Notifications.getBadgeCountAsync();

// iOS only - present badge immediately
Notifications.presentBadgeCountAsync(3);
```

---

## 3. Linking & Deep Linking

**Interview Question:** "How do you implement deep linking in both React Navigation and Expo Router? What about universal links?"

### URL Schemes

```tsx
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

// Open external URL
await WebBrowser.openBrowserAsync("https://example.com");

// Check if URL can be opened
const canOpen = await Linking.canOpenURL("twitter://user?id=123");

// Open another app
if (canOpen) {
  await Linking.openURL("twitter://user?id=123");
}

// Get initial URL (when app was opened via link)
const initialURL = Linking.useURL();

// Listen for URL changes while app is open
Linking.addEventListener("url", (event) => {
  handleDeepLink(event.url);
});
```

### Deep Link Configuration

```tsx
// app.json configuration
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "associatedDomains": [
        "applinks:myapp.com",
        "applinks:staging.myapp.com"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "myapp.com",
              "pathPrefix": "/"
            },
            {
              "scheme": "myapp"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Expo Router Deep Linking

```tsx
// app/product/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Deep link: myapp://product/123 or https://myapp.com/product/123

  return <Text>Product: {id}</Text>;
}

// Handle links in the app
function handleDeepLink(url: string) {
  // Parse the URL
  const { hostname, path, queryParams } = Linking.parse(url);

  // Route based on path
  if (path?.startsWith("product/")) {
    const productId = path.split("/")[1];
    router.push(`/product/${productId}`);
  } else if (path?.startsWith("user/")) {
    const userId = path.split("/")[1];
    router.push(`/user/${userId}`);
  }
}
```

### Universal Links (iOS) & App Links (Android)

```json
// For iOS - apple-app-site-association file on your server
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.myapp.app",
        "paths": ["/product/*", "/user/*"]
      }
    ]
  }
}
```

```json
// For Android - assetlinks.json on your server
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.myapp.app",
      "sha256_cert_fingerprints": ["..."]
    }
  }
]
```

### Testing Deep Links

```bash
# iOS Simulator
xcrun simctl openurl booted "myapp://product/123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"

# Using expo-cli
npx expo uri-scheme open "myapp://product/123" --ios
npx expo uri-scheme open "myapp://product/123" --android
```

---

## 4. Background Tasks & Headless JS

**Interview Question:** "How do you handle background tasks in React Native? What's the difference between foreground, background, and headless execution?"

### Background Tasks with expo-task-manager

```tsx
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { Platform } from "react-native";

const BACKGROUND_LOCATION_TASK = "background-location-task";
const BACKGROUND_SYNC_TASK = "background-sync-task";

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }

  if (data) {
    const { locations } = data as {
      locations: Location.LocationObject[];
    };

    // Process location data
    const latestLocation = locations[0];
    console.log("Background location:", latestLocation.coords);

    // Save to local storage or trigger API call
    saveLocationToStorage(latestLocation);
  }
});

TaskManager.defineTask(BACKGROUND_SYNC_TASK, ({ data, error }) => {
  if (error) {
    console.error("Background sync error:", error);
    return;
  }

  // Sync pending data
  syncPendingData();
});

async function startBackgroundLocation() {
  // Request permissions
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== "granted") {
    console.warn("Foreground location permission not granted");
    return;
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();

  if (backgroundStatus !== "granted") {
    console.warn("Background location permission not granted");
    return;
  }

  // Check if task is already defined
  const isDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
  if (!isDefined) {
    console.warn("Background location task not defined");
    return;
  }

  // Start the task
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100, // meters
    deferredUpdatesInterval: 60 * 1000, // 1 minute
    foregroundService: {
      notificationTitle: "Location Tracking",
      notificationBody: "Your location is being tracked background",
      notification in theColor: "#0a84ff",
    },
    showsBackgroundLocationIndicator: true,
  });
}

async function stopBackgroundLocation() {
  await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
}
```

### Background Fetch

```tsx
import * as BackgroundFetch from "expo-background-fetch";

const BACKGROUND_FETCH_TASK = "background-fetch";

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Fetch new data
    const newData = await fetchNewData();

    // Return result
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetch() {
  const status = await BackgroundFetch.requestPermissionsAsync();

  if (status !== "granted") {
    console.warn("Background fetch permissions not granted");
    return;
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

### App State and Background Handling

```tsx
import { AppState, AppStateStatus } from "react-native";
import { useEffect, useRef } from "react";

function AppLifecycleComponent() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    console.log("App state changed:", appState.current, "->", nextAppState);

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to the foreground
      console.log("App has come to the foreground");
      refreshData();
    } else if (
      appState.current === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      // App is going to background
      console.log("App is going to background");
      saveState();
    }

    appState.current = nextAppState;
  }

  return <View />;
}
```

### Foreground Service (Android)

```tsx
import { Platform } from "react-native";
import { ExpoForegroundService } from "@unimodules/foreground-service";

async function startForegroundService() {
  if (Platform.OS !== "android") return;

  await ExpoForegroundService.createNotificationChannel({
    id: "foreground-service",
    name: "Foreground Service",
    description: "Keeps the app running in the foreground",
    importance: 4, // IMPORTANCE_HIGH
  });

  await ExpoForegroundService.startService({
    channelId: "foreground-service",
    title: "App Running",
    message: "The app is performing background tasks",
    iconUrl: "https://example.com/icon.png",
    importance: 4,
  });
}

async function stopForegroundService() {
  if (Platform.OS !== "android") return;
  await ExpoForegroundService.stopService();
}
```

---

## 5. App Lifecycle

**Interview Question:** "Explain the app lifecycle in React Native. How do you handle app state transitions and preserve user data?"

### Lifecycle States

```
┌─────────────────────────────────────────────────────────────────┐
│                    APP LIFECYCLE STATES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐                                                   │
│  │  ACTIVE  │ ← App is in foreground, receiving user input    │
│  └────┬─────┘                                                   │
│       │                                                             │
│       │ App loses focus                                          │
│       ▼                                                             │
│  ┌──────────┐                                                   │
│  │ INACTIVE │ ← Phone call, notification, etc.                 │
│  └────┬─────┘                                                   │
│       │                                                             │
│       │ App enters background                                    │
│       ▼                                                             │
│  ┌──────────┐                                                   │
│  │BACKGROUND│ ← App not visible, may be suspended             │
│  └────┬─────┘                                                   │
│       │                                                             │
│       │ System kills app                                         │
│       ▼                                                             │
│  ┌──────────┐                                                   │
│  │ TERMINATED│ ← App killed by system or user                   │
│  └──────────┘                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Lifecycle Hooks Implementation

```tsx
import { AppState, AppStateStatus, NetInfo } from "react-native";
import { useEffect, useRef, useCallback } from "react";

export function useAppLifecycle(
  onForeground?: () => void,
  onBackground?: () => void,
  onActive?: () => void,
  onInactive?: () => void
) {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      console.log(
        `AppState transition: ${appState.current} -> ${nextAppState}`
      );

      if (
        appState.current === "background" &&
        nextAppState === "active"
      ) {
        // App came to foreground
        onForeground?.();
        onActive?.();
      } else if (
        appState.current === "active" &&
        nextAppState === "background"
      ) {
        // App went to background
        onBackground?.();
      } else if (
        appState.current === "active" &&
        nextAppState === "inactive"
      ) {
        onInactive?.();
      }

      appState.current = nextAppState;
    },
    [onForeground, onBackground, onActive, onInactive]
  );
}

// Usage in app
export default function App() {
  useAppLifecycle(
    () => {
      console.log("App is in foreground - refresh data");
      refreshAppData();
    },
    () => {
      console.log("App is in background - save state");
      saveAppState();
    }
  );

  return <RootComponent />;
}
```

### Network State Handling

```tsx
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState, useCallback } from "react";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    isWifi: connectionType === "wifi",
    isCellular: connectionType === "cellular",
  };
}

// Usage with offline handling
function OfflineAwareComponent() {
  const { isConnected } = useNetworkStatus();

  if (!isConnected) {
    return <OfflineBanner />;
  }

  return <MainContent />;
}
```

---

## 6. Device Sensors & Hardware Access

**Interview Question:** "How do you access device sensors in React Native? What are the common sensors and how do you use them?"

### Accelerometer

```tsx
import { Accelerometer } from "expo-sensors";
import { useEffect, useState, useRef } from "react";

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export function useAccelerometer(
  updateInterval: number = 100
): AccelerometerData {
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(updateInterval);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      setData(accelerometerData);
    });

    return () => subscription.remove();
  }, [updateInterval]);

  return data;
}

// Usage - Shake detection
function ShakeDetector({ onShake }: { onShake: () => void }) {
  const { x, y, z } = useAccelerometer(100);
  const lastShake = useRef(0);
  const lastXYZ = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const speed =
      Math.abs(x - lastXYZ.current.x) +
      Math.abs(y - lastXYZ.current.y) +
      Math.abs(z - lastXYZ.current.z);

    if (speed > 2.5) {
      const now = Date.now();
      if (now - lastShake.current > 1000) {
        lastShake.current = now;
        onShake();
      }
    }

    lastXYZ.current = { x, y, z };
  }, [x, y, z, onShake]);

  return null;
}
```

### Gyroscope

```tsx
import { Gyroscope } from "expo-sensors";

export function useGyroscope(updateInterval: number = 100) {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    Gyroscope.setUpdateInterval(updateInterval);

    const subscription = Gyroscope.addListener((gyroscopeData) => {
      setData(gyroscopeData);
    });

    return () => subscription.remove();
  }, [updateInterval]);

  return data;
}
```

### Barometer / Barometric Pressure

```tsx
import { Barometer } from "expo-sensors";

export function useBarometer() {
  const [data, setData] = useState({ pressure: 0, relativeAltitude: 0 });

  useEffect(() => {
    const subscription = Barometer.addListener((barometerData) => {
      setData(barometerData);
    });

    return () => subscription.remove();
  }, []);

  return data;
}

// Weather app usage
function WeatherDisplay() {
  const { pressure } = useBarometer();

  const getWeatherDescription = (pressure: number) => {
    if (pressure > 1020) return "High pressure - Clear weather";
    if (pressure > 1010) return "Normal pressure";
    if (pressure < 1000) return "Low pressure - Possible rain";
  };

  return <Text>{getWeatherDescription(pressure)}</Text>;
}
```

### Magnetometer (Compass)

```tsx
import { Magnetometer } from "expo-sensors";

export function useCompass() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const subscription = Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(Math.round(angle));
    });

    return () => subscription.remove();
  }, []);

  return heading;
}

function Compass() {
  const heading = useCompass();

  return (
    <View style={{ transform: [{ rotate: `${-heading}deg` }] }}>
      <Image source={require("../assets/compass.png")} />
    </View>
  );
}
```

### Device Motion

```tsx
import { DeviceMotion } from "expo-sensors";

export function useDeviceMotion(updateInterval: number = 100) {
  const [motion, setMotion] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
    rotation: { alpha: 0, beta: 0, gamma: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    orientation: 0,
  });

  useEffect(() => {
    DeviceMotion.setUpdateInterval(updateInterval);

    const subscription = DeviceMotion.addListener((deviceMotion) => {
      setMotion(deviceMotion);
    });

    return () => subscription.remove();
  }, [updateInterval]);

  return motion;
}
```

### Haptics (Vibration Feedback)

```tsx
import * as Haptics from "expo-haptics";

export function triggerHaptic(style: Haptics.ImpactFeedbackStyle) {
  if (Haptics.hasHapticFeedback()) {
    Haptics.impactAsync(style);
  }
}

export function triggerNotification(type: Hapt) {
  ifics.NotificationFeedbackType (Haptics.hasHapticFeedback()) {
    Haptics.notificationAsync(type);
  }
}

export function triggerSelection() {
  if (Haptics.hasHapticFeedback()) {
    Haptics.selectionAsync();
  }
}

// Usage in components
function ButtonWithHaptic({ onPress }: { onPress: () => void }) {
  const handlePress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return <Pressable onPress={handlePress}><Text>Press me</Text></Pressable>;
}
```

---

## Interview Discussion Points

### Permission Best Practices

1. **Always request permissions at the moment they're needed** - Don't ask for all permissions upfront
2. **Provide clear explanations** - Use descriptive permission strings
3. **Handle denials gracefully** - Provide alternative flows or clear messaging
4. **Check permission status before requesting** - Don't repeatedly ask if denied

### Push Notification Considerations

1. **Token management** - Handle token refresh and invalidation
2. **Notification channels** - Required for Android 8.0+
3. **Foreground handling** - Show in-app notifications when app is active
4. **Background interaction** - Deep link from notification taps
5. **Badge management** - Clear badges appropriately

### Background Task Limitations

1. **iOS restrictions** - Limited background execution time
2. **Battery impact** - Balance functionality with battery drain
3. **Task prioritization** - System may delay or skip tasks
4. **Testing** - Hard to test background behavior in development

---

## Summary

Platform integration knowledge is essential for senior mobile developers:

1. **Permissions** - Follow the check → request → handle denial pattern
2. **Notifications** - Understand the full flow from token to interaction
3. **Deep linking** - Configure URL schemes and universal links properly
4. **Background tasks** - Use expo-task-manager for background processing
5. **Lifecycle** - Handle state transitions to preserve data and refresh
6. **Sensors** - Access accelerometer, gyroscope, barometer, and haptics

Next: Phase 3 covers performance optimization techniques.
