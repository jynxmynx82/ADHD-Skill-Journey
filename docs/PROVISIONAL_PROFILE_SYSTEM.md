# Provisional Family Profile System

## Overview
The Provisional Family Profile system allows new users to get personalized experiences immediately after signup, without requiring them to create detailed child profiles first.

## Architecture

### Data Flow
1. **User Signup** → Creates Firebase Auth account
2. **Questionnaire** → Collects family-level insights
3. **Provisional Profile** → Stores questionnaire data for immediate use
4. **AI Personalization** → Uses provisional data for Quick Advice
5. **Child Profiles** → Can be added later when families are ready

### Firestore Structure
```
/provisionalProfiles/{profileId}
├── userId: string
├── isPlaceholder: true
├── primaryChallenge: string
├── familyStrength: string
├── supportNetwork: string[]
├── currentStrategies: string[]
├── createdAt: timestamp
└── updatedAt: timestamp
```

## Implementation

### Service Layer (`lib/provisionalProfileService.ts`)
```typescript
export const createProvisionalProfile = async (
  userId: string, 
  answers: Record<string, string>
): Promise<string>
```

### Questionnaire Integration (`components/SignupQuestionnaire.tsx`)
- Collects family-level insights
- Maps to Provisional Profile fields
- Handles skip functionality

### Signup Flow (`app/(auth)/signup-with-questions.tsx`)
- Creates user account
- Shows questionnaire
- Creates Provisional Profile
- Redirects to main app

## Questionnaire Questions

### 1. Family Challenge
**Question:** "What part of the day can feel overwhelming for your family?"
**Options:** mornings, homework, emotions, bedtime, changes
**Field:** `primaryChallenge`

### 2. Family Strength
**Question:** "What's a core strength of your family?"
**Options:** creative, energy, kind, curious, other
**Field:** `familyStrength`

### 3. Support Network
**Question:** "Who do you turn to for support?"
**Options:** therapist, teacher, family, friends, figuring
**Field:** `supportNetwork`

### 4. Current Strategies
**Question:** "What strategies are you currently trying?"
**Options:** routines, rewards, calming, trying, other
**Field:** `currentStrategies`

## Usage Examples

### AI Quick Advice
```typescript
// Get provisional profile for AI personalization
const profile = await getProvisionalProfile(userId);
if (profile) {
  // Use profile.primaryChallenge, profile.familyStrength, etc.
  // for personalized AI responses
}
```

### Onboarding Personalization
```typescript
// Show relevant content based on family challenges
if (profile.primaryChallenge === 'mornings') {
  // Show morning routine suggestions
}
```

### Child Profile Migration
```typescript
// When family is ready to add child profiles
const childData = {
  ...profile, // Pre-populate from provisional data
  name: 'Child Name',
  age: 8,
  // Add child-specific details
};
```

## Benefits

### For Families
- **Immediate Value** - Get personalized help right away
- **No Pressure** - Don't need to create detailed child profiles immediately
- **Flexible** - Can add child profiles when ready
- **Family-Focused** - Captures family-level insights

### For Development
- **Faster Onboarding** - Users can start using the app immediately
- **Data-Driven** - AI features work from day one
- **Scalable** - Easy to extend with more questionnaire questions
- **Testable** - Clear data flow for testing

## Future Enhancements

### Additional Questions
- Family size and composition
- Previous ADHD experience
- Preferred communication style
- Available time for interventions

### AI Integration
- Personalized Quick Advice responses
- Customized resource recommendations
- Adaptive learning based on family profile

### Analytics
- Track which challenges are most common
- Identify effective strategies by family type
- Measure onboarding completion rates

## Testing

### Manual Testing
1. Create new account with questionnaire
2. Verify Provisional Profile created in Firestore
3. Check data structure matches expected format
4. Test skip functionality
5. Verify AI features can access profile data

### Automated Testing
```typescript
// Test Provisional Profile creation
const profile = await createProvisionalProfile(userId, testAnswers);
expect(profile).toBeDefined();
expect(profile.primaryChallenge).toBe(testAnswers.primaryChallenge);
```

## Security

### Firestore Rules
```javascript
match /provisionalProfiles/{profileId} {
  allow read, write: if isAuthenticated() && 
    (resource == null || request.auth.uid == resource.data.userId) &&
    (request.resource == null || request.auth.uid == request.resource.data.userId);
}
```

### Data Privacy
- Provisional Profiles are user-specific
- No sharing between family members
- Can be deleted when child profiles are created
- GDPR compliant data handling

## Migration Strategy

### From Provisional to Child Profiles
1. **Keep Provisional Data** - Don't delete, use as reference
2. **Pre-populate Child Fields** - Use relevant provisional data
3. **Add Child-Specific Details** - Name, age, individual challenges
4. **Maintain Family Context** - Keep family-level insights

### Data Cleanup
- Provisional Profiles can be archived after child profiles are created
- Implement cleanup job for inactive provisional profiles
- Maintain audit trail of questionnaire responses

This system provides a solid foundation for personalized family support while maintaining flexibility for future enhancements. 