# Chapter 7: Native Device Features

**TL;DR**
- Always follow the pattern: Check Permission → Request Permission → Handle Result.
- Use `expo-camera` or `react-native-vision-camera` for media.
- Use `expo-location` for GPS data.

## Permissions Pattern

Never assume you have permission.

```tsx
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Text } from 'react-native';

export default function LocationComponent() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      // Proceed to get location...
    })();
  }, []);

  return <Text>{errorMsg || 'Permission granted!'}</Text>;
}
```

## Camera

⚠️ **Deprecated:** Old `expo-camera` APIs.
✅ **Current:** `expo-camera` (Next) or `react-native-vision-camera` for advanced use cases.

```bash
npx expo install expo-camera
```

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Text, View } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <CameraView style={{ flex: 1 }} facing="back" />
  );
}
```

## Image Picker

```bash
npx expo install expo-image-picker
```

```tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    console.log(result.assets[0].uri);
  }
};
```

## Push Notifications

```bash
npx expo install expo-notifications
```

Configure in `app.json` and use `expo-notifications` to get the Expo Push Token, which you send to your backend.

## Links
- [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [GitHub: mrousavy/react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)

## ⚠️ Gotchas & Common Errors

- **Error:** App crashes when accessing camera/location on iOS.
  - **Fix:** Ensure you have added the required usage descriptions (e.g., `NSCameraUsageDescription`) in your `app.json` under `ios.infoPlist`.
- **Gotcha:** Background location requires separate permissions and configuration.

## ⚡ Shortcuts & Speed Tricks

- **Simulating Location:** In iOS Simulator, go to Features -> Location -> Custom Location to test GPS features without moving.