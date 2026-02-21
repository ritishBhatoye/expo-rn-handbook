export interface Entry {
  id: string;
  title: string;
  category: string;
  tags: string[];
  definition: string;
  whenToUse: string;
  code?: string;
}

export const data: Entry[] = [
  // Fundamentals
  {
    id: 'f1',
    title: 'The Bridge',
    category: 'Fundamentals',
    tags: ['#core', '#architecture'],
    definition: 'The legacy asynchronous communication layer between JavaScript and Native (C++/Swift/Java). Data is serialized to JSON and sent across.',
    whenToUse: 'Historical context - being replaced by JSI.',
  },
  {
    id: 'f2',
    title: 'JSI (JavaScript Interface)',
    category: 'Fundamentals',
    tags: ['#core', '#performance'],
    definition: 'A lightweight C++ layer that allows JS to hold references to C++ Host Objects and call methods on them directly. No serialization needed.',
    whenToUse: 'When high-performance native interaction is required.',
    code: 'const result = nativeModule.syncMethod(); // Sync execution possible'
  },
  {
    id: 'f3',
    title: 'Hermes',
    category: 'Fundamentals',
    tags: ['#core', '#engine'],
    definition: 'An open-source JavaScript engine optimized for running React Native on Android and iOS. Focuses on startup time and memory usage.',
    whenToUse: 'Production standard for most apps.',
  },
  {
    id: 'f4',
    title: 'Fabric',
    category: 'Fundamentals',
    tags: ['#core', '#ui'],
    definition: 'React Native\'s new rendering system. It uses the JSI to communicate with the native side, allowing for synchronous UI updates.',
    whenToUse: 'Automatic in the New Architecture.',
  },

  // Styling
  {
    id: 's1',
    title: 'StyleSheet',
    category: 'Styling',
    tags: ['#styling', '#performance'],
    definition: 'A way to define styles similar to CSS but as JS objects. Compiled once and referenced by ID to minimize bridge traffic.',
    whenToUse: 'All React Native components.',
    code: 'const styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: "red" }\n});'
  },
  {
    id: 's2',
    title: 'Flexbox',
    category: 'Styling',
    tags: ['#styling', '#layout'],
    definition: 'Layout engine for React Native. Defaults to flexDirection: "column". Works similarly to web but with some variations.',
    whenToUse: 'All layouts.',
    code: 'flexDirection: "row", justifyContent: "center", alignItems: "center"'
  },

  // Navigation
  {
    id: 'n1',
    title: 'Expo Router',
    category: 'Navigation',
    tags: ['#navigation', '#expo'],
    definition: 'File-based routing for React Native and Web. Built on top of React Navigation.',
    whenToUse: 'Recommended for all new Expo projects.',
    code: '// app/profile/[id].tsx\nconst { id } = useLocalSearchParams();'
  },
  {
    id: 'n2',
    title: 'useNavigation',
    category: 'Navigation',
    tags: ['#navigation', '#hook'],
    definition: 'A hook that provides access to the navigation object in any component.',
    whenToUse: 'When you need to trigger navigation from a child component.',
    code: 'const navigation = useNavigation();\nnavigation.navigate("Details");'
  },

  // State & Data
  {
    id: 'sd1',
    title: 'Zustand',
    category: 'State & Data',
    tags: ['#state', '#simple'],
    definition: 'A small, fast, and scalable bearbones state-management solution using simplified flux principles.',
    whenToUse: 'Medium to large applications for global state.',
    code: 'const useStore = create((set) => ({\n  bears: 0,\n  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),\n}));'
  },
  {
    id: 'sd2',
    title: 'TanStack Query',
    category: 'State & Data',
    tags: ['#data', '#caching'],
    definition: 'Powerful asynchronous state management for TS/JS. Handles caching, background updates, and stale data.',
    whenToUse: 'Any app fetching remote data.',
    code: 'const { data } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos });'
  },

  // Animations
  {
    id: 'a1',
    title: 'Reanimated 3',
    category: 'Animations',
    tags: ['#animations', '#performance'],
    definition: 'A library that allows for fluid animations running on the UI thread at 60fps.',
    whenToUse: 'Complex, gesture-based animations.',
    code: 'const sv = useSharedValue(0);\nconst style = useAnimatedStyle(() => ({ opacity: sv.value }));'
  },
  {
    id: 'a2',
    title: 'Gesture Handler',
    category: 'Animations',
    tags: ['#gestures', '#ux'],
    definition: 'Provides native platform-specific gestures (Pan, Pinch, Rotation) for React Native.',
    whenToUse: 'Interactive UIs, swipe-to-delete, drag-and-drop.',
  },

  // Performance
  {
    id: 'p1',
    title: 'FlashList',
    category: 'Performance',
    tags: ['#performance', '#list'],
    definition: 'A drop-in replacement for FlatList by Shopify. Up to 10x faster due to view recycling.',
    whenToUse: 'Lists with many items or complex rows.',
    code: '<FlashList data={data} renderItem={renderItem} estimatedItemSize={200} />'
  },
  {
    id: 'p2',
    title: 'React.memo',
    category: 'Performance',
    tags: ['#react', '#optimization'],
    definition: 'Higher-order component that memoizes a component, preventing unnecessary re-renders if props don\'t change.',
    whenToUse: 'Expensive components in a large tree.',
  },

  // Deployment
  {
    id: 'd1',
    title: 'EAS Update',
    category: 'Deployment',
    tags: ['#expo', '#ota'],
    definition: 'Over-the-air updates for Expo apps. Fix bugs instantly without resubmitting to the App Store.',
    whenToUse: 'Critical bug fixes, UI updates.',
    code: 'eas update --branch production --message "Fix login bug"'
  },

  // Interview Q&A
  {
    id: 'i1',
    title: 'What is the Virtual DOM in RN?',
    category: 'Interview Q&A',
    tags: ['#interview', '#fundamentals'],
    definition: 'RN doesn\'t have a DOM; it uses the Shadow Tree which is a representation of the UI before it\'s translated to native views.',
    whenToUse: 'Interview preparation.',
  },
  {
    id: 'i2',
    title: 'How to optimize images in RN?',
    category: 'Interview Q&A',
    tags: ['#interview', '#performance'],
    definition: 'Use expo-image, compress images, use WebP/AVIF, and size them correctly.',
    whenToUse: 'Production performance.',
  }
];
