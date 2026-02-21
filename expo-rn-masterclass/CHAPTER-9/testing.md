# Chapter 9 — Testing

> **TL;DR**
> - Jest + React Native Testing Library (RNTL) for unit and component tests.
> - MSW for API mocking — intercepts at the network level, no Axios mock needed.
> - Maestro for E2E — YAML-based, no flaky selectors, runs in CI.

📚 [RNTL Docs](https://callstack.github.io/react-native-testing-library/) · 📚 [Maestro Docs](https://maestro.mobile.dev/) · 🔗 [expo/expo](https://github.com/expo/expo)

---

## Jest + jest-expo Setup

Expo projects come with Jest pre-configured. Verify:

```json
// package.json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

---

## React Native Testing Library (RNTL)

```bash
npx expo install @testing-library/react-native @testing-library/jest-native
```

### Rendering and Querying

```tsx
// components/__tests__/Counter.test.tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Counter } from "../Counter";

describe("Counter", () => {
  it("renders initial count", () => {
    render(<Counter />);
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("increments on press", () => {
    render(<Counter />);
    fireEvent.press(screen.getByText("Increment"));
    expect(screen.getByText("1")).toBeTruthy();
  });
});
```

### Async Testing with waitFor

```tsx
import { render, screen, waitFor } from "@testing-library/react-native";
import { UserProfile } from "../UserProfile";

it("loads and displays user data", async () => {
  render(<UserProfile userId="123" />);

  // Wait for async data to appear
  await waitFor(() => {
    expect(screen.getByText("Alice")).toBeTruthy();
  });
});
```

### Query Priority

| Method | When |
|--------|------|
| `getByText` | Visible text content |
| `getByRole` | Accessibility role |
| `getByPlaceholderText` | Input placeholders |
| `getByTestId` | Last resort — when nothing else works |

**Rule:** Prefer queries that match what the user sees. `getByTestId` is a code smell — use it only for ambiguous cases.

---

## Mocking Expo Modules

```tsx
// __mocks__/expo-secure-store.ts
const store: Record<string, string> = {};

export const setItemAsync = jest.fn(
  async (key: string, value: string) => { store[key] = value; }
);

export const getItemAsync = jest.fn(
  async (key: string) => store[key] ?? null
);

export const deleteItemAsync = jest.fn(
  async (key: string) => { delete store[key]; }
);
```

```tsx
// jest.config.js or package.json
{
  "jest": {
    "preset": "jest-expo",
    "moduleNameMapper": {
      "^expo-secure-store$": "<rootDir>/__mocks__/expo-secure-store.ts"
    }
  }
}
```

### Mocking Navigation

```tsx
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ id: "42" }),
  Link: ({ children }: any) => children,
}));
```

---

## MSW for API Mocking

```bash
npm install msw --save-dev
```

```tsx
// mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.example.com/users/:id", ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: "Alice",
      email: "alice@example.com",
    });
  }),

  http.post("https://api.example.com/posts", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "new-1", ...body }, { status: 201 });
  }),
];
```

```tsx
// mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```tsx
// jest.setup.ts
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```json
// jest config
{
  "setupFilesAfterSetup": ["./jest.setup.ts"]
}
```

---

## Maestro for E2E Testing

Maestro is the simplest E2E framework for mobile. YAML-based, no flaky selectors.

### Install

```bash
# macOS
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Verify
maestro --version
```

### Write a Flow

```yaml
# e2e/login.yaml
appId: com.company.myapp
---
- launchApp
- tapOn: "Email"
- inputText: "user@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome back"
```

### Run

```bash
# Run a single flow
maestro test e2e/login.yaml

# Run all flows
maestro test e2e/

# Record for CI (creates a video)
maestro test e2e/login.yaml --format junit
```

### Maestro vs Detox

| Feature | Maestro | Detox |
|---------|---------|-------|
| Setup | 1 command | Complex (native build required) |
| Syntax | YAML | JavaScript |
| Reliability | High (waits automatically) | Moderate (needs `waitFor`) |
| CI support | ✅ Maestro Cloud | ✅ Self-hosted |
| Best for | Most apps | Apps needing fine-grained control |

---

## Detox (When You Need It)

```bash
npm install detox --save-dev
npx detox init
```

```tsx
// e2e/login.test.ts
describe("Login Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should login successfully", async () => {
    await element(by.id("email-input")).typeText("user@example.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.id("login-button")).tap();
    await waitFor(element(by.text("Welcome back")))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

---

## Testing Strategy Table

| What | Tool | Frequency |
|------|------|-----------|
| Pure functions, utils | Jest | Every PR |
| Custom hooks | RNTL `renderHook` | Every PR |
| Components (UI behavior) | RNTL `render` + `fireEvent` | Every PR |
| API integration | MSW + RNTL | Every PR |
| Full user flows | Maestro | Nightly / pre-release |
| Visual regression | Storybook (optional) | Weekly |

---

## ⚠️ Gotchas & Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `act()` warning | State update not wrapped | Use `waitFor` for async updates |
| `Cannot find module 'react-native'` | Jest config missing preset | Use `preset: 'jest-expo'` |
| Maestro can't find element | App not yet rendered | Add `- waitForAnimationToEnd` before `tapOn` |
| Mock not working | Import order issue | Mock BEFORE importing the component |
| `ReferenceError: fetch is not defined` | Node.js < 18 in Jest | Use MSW or polyfill fetch in jest setup |

---

## ⚡ Shortcuts & Speed Tricks

- **`--watch`** mode in Jest — only re-runs tests for changed files. Use it during development.
- **`renderHook`** from RNTL — test custom hooks without a wrapper component.
- **MSW intercepts at the network level** — your code calls `fetch`/`axios` normally. No mock injection needed.
- **Maestro `assertVisible`** waits automatically — no explicit timeouts needed.
- **`testID` prop** — add it to critical UI elements for E2E selectors. `<Pressable testID="login-button">`.