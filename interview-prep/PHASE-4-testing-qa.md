# Phase 4 — Testing & QA

> Testing is a critical skill for senior developers. This phase covers unit testing, component testing, mocking, E2E testing, and CI/CD integration.

---

## Table of Contents

1. [Unit Testing with Jest](#1-unit-testing-with-jest)
2. [Component Testing with RNTL](#2-component-testing-with-rntl)
3. [Mock API & Async Behavior](#3-mock-api--async-behavior)
4. [End-to-End Testing with Detox & Maestro](#4-end-to-end-testing-with-detox--maestro)
5. [Test Coverage & CI/CD Integration](#5-test-coverage--cicd-integration)

---

## 1. Unit Testing with Jest

**Interview Question:** "How do you test pure functions and utility modules in React Native? What's your testing philosophy?"

### Jest Setup and Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
```

```javascript
// jest.setup.js
import "@testing-library/react-native/extend-expect";

// Mock native modules
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock MMKV
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn().mockReturnValue([]),
  })),
}));

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

### Testing Utilities

```typescript
// __tests__/utils/format.test.ts
import { formatCurrency, formatDate, truncateText, capitalize } from "../../src/utils/format";

describe("format utils", () => {
  describe("formatCurrency", () => {
    it("formats USD correctly", () => {
      expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("handles zero", () => {
      expect(formatCurrency(0, "USD")).toBe("$0.00");
    });

    it("handles negative amounts", () => {
      expect(formatCurrency(-50, "USD")).toBe("-$50.00");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date string", () => {
      const result = formatDate("2024-01-15", "en-US");
      expect(result).toMatch(/Jan.*15.*2024/);
    });
  });

  describe("truncateText", () => {
    it("truncates long text", () => {
      expect(truncateText("Hello World", 5)).toBe("Hello...");
    });

    it("doesn't truncate short text", () => {
      expect(truncateText("Hi", 10)).toBe("Hi");
    });
  });
});
```

### Testing State Management

```typescript
// __tests__/stores/authStore.test.ts
import { renderHook, act } from "@testing-library/react-native";
import { useAuthStore } from "../../src/stores/useAuthStore";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  it("initializes with null user", () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("sets user on login", () => {
    const { result } = renderHook(() => useAuthStore());

    const testUser = { id: "1", name: "Test User", email: "test@test.com" };

    act(() => {
      result.current.login(testUser, "token-123");
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.token).toBe("token-123");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("clears user on logout", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({ id: "1", name: "Test", email: "test@test.com" }, "token");
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("selects specific slice of state", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({ id: "1", name: "Test", email: "test@test.com" }, "token");
    });

    const user = useAuthStore((state) => state.user);
    expect(user).toEqual({ id: "1", name: "Test", email: "test@test.com" });
  });
});
```

### Testing Async Operations

```typescript
// __tests__/api/userApi.test.ts
import { fetchUser, createUser, updateUser, deleteUser } from "../../src/api/userApi";
import { server } from "../mocks/server";

describe("userApi", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("fetchUser", () => {
    it("returns user on success", async () => {
      const user = await fetchUser("1");
      expect(user.id).toBe("1");
      expect(user.name).toBe("John Doe");
    });

    it("throws on error", async () => {
      await expect(fetchUser("999")).rejects.toThrow("Failed to fetch");
    });
  });

  describe("createUser", () => {
    it("creates user and returns created user", async () => {
      const newUser = { name: "Jane", email: "jane@test.com" };
      const created = await createUser(newUser);

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Jane");
    });
  });
});
```

---

## 2. Component Testing with RNTL

**Interview Question:** "How do you test React Native components? What's the difference between unit tests and component tests?"

### Basic Component Testing

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "../../src/components/Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button title="Press Me" onPress={() => {}} />);

    expect(screen.getByText("Press Me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();

    render(<Button title="Press Me" onPress={onPressMock} />);

    fireEvent.press(screen.getByText("Press Me"));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const onPressMock = jest.fn();

    render(
      <Button title="Press Me" onPress={onPressMock} disabled />
    );

    fireEvent.press(screen.getByText("Press Me"));

    expect(onPressMock).not.toHaveBeenCalled();
  });

  it("shows loading indicator when loading", () => {
    render(<Button title="Press Me" onPress={() => {}} loading />);

    expect(screen.queryByText("Press Me")).toBeNull();
  });
});
```

### Testing FlatList Components

```typescript
// __tests__/components/UserList.test.tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { UserList } from "../../src/components/UserList";

