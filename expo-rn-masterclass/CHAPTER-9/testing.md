# Chapter 9: Testing

**TL;DR**
- Use Jest + React Native Testing Library for unit/component tests.
- Mock native modules properly.
- Use Maestro for E2E testing (much simpler than Detox).

## Unit Testing Setup

```bash
npm install --save-dev jest jest-expo @testing-library/react-native @types/jest
```

Update `package.json`:
```json
"scripts": {
  "test": "jest"
},
"jest": {
  "preset": "jest-expo",
  "setupFilesAfterEnv": ["@testing-library/react-native/extend-expect"]
}
```

## Component Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import Counter from './Counter';

test('increments counter', () => {
  const { getByText } = render(<Counter />);
  
  const button = getByText('Increment');
  fireEvent.press(button);
  
  expect(getByText('1')).toBeTruthy();
});
```

## Mocking Expo Modules

Create a `jest.setup.js` file and add it to `setupFiles` in your Jest config.

```javascript
// jest.setup.js
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));
```

## E2E Testing: Maestro

Maestro is the modern alternative to Detox. It's incredibly easy to write flows in YAML.

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Create a `flow.yaml`:
```yaml
appId: com.mycompany.myapp
---
- launchApp
- tapOn: "Login"
- inputText: "user@example.com"
- tapOn: "Submit"
- assertVisible: "Welcome!"
```

Run it:
```bash
maestro test flow.yaml
```

## Links
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [GitHub: callstack/react-native-testing-library](https://github.com/callstack/react-native-testing-library)
- [Maestro Docs](https://maestro.mobile.dev/)

## ⚠️ Gotchas & Common Errors

- **Error:** Jest fails to parse ES modules in `node_modules`.
  - **Fix:** Update `transformIgnorePatterns` in your Jest config to include the problematic modules.
- **Gotcha:** Testing animations.
  - **Fix:** Mock `react-native-reanimated` using their provided mock setup to avoid test hangs.

## ⚡ Shortcuts & Speed Tricks

- **Watch Mode:** Run `npm test -- --watch` to automatically re-run tests when files change.
- **Test IDs:** Use `testID="my-element"` on components to easily find them in tests using `getByTestId`.