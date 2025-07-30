/**
 * HIPAA Compliance and Data Classification Types
 * Prepares the data model for future HIPAA compliance requirements
 */

// ===== DATA CLASSIFICATION =====

export type DataClassification = 
  | 'non_hipaa'      // General app functionality, no PHI
  | 'hipaa_phi'      // Protected Health Information
  | 'hipaa_phi_minimal'; // Minimal PHI (e.g., basic diagnosis)

export type DataSensitivity = 
  | 'public'         // No restrictions
  | 'internal'       // App users only
  | 'confidential'   // User + family only
  | 'restricted';    // User only, potential PHI

// ===== COLLECTION CLASSIFICATION =====

export interface CollectionMetadata {
  collectionName: string;
  classification: DataClassification;
  sensitivity: DataSensitivity;
  requiresEncryption: boolean;
  retentionPolicy: {
    days: number;
    autoDelete: boolean;
  };
  accessControls: {
    requiresAuth: boolean;
    familyScope: boolean;
    userScope: boolean;
  };
}

// ===== BASE ENTITY WITH COMPLIANCE =====

export interface BaseEntity {
  id: string;
  userId: string;
  familyId?: string;
  childId?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  
  // Compliance fields
  dataClassification: DataClassification;
  dataSensitivity: DataSensitivity;
  encryptionLevel: 'none' | 'standard' | 'hipaa';
  
  // Audit trail
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  
  // Data retention
  expiresAt?: string; // ISO string
  autoDelete: boolean;
}

// ===== COLLECTION DEFINITIONS =====

export const COLLECTION_METADATA: Record<string, CollectionMetadata> = {
  // Non-HIPAA Collections (Current)
  'userProfiles': {
    collectionName: 'userProfiles',
    classification: 'non_hipaa',
    sensitivity: 'internal',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false }, // 7 years
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'provisionalProfiles': {
    collectionName: 'provisionalProfiles',
    classification: 'non_hipaa',
    sensitivity: 'internal',
    requiresEncryption: false,
    retentionPolicy: { days: 365, autoDelete: true },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'helpfulStrategies': {
    collectionName: 'helpfulStrategies',
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  },
  
  'adviceSessions': {
    collectionName: 'adviceSessions',
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 1095, autoDelete: true }, // 3 years
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  },
  
  'journalEntries': {
    collectionName: 'journalEntries',
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  },
  
  'skillJourneys': {
    collectionName: 'skillJourneys',
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  },
  
  'scheduleEvents': {
    collectionName: 'scheduleEvents',
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 1095, autoDelete: true },
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  },
  
  'favoriteResources': {
    collectionName: 'favoriteResources',
    classification: 'non_hipaa',
    sensitivity: 'internal',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'usageTracking': {
    collectionName: 'usageTracking',
    classification: 'non_hipaa',
    sensitivity: 'internal',
    requiresEncryption: false,
    retentionPolicy: { days: 1095, autoDelete: true },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'children': {
    collectionName: 'children',
    classification: 'non_hipaa',
    sensitivity: 'confidential',
    requiresEncryption: false,
    retentionPolicy: { days: 2555, autoDelete: false }, // 7 years
    accessControls: { requiresAuth: true, familyScope: true, userScope: true }
  },
  
  // Future HIPAA Collections
  'medicalRecords': {
    collectionName: 'medicalRecords',
    classification: 'hipaa_phi',
    sensitivity: 'restricted',
    requiresEncryption: true,
    retentionPolicy: { days: 2555, autoDelete: false }, // 7 years
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'healthObservations': {
    collectionName: 'healthObservations',
    classification: 'hipaa_phi',
    sensitivity: 'restricted',
    requiresEncryption: true,
    retentionPolicy: { days: 1095, autoDelete: true },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'treatmentPlans': {
    collectionName: 'treatmentPlans',
    classification: 'hipaa_phi',
    sensitivity: 'restricted',
    requiresEncryption: true,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  },
  
  'medicationSchedules': {
    collectionName: 'medicationSchedules',
    classification: 'hipaa_phi',
    sensitivity: 'restricted',
    requiresEncryption: true,
    retentionPolicy: { days: 2555, autoDelete: false },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  }
};

// ===== DATA CLASSIFICATION UTILITIES =====

export function getCollectionMetadata(collectionName: string): CollectionMetadata {
  return COLLECTION_METADATA[collectionName] || {
    collectionName,
    classification: 'non_hipaa',
    sensitivity: 'internal',
    requiresEncryption: false,
    retentionPolicy: { days: 365, autoDelete: true },
    accessControls: { requiresAuth: true, familyScope: false, userScope: true }
  };
}

export function isHIPAACompliant(classification: DataClassification): boolean {
  return classification === 'hipaa_phi' || classification === 'hipaa_phi_minimal';
}

export function requiresEncryption(collectionName: string): boolean {
  const metadata = getCollectionMetadata(collectionName);
  return metadata.requiresEncryption;
}

// ===== COMPLIANCE HELPERS =====

export interface ComplianceConfig {
  enableHIPAA: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  dataRetention: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  collectionName: string;
  documentId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// ===== DATA MIGRATION TYPES =====

export interface DataMigrationPlan {
  fromCollection: string;
  toCollection: string;
  classification: DataClassification;
  migrationRules: {
    fieldMappings: Record<string, string>;
    dataTransformations: Record<string, (value: any) => any>;
    validationRules: Record<string, (value: any) => boolean>;
  };
  estimatedDuration: number; // minutes
  rollbackPlan: string;
} 