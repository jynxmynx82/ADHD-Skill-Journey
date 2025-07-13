# Feature Spec: AI Skill Journey Storybook

This document outlines the feature specification for the AI Skill Journey Storybook, a premium feature for the ADHD Skill Journey app.

## 🎯 Overview

The Skill Journey Storybook will generate personalized AI stories that capture a child's learning journey, specifically designed for children with ADHD. These stories will celebrate progress, build confidence, and create meaningful connections between skills and real-life experiences.

## 🤔 Key Design Considerations

### 1. Story Generation Triggers
Stories can be generated via several methods to maximize engagement:

-   **Manual Trigger**: A "Create Story" button becomes available in the Skill Journey tab after a minimum number of adventures (e.g., 3-5) have been logged.
-   **Milestone-Based**: Automatically generate a story when a child reaches a significant milestone (e.g., 10, 25, 50 adventures).
-   **Weekly Summary**: Automatically generate a "Weekly Roundup" story summarizing the week's progress.

### 2. Personalization for ADHD Children
The stories must be tailored to the unique needs of children with ADHD.

-   **ADHD-Specific Elements**:
    -   **Attention Span**: Stories will be short (3-5 minutes) with clear, simple plots.
    -   **Visuals**: Stories will be heavily illustrated to support visual learners.
    -   **Emotional Regulation**: Content will use positive, encouraging language and focus on effort over outcome.
    -   **Executive Function**: Narratives will have clear, predictable structures.
-   **Personalization Inputs**:
    -   Child's Name, Age, Strengths, and Interests (from their profile).
    -   The specific skill and adventures being celebrated.
    -   Themes derived from the "win types" of the logged adventures.

### 3. Quality & Content Guidelines
-   **Positive Framing**: Focus on effort, perseverance, and finding fun in challenges.
-   **Realistic Challenges**: Acknowledge struggles in a hopeful and constructive way.
-   **ADHD-Appropriate Content**: Avoid over-stimulating visuals or complex narratives. All content will be filtered for age-appropriateness and safety.

## 🏗️ Implementation Architecture

### 1. Services
-   **`AIStoryService`**: The core service responsible for generating the story. It will:
    1.  Analyze the child's profile and recent adventures.
    2.  Select an appropriate story template (e.g., "The Hero's Journey," "The Friendly Guide").
    3.  Build a detailed, personalized prompt for the AI model.
    4.  Call the AI model (e.g., OpenAI GPT-4) to generate the story text.
    5.  Call an image generation model (e.g., DALL-E 3) to create illustrations.
-   **`StoryTriggerService`**: A service that runs periodically to check if conditions for automatic story generation have been met.
-   **`StoryManagementService`**: Handles saving, retrieving, and managing a child's library of generated stories.

### 2. UI Components
-   **`StoryGenerationButton`**: A button, wrapped in a `PremiumFeatureGate`, that allows parents to manually trigger story generation.
-   **`StoryLibrary`**: A new screen or tab where all of a child's generated stories are collected and can be viewed.
-   **`StoryViewer`**: An immersive viewer to display the illustrated story, potentially with text-to-speech narration.

## 💰 Cost & Resource Considerations

-   **AI Service Costs**: Each story will incur a small cost from API calls to AI services for text and image generation.
-   **Usage Limits**: The number of stories a user can generate will be based on their subscription tier.
    -   **Free Tier**: 0 stories (this is a premium-only feature).
    -   **Premium Tier**: A generous number of stories per month (e.g., 5-10) or unlimited, depending on final pricing.

## 🚀 Next Steps

1.  **Validate Concept**: Share mockups or prototypes with families of ADHD children to gather feedback.
2.  **Prototype Generation**: Build a proof-of-concept using sample data to test prompt engineering and AI model quality.
3.  **Implement Core System**: Build the services and UI components for generating and viewing stories.
4.  **Integrate with Subscription**: Ensure the entire feature is correctly gated and marketed as a premium "superpower."
