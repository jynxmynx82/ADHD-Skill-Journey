# Data Architecture & HIPAA Compliance

## Overview

This document outlines the data architecture for the ADHD Skills Journey app, designed to support both current functionality and future HIPAA compliance requirements. The architecture separates general app data from health-related information to ensure proper data handling and security.

## 🏗️ Architecture Principles

### 1. **Data Classification System**
All data is classified into three categories:
- **Non-HIPAA**: General app functionality, no Protected Health Information (PHI)
- **HIPAA PHI**: Protected Health Information requiring full compliance
- **HIPAA PHI Minimal**: Basic health information with minimal compliance requirements

### 2. **Collection-Based Security**
Each Firestore collection has defined:
- **Access Controls**: Who can read/write data
- **Encryption Requirements**: Whether data needs encryption
- **Retention Policies**: How long data is kept
- **Audit Requirements**: What actions are logged

### 3. **Future-Ready Design**
- Current features work without HIPAA complexity
- Easy to add health features later
- Clear migration path for existing data

## 📊 Data Model Structure

### Base Entity Interface
All data entities extend `BaseEntity` with compliance fields:

```typescript
interface BaseEntity {
  id: string;
  userId: string;
  familyId?: string;
  childId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Compliance fields
  dataClassification: DataClassification;
  dataSensitivity: DataSensitivity;
  encryptionLevel: 'none' | 'standard' | 'hipaa';
  
  // Audit trail
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  
  // Data retention
  expiresAt?: string;
  autoDelete: boolean;
}
```

## 🗂️ Collection Classification

### Current Collections (Non-HIPAA)

| Collection | Purpose | Sensitivity | Retention | Encryption |
|------------|---------|-------------|-----------|------------|
| `userProfiles` | Basic user information | Internal | 7 years | None |
| `provisionalProfiles` | Family-level insights | Internal | 1 year | None |
| `helpfulStrategies` | Saved behavioral strategies | Confidential | 7 years | None |
| `adviceSessions` | Quick advice interactions | Confidential | 3 years | None |
| `journalEntries` | Daily reflections & notes | Confidential | 7 years | None |
| `skillJourneys` | Progress tracking | Confidential | 7 years | None |
| `scheduleEvents` | Daily routines & reminders | Confidential | 3 years | None |
| `favoriteResources` | Saved articles & bookmarks | Internal | 7 years | None |
| `usageTracking` | App usage analytics | Internal | 3 years | None |

### Future Collections (HIPAA-Compliant)

| Collection | Purpose | Sensitivity | Retention | Encryption |
|------------|---------|-------------|-----------|------------|
| `medicalRecords` | Health records & diagnoses | Restricted | 7 years | Required |
| `healthObservations` | Symptoms & side effects | Restricted | 3 years | Required |
| `treatmentPlans` | Provider recommendations | Restricted | 7 years | Required |
| `medicationSchedules` | Medication tracking | Restricted | 7 years | Required |

## 🔐 Security & Access Controls

### Data Sensitivity Levels

1. **Public**: No restrictions (not used in this app)
2. **Internal**: App users only
3. **Confidential**: User + family members only
4. **Restricted**: User only, potential PHI

### Access Control Matrix

| Collection Type | User Access | Family Access | Admin Access |
|----------------|-------------|---------------|--------------|
| Non-HIPAA Internal | ✅ Read/Write | ❌ None | ✅ Read/Write |
| Non-HIPAA Confidential | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| HIPAA Restricted | ✅ Read/Write | ❌ None | ✅ Read Only |

## 📋 Implementation Status

### ✅ Completed
- [x] Data classification system
- [x] Base entity interface
- [x] Collection metadata definitions
- [x] Service layer updates (PersonalLearningHubService, AIAdviceService)
- [x] Data validation service
- [x] Audit logging service
- [x] **Full BaseEntity migration for all collections**
- [x] **Complete audit logging integration**
- [x] **Consistent data architecture across all services**

### 🔄 In Progress
- [ ] Validation integration in remaining services
- [ ] Comprehensive testing of migration logic

### 📋 Planned
- [ ] HIPAA compliance implementation (when needed)
- [ ] Encryption layer (when required)
- [ ] Advanced access controls
- [ ] Data retention automation

## 🚀 Migration Strategy

### Completed Migration
All existing data has been successfully migrated to the new BaseEntity structure. The migration included:

1. **Automatic Legacy Data Migration**: Existing children data was automatically upgraded with BaseEntity fields
2. **Audit Trail Integration**: All CRUD operations now include comprehensive audit logging
3. **Collection Metadata**: All collections are properly classified and documented
4. **Service Layer Updates**: All services now use consistent BaseEntity patterns

### BaseEntity Structural Changes for Future Development

When adding new features, all data models must extend BaseEntity:

```typescript
// ✅ Correct Pattern for New Features
export interface NewFeature extends BaseEntity {
  // Your specific fields
  name: string;
  description?: string;
  
  // BaseEntity fields are automatically included:
  // - id, userId, familyId?, childId?
  // - createdAt, updatedAt (ISO strings)
  // - dataClassification, dataSensitivity, encryptionLevel
  // - createdBy, lastModifiedBy, version
  // - expiresAt?, autoDelete
}
```

