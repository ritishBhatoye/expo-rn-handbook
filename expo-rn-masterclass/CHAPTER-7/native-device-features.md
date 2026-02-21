# Chapter 7 — Native Device Features

> **TL;DR**
> - Always follow the pattern: check permission → request → handle denied gracefully.
> - `expo-camera` and `expo-location` require Dev Client (not Expo Go) for full feature access.
> - Push notifications require physical devices — they do NOT work on simulators.

📚 [Expo SDK Docs](https://docs.expo.dev/versions/latest/) · 🔗 [expo/expo](https://github.com/expo/expo) · 🔗 [mrousavy/react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)

---

## The Permissions Pattern

Every native feature follows this flow:

```tsx
import { Alert, Linking } from "react-native";

async function requestPermission(
  checkFn: () => Promise<{ status: string }>,
  requestFn: () => Promise<{ status: string }>,
  featureName: string
): Promise<boolean> {
  // 1. Check current status
  const { status: existing } = await checkFn();
  if (existing === "granted") return true;

  // 2. Request permission
  const { status } = await requestFn();
  if (status === "granted") return true;

  // 3. Handle denial — prompt user to open settings
  Alert.alert(
    `${featureName} Permission Required`,
    `Please enable ${featureName} in Settings to continue.`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
  return false;
}
```

---

## Camera (expo-camera)

```bash
npx expo install expo-camera
```

```json
// app.json plugins
["expo-camera", { "cameraPermission": "We need camera access for scanning." }]
```

```tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Camera access required</Text>
        <Pressable onPress={requestPermission}>
          <Text style={{ color: "#0a84ff", marginTop: 12 }}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    console.log(photo?.uri);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      >
        <View style={styles.controls}>
          <Pressable onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}>
            <Text style={{ color: "#fff" }}>Flip</Text>
          </Pressable>
          <Pressable onPress={takePicture}>
            <Text style={{ color: "#fff" }}>Capture</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  controls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 40,
  },
});
```

---

## Location (expo-location)

```bash
npx expo install expo-location
```

### Foreground Location

```tsx
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
    })();
  }, []);

  return { location, error };
}
```

### Background Location

Requires additional config:

```json
// app.json plugins
[
  "expo-location",
  {
    "locationAlwaysAndWhenInUsePermission": "Allow background location for tracking."
  }
]
```

```tsx
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_LOCATION_TASK = "background-location-task";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  console.log("Background location:", locations[0]);
});

async function startBackgroundLocation() {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== "granted") return;

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== "granted") return;

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100,
    showsBackgroundLocationIndicator: true,
  });
}
```

---

## Push Notifications (expo-notifications)

```bash
npx expo install expo-notifications expo-device expo-constants
```

⚠️ Push notifications require a **physical device**. They do NOT work on iOS simulators or Android emulators.

```tsx
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPush().then(setExpoPushToken);

    // Notification received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // User tapped on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("User tapped notification. Data:", data);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken };
}

async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device.");
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  // Android notification channel
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}
```

### Local Notification

```tsx
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Reminder",
    body: "Don't forget to check your tasks!",
    data: { screen: "/tasks" },
  },
  trigger: { seconds: 60 }, // Fire in 60 seconds
});
```

---

## Haptics

```bash
npx expo install expo-haptics
```

```tsx
import * as Haptics from "expo-haptics";

// Light tap feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Selection click
Haptics.selectionAsync();
```

---

## Image Picker (expo-image-picker)

```bash
npx expo install expo-image-picker
```

```tsx
import * as ImagePicker from "expo-image-picker";

async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    console.log("Selected image:", uri);
  }
}

async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") return;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    console.log("Photo taken:", result.assets[0].uri);
  }
}
```

---

## Sensors (Accelerometer, Gyroscope)

```bash
npx expo install expo-sensors
```

```tsx
import { Accelerometer } from "expo-sensors";
import { useEffect, useState } from "react";

export function useAccelerometer() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(setData);
    return () => subscription.remove();
  }, []);

  return data;
}
```

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Push token is `null` | Running on simulator | Must use physical device |
| Camera blank on Android | Missing `expo-camera` plugin | Add plugin to `app.json` and rebuild |
| Background location rejected by Apple | Missing purpose string | Must provide clear `*UsageDescription` strings |
| Image picker shows no images | Missing media library permission | Add `expo-media-library` for full gallery access |
| Haptics not working | Running on simulator or web | Haptics only work on physical devices |

---

## ⚡ Shortcuts & Speed Tricks

- **`useCameraPermissions()`** hook replaces manual `requestPermissionsAsync()` boilerplate.
- **`expo-image-picker`** handles both camera and gallery — no need for `expo-camera` just to take a photo.
- **Background tasks** need `expo-task-manager`. Define tasks at the top level (outside components).
- **Android notification channels** are required on API 26+. Always create them.
- **Haptics on every button press** — wrap in a utility: `const tap = () => { Haptics.impactAsync(...); onPress(); }`.