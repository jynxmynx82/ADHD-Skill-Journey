# Styling Architecture Guide

This document outlines the principles and plan for creating a consistent, maintainable, and functional visual system for the ADHD Skill Journey application.

## 1. Core Principle: A Single Source of Truth

To ensure consistency and ease of maintenance, all styling values (colors, spacing, fonts, etc.) must originate from a single source of truth. Our application will use a hybrid system that centralizes design tokens and uses them to build themed, reusable components.

## 2. The Styling Stack

Our styling architecture is composed of three layers:

1.  **Design Tokens (`constants/theme.ts`):** This is the foundational layer. It defines all raw design values (color palettes, spacing units, font sizes, etc.). This file should be the only place where raw hex codes or pixel values are defined.

2.  **Theming Engine (`lib/theme.ts`):** This is a utility layer that consumes the raw design tokens and provides them to the application in a ready-to-use format. It will contain a custom hook, `useAppTheme`, which will handle logic for light/dark modes and provide simplified color access (e.g., `colors.primary` instead of `theme.colors.primary[600]`).

3.  **Component-Level Styling:** This is the implementation layer. All components will use one of the following methods for styling, in order of preference:
    *   **Themed UI Components (`components/ui/*`):** For all common interactive elements (buttons, inputs, cards, etc.), we will use a set of standardized, reusable components from the `components/ui/` directory. These components will use our `useAppTheme` hook internally.
    *   **`StyleSheet.create` with Theme Variables:** For layout and component-specific styles, we will use the standard `StyleSheet.create` method, but **all style values must come from the `useAppTheme` hook**. Hardcoded values are not permitted.

## 3. Refactoring Plan

To transition to this new architecture, we will follow these steps:

1.  **Create the Theming Engine:** Implement the `lib/theme.ts` file with the `useAppTheme` hook as the central utility for accessing theme properties.

2.  **Refactor Core UI Components:** Update all components in `components/ui/` to consume the `useAppTheme` hook instead of referencing `constants/theme.ts` directly or using hardcoded values.

3.  **Systematic Component Refactoring:** Go through each screen and component in the application.
    *   Replace standard `TouchableOpacity`, `TextInput`, etc., with their themed counterparts from `components/ui/`.
    *   Update all `StyleSheet.create` calls to use variables from the `useAppTheme` hook.

4.  **Centralize Platform-Specific Logic:** For components with significant differences between web and mobile, create platform-specific files (e.g., `MyComponent.web.tsx` and `MyComponent.native.tsx`) to keep the code clean and avoid excessive `Platform.OS` checks.

By following this guide, we will create a robust and scalable styling system that accelerates development and ensures a polished, consistent user experience.