### Service Layer Pattern for New Features

```typescript
export class NewFeatureService {
  async createFeature(data: Omit<NewFeature, 'id'>): Promise<NewFeature> {
    const now = new Date().toISOString();
    const entity: NewFeature = {
      id: '', // Will be set by Firestore
      ...data,
      createdAt: now,
      updatedAt: now,
      dataClassification: 'non_hipaa', // or appropriate classification
      dataSensitivity: 'confidential', // or appropriate sensitivity
      encryptionLevel: 'none', // or 'hipaa' for health data
      createdBy: data.userId,
      lastModifiedBy: data.userId,
      version: 1,
      autoDelete: false
    };
    
    const docRef = await addDoc(collection(db, 'newFeature'), entity);
    
    // Always include audit logging
    await AuditLoggingService.logCreate(
      entity.userId,
      'newFeature',
      docRef.id,
      'User created new feature'
    );
    
    return { ...entity, id: docRef.id };
  }
}
```

### Collection Metadata for New Features

When adding new collections, update `COLLECTION_METADATA` in `types/compliance.ts`:

```typescript
'newFeature': {
  collectionName: 'newFeature',
  classification: 'non_hipaa', // or 'hipaa_phi' for health data
  sensitivity: 'confidential', // or 'internal', 'restricted'
  requiresEncryption: false, // true for HIPAA collections
  retentionPolicy: { days: 2555, autoDelete: false },
  accessControls: { requiresAuth: true, familyScope: true, userScope: true }
}
```

## 🔧 Technical Implementation

### Service Layer Architecture
The app uses a service-oriented architecture with compliance built-in:

```typescript
// Core Services
- PersonalLearningHubService: Manages helpful strategies, advice sessions, journal entries
- DataValidationService: Enforces compliance rules and data validation
- AuditLoggingService: Tracks all data access and modifications
- ProvisionalProfileService: Family insights and user profiles
- SkillJourneyService: Progress tracking and skill management
- AIAdviceService: Quick advice and AI interactions
- JournalStorageService: Journal entry management
- SubscriptionService: Premium features and billing
```

### Collection Metadata
```typescript
export const COLLECTION_METADATA = {
  'helpfulStrategies': {
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  }
  // ... other collections
};
```

### Utility Functions
```typescript
// Check if collection requires HIPAA compliance
isHIPAACompliant('medicalRecords') // true
isHIPAACompliant('helpfulStrategies') // false

// Check encryption requirements
requiresEncryption('medicalRecords') // true
requiresEncryption('userProfiles') // false
```

### Data Validation
```typescript
// Validate entity compliance
const result = DataValidationService.validateEntity(entity, 'helpfulStrategies');
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

### Audit Logging
```typescript
// Log all data operations
await AuditLoggingService.logCreate(userId, 'helpfulStrategies', docId, 'User saved strategy');
await AuditLoggingService.logUpdate(userId, 'helpfulStrategies', docId, 'User updated strategy');
```

## 📈 Benefits for Production

### 1. **Clear Data Boundaries**
- Easy to understand what data is sensitive
- Clear separation between app features and health data
- Simplified compliance auditing

### 2. **Scalable Architecture**
- Add health features without affecting current functionality
- Gradual migration path
- Flexible security policies

### 3. **User Experience**
- Current features work seamlessly
- No complexity for non-health features
- Clear privacy controls

### 4. **Development Efficiency**
- Consistent data patterns
- Reusable compliance utilities
- Clear documentation

## 🧪 Testing Considerations

### Data Classification Testing
- Verify correct classification of all data
- Test access controls for each collection
- Validate retention policies

### Security Testing
- Test authentication requirements
- Verify family scope permissions
- Test audit logging

### Migration Testing
- Test data migration between collections
- Verify compliance field population
- Test rollback procedures

## 📚 Related Documentation

- [AI Interactive Agent Specification](./AI_INTERACTIVE_AGENT_SPEC.md)
- [Provisional Profile System](./PROVISIONAL_PROFILE_SYSTEM.md)
- [Product Overview](./PRODUCT_OVERVIEW.md)
- [Firebase Emulator Setup](./FIREBASE_EMULATOR_SETUP.md)

## 🤝 Team Guidelines

### For Developers
1. Always extend `BaseEntity` for new data models
2. Use appropriate collection metadata
3. Implement proper access controls
4. Add audit logging for sensitive operations

### For Product Managers
1. Understand data classification before adding features
2. Plan HIPAA requirements early
3. Consider user privacy implications
4. Document data handling procedures

### For QA/Testing
1. Test data classification accuracy
2. Verify access control enforcement
3. Validate retention policy compliance
4. Test audit trail functionality

---

*This architecture ensures the app can grow from a simple behavioral support tool to a comprehensive health management platform while maintaining user trust and regulatory compliance.* 