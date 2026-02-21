# Chapter 10: Deployment & EAS

**TL;DR**
- Use EAS (Expo Application Services) for building and submitting.
- Configure `eas.json` for different environments (dev, preview, prod).
- Use OTA (Over-The-Air) updates for quick JS fixes.

## EAS Setup

```bash
npm install -g eas-cli
eas login
eas build:configure
```

## eas.json Configuration

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## Building the App

```bash
# Build for iOS simulator
eas build --profile development --platform ios

# Build for production (App Store / Play Store)
eas build --profile production --platform all
```

## Submitting to Stores

```bash
eas submit --platform ios
eas submit --platform android
```

## OTA Updates (`eas update`)

Update your app's JavaScript and assets instantly without going through app store review.

```bash
eas update:configure
eas update --branch production --message "Fix login bug"
```

**What CAN be updated OTA:**
- JavaScript code (React components, logic)
- Assets (images, fonts)

**What CANNOT be updated OTA:**
- Native code changes (adding new native libraries)
- App icon or splash screen
- `app.json` changes like bundle identifier or permissions

## Links
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)
- [GitHub: expo/eas-cli](https://github.com/expo/eas-cli)

## ⚠️ Gotchas & Common Errors

- **Error:** iOS build fails due to provisioning profile issues.
  - **Fix:** Let EAS manage your credentials. Run `eas credentials` and follow the prompts to clear and recreate them.
- **Gotcha:** OTA update not applying.
  - **Fix:** Ensure the app's native runtime version matches the update's runtime version.

## ⚡ Shortcuts & Speed Tricks

- **Local Builds:** Run `eas build --local` to build on your own machine and save EAS cloud build minutes.
- **Auto-Submit:** Add `--auto-submit` to your build command to automatically submit to the store upon a successful build.