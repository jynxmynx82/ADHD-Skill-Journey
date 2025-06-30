## Project API Reference

### Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Directory Structure](#directory-structure)
4. [Theming](#theming)
5. [UI Components](#ui-components)
6. [Utility & Layout Components](#utility--layout-components)
7. [Context Providers & Hooks](#context-providers--hooks)
8. [Library / Service Layer](#library--service-layer)
9. [Validation Schemas](#validation-schemas)
10. [Error Handling](#error-handling)
11. [Storage Utilities](#storage-utilities)
12. [Skill-Journey Service](#skilljourney-service)
13. [Types & Constants](#types--constants)
14. [End-to-End Examples](#end-to-end-examples)

---

<a name="overview"></a>
## 1. Overview
This project is an **Expo-React-Native** application that helps families track development goals, daily routines, and other rich data (journal entries, barcode-based food scanning, etc.) for their children. It communicates with **Firebase** (Auth & Firestore) and uses a modular, context-driven architecture with a small, reusable component library.

All *public* APIs—everything exported from `components/**`, `context/**`, `lib/**`, `constants/**`, and `types/**`—are documented below.

> **Notation**  
> - **Fn** *(…)* → *T* = function signature  
> - **Hook** = custom React hook  
> - **Cmp** = React component  
> `?<T>` denotes an optional prop of type `T`.

---

<a name="getting-started"></a>
## 2. Getting Started
```bash
# 1. Install deps
pnpm install

# 2. Start the Expo dev server
pnpm expo start --tunnel
```
Create a `.env` file with your Firebase keys. The app reads them via `firebaseConfig.ts`.

---

<a name="directory-structure"></a>
## 3. Directory Structure (truncated)
```text
.
├─ app/                # Expo-Router pages / screens
├─ components/         # Re-usable UI and feature components
│  ├─ ui/              # Design-system primitives (Button, Input…)
│  └─ food-scanner/    # Camera & product display widgets
├─ context/            # Global providers + hooks (Auth, Theme…)
├─ lib/                # Pure functions & service layer utils
├─ constants/          # Design tokens, static data
├─ types/              # Shared TypeScript types
└─ docs/               # (you are here)
```

---

<a name="theming"></a>
## 4. Theming
Theme values live in `constants/theme.ts` and are surfaced through **ThemeContext**.  
```ts
const { colors, spacing, radius } = useTheme();
```

Colours follow the Tailwind palette conventions (`primary[600]`, `gray[700]`…).

---

<a name="ui-components"></a>
## 5. UI Components
### 5.1 `Button` *(Cmp)*  — `components/ui/Button.tsx`
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `title` | `string` | — | Button label |
| `onPress` | `() => void` | — | Click handler |
| `variant?` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' \| 'danger'` | `primary` | Visual style |
| `size?` | `'sm' \| 'md' \| 'lg'` | `md` | Padding / font scale |
| `disabled?` | `boolean` | `false` | Disable presses |
| `loading?` | `boolean` | `false` | Show spinner |
| `icon?` | `ReactNode` | — | Optional icon node |
| `iconPosition?` | `'left' \| 'right'` | `left` | Icon placement |
| `style?` | `StyleProp<ViewStyle>` | — | Container overrides |
| `textStyle?` | `StyleProp<TextStyle>` | — | Text overrides |
| `fullWidth?` | `boolean` | `false` | Stretch to 100 % |

**Example**
```tsx
import { Button } from '@/components/ui/Button';

<Button
  title="Save"
  variant="secondary"
  icon={<Check size={16} color="#fff" />}
  onPress={() => alert('Saved!')}
/>
```

---
### 5.2 `Input` *(Cmp)*  — `components/ui/Input.tsx`
High-level wrapper around `TextInput` with label, error text, icons, and secure-text toggle.

| Prop | Type | Default |
| ---- | ---- | ------- |
| `label?` | `string` | — |
| `error?` | `string` | — |
| `secureTextEntry?` | `boolean` | `false` |
| `leftIcon?` / `rightIcon?` | `ReactNode` | — |
| *…plus all* [`TextInputProps`](https://reactnative.dev/docs/textinput) |

**Example**
```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  keyboardType="email-address"
  error={errors.email}
  touched={touched.email}
/>
```

---
### 5.3 `Link` *(Cmp)* — `components/ui/Link.tsx`
Thin wrapper around `expo-router` `Link` that inherits theme colours and supports mobile/web presses.
```tsx
<Link href="/settings" onPress={() => console.log('navigate')}>Go to settings</Link>
```

---

<a name="utility--layout-components"></a>
## 6. Utility & Layout Components
| Component | Purpose |
| --------- | ------- |
| `ErrorBoundary` | Catches render/runtime errors and shows fallback UI. Use `<ErrorBoundary><SomeTree/></ErrorBoundary>` |
| `WebGradientWrapper` | Adds a responsive gradient background on Web to match native looks. Wrap page roots. |
| `CameraView` | Barcode scanner powered by `expo-camera`. Props: `onBarcodeScanned`, `onClose`, `scanning`. |
| `SearchBar` | Quick-filter input for products (food-scanner feature). |
| `ProductInfo` | Displays nutrition / pricing info for a scanned product. |

> **Tip** – All food-scanner widgets live in `components/food-scanner/` and can be composed within any screen.

---

<a name="context-providers--hooks"></a>
## 7. Context Providers & Hooks
| Provider / Hook | Description | Common usage |
| --------------- | ----------- | ------------ |
| `AuthProvider`, `useAuth()` | Firebase email/password auth wrapper. Exposes `user`, `signIn`, `signUp`, `logout`, `setUserRole`, `deleteAccount`, `loading`, `isLoading`. | ```tsx
const { user, signIn } = useAuth();
await signIn(email, pwd);
``` |
| `FamilyProvider`, `useFamily()` | CRUD for *children* sub-collection. Functions: `fetchChildren`, `addChild`, `updateChild`, `deleteChild`, `deleteAllChildren`, `setSelectedChildId`, `getSelectedChild`. | ```tsx
const { children, addChild } = useFamily();
await addChild({ name:'Anna', age:6, diagnosis:'Autism', strengths:[], challenges:[] });
``` |
| `ScheduleProvider`, `useSchedule()` | Manages routine schedules for each child. |
| `ThemeProvider`, `useTheme()` | Light/Dark + colour palette consumed by components. |

Wrap the root in all providers (see `App.tsx`).
```tsx
<AuthProvider>
  <ThemeProvider>
    <FamilyProvider>
      <ScheduleProvider>
        <RootLayout />
      </ScheduleProvider>
    </FamilyProvider>
  </ThemeProvider>
</AuthProvider>
```

---

<a name="library--service-layer"></a>
## 8. Library / Service Layer
### 8.1 `errorHandling.ts`
| Function | Purpose |
| -------- | ------- |
| `handleAsyncOperation(fn, context?)` | Wrapper that returns `{ data, error }` and auto-converts thrown errors into `AppError`. |
| `handleFirebaseError` / `handleNetworkError` | Maps native errors to unified `AppError` format. |
| `createValidationError` | Throw validation issues with a consistent code. |
| `logError` | Dev/prod routing for console vs Sentry. |

**AppError** shape:
```ts
AppError {
  code: string;  // see ERROR_CODES
  message: string;
  userMessage: string; // UI-safe wording
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string,any>;
}
```

---
### 8.2 `journalStorage.ts`
Persistent, offline-first storage of narrative or audio journal entries via `AsyncStorage` + `expo-file-system`.

Key APIs:
```ts
loadJournalEntries()               // -> JournalEntry[]
saveJournalEntries(entries)
deleteJournalEntry(id)
exportJournalData(start, end)      // -> CSV string
getStorageStats()                  // -> metrics
```

---

<a name="validation-schemas"></a>
## 9. Validation Schemas (`lib/validation.ts`)
`yup` based schemas exported as constants (`emailSchema`, `passwordSchema`, …).  
Utility fns: `sanitizeString`, `isValidEmail`, `isValidPassword`, `isValidBarcode`, and **Hook** `useFieldValidation<T>()` for live form validation.

```ts
const { values, errors, touched } = useFieldValidation(signupSchema);
```

---

<a name="error-handling"></a>
## 10. Error Handling
All async calls (Firestore, file ops, network) are wrapped with `handleAsyncOperation`, guaranteeing UI layers receive normalized errors that can be toasted:
```ts
const { data, error } = await skillService.createSkill(childId, form);
if (error) toast.show(error.userMessage);
```

---

<a name="storage-utilities"></a>
## 11. Storage Utilities
`journalStorage.ts` (see §8.2) and the Expo `SecureStore` ready constants for future enhancements.

---

<a name="skilljourney-service"></a>
## 12. Skill-Journey Service (`lib/skillJourneyService.ts`)
High-level wrapper around multiple Firestore collections.

| Sub-service | Key Methods |
| ----------- | ----------- |
| **skillService** | `createSkill`, `getSkills`, `getSkill`, `updateSkill`, `deleteSkill` |
| **progressService** | `recordProgress`, `getSkillProgress`, `getChildProgress`, `getLatestProgress` |
| **milestoneService** | `createMilestone`, `getSkillMilestones`, `getChildMilestones`, `celebrateMilestone` |
| **storyService** | `createStory`, `getChildStories`, `markStoryAsRead`, `toggleStoryFavorite` |
| **statsService** | `updateChildStats`, `getChildStats` |
| **realtimeService** | `onSkillsChange`, `onSkillProgressChange` |

All return `{ data, error }` in the pattern described earlier.

**Quick add skill**
```ts
await skillService.createSkill(childId, {
  name: 'Tie Shoelaces',
  category: 'Motor',
  description: 'Loops & pulls',
});
```

---

<a name="types--constants"></a>
## 13. Types & Constants
Look under `types/**`. For routing helpers see `types/routes.ts`:
```ts
createHref('skill-journey', { childId }) // -> href typed for expo-router
```
Design tokens are exported from `constants/theme.ts` as `theme`.

---

<a name="end-to-end-examples"></a>
## 14. End-to-End Examples
### 14.1 Sign-up Flow
```tsx
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const [form, setForm] = useState({ email:'', pwd:'', first:'', last:'' });
const { signUp, isLoading } = useAuth();

<Button
  title={isLoading ? 'Creating…' : 'Create account'}
  loading={isLoading}
  onPress={() => signUp(form.email, form.pwd, form.first, form.last)}
/>
```

---
### 14.2 Add & Track a Skill
```ts
// 1. Parent creates a skill for a child
await skillService.createSkill(childId, { name:'Reading', category:'Cognitive', description:'Basic phonics' });

// 2. Record daily progress
await progressService.recordProgress(childId, skillId, { effort:4, mood:5, duration:900, notes:'Great focus' });

// 3. Update stats dashboard automatically
await statsService.updateChildStats(childId);
```

---
### 14.3 Barcode Scan Flow (Food Scanner)
```tsx
const [barcode, setBarcode] = useState<string|null>(null);
const [scanning, setScanning] = useState(true);

<CameraView
  scanning={scanning}
  onClose={() => setScanning(false)}
  onBarcodeScanned={({ data }) => {
    setBarcode(data);
    setScanning(false);
  }}
/>
```

---

⬆️ Scroll to the [top](#project-api-reference) • Made with ❤️ & TypeScript