const mockUsers = [
  { id: "1", name: "Alice", email: "alice@test.com" },
  { id: "2", name: "Bob", email: "bob@test.com" },
];

describe("UserList", () => {
  it("renders list of users", () => {
    render(<UserList users={mockUsers} onUserPress={() => {}} />);

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
  });

  it("calls onUserPress when user is pressed", () => {
    const onUserPressMock = jest.fn();

    render(<UserList users={mockUsers} onUserPress={onUserPressMock} />);

    fireEvent.press(screen.getByText("Alice"));

    expect(onUserPressMock).toHaveBeenCalledWith("1");
  });

  it("shows empty state when no users", () => {
    render(<UserList users={[]} onUserPress={() => {}} />);

    expect(screen.getByText("No users found")).toBeTruthy();
  });

  it("filters users based on search", () => {
    render(
      <UserList
        users={mockUsers}
        onUserPress={() => {}}
        searchQuery="Alice"
      />
    );

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.queryByText("Bob")).toBeNull();
  });
});
```

### Testing Forms

```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginForm } from "../../src/components/LoginForm";

describe("LoginForm", () => {
  it("validates empty email", async () => {
    render(<LoginForm onSubmit={() => {}} />);

    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeTruthy();
    });
  });

  it("validates invalid email format", async () => {
    render(<LoginForm onSubmit={() => {}} />);

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "invalid-email");
    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeTruthy();
    });
  });

  it("calls onSubmit with form data on valid submit", async () => {
    const onSubmitMock = jest.fn();

    render(<LoginForm onSubmit={onSubmitMock} />);

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password123");
    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });
  });

  it("shows loading state during submission", async () => {
    render(<LoginForm onSubmit={() => {}} />);

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password123");
    fireEvent.press(screen.getByText("Sign In"));

    expect(screen.getByText("Signing in...")).toBeTruthy();
  });
});
```

### Testing Hooks

```typescript
// __tests__/hooks/useCounter.test.ts
import { renderHook, act } from "@testing-library/react-native";
import { useCounter } from "../../src/hooks/useCounter";

describe("useCounter", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("initializes with custom value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("increments count", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("decrements count", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it("resets count", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });
});
```

---

## 3. Mock API & Async Behavior

**Interview Question:** "How do you mock API calls and async behavior in tests?"

### MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";

export const handlers = [
  // GET request
  http.get("https://api.example.com/users/:id", async ({ params }) => {
    await delay(100); // Simulate network delay

    if (params.id === "999") {
      return HttpResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      id: params.id,
      name: "John Doe",
      email: "john@example.com",
    });
  }),

  // POST request
  http.post("https://api.example.com/users", async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json(
      { id: "new-id", ...body },
      { status: 201 }
    );
  }),

  // PUT request
  http.put("https://api.example.com/users/:id", async ({ params, request }) => {
    const body = await request.json();

    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE request
  http.delete("https://api.example.com/users/:id", ({ params }) => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Query parameters
  http.get("https://api.example.com/posts", ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    return HttpResponse.json({
      data: Array.from({ length: Number(limit) || 10 }, (_, i) => ({
        id: `${page}-${i}`,
        title: `Post ${page}-${i}`,
      })),
      page: Number(page) || 1,
      totalPages: 5,
    });
  }),
];
```

