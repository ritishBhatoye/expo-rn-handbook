# Phase 7 — Real-World Case Studies & Failure Analysis

> Real production failures teach more than any tutorial. This phase provides detailed case studies with problems, solutions, and failure scenarios.

---

## Table of Contents

1. [Real Failure Examples](#1-real-failure-examples)
2. [Detailed Case Studies](#2-detailed-case-studies)
3. [Failure Scenarios & Fixes](#3-failure-scenarios--fixes)

---

## 1. Real Failure Examples

### Case 1: Memory Leak from Large FlatList

**Problem:** App crashes on large product listing screen with thousands of items.

**Root Cause:** FlatList without optimization - renders all items, no item recycling.

**Solution:**

```typescript
// BEFORE - Causing memory leak
function ProductList({ products }: { products: Product[] }) {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => {}}
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

// AFTER - Optimized
function ProductList({ products }: { products: Product[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={() => {}}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 120,
      offset: 120 * index,
      index,
    }),
    []
  );

  return (
    <FlashList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={120}
    />
  );
}
```

**Key Takeaways:**
- Use FlashList for 50+ items
- Provide `estimatedItemSize`
- Use `getItemLayout` for fixed-height items
- Memoize `renderItem` and `keyExtractor`

---

### Case 2: OTA Updates Breaking Users

**Problem:** OTA update pushed JS bundle incompatible with native code changes, app crashes on launch.

**Root Cause:** Update included new native module but was pushed via OTA (which can't update native code).

**Solution:**

```typescript
// app.config.ts - Proper runtime version strategy
export default {
  runtimeVersion: {
    // Strategy 1: Match app version
    policy: "appVersion",
    
    // Strategy 2: Match native version (safer)
    // policy: "nativeVersion",
    
    // Strategy 3: SDK version (for Expo managed)
    // policy: "sdkVersion",
  },
  
  // Check update before launching
  updates: {
    checkAutomatically: "ON_ERROR_RECOVERY",
    fallbackToCacheTimeout: 2000,
  },
};

// Update validation hook
function useUpdateValidation() {
  const update = useUpdate();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current === "background" &&
      nextAppState === "active"
    ) {
      // Check for updates when returning to app
      const updateAvailable = await update.checkForUpdateAsync();
      
      if (updateAvailable?.isNew) {
        // Validate compatibility before downloading
        const currentVersion = Constants.expoConfig?.version;
        const updateVersion = updateAvailable.metadata?.version;
        
        if (currentVersion !== updateVersion) {
          // Version mismatch - might have native changes
          Alert.alert(
            "Update Required",
            "Please update from the app store for the latest features.",
            [{ text: "OK" }]
          );
        }
      }
    }
    appState.current = nextAppState;
  };
}
```

**Key Takeaways:**
- Never push native code changes via OTA
- Use proper runtime versioning
- Validate update compatibility before applying

---

### Case 3: Push Notifications Failing on iOS

**Problem:** Push notifications not received on iOS devices.

**Root Cause:** Incorrect APNs configuration - missing push capability or wrong device token handling.

**Solution:**

```typescript
// Proper push notification setup
async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  // 1. Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;
  }

  // 2. Create notification channel (Android only)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  // 3. Get Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  
  if (!projectId) {
    console.error("No project ID configured");
    return null;
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  // 4. Send token to YOUR server (not directly to APNs)
  // Your server should handle APNs communication
  await api.post("/push/register", {
    token: expoPushToken,
    platform: Platform.OS,
  });

  return expoPushToken;
}
```

**Backend Token Handling:**

```typescript
// Server-side: Send to APNs
async function sendPushNotification(expoToken: string, message: string) {
  const ticket = await expo.fetchPushTicket(expoToken, {
    sound: "default",
    badge: 1,
  });

  // If valid, send notification
  const receipt = await expo.sendPushNotification([
    {
      to: expoToken,
      title: "App Notification",
      body: message,
    },
  ]);

  return receipt;
}
```

**Key Takeaways:**
- Use Expo Push Service (handles APNs/FCM)
- Always send tokens to your server
- Handle token refresh
- Test on physical devices only

---

### Case 4: Deep Linking Inconsistencies

**Problem:** Deep links work on Android but fail on iOS, or vice versa.

**Root Cause:** Incomplete URL scheme and universal link configuration.

**Solution:**

```json
// app.json - Complete deep link configuration
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
            { "scheme": "https", "host": "myapp.com", "pathPrefix": "/" },
            { "scheme": "https", "host": "www.myapp.com", "pathPrefix": "/" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        },
        {
          "action": "VIEW",
          "data": [{ "scheme": "myapp" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**Server-side Configuration:**

```json
// https://myapp.com/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.myapp.app",
        "paths": [
          "/product/*",
          "/user/*",
          "/deeplink/*"
        ]
      }
    ]
  }
}
```

```json
// https://myapp.com/.well-known/assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.myapp.app",
      "sha256_cert_fingerprints": ["FINGERPRINT1", "FINGERPRINT2"]
    }
  }
]
```

**Key Takeaways:**
- Test on both platforms separately
- Configure both URL scheme and universal links
- Set `autoVerify: true` for Android
- Validate server-side association files

---

### Case 5: Animation Jank Due to JS Thread Blocking

**Problem:** Animations stutter and drop frames during data processing.

**Root Cause:** Heavy JavaScript work running on same thread as animations.

**Solution:**

```typescript
// BEFORE - Blocking JS thread
function AnimatedList({ items }: { items: Item[] }) {
  const [sorted, setSorted] = useState<Item[]>([]);

  useEffect(() => {
    // Heavy computation on main thread
    const result = items
      .filter(...)
      .map(...)
      .sort(...); // This blocks animations!
    setSorted(result);
  }, [items]);

  return <AnimatedFlatList data={sorted} />;
}

