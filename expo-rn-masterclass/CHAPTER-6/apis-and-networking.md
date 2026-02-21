# Chapter 6: APIs & Networking

**TL;DR**
- Use `fetch` for standard requests; `axios` if you need complex interceptors.
- Use MMKV for blazing fast synchronous storage (replaces AsyncStorage).
- Secure sensitive data with `expo-secure-store`.

## Fetch vs Axios

`fetch` is built-in and usually sufficient.

```tsx
// Typed Fetch Example
interface User {
  id: number;
  name: string;
}

async function getUser(id: number): Promise<User> {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}
```

## Storage: MMKV vs AsyncStorage

⚠️ **Deprecated/Slow:** `@react-native-async-storage/async-storage`
✅ **Current:** `react-native-mmkv`

MMKV is synchronous and up to 30x faster.

```bash
npx expo install react-native-mmkv
```

```tsx
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// Synchronous read/write!
storage.set('user.name', 'Marc');
const username = storage.getString('user.name');
```

## Secure Storage

For tokens and passwords, always use `expo-secure-store`.

```bash
npx expo install expo-secure-store
```

```tsx
import * as SecureStore from 'expo-secure-store';

async function saveToken(value: string) {
  await SecureStore.setItemAsync('jwt_token', value);
}

async function getToken() {
  return await SecureStore.getItemAsync('jwt_token');
}
```

## Supabase Setup

Supabase is the go-to Firebase alternative for React Native.

```bash
npm install @supabase/supabase-js
```

```tsx
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyzcompany.supabase.co';
const supabaseAnonKey = 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Links
- [GitHub: mrousavy/react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

## ⚠️ Gotchas & Common Errors

- **Error:** `fetch` failing on Android with cleartext HTTP traffic not permitted.
  - **Fix:** Use `https://` or configure network security settings in `app.json` to allow HTTP for local development.
- **Gotcha:** MMKV doesn't work in Expo Go.
  - **Fix:** You must use a Development Build (`npx expo run:ios` or `npx expo run:android`) because MMKV contains custom native code.

## ⚡ Shortcuts & Speed Tricks

- **Network Inspector:** Use React Native Debugger or Flipper to inspect network requests easily.
- **Zustand + MMKV:** Combine them for instant, persistent global state.