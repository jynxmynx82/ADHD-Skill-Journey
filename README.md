# ADHD Skill Journey

A React Native/Expo app designed to help parents track and support their children with ADHD through a positive, adventure-based approach.

For a detailed explanation of product features, monetization strategy, and feature specifications, please see the [`docs/`](./docs) directory.

## Documentation

### Core Architecture
- [Data Architecture & HIPAA Compliance](./docs/DATA_ARCHITECTURE_HIPAA_COMPLIANCE.md) - Comprehensive data model and compliance strategy
- [Developer Guide for HIPAA Data](./docs/DEVELOPER_GUIDE_HIPAA_DATA.md) - Quick reference for developers
- [Typography System](./docs/TYPOGRAPHY_SYSTEM.md) - Consistent typography guidelines
- [Design Token System](./docs/DESIGN_TOKEN_SYSTEM.md) - Complete design system and reusable components

### Feature Specifications
- [Product Overview](./docs/PRODUCT_OVERVIEW.md) - High-level product vision and features
- [Monetization Strategy](./docs/MONETIZATION_STRATEGY.md) - Revenue model and pricing
- [Styling Guide](./docs/STYLING_GUIDE.md) - UI/UX design patterns

### Development Setup
- **[Firebase Emulator Setup](./docs/FIREBASE_EMULATOR_SETUP.md)** - Required for local development
- **[Coding Architecture Principles](./docs/CodingArchitecturePrinciples.md)** - Development guidelines

## 🎯 Project Status

**✅ Stable & Production-Ready**

This project prioritizes stability over new features. The core system is tested and provides a solid foundation for families. Please see the contribution guidelines in [`docs/PRODUCT_OVERVIEW.md`](./docs/PRODUCT_OVERVIEW.md) before adding new features.

## 🏗️ Tech Stack

-   **Framework**: React Native with Expo SDK 51
-   **Navigation**: Expo Router
-   **Backend**: Firebase (Firestore, Authentication)
-   **Styling**: TailwindCSS
-   **State Management**: React Context API
-   **Testing**: Jest with React Native Testing Library
-   **Language**: TypeScript (Strict)

## 🔧 Development Setup

### Prerequisites
-   Node.js 18+
-   Expo CLI
-   Firebase CLI: `npm install -g firebase-tools`
-   A Firebase project

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory with your Firebase project configuration:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### ⚠️ Critical: Firebase Emulator Setup

**This setup is REQUIRED for local development and testing.**

The app uses Firebase emulators for local development. Follow the complete setup guide in [`docs/FIREBASE_EMULATOR_SETUP.md`](./docs/FIREBASE_EMULATOR_SETUP.md) before running the app.

**Quick Start:**
```bash
# Initialize Firebase emulators
firebase init emulators

# Start emulators (required for app to work)
firebase emulators:start --only firestore,auth

# In another terminal, start the app
npx expo start --clear
```

**Key Points:**
- Emulators must be running for the app to function
- Network IP configuration is required for mobile device testing
- See the detailed guide for troubleshooting common issues

### Running the App
```bash
# Start Firebase emulators (REQUIRED)
firebase emulators:start --only firestore,auth

# In another terminal, start the development server
npx expo start --clear

# Run on the iOS simulator
npm run ios

# Run on the Android emulator
npm run android
```

## 🧪 Testing

The test environment for this project currently has a memory leak issue when running the full suite. Tests should be run individually.

```bash
# Run a specific test file
npm test -- <path_to_test_file>
```

## 📄 License

This project is licensed under the MIT License.