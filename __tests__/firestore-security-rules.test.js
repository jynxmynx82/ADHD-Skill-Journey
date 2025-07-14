/**
 * Firestore Security Rules Tests
 * 
 * These tests validate that the family-scoped security rules work correctly.
 * Run with: npm test -- __tests__/firestore-security-rules.test.js
 */

const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, deleteDoc } = require('firebase/firestore');

// Test configuration
const PROJECT_ID = 'adhd-skill-journey-test';
const USER_1_UID = 'user1';
const USER_2_UID = 'user2';
const FAMILY_1_ID = `family_${USER_1_UID}`;
const FAMILY_2_ID = `family_${USER_2_UID}`;

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  
  describe('Authentication Requirements', () => {
    it('should deny all access to unauthenticated users', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      
      // Try to read users collection
      await assertFails(getDoc(doc(unauthedDb, 'users', USER_1_UID)));
      
      // Try to read children collection
      await assertFails(getDocs(collection(unauthedDb, 'children')));
      
      // Try to write to any collection
      await assertFails(setDoc(doc(unauthedDb, 'users', USER_1_UID), { name: 'Test' }));
    });
  });

  describe('Users Collection', () => {
    it('should allow users to read/write their own document', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const userData = {
        uid: USER_1_UID,
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
      };
      
      // User can create their own document
      await assertSucceeds(setDoc(doc(user1Db, 'users', USER_1_UID), userData));
      
      // User can read their own document
      await assertSucceeds(getDoc(doc(user1Db, 'users', USER_1_UID)));
    });

    it('should deny users from accessing other users documents', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      // User 1 cannot read User 2's document
      await assertFails(getDoc(doc(user1Db, 'users', USER_2_UID)));
      
      // User 1 cannot write to User 2's document
      await assertFails(setDoc(doc(user1Db, 'users', USER_2_UID), { name: 'Hacker' }));
    });

    it('should validate user document structure', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      // Missing required fields should fail
      await assertFails(setDoc(doc(user1Db, 'users', USER_1_UID), {
        email: 'user1@example.com'
        // Missing firstName, lastName, etc.
      }));
      
      // Wrong UID should fail
      await assertFails(setDoc(doc(user1Db, 'users', USER_1_UID), {
        uid: 'wrong-uid',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
      }));
    });
  });

  describe('Children Collection', () => {
    beforeEach(async () => {
      // Set up test users
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      const user2Db = testEnv.authenticatedContext(USER_2_UID).firestore();
      
      await setDoc(doc(user1Db, 'users', USER_1_UID), {
        uid: USER_1_UID,
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
      });
      
      await setDoc(doc(user2Db, 'users', USER_2_UID), {
        uid: USER_2_UID,
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: new Date(),
      });
    });

    it('should allow users to create children in their family', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const childData = {
        name: 'Alice',
        age: 8,
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: ['creative', 'energetic'],
        challenges: ['focus', 'organization'],
        interests: ['art', 'music'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await assertSucceeds(addDoc(collection(user1Db, 'children'), childData));
    });

    it('should deny users from creating children in other families', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const childData = {
        name: 'Bob',
        age: 10,
        diagnosis: 'ADHD',
        familyId: FAMILY_2_ID, // Wrong family!
        strengths: ['math'],
        challenges: ['reading'],
        interests: ['games'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await assertFails(addDoc(collection(user1Db, 'children'), childData));
    });

    it('should allow users to read children in their family', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      // Create a child in user1's family
      const childData = {
        name: 'Charlie',
        age: 7,
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: ['sports'],
        challenges: ['sitting still'],
        interests: ['soccer'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const childRef = await addDoc(collection(user1Db, 'children'), childData);
      
      // User should be able to read their own family's children
      await assertSucceeds(getDoc(childRef));
      await assertSucceeds(getDocs(query(
        collection(user1Db, 'children'),
        where('familyId', '==', FAMILY_1_ID)
      )));
    });

    it('should deny users from reading children in other families', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      const user2Db = testEnv.authenticatedContext(USER_2_UID).firestore();
      
      // User 2 creates a child in their family
      const childData = {
        name: 'David',
        age: 9,
        diagnosis: 'ADHD',
        familyId: FAMILY_2_ID,
        strengths: ['reading'],
        challenges: ['math'],
        interests: ['books'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const childRef = await addDoc(collection(user2Db, 'children'), childData);
      
      // User 1 should NOT be able to read User 2's children
      await assertFails(getDoc(doc(user1Db, 'children', childRef.id)));
      await assertFails(getDocs(query(
        collection(user1Db, 'children'),
        where('familyId', '==', FAMILY_2_ID)
      )));
    });

    it('should validate child document structure', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      // Missing required fields should fail
      await assertFails(addDoc(collection(user1Db, 'children'), {
        name: 'Eve',
        // Missing age, diagnosis, familyId, etc.
      }));
      
      // Invalid age should fail
      await assertFails(addDoc(collection(user1Db, 'children'), {
        name: 'Frank',
        age: -5, // Invalid age
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: [],
        challenges: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      // Age too high should fail
      await assertFails(addDoc(collection(user1Db, 'children'), {
        name: 'Grace',
        age: 30, // Too old
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: [],
        challenges: [],
        interests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });
  });

  describe('Journeys Collection', () => {
    let childId;

    beforeEach(async () => {
      // Set up a test child for journey tests
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const childData = {
        name: 'Test Child',
        age: 8,
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: ['creative'],
        challenges: ['focus'],
        interests: ['art'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const childRef = await addDoc(collection(user1Db, 'children'), childData);
      childId = childRef.id;
    });

    it('should allow users to create journeys for their children', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const journeyData = {
        childId: childId,
        skillData: {
          id: 'skill_123',
          name: 'Tying Shoes',
          category: 'self-care',
          difficulty: 'beginner',
          estimatedDays: 30,
          createdAt: new Date(),
        },
        progress: {
          adventureCount: 0,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
      };
      
      await assertSucceeds(addDoc(collection(user1Db, 'journeys'), journeyData));
    });

    it('should deny users from creating journeys for other families children', async () => {
      const user2Db = testEnv.authenticatedContext(USER_2_UID).firestore();
      
      const journeyData = {
        childId: childId, // This child belongs to user1's family
        skillData: {
          id: 'skill_456',
          name: 'Reading',
          category: 'academic',
          difficulty: 'intermediate',
          estimatedDays: 60,
          createdAt: new Date(),
        },
        progress: {
          adventureCount: 0,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
      };
      
      await assertFails(addDoc(collection(user2Db, 'journeys'), journeyData));
    });
  });

  describe('Adventures Collection', () => {
    let childId;

    beforeEach(async () => {
      // Set up a test child for adventure tests
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const childData = {
        name: 'Test Child',
        age: 8,
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: ['creative'],
        challenges: ['focus'],
        interests: ['art'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const childRef = await addDoc(collection(user1Db, 'children'), childData);
      childId = childRef.id;
    });

    it('should allow users to create adventures for their children', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const adventureData = {
        childId: childId,
        skillId: 'skill_123',
        text: 'We tried our best today!',
        winType: 'tried-best',
        createdAt: new Date(),
      };
      
      await assertSucceeds(addDoc(collection(user1Db, 'adventures'), adventureData));
    });

    it('should validate adventure win types', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      // Valid win type should succeed
      await assertSucceeds(addDoc(collection(user1Db, 'adventures'), {
        childId: childId,
        skillId: 'skill_123',
        text: 'We made progress!',
        winType: 'made-progress',
        createdAt: new Date(),
      }));
      
      // Invalid win type should fail
      await assertFails(addDoc(collection(user1Db, 'adventures'), {
        childId: childId,
        skillId: 'skill_123',
        text: 'We failed miserably',
        winType: 'total-failure', // Invalid win type
        createdAt: new Date(),
      }));
    });
  });

  describe('Events Collection', () => {
    it('should allow users to create events for their family', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const eventData = {
        familyId: FAMILY_1_ID,
        createdBy: USER_1_UID,
        title: 'Doctor Appointment',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // 1 hour later
        category: 'medical',
        childIds: [],
        isRecurring: false,
        subTasks: [],
      };
      
      await assertSucceeds(addDoc(collection(user1Db, 'events'), eventData));
    });

    it('should deny users from creating events for other families', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const eventData = {
        familyId: FAMILY_2_ID, // Wrong family!
        createdBy: USER_1_UID,
        title: 'Unauthorized Event',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        category: 'other',
        childIds: [],
        isRecurring: false,
        subTasks: [],
      };
      
      await assertFails(addDoc(collection(user1Db, 'events'), eventData));
    });
  });

  describe('AI Stories Collection', () => {
    let childId;

    beforeEach(async () => {
      // Set up a test child for AI story tests
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const childData = {
        name: 'Test Child',
        age: 8,
        diagnosis: 'ADHD',
        familyId: FAMILY_1_ID,
        strengths: ['creative'],
        challenges: ['focus'],
        interests: ['art'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const childRef = await addDoc(collection(user1Db, 'children'), childData);
      childId = childRef.id;
    });

    it('should allow users to create AI stories for their children', async () => {
      const user1Db = testEnv.authenticatedContext(USER_1_UID).firestore();
      
      const storyData = {
        childId: childId,
        title: 'The Adventure of Learning',
        content: 'Once upon a time, a brave child learned to tie their shoes...',
        createdAt: new Date(),
      };
      
      await assertSucceeds(addDoc(collection(user1Db, 'ai_stories'), storyData));
    });

    it('should deny users from creating AI stories for other families children', async () => {
      const user2Db = testEnv.authenticatedContext(USER_2_UID).firestore();
      
      const storyData = {
        childId: childId, // This child belongs to user1's family
        title: 'Unauthorized Story',
        content: 'This should not be allowed...',
        createdAt: new Date(),
      };
      
      await assertFails(addDoc(collection(user2Db, 'ai_stories'), storyData));
    });
  });
});