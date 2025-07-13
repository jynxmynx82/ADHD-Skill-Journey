# Product Overview: ADHD Skill Journey

This document provides a detailed overview of the features and data models for the ADHD Skill Journey application.

## 🎮 Key Features

### 1. Child Management
-   **Multi-child support** for families.
-   Individual profiles with comprehensive, positive-focused data (strengths, interests).
-   **Family data isolation** using Firebase security rules.
-   Real-time data synchronization across devices.

### 2. Skill Journey Tracking
-   Create and monitor skill development "journeys."
-   **Adventure-based progress tracking**, framing practice as positive steps forward.
-   Category-based organization (e.g., self-care, academic, social).

### 3. Adventure Logging
-   A **child-friendly interface** for logging progress on a skill.
-   Focuses on positive "win types" to build confidence and resilience:
    -   "We gave it our all!" 🌟
    -   "We stayed calm!" 😌
    -   "We found the fun!" 😄
    -   "We got better!" 📈
    -   "We didn't give up!" 💪
-   Supports optional text notes and photo attachments.
-   Updates progress visualizations in real-time.

### 4. Flow Visualization
-   An **interactive "Flow" mode** that visually represents all of a child's active skill journeys.
-   Skills are shown as **glowing orbs**, with their size growing based on the number of logged adventures.
-   Orbs are **color-coded** by skill category.
-   The visualization provides a beautiful, at-a-glance summary of a child's efforts and progress.

### 5. Memory Lane
-   A **historical view** of all logged adventures for a specific skill.
-   Presents a chronological timeline of progress.
-   Includes encouraging messages to celebrate the journey over time.

## 📊 Data Models

### Core Entities
-   **Child**: Stores the child's profile information, including name, age, strengths, and interests.
-   **Journey**: The main document that tracks a single skill journey. It contains:
    -   **Skill Data**: The definition of the skill being learned (e.g., name, category).
    -   **Progress**: A summary of the progress, including the total adventure count.
-   **Adventure**: A single entry representing a positive step forward in a journey. It includes the win type, notes, and a timestamp.
