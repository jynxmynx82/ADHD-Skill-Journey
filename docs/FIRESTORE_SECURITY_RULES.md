# Firestore Security Rules Documentation

## 🛡️ Overview

This document explains the family-scoped security rules implemented for the ADHD Skill Journey application. These rules replace the previous insecure open access rules and provide proper data isolation and protection.

## 🔐 Security Model

### Core Principles

1. **Authentication Required**: All operations require a valid Firebase Auth user
2. **Family Data Isolation**: Each family's data is completely isolated using `family_{user.uid}` as the family identifier
3. **Child-Scoped Access**: Skill journeys, adventures, and AI stories are scoped to specific children within the family
4. **Data Validation**: Input validation ensures data integrity and prevents malformed documents
5. **Principle of Least Privilege**: Users can only access data they own or are authorized to see

### Data Access Hierarchy

```
User (authenticated)
└── Family Scope (family_{user.uid})
    ├── User Profile (own document only)
    ├── Children (family-scoped)
    ├── Events (family-scoped)
    └── Child-Specific Data
        ├── Journeys (child-scoped)
        ├── Adventures (child-scoped)
        └── AI Stories (child-scoped)
```

## 📋 Collection Rules

### Users Collection (`/users/{userId}`)

**Access**: Users can only read/write their own user document

**Validation**:
- Must include: `uid`, `email`, `firstName`, `lastName`, `createdAt`
- `uid` must match the document ID
- All required fields must be strings (except `createdAt`)

```javascript
// Example: User can only access /users/their-uid
allow read, write: if request.auth.uid == userId;
```

### Children Collection (`/children/{childId}`)

**Access**: Family-scoped - users can access children in their family only

**Validation**:
- Must include: `name`, `age`, `diagnosis`, `familyId`, `createdAt`, `updatedAt`
- `familyId` must be `family_{user.uid}`
- `age` must be between 0-25
- Updates must include current timestamp in `updatedAt`

```javascript
// Example: User can access children with familyId = "family_abc123"
allow read: if resource.data.familyId == 'family_' + request.auth.uid;
```

### Events Collection (`/events/{eventId}`)

**Access**: Family-scoped - users can access events for their family

**Validation**:
- Must include: `familyId`, `createdBy`, `title`, `startTime`, `endTime`
- `familyId` must be `family_{user.uid}`
- `createdBy` must be the current user's UID

### Journeys Collection (`/journeys/{journeyId}`)

**Access**: Child-scoped - users can access journeys for children in their family

**Validation**:
- Must include: `childId`, `skillData`, `progress`, `createdAt`
- `childId` must reference a child owned by the user's family
- `skillData` must include: `id`, `name`, `category`, `difficulty`, `estimatedDays`, `createdAt`
- `progress` must include: `adventureCount`, `lastUpdated`

### Adventures Collection (`/adventures/{adventureId}`)

**Access**: Child-scoped - users can access adventures for children in their family

**Validation**:
- Must include: `childId`, `skillId`, `text`, `winType`, `createdAt`
- `childId` must reference a child owned by the user's family
- `winType` must be one of: `tried-best`, `no-frustration`, `laughed-about-it`, `made-progress`, `kept-going`, `custom`

### AI Stories Collection (`/ai_stories/{storyId}`)

**Access**: Child-scoped - users can access AI stories for children in their family

**Validation**:
- Must include: `childId`, `title`, `content`, `createdAt`
- `childId` must reference a child owned by the user's family

## 🔧 Helper Functions

The rules use several helper functions for cleaner, more maintainable code:

### `isAuthenticated()`
Checks if the user is logged in with Firebase Auth.

### `isOwner(userId)`
Checks if the current user owns a specific user document.

### `getFamilyId()`
Returns the family ID for the current user: `family_{user.uid}`.

### `isFamilyMember(familyId)`
Checks if the current user belongs to a specific family.

### `isChildOwner(childId)`
Checks if the current user owns a specific child by:
1. Verifying the child document exists
2. Checking that the child's `familyId` matches the user's family

### Validation Functions
- `isValidChildData()`: Validates child document structure and data types
- `isValidJourneyData()`: Validates journey document structure
- `isValidAdventureData()`: Validates adventure document structure
- `isValidEventData()`: Validates event document structure

## 🚀 Deployment

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Project initialized: `firebase init firestore`

### Deploy Rules
```bash
# Deploy security rules to Firebase
firebase deploy --only firestore:rules

# Deploy rules and indexes together
firebase deploy --only firestore
```

### Testing Rules
```bash
# Run local emulator for testing
firebase emulators:start --only firestore

# Test rules with the Firebase console
# Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules
```

## 🧪 Testing Security Rules

### Test Cases to Verify

1. **Authentication Required**
   - Unauthenticated users cannot read/write any data
   - All operations fail without valid auth token

2. **User Isolation**
   - User A cannot access User B's profile
   - User A cannot access User B's family data

3. **Family Data Isolation**
   - User A cannot access children from User B's family
   - User A cannot access events from User B's family

4. **Child Data Isolation**
   - User A cannot access journeys for User B's children
   - User A cannot access adventures for User B's children

5. **Data Validation**
   - Invalid data structures are rejected
   - Required fields are enforced
   - Data type validation works correctly

### Example Test Scenarios

```javascript
// ✅ SHOULD WORK: User accessing their own data
const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

// ✅ SHOULD WORK: User accessing their family's children
const children = await getDocs(query(
  collection(db, 'children'), 
  where('familyId', '==', `family_${currentUser.uid}`)
));

// ❌ SHOULD FAIL: User accessing another user's data
const otherUserDoc = await getDoc(doc(db, 'users', 'other-user-id'));

// ❌ SHOULD FAIL: User accessing another family's children
const otherChildren = await getDocs(query(
  collection(db, 'children'), 
  where('familyId', '==', 'family_other-user-id')
));
```

## 🔍 Monitoring and Maintenance

### Security Rule Logs
Monitor security rule violations in the Firebase Console:
1. Go to Firestore → Usage tab
2. Check "Security rules" section for denied requests
3. Review patterns of failed access attempts

### Performance Considerations
- The `isChildOwner()` function performs a document read for validation
- This adds a small performance cost but ensures security
- Consider caching strategies for frequently accessed child ownership checks

### Regular Security Reviews
1. **Monthly**: Review access patterns and denied requests
2. **Quarterly**: Audit rules for new features or data structures
3. **Annually**: Complete security assessment with penetration testing

## 🚨 Emergency Procedures

### If Rules Are Too Restrictive
1. Check Firebase Console logs for specific error messages
2. Test rules in local emulator before deploying fixes
3. Use temporary permissive rules only if absolutely necessary:

```javascript
// EMERGENCY ONLY - DO NOT USE IN PRODUCTION
match /{document=**} {
  allow read, write: if request.auth != null; // Authenticated users only
}
```

### If Data Access Is Compromised
1. Immediately deploy restrictive rules
2. Audit all recent data access
3. Review user authentication logs
4. Consider rotating Firebase project keys

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Best Practices for Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

**⚠️ Important**: These security rules are critical for protecting user data. Always test thoroughly before deploying to production, and never deploy overly permissive rules to a live application.