// AFTER - Worklet-based animations (runs on UI thread)
function AnimatedListReanimated({ items }: { items: Item[] }) {
  const listHeight = useSharedValue(0);

  const animatedListStyle = useAnimatedStyle(() => ({
    height: listHeight.value,
    opacity: interpolate(listHeight.value, [0, 500], [0, 1]),
  }));

  useEffect(() => {
    // Process in worklet when possible
    "worklet";
    runOnUI(() => {
      listHeight.value = withSpring(items.length * 80);
    });
  }, [items.length]);

  return (
    <Animated.View style={animatedListStyle}>
      <FlatList data={items} />
    </Animated.View>
  );
}

// Alternative: Use useDerivedValue for derived calculations
function OptimizedAnimation() {
  const scrollY = useSharedValue(0);

  // Runs on UI thread via worklet
  const headerOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 100], [1, 0]);
  });
}
```

**Key Takeaways:**
- Use Reanimated 3 for UI-thread animations
- Keep worklets minimal
- Use `runOnJS` for heavy work
- Process heavy data outside render cycle

---

## 2. Detailed Case Studies

### Case Study: Chat/Messaging App

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT APP ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│  │ Messages │ ←→ │  Socket  │ ←→ │  Server  │                │
│  │  Store   │    │ Manager  │    │          │                │
│  └──────────┘    └──────────┘    └──────────┘                │
│       ↓                                            ↓          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│  │  Local   │ ←→ │  Sync    │ ←→ │ Database  │                │
│  │ Database │    │ Engine   │    │  (SQLite) │               │
│  └──────────┘    └──────────┘    └──────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Real-time messaging via WebSocket
- Offline message queue
- Read receipts
- Media caching

```typescript
// hooks/useMessages.ts
function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const { sendMessage, subscribeToMessages, markAsRead } = useChat();

  // Query with local-first strategy
  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    staleTime: Infinity, // Rely on real-time updates
  });

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (message) => {
      // Optimistic update
      queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => [
        ...(old || []),
        message,
      ]);
    });

    return unsubscribe;
  }, [conversationId]);

  // Send with offline support
  const send = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onMutate: async (content) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        content,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", conversationId], (old) => [
        ...(old || []),
        optimisticMessage,
      ]);

      return { tempId };
    },
    onError: (_, __, context) => {
      // Mark as failed
      queryClient.setQueryData(["messages", conversationId], (old) =>
        old?.map((m) =>
          m.id === context?.tempId ? { ...m, status: "failed" } : m
        )
      );
    },
  });

  return { ...query, send };
}
```

---

### Case Study: Food Delivery App

**Key Features:**
- Real-time order tracking
- Map integration
- Push notifications for status updates
- Restaurant search with filters

```typescript
// Order tracking with real-time updates
function useOrderTracking(orderId: string) {
  const [location, setLocation] = useState<Location | null>(null);
  const { data: order } = useQuery(["order", orderId]);

  // Subscribe to order status changes
  useEffect(() => {
    const unsubscribe = subscribeToOrder(orderId, (update) => {
      if (update.type === "location") {
        setLocation(update.location);
      }
      // Trigger refetch for status changes
      queryClient.invalidateQueries(["order", orderId]);
    });

    return unsubscribe;
  }, [orderId]);

  // Estimated time calculation
  const eta = useMemo(() => {
    if (!order?.estimatedDelivery) return null;
    return calculateETA(order.estimatedDelivery);
  }, [order?.estimatedDelivery]);

  return { order, location, eta };
}
```

---

### Case Study: Video Streaming App

**Key Features:**
- Adaptive bitrate streaming
- Offline downloads
- Picture-in-picture
- Background audio

```typescript
// Video player with adaptive streaming
function useVideoPlayer(videoId: string) {
  const [quality, setQuality] = useState<VideoQuality>("auto");
  const [isBuffering, setIsBuffering] = useState(false);

  // Adaptive quality based on network
  const { isConnected, effectiveType } = useNetworkStatus();

  useEffect(() => {
    if (isConnected && effectiveType === "2g") {
      setQuality("low");
    } else if (effectiveType === "4g") {
      setQuality("high");
    } else {
      setQuality("auto");
    }
  }, [effectiveType]);

  return (
    <Video
      source={{ uri: getVideoUri(videoId, quality) }}
      onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
      useNativeControls
      resizeMode="contain"
    />
  );
}
```

---

## 3. Failure Scenarios & Fixes

### Scenario: App Freezes on Startup

**Symptoms:** App shows splash screen indefinitely, never loads.

**Diagnosis Steps:**
1. Check JS bundle is loading
2. Check for infinite loops in useEffect
3. Check for synchronous storage operations blocking

**Fix:**

```typescript
// Async initialization pattern
function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        // Load critical data in parallel
        await Promise.all([
          loadUserPreferences(),
          loadCachedData(),
          initializeAnalytics(),
        ]);
      } catch (error) {
        // Handle initialization errors
        console.error("Initialization error:", error);
      } finally {
        setIsReady(true);
      }
    }

    initialize();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return <MainApp />;
}
```

---

### Scenario: Navigation State Lost on Background

**Symptoms:** Stack resets when app returns from background.

**Fix:**

```typescript
// Persist navigation state
function App() {
  const [isReady, setIsReady] = useState(false);
  const [navigationState, setNavigationState] = useState(null);

  useEffect(() => {
    // Restore navigation state
    const restoreState = async () => {
      const savedState = await AsyncStorage.getItem("navigationState");
      if (savedState) {
        setNavigationState(JSON.parse(savedState));
      }
      setIsReady(true);
    };

    restoreState();
  }, []);

  // Save on app background
  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState === "background") {
      const state = navigationRef.current?.getRootState();
      AsyncStorage.setItem("navigationState", JSON.stringify(state));
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      initialState={navigationState}
      onStateChange={(state) => {
        setNavigationState(state);
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
```

---

### Scenario: Memory Warnings on Image Gallery

**Symptoms:** App crashes when viewing large image galleries.

**Fix:**

```typescript
function OptimizedGallery({ images }: { images: string[] }) {
  return (
    <FlashList
      data={images}
      renderItem={({ item }) => (
        <ThumbnailImage uri={item} />
      )}
      estimatedItemSize={150}
      numColumns={3}
      // Limit memory usage
      removeClippedSubviews={true}
    />
  );
}

function ThumbnailImage({ uri }: { uri: string }) {
  const [lowResUri, setLowResUri] = useState<string | null>(null);

  useEffect(() => {
    // Load thumbnail first
    setLowResUri(getThumbnailUri(uri));
  }, [uri]);

  return (
    <View>
      {lowResUri && (
        <Image
          source={{ uri: lowResUri }}
          style={{ width: 100, height: 100 }}
        />
      )}
      {/* Load full resolution on tap */}
    </View>
  );
}
```

---

## Summary

Real-world failure analysis skills:

1. **Memory leaks** - Use FlashList, memoize, clean up subscriptions
2. **OTA updates** - Never include native code, use proper versioning
3. **Push notifications** - Use Expo service, handle tokens correctly
4. **Deep linking** - Configure both platforms completely
5. **Animation jank** - Use worklets, keep JS thread free

Next: Phase 8 covers interview questions and whiteboard preparation.
