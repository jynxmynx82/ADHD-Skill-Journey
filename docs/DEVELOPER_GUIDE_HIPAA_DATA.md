# Developer Guide: HIPAA Data Architecture

## Quick Reference

### 🚀 Getting Started

#### 1. Creating New Data Models
```typescript
import { BaseEntity, DataClassification, DataSensitivity } from '../types/compliance';

// Always extend BaseEntity (no legacy support needed)
export interface MyNewEntity extends BaseEntity {
  // Your specific fields
  name: string;
  description?: string;
}
```

#### 2. Adding New Collections
```typescript
// In types/compliance.ts
export const COLLECTION_METADATA = {
  'myNewCollection': {
    collectionName: 'myNewCollection',
    classification: 'non_hipaa', // or 'hipaa_phi'
    sensitivity: 'confidential', // or 'internal', 'restricted'
    requiresEncryption: false, // true for HIPAA
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  }
};
```

#### 3. Creating Entities with Compliance
```typescript
const newEntity: MyNewEntity = {
  id: generateId(),
  userId: currentUser.uid,
  familyId: currentFamily.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Compliance fields
  dataClassification: 'non_hipaa',
  dataSensitivity: 'confidential',
  encryptionLevel: 'none',
  
  // Audit trail
  createdBy: currentUser.uid,
  lastModifiedBy: currentUser.uid,
  version: 1,
  autoDelete: false,
  
  // Your specific fields
  name: 'My Entity',
  description: 'Description here'
};
```

## 🚀 Migration Status

### ✅ Completed Migration
All existing data has been successfully migrated to the BaseEntity structure. The app now has:

- **Consistent Data Architecture**: All collections use BaseEntity
- **Complete Audit Logging**: All CRUD operations are logged
- **Proper Classification**: All data is properly classified
- **Service Layer Integration**: All services use consistent patterns

### 🏗️ Current Architecture
- **No Legacy Support**: All data follows BaseEntity patterns
- **Unified Security**: Consistent access controls across collections
- **Future-Ready**: Easy to add HIPAA features when needed
- **Production-Ready**: Clean, maintainable codebase

## 📋 Common Patterns

### 1. Service Layer Pattern
```typescript
export class MyService {
  async createEntity(data: Omit<MyNewEntity, 'id'>): Promise<MyNewEntity> {
    const now = new Date().toISOString();
    const entity: MyNewEntity = {
      id: '', // Will be set by Firestore
      ...data,
      createdAt: now,
      updatedAt: now,
      dataClassification: 'non_hipaa',
      dataSensitivity: 'confidential',
      encryptionLevel: 'none',
      createdBy: data.userId,
      lastModifiedBy: data.userId,
      version: 1,
      autoDelete: false
    };
    
    const docRef = await addDoc(collection(db, 'myCollection'), entity);
    
    // Log the creation
    await AuditLoggingService.logCreate(
      entity.userId,
      'myCollection',
      docRef.id,
      'User created entity'
    );
    
    return {
      ...entity,
      id: docRef.id
    };
  }
}
```

### 2. Data Validation
```typescript
import { DataValidationService } from '../lib/dataValidationService';

// Validate entity compliance
const result = DataValidationService.validateEntity(entity, 'myCollection');
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  console.warn('Validation warnings:', result.warnings);
}

// Validate entity creation
const creationResult = DataValidationService.validateEntityCreation(
  data, 
  'myCollection', 
  userId
);

// Validate entity update
const updateResult = DataValidationService.validateEntityUpdate(
  originalEntity,
  updates,
  userId
);
```

### 3. Access Control Checks
```typescript
import { DataValidationService } from '../lib/dataValidationService';

// Validate access permissions
const accessResult = DataValidationService.validateAccess(
  entity,
  userId,
  'myCollection'
);

if (!accessResult.isValid) {
  console.error('Access denied:', accessResult.errors);
}
```

## 🔧 Utility Functions

### Data Classification
```typescript
import { isHIPAACompliant, requiresEncryption, getCollectionMetadata } from '@/types/compliance';

// Check if data needs HIPAA compliance
const needsHIPAA = isHIPAACompliant('medicalRecords'); // true

// Check encryption requirements
const needsEncryption = requiresEncryption('medicalRecords'); // true

// Get collection metadata
const metadata = getCollectionMetadata('helpfulStrategies');
console.log(metadata.sensitivity); // 'confidential'
```

