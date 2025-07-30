import { db } from '@/firebaseConfig';
import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { AuditLog } from '@/types/compliance';

export interface AuditEvent {
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  collectionName: string;
  documentId?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export class AuditLoggingService {
  
  /**
   * Log an audit event
   */
  static async logEvent(event: AuditEvent): Promise<void> {
    try {
      const ipAddress = await this.getClientIP();
      const userAgent = await this.getClientUserAgent();
      
      const auditLog: AuditLog = {
        id: '', // Will be set by Firestore
        userId: event.userId,
        action: event.action,
        collectionName: event.collectionName,
        documentId: event.documentId,
        timestamp: new Date().toISOString(),
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
        ...(event.reason && { reason: event.reason }),
        ...(event.metadata && { metadata: event.metadata })
      };
      
      await addDoc(collection(db, 'auditLogs'), auditLog);
      
      // Log to console in development
      if (__DEV__) {
        console.log('🔍 Audit Log:', {
          action: event.action,
          collection: event.collectionName,
          documentId: event.documentId,
          userId: event.userId,
          timestamp: auditLog.timestamp
        });
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw - audit logging should not break the main functionality
    }
  }
  
  /**
   * Log entity creation
   */
  static async logCreate(
    userId: string,
    collectionName: string,
    documentId: string,
    reason?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'create',
      collectionName,
      documentId,
      reason
    });
  }
  
  /**
   * Log entity read
   */
  static async logRead(
    userId: string,
    collectionName: string,
    documentId?: string,
    reason?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'read',
      collectionName,
      documentId,
      reason
    });
  }
  
  /**
   * Log entity update
   */
  static async logUpdate(
    userId: string,
    collectionName: string,
    documentId: string,
    reason?: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'update',
      collectionName,
      documentId,
      reason,
      metadata: { changes }
    });
  }
  
  /**
   * Log entity deletion
   */
  static async logDelete(
    userId: string,
    collectionName: string,
    documentId: string,
    reason?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'delete',
      collectionName,
      documentId,
      reason
    });
  }
  
  /**
   * Log data export
   */
  static async logExport(
    userId: string,
    collectionName: string,
    reason?: string,
    exportFormat?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'export',
      collectionName,
      reason,
      metadata: { exportFormat }
    });
  }
  
  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(
    userId: string,
    limitCount: number = 100
  ): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } catch (error) {
      console.error('Error getting user audit logs:', error);
      throw new Error('Failed to get audit logs');
    }
  }
  
  /**
   * Get audit logs for a specific document
   */
  static async getDocumentAuditLogs(
    collectionName: string,
    documentId: string,
    limitCount: number = 50
  ): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'auditLogs'),
        where('collectionName', '==', collectionName),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } catch (error) {
      console.error('Error getting document audit logs:', error);
      throw new Error('Failed to get document audit logs');
    }
  }
  
  /**
   * Get audit logs for a collection
   */
  static async getCollectionAuditLogs(
    collectionName: string,
    limitCount: number = 100
  ): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'auditLogs'),
        where('collectionName', '==', collectionName),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } catch (error) {
      console.error('Error getting collection audit logs:', error);
      throw new Error('Failed to get collection audit logs');
    }
  }
  
  /**
   * Get audit analytics for compliance reporting
   */
  static async getAuditAnalytics(
    userId?: string,
    collectionName?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByCollection: Record<string, number>;
    eventsByUser: Record<string, number>;
    recentActivity: AuditLog[];
  }> {
    try {
      let q = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(1000) // Limit for analytics
      );
      
      // Add filters if provided
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
      
      if (collectionName) {
        q = query(q, where('collectionName', '==', collectionName));
      }
      
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      
      // Filter by date range if provided
      let filteredLogs = logs;
      if (startDate || endDate) {
        filteredLogs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          if (startDate && logDate < startDate) return false;
          if (endDate && logDate > endDate) return false;
          return true;
        });
      }
      
      // Calculate analytics
      const eventsByAction: Record<string, number> = {};
      const eventsByCollection: Record<string, number> = {};
      const eventsByUser: Record<string, number> = {};
      
      filteredLogs.forEach(log => {
        eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
        eventsByCollection[log.collectionName] = (eventsByCollection[log.collectionName] || 0) + 1;
        eventsByUser[log.userId] = (eventsByUser[log.userId] || 0) + 1;
      });
      
      return {
        totalEvents: filteredLogs.length,
        eventsByAction,
        eventsByCollection,
        eventsByUser,
        recentActivity: filteredLogs.slice(0, 50) // Last 50 events
      };
    } catch (error) {
      console.error('Error getting audit analytics:', error);
      throw new Error('Failed to get audit analytics');
    }
  }
  
  /**
   * Get client IP address (placeholder for React Native)
   */
  private static async getClientIP(): Promise<string | undefined> {
    // In React Native, we can't easily get the client IP
    // This would need to be implemented on the server side
    return undefined;
  }
  
  /**
   * Get client user agent (placeholder for React Native)
   */
  private static async getClientUserAgent(): Promise<string | undefined> {
    // In React Native, we can get some device info
    // This is a simplified version
    return 'React Native App';
  }
}

// Export singleton instance
export const auditLogging = new AuditLoggingService(); 