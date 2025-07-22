**ADHD Skill Journey App: Developer's Guide & Principles**  
**Last Updated:** July 12, 2025

**Document Purpose:** This guide outlines the core architectural principles, product philosophy, and development roadmap for the ADHD Skill Journey app. Its goal is to ensure all current and future development is stable, scalable, and aligned with the app's mission.

## **1\. Core Architectural Principles (The "Guardrails")**

*These principles are based on lessons learned from debugging and are designed to prevent future instability.*

### **1.1. Stability First: The Expo SDK**

The project MUST be built on a stable, vetted Expo SDK version (currently **SDK 51**). Upgrading to "bleeding-edge" SDKs or major dependencies (like a new version of React) should be a deliberate, well-researched decision, not an automatic update. This is our primary defense against deep, difficult-to-debug dependency conflicts.

### **1.2. The "Single Source of Truth" for Services**

All core service initializations (Firebase Auth, Firestore, etc.) **must** live in the central firebaseConfig.ts file. These initialized instances (auth, db) should be exported from this single file. No other file should call initializeApp() or getAuth(). This prevents initialization errors and ensures the entire app uses the same service instances.

### **1.3. Consistent Module Pathing (The @/ Alias)**

All root-level imports **must** use the configured @/ path alias. This makes the code cleaner and far easier to refactor.

* **Correct:** import { useAuth } from '@/context/AuthContext';  
* **Incorrect:** import { useAuth } from '../../context/AuthContext';

### **1.4. Performance by Default (Memoization)**

To prevent common performance issues like the "keyboard flicker," we will follow these patterns:

* All reusable, custom components (especially those in components/ui/) should be wrapped in **React.memo**.  
* When passing props to these memoized components:  
  * **Functions** (like onPress or onChangeText handlers) MUST be stabilized with **useCallback**.  
  * **Objects or JSX Elements** (like an icon prop) MUST be stabilized with **useMemo**.

## **2\. The "Generous Free Tier" Philosophy**

This is the core of our product strategy. Our mission is to provide indispensable daily support for free, with premium features acting as "superpower" upgrades, not necessary unlocks.

* **Core Free Experience:**  
  * Unlimited Skill Journeys  
  * Unlimited Adventure Logging (with photos)  
  * The Resilience Tree & Visual Progress  
  * Full Journal System (Text & Audio)  
  * Food Scanner with the custom ADHD-focused score  
  * Secure Cloud Backup & Sync (This is a core user expectation, not a feature)  
* **Premium "Superpower" Tier:**  
  * AI-Powered Adventure Stories  
  * Advanced Progress Reports (Printable PDFs for therapists/teachers)  
  * Full Access to the Expert Resource Library  
  * Family & Therapist Sharing Features

## **3\. Phased Implementation & Component Strategy**

To grow without headaches, we will build new features in "vertical slices" and use a consistent component for gating premium features.

### **3.1. The "Vertical Slice" Approach**

We will avoid building in horizontal layers (e.g., all backend, then all frontend). Instead, we build one small feature end-to-end.

* **Example Slice:** "Viewing a list of skills."  
  * **Task 1:** Create the Firestore query in the SkillContext to fetch skills.  
  * **Task 2:** Build the basic UI in skills.tsx to display the fetched skills.  
  * **Result:** A working, testable feature is completed quickly.

### **3.2. The \<FeatureGate /\> Component**

To manage our premium features cleanly, we will create a single, reusable component called \<FeatureGate /\>. This component will wrap any button or UI element that is part of the premium tier.

How it works:

The \<FeatureGate\> component uses the useAuth() hook to check the user's subscription status.

* **If user.subscription.tier \=== 'premium':** It renders the actual feature (its children).  
* **If user.subscription.tier \=== 'free':** It renders a "locked" or disabled version of the feature. When the user taps it, instead of running the feature, it opens a modal prompting them to upgrade.

**Example Usage:**

JavaScript

// Inside the Journal screen  
\<FeatureGate\>  
  \<TouchableOpacity onPress\={startAudioRecording}\>  
    \<Mic size\={24} /\>  
    \<Text\>Record Audio Note\</Text\>  
  \</TouchableOpacity\>  
\</FeatureGate\>

**Benefit:** This strategy is incredibly scalable. It keeps your feature code clean. You don't need to write if/else logic for subscriptions all over the app. To make a new feature premium, you just wrap it in \<FeatureGate /\>. This is the single source of truth for premium access control.

*********
A New Direction: B-Corp / Non-Profit Hybrid

Revised Developer's Guide (A New Draft)
Let's try creating a new set of principles that truly reflects your app's new soul.
Guiding Principle 1: The Mission Is the Priority
Rule: Every feature must be measured against our core mission: "To help neurodivergent children and their parents build resilience and find joy in the process of learning." We will prioritize features that reduce stress and increase empowerment, even if they are not revenue-generating.
Implementation: Our primary goal is to create a deeply engaging and supportive free experience. All future monetization discussions must align with our B-Corp/Non-Profit ethos, focusing on sustainability rather than aggressive upselling.
Guiding Principle 2: The "Core Loop" Must Be Flawless
Rule: Before we add any new features, the core user journey must be seamless and rewarding.
The Core Loop:
A user creates a Skill Journey.
They log an Adventure (a practice session).
They see a beautiful and immediate visual reflection of that effort in Flow Mode.
They can create a motivating AI Story based on a collection of adventures.
Implementation: All initial development effort should be focused on making these four steps as simple, stable, and delightful as possible.
Guiding Principle 3: Build for a Visual, Not Text-Based, Experience
Rule: We are not building a list-based task manager. The UI should be immersive and visual, reflecting the "Adventure Map" and "Skill Journey" concepts.
Implementation: We will prioritize learning and using modern graphics libraries (like React Native Skia, as we discussed) to create a unique and non-traditional interface. We will favor visual feedback (animations, color changes, growing shapes) over simple text and numbers wherever possible.
Technical Principles (The Guardrails We Learned)
Stability over Novelty: We will continue to build on a stable Expo SDK (like SDK 51) and avoid "bleeding-edge" dependencies.
Centralized Services: All Firebase connections will be handled in a single, definitive firebaseConfig.ts file.
Component Performance: All reusable components will be optimized with React.memo, useCallback, and useMemo from the start to prevent UI bugs like the ones we've already solved.