### Audit Logging
```typescript
import { AuditLoggingService } from '../lib/auditLoggingService';

// Log different types of events
await AuditLoggingService.logCreate(userId, 'myCollection', docId, 'User created entity');
await AuditLoggingService.logRead(userId, 'myCollection', docId, 'User viewed entity');
await AuditLoggingService.logUpdate(userId, 'myCollection', docId, 'User updated entity', changes);
await AuditLoggingService.logDelete(userId, 'myCollection', docId, 'User deleted entity');

// Get audit logs
const userLogs = await AuditLoggingService.getUserAuditLogs(userId);
const documentLogs = await AuditLoggingService.getDocumentAuditLogs('myCollection', docId);
const analytics = await AuditLoggingService.getAuditAnalytics(userId);
```

## 🚨 Important Rules

### 1. Always Extend BaseEntity
```typescript
// ✅ Correct
export interface MyEntity extends BaseEntity {
  name: string;
}

// ❌ Incorrect
export interface MyEntity {
  id: string;
  name: string;
}
```

### 2. Set Proper Classification
```typescript
// ✅ Correct - Behavioral data
const entity = {
  dataClassification: 'non_hipaa',
  dataSensitivity: 'confidential'
};

// ✅ Correct - Health data
const healthEntity = {
  dataClassification: 'hipaa_phi',
  dataSensitivity: 'restricted',
  encryptionLevel: 'hipaa'
};
```

### 3. Use Appropriate Collections
```typescript
// ✅ Correct - Behavioral strategy
await addDoc(collection(db, 'helpfulStrategies'), strategy);

// ✅ Correct - Health record (future)
await addDoc(collection(db, 'medicalRecords'), healthRecord);
```

## 🧪 Testing Guidelines

### 1. Data Classification Tests
```typescript
describe('Data Classification', () => {
  it('should classify behavioral data as non-HIPAA', () => {
    const strategy = createHelpfulStrategy();
    expect(strategy.dataClassification).toBe('non_hipaa');
  });
  
  it('should classify health data as HIPAA', () => {
    const healthRecord = createMedicalRecord();
    expect(healthRecord.dataClassification).toBe('hipaa_phi');
  });
});
```

### 2. Access Control Tests
```typescript
describe('Access Controls', () => {
  it('should allow family access to confidential data', () => {
    const canAccess = canAccessEntity(familyMemberId, familyData);
    expect(canAccess).toBe(true);
  });
  
  it('should restrict health data to user only', () => {
    const canAccess = canAccessEntity(familyMemberId, healthData);
    expect(canAccess).toBe(false);
  });
});
```

## 📚 Common Collections

### Current (Non-HIPAA)
- `userProfiles` - Basic user info
- `provisionalProfiles` - Family insights
- `helpfulStrategies` - Behavioral strategies
- `adviceSessions` - Quick advice interactions
- `journalEntries` - Daily reflections
- `skillJourneys` - Progress tracking
- `scheduleEvents` - Daily routines
- `favoriteResources` - Saved content
- `usageTracking` - App analytics

### Future (HIPAA)
- `medicalRecords` - Health records
- `healthObservations` - Symptoms/observations
- `treatmentPlans` - Provider recommendations
- `medicationSchedules` - Medication tracking

## 🔧 Implemented Services

### Core Services with Compliance
- **PersonalLearningHubService** - Manages helpful strategies, advice sessions, journal entries
- **DataValidationService** - Enforces compliance rules and data validation
- **AuditLoggingService** - Tracks all data access and modifications
- **ProvisionalProfileService** - Family insights and user profiles
- **SkillJourneyService** - Progress tracking and skill management
- **AIAdviceService** - Quick advice and AI interactions
- **JournalStorageService** - Journal entry management
- **SubscriptionService** - Premium features and billing

### Compliance Services
- **DataValidationService** - Comprehensive validation for all entities
- **AuditLoggingService** - Complete audit trail for compliance
- **Collection Metadata** - Centralized collection configuration

## 🔍 Debugging Tips

### 1. Check Data Classification
```typescript
console.log('Entity classification:', entity.dataClassification);
console.log('Collection metadata:', getCollectionMetadata('myCollection'));
```

### 2. Verify Access Controls
```typescript
const canAccess = canAccessEntity(userId, entity);
console.log('Access granted:', canAccess);
```

### 3. Check Compliance Fields
```typescript
const missingFields = [];
if (!entity.dataClassification) missingFields.push('dataClassification');
if (!entity.dataSensitivity) missingFields.push('dataSensitivity');
if (!entity.createdBy) missingFields.push('createdBy');

if (missingFields.length > 0) {
  console.error('Missing compliance fields:', missingFields);
}
```

## 🚀 Migration Checklist

When adding new features:

- [ ] Extend BaseEntity for all new interfaces
- [ ] Add collection metadata to COLLECTION_METADATA
- [ ] Set appropriate data classification
- [ ] Implement access controls
- [ ] Add audit logging for sensitive operations
- [ ] Test data validation
- [ ] Update documentation

---

*This guide ensures consistent implementation of the HIPAA-compliant data architecture across all development work.* 