# ADHD Skill Journey: Developer's Guide & Principles
**Last Updated:** July 12, 2025

**Document Purpose:** This guide outlines the core philosophy, architectural principles, and development strategy for the ADHD Skill Journey app. Its goal is to ensure all development is stable, scalable, and aligned with our mission.

---

## 1. Our Mission & Guiding Principles

### Guiding Principle 1: The Mission Is the Priority
**Rule:** Every feature must be measured against our core mission: "To help neurodivergent children and their parents build resilience and find joy in the process of learning." We will prioritize features that reduce stress and increase empowerment.
**Implementation:** Our primary goal is to create a deeply engaging and supportive free experience. All monetization discussions must align with our B-Corp/Non-Profit ethos, focusing on sustainability rather than aggressive upselling.

### Guiding Principle 2: The "Core Loop" Must Be Flawless
**Rule:** Before we add any new features, the core user journey must be seamless and rewarding.
**The Core Loop:**
1.  A user creates a **Skill Journey**.
2.  They log an **Adventure** (a practice session).
3.  They see a beautiful and immediate visual reflection of that effort in **Flow Mode**.
4.  They can create a motivating **AI Story** based on a collection of adventures.
**Implementation:** All initial development effort should be focused on making these four steps as simple, stable, and delightful as possible.

### Guiding Principle 3: Build for a Visual, Not Text-Based, Experience
**Rule:** We are not building a list-based task manager. The UI should be immersive and visual.
**Implementation:** We will prioritize learning and using modern graphics libraries (like React Native Skia) to create a unique and non-traditional interface. We will favor visual feedback (animations, color changes, growing shapes) over simple text and numbers wherever possible.

---

## 2. The Community-Supported Model (Product Strategy)

To align with our mission, we use a **Community-Supported Model**. The core app is free and powerful. A subscription is a way for users to become "Supporters" who ensure the app's future and receive powerful enhancements.

*   **The Free Tier (Our Promise):** Includes unlimited journeys, adventures, secure cloud backup, the custom ADHD food score, basic scheduling, and basic journaling.
*   **The Supporter Tier (Our Enhancements):** Includes Advanced PDF Reports, Family Sharing, Advanced Scheduling/Journaling, the full Expert Resource Library, and Food Scanner History.

### A Note on the AI Storybook
The AI Storybook is a core part of the experience, but it has a direct operational cost.
*   **Free:** Every user will be able to create their **first few AI Stories for free** as a gift.
*   **Supporter:** Becoming a supporter unlocks the ability to **generate unlimited AI stories**.

*For a complete breakdown of the feature tiers, see `docs/MONETIZATION_STRATEGY.md`.*

---

## 3. Technical Architecture (The "Guardrails")

*These principles are based on lessons learned from debugging and are designed to prevent future instability.*

### 3.1. Stability First: The Expo SDK
The project MUST be built on a stable, vetted Expo SDK version (currently **SDK 51**). Upgrading should be a deliberate, well-researched decision.

### 3.2. The "Single Source of Truth" for Services
All core service initializations (Firebase Auth, Firestore, etc.) **must** live in the central `firebaseConfig.ts` file. No other file should call `initializeApp()` or `getAuth()`.

### 3.3. Consistent Module Pathing (The `@/` Alias)
All root-level imports **must** use the configured `@/` path alias.
*   **Correct:** `import { useAuth } from '@/context/AuthContext';`
*   **Incorrect:** `import { useAuth } from '../../context/AuthContext';`

### 3.4. Performance by Default (Memoization)
To prevent common performance issues, all reusable components should be wrapped in **`React.memo`**, and function/object props MUST be stabilized with **`useCallback`** and **`useMemo`**.

---

## 4. Implementation Strategy

### 4.1. The "Vertical Slice" Approach
We will build one small feature end-to-end (backend, frontend, UI) before moving to the next. This ensures we are always delivering working, testable code.

### 4.2. The `<PremiumFeatureGate />` Component
To manage our Supporter features cleanly, we will use the single, reusable `<PremiumFeatureGate />` component. This component wraps any button or UI element that is part of the Supporter tier.

*   **How it works:** The component checks the user's subscription status. If the user is a Supporter, it renders the feature. If not, it renders a "locked" or disabled version that prompts them to become a supporter.
*   **Benefit:** This strategy is incredibly scalable and keeps our feature code clean. To make a new feature for Supporters, we just wrap it in the gate.
