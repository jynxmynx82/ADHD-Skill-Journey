# ADHD Skill Journey

A React Native/Expo app designed to help parents track and support their children with ADHD through a positive, adventure-based approach.

For a detailed explanation of product features, monetization strategy, and feature specifications, please see the [`docs/`](./docs) directory.

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

### Running the App
```bash
# Start the development server
npm start

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