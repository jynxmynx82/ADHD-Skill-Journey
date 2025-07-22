import { createProvisionalProfile, getProvisionalProfile, updateProvisionalProfile } from '@/lib/provisionalProfileService';

// Mock Firebase
jest.mock('@/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
}));

describe('Provisional Profile Service', () => {
  const mockUserId = 'test-user-123';
  const mockAnswers = {
    primaryChallenge: 'mornings',
    familyStrength: 'creative',
    supportNetwork: 'therapist',
    currentStrategies: 'routines',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProvisionalProfile', () => {
    it('should create a provisional profile with correct data structure', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValue(undefined);

      const profileId = await createProvisionalProfile(mockUserId, mockAnswers);

      expect(profileId).toBe('provisional_test-user-123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: mockUserId,
          isPlaceholder: true,
          primaryChallenge: 'mornings',
          familyStrength: 'creative',
          supportNetwork: ['therapist'],
          currentStrategies: ['routines'],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should handle missing optional fields gracefully', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValue(undefined);

      const incompleteAnswers = {
        primaryChallenge: 'mornings',
        // Missing other fields
      };

      await createProvisionalProfile(mockUserId, incompleteAnswers);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          primaryChallenge: 'mornings',
          familyStrength: '',
          supportNetwork: [],
          currentStrategies: [],
        })
      );
    });
  });

  describe('getProvisionalProfile', () => {
    it('should return profile data when profile exists', async () => {
      const { getDoc } = require('firebase/firestore');
      const mockProfileData = {
        id: 'provisional_test-user-123',
        userId: mockUserId,
        isPlaceholder: true,
        primaryChallenge: 'mornings',
        familyStrength: 'creative',
        supportNetwork: ['therapist'],
        currentStrategies: ['routines'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfileData,
        id: 'provisional_test-user-123',
      });

      const result = await getProvisionalProfile(mockUserId);

      expect(result).toEqual(mockProfileData);
    });

    it('should return null when profile does not exist', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await getProvisionalProfile(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('updateProvisionalProfile', () => {
    it('should update profile with new data', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValue(undefined);

      const updates = {
        primaryChallenge: 'homework',
        familyStrength: 'energy',
      };

      await updateProvisionalProfile(mockUserId, updates);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          primaryChallenge: 'homework',
          familyStrength: 'energy',
          updatedAt: expect.any(Date),
        }),
        { merge: true }
      );
    });
  });
}); 