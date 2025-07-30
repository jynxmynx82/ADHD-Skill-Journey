import { BaseEntity, DataClassification, DataSensitivity, getCollectionMetadata, isHIPAACompliant } from '@/types/compliance';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DataValidationService {
  
  /**
   * Validate a BaseEntity for compliance requirements
   */
  static validateEntity(entity: BaseEntity, collectionName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check required BaseEntity fields
    if (!entity.id) errors.push('Entity must have an ID');
    if (!entity.userId) errors.push('Entity must have a userId');
    if (!entity.createdAt) errors.push('Entity must have createdAt timestamp');
    if (!entity.updatedAt) errors.push('Entity must have updatedAt timestamp');
    if (!entity.dataClassification) errors.push('Entity must have dataClassification');
    if (!entity.dataSensitivity) errors.push('Entity must have dataSensitivity');
    if (!entity.encryptionLevel) errors.push('Entity must have encryptionLevel');
    if (!entity.createdBy) errors.push('Entity must have createdBy field');
    if (!entity.lastModifiedBy) errors.push('Entity must have lastModifiedBy field');
    if (entity.version === undefined) errors.push('Entity must have version number');
    if (entity.autoDelete === undefined) errors.push('Entity must have autoDelete flag');
    
    // Get collection metadata
    const metadata = getCollectionMetadata(collectionName);
    
    // Validate classification matches collection
    if (entity.dataClassification !== metadata.classification) {
      errors.push(`Entity classification (${entity.dataClassification}) must match collection classification (${metadata.classification})`);
    }
    
    // Validate sensitivity matches collection
    if (entity.dataSensitivity !== metadata.sensitivity) {
      errors.push(`Entity sensitivity (${entity.dataSensitivity}) must match collection sensitivity (${metadata.sensitivity})`);
    }
    
    // Validate encryption requirements
    if (metadata.requiresEncryption && entity.encryptionLevel !== 'hipaa') {
      errors.push('HIPAA collections require hipaa-level encryption');
    }
    
    // Validate audit trail
    if (entity.createdBy !== entity.userId) {
      warnings.push('createdBy should typically match userId for user-created entities');
    }
    
    if (entity.lastModifiedBy !== entity.userId) {
      warnings.push('lastModifiedBy should typically match userId for user-created entities');
    }
    
    // Validate timestamps
    const createdAt = new Date(entity.createdAt);
    const updatedAt = new Date(entity.updatedAt);
    
    if (isNaN(createdAt.getTime())) {
      errors.push('createdAt must be a valid ISO date string');
    }
    
    if (isNaN(updatedAt.getTime())) {
      errors.push('updatedAt must be a valid ISO date string');
    }
    
    if (updatedAt < createdAt) {
      errors.push('updatedAt cannot be before createdAt');
    }
    
    // Validate version number
    if (entity.version < 1) {
      errors.push('Version number must be at least 1');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate entity creation with proper compliance fields
   */
  static validateEntityCreation(
    data: any, 
    collectionName: string, 
    userId: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if data has required BaseEntity fields
    const requiredFields = [
      'userId', 'dataClassification', 'dataSensitivity', 
      'encryptionLevel', 'createdBy', 'lastModifiedBy', 'version', 'autoDelete'
    ];
    
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate userId matches current user
    if (data.userId && data.userId !== userId) {
      errors.push('userId must match the current user');
    }
    
    // Validate createdBy and lastModifiedBy
    if (data.createdBy && data.createdBy !== userId) {
      warnings.push('createdBy should match the current user');
    }
    
    if (data.lastModifiedBy && data.lastModifiedBy !== userId) {
      warnings.push('lastModifiedBy should match the current user');
    }
    
    // Validate classification
    const metadata = getCollectionMetadata(collectionName);
    if (data.dataClassification && data.dataClassification !== metadata.classification) {
      errors.push(`Data classification must be '${metadata.classification}' for collection '${collectionName}'`);
    }
    
    // Validate sensitivity
    if (data.dataSensitivity && data.dataSensitivity !== metadata.sensitivity) {
      errors.push(`Data sensitivity must be '${metadata.sensitivity}' for collection '${collectionName}'`);
    }
    
    // Validate encryption level
    if (metadata.requiresEncryption && data.encryptionLevel !== 'hipaa') {
      errors.push('HIPAA collections require hipaa-level encryption');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate entity update with proper audit trail
   */
  static validateEntityUpdate(
    originalEntity: BaseEntity,
    updates: Partial<BaseEntity>,
    userId: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if immutable fields are being changed
    const immutableFields = ['id', 'userId', 'createdAt', 'createdBy', 'dataClassification'];
    
    for (const field of immutableFields) {
      if (field in updates) {
        errors.push(`Cannot update immutable field: ${field}`);
      }
    }
    
    // Validate lastModifiedBy
    if (updates.lastModifiedBy && updates.lastModifiedBy !== userId) {
      warnings.push('lastModifiedBy should match the current user');
    }
    
    // Validate version increment
    if (updates.version && updates.version <= originalEntity.version) {
      errors.push('Version number must be incremented on updates');
    }
    
    // Validate updatedAt timestamp
    if (updates.updatedAt) {
      const updatedAt = new Date(updates.updatedAt);
      const createdAt = new Date(originalEntity.createdAt);
      
      if (isNaN(updatedAt.getTime())) {
        errors.push('updatedAt must be a valid ISO date string');
      }
      
      if (updatedAt < createdAt) {
        errors.push('updatedAt cannot be before createdAt');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate access permissions for a user
   */
  static validateAccess(
    entity: BaseEntity,
    userId: string,
    collectionName: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const metadata = getCollectionMetadata(collectionName);
    
    // User can always access their own data
    if (entity.userId === userId) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    // Check family scope access
    if (metadata.accessControls.familyScope && entity.familyId) {
      // This would need to be implemented with actual family membership check
      warnings.push('Family scope access validation requires family membership check');
    } else {
      errors.push('User does not have permission to access this entity');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate data retention policies
   */
  static validateRetention(entity: BaseEntity, collectionName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const metadata = getCollectionMetadata(collectionName);
    const createdAt = new Date(entity.createdAt);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Check if entity should be auto-deleted
    if (metadata.retentionPolicy.autoDelete && daysSinceCreation > metadata.retentionPolicy.days) {
      warnings.push(`Entity is past retention period (${metadata.retentionPolicy.days} days) and should be deleted`);
    }
    
    // Check if entity has expiresAt set
    if (entity.expiresAt) {
      const expiresAt = new Date(entity.expiresAt);
      if (now > expiresAt) {
        warnings.push('Entity has expired and should be deleted');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Comprehensive validation for entity operations
   */
  static validateEntityOperation(
    operation: 'create' | 'read' | 'update' | 'delete',
    entity: BaseEntity | Partial<BaseEntity>,
    collectionName: string,
    userId: string
  ): ValidationResult {
    const results: ValidationResult[] = [];
    
    switch (operation) {
      case 'create':
        results.push(this.validateEntityCreation(entity as Partial<BaseEntity>, collectionName, userId));
        break;
      case 'read':
        results.push(this.validateAccess(entity as BaseEntity, userId, collectionName));
        break;
      case 'update':
        // This would need the original entity for comparison
        results.push({ isValid: true, errors: [], warnings: ['Update validation requires original entity'] });
        break;
      case 'delete':
        results.push(this.validateAccess(entity as BaseEntity, userId, collectionName));
        break;
    }
    
    // Combine all validation results
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

// Export singleton instance
export const dataValidation = new DataValidationService(); 