```typescript
// mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### Testing Async States

```typescript
// Testing loading, error, and success states
describe("useUser hook", () => {
  it("shows loading initially", () => {
    const { result } = renderHook(() => useUser("1"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("shows data after successful fetch", async () => {
    const { result } = renderHook(() => useUser("1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({
      id: "1",
      name: "John Doe",
    });
  });

  it("shows error on failed fetch", async () => {
    const { result } = renderHook(() => useUser("999"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });

  it("refetches on refetch call", async () => {
    const { result } = renderHook(() => useUser("1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialData = result.current.data;

    await actAsync(() => result.current.refetch());

    expect(result.current.data).toEqual(initialData);
  });
});
```

---

## 4. End-to-End Testing with Detox & Maestro

**Interview Question:** "What's the difference between E2E testing tools? When would you use each?"

### Maestro Setup

```yaml
# .maestro/flows/onboarding.yaml
appId: com.company.myapp
---
- launchApp
- assertVisible: "Welcome to MyApp"
- tapOn: "Get Started"
- assertVisible: "Create Account"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign Up"
- assertVisible: "Verify Your Email"
- assertVisible: "Enter the 6-digit code"
```

```yaml
# .maestro/flows/login.yaml
appId: com.company.myapp
---
- launchApp
- tapOn: "Already have an account? Sign In"
- assertVisible: "Sign In"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "wrongpassword"
- tapOn: "Sign In"
- assertVisible: "Invalid credentials"
- tapOn: "Password"
- inputText: "correctpassword"
- tapOn: "Sign In"
- assertNotVisible: "Sign In"
- assertVisible: "Home"
```

### Maestro Advanced

```yaml
# Subflows
appId: com.company.myapp
---
- runFlow: ./subflows/clear-data.yaml
- launchApp

# Scroll and tap
- scrollUntilVisible:
    element: "Submit Button"
    direction: DOWN

# Wait for animation
- waitForAnimationToEnd:
    timeout: 3000

# Screenshot on failure
- takeScreenshot:
    label: "debug_login_failure"

# Conditional flow
- if:
    visible: "Welcome Back"
  then:
    - tapOn: "Continue"
  else:
    - tapOn: "Sign In"

# Error handling
- try:
    - tapOn: "Delete Account"
  error:
    - assertVisible: "Are you sure?"
```

### Detox Setup

```typescript
// e2e/login.test.ts
import { describe, beforeAll, it, expect } from "detox";
import { by, element, expect as detoxExpect } from "detox";

describe("Login Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should login successfully", async () => {
    await element(by.id("email-input")).typeText("test@example.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.id("login-button")).tap();

    await waitFor(element(by.text("Home")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should show error on invalid credentials", async () => {
    await element(by.id("email-input")).typeText("test@example.com");
    await element(by.id("password-input")).typeText("wrongpassword");
    await element(by.id("login-button")).tap();

    await waitFor(element(by.text("Invalid credentials")))
      .toBeVisible()
      .withTimeout(2000);
  });
});
```

### Testing Strategy Comparison

| Aspect | Jest | RNTL | Maestro | Detox |
|--------|------|------|---------|-------|
| Type | Unit | Component | E2E | E2E |
| Speed | Fast | Fast | Medium | Slow |
| Setup | Easy | Easy | Easy | Complex |
| Flakiness | None | Low | Low | Medium |
| Native code | No | No | Yes | Yes |
| Best for | Logic, utils | UI components | User flows | Complex flows |

---

## 5. Test Coverage & CI/CD Integration

**Interview Question:** "How do you integrate testing into your CI/CD pipeline?"

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage --coverageReporters=lcov

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript
        run: npx tsc --noEmit

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Maestro
        run: |
          curl -fsSL "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Build iOS project
        run: |
          xcodebuild -workspace ios/MyApp.xcworkspace \
            -scheme MyApp \
            -configuration Debug \
            -destination "platform=iOS Simulator,name=iPhone 15" \
            build

      - name: Run E2E tests
        run: maestro test e2e/
```

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    "./src/utils/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/api/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Metrics

```typescript
// Testing metrics to track
const testMetrics = {
  codeCoverage: {
    line: 75,      // Lines of code covered
    branch: 70,   // Conditional branches covered
    function: 80,  // Functions covered
  },
  testPyramid: {
    unit: 70,      // 70% unit tests
    integration: 20, // 20% integration tests
    e2e: 10,      // 10% E2E tests
  },
  performance: {
    unitTestTime: "< 100ms per test",
    componentTestTime: "< 500ms per test",
  },
};
```

---

## Summary

Testing skills for senior developers:

1. **Jest** - Unit tests for utilities, stores, and pure functions
2. **RNTL** - Component tests for UI behavior and user interactions
3. **MSW** - Mock API calls at the network level
4. **Maestro** - Simple, reliable E2E testing
5. **Detox** - When you need fine-grained control
6. **CI/CD** - Automated testing on every PR

Next: Phase 5 covers deployment and production topics.
