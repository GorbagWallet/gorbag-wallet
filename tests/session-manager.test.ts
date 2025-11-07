import { 
  createSession, 
  getSession, 
  updateSessionLastActive, 
  deleteSession, 
  isSessionExpired 
} from '../src/lib/session-manager';

// Define the mock storage instance before creating the mock
const mockStorageInstance = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
};

// Mock the Plasmo storage module after defining the instance
jest.mock('@plasmohq/storage', () => ({
  Storage: jest.fn(() => mockStorageInstance)
}));

describe('Session Manager', () => {
  const mockStorage = mockStorageInstance;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('creates a new session with provided data', async () => {
      const password = 'testPassword123';
      const autoLockTimer = '30mins';
      const currentTime = 1762547527842; // Fixed timestamp for testing
      
      // Mock Date.now to return a specific value
      jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

      const result = await createSession(password, autoLockTimer);

      expect(result).toEqual({
        password,
        enteredAt: currentTime,
        lastActive: currentTime,
        autoLockTimer
      });

      expect(mockStorage.set).toHaveBeenCalledWith('gorbag_session', {
        password,
        enteredAt: currentTime,
        lastActive: currentTime,
        autoLockTimer
      });
      
      // Restore original Date.now
      jest.spyOn(global.Date, 'now').mockRestore();
    });

    it('creates a session with different auto-lock timer', async () => {
      const password = 'anotherPassword';
      const autoLockTimer = '1hr';
      const currentTime = Date.now();
      
      jest.spyOn(global.Date, 'now').mockImplementation(() => currentTime);

      const result = await createSession(password, autoLockTimer);

      expect(result.autoLockTimer).toBe(autoLockTimer);
      expect(result.enteredAt).toBe(currentTime);
      expect(result.lastActive).toBe(currentTime);
      
      jest.spyOn(global.Date, 'now').mockRestore();
    });
  });

  describe('getSession', () => {
    it('returns session data when it exists', async () => {
      const sessionData = {
        password: 'testPassword',
        enteredAt: Date.now() - 1000,
        lastActive: Date.now() - 500,
        autoLockTimer: '10mins'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await getSession();

      expect(result).toEqual(sessionData);
      expect(mockStorage.get).toHaveBeenCalledWith('gorbag_session');
    });

    it('returns null when session does not exist', async () => {
      mockStorage.get.mockResolvedValue(null);

      const result = await getSession();

      expect(result).toBeNull();
    });

    it('handles storage errors gracefully', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      const result = await getSession();

      expect(result).toBeNull();
    });
  });

  describe('updateSessionLastActive', () => {
    it('updates the last active time when session exists', async () => {
      const sessionData = {
        password: 'testPassword',
        enteredAt: Date.now() - 10000,
        lastActive: Date.now() - 5000,
        autoLockTimer: '30mins'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);
      const newTime = Date.now();
      jest.spyOn(global.Date, 'now').mockImplementation(() => newTime);

      await updateSessionLastActive();

      expect(mockStorage.get).toHaveBeenCalledWith('gorbag_session');
      expect(mockStorage.set).toHaveBeenCalledWith('gorbag_session', {
        ...sessionData,
        lastActive: newTime
      });
      
      jest.spyOn(global.Date, 'now').mockRestore();
    });

    it('does nothing when no session exists', async () => {
      mockStorage.get.mockResolvedValue(null);

      await updateSessionLastActive();

      expect(mockStorage.get).toHaveBeenCalledWith('gorbag_session');
      expect(mockStorage.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('removes the session from storage', async () => {
      await deleteSession();

      expect(mockStorage.remove).toHaveBeenCalledWith('gorbag_session');
    });
  });

  describe('isSessionExpired', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns true when no session exists', async () => {
      mockStorage.get.mockResolvedValue(null);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });

    it('returns false when session is still active (10mins timer)', async () => {
      const now = Date.now();
      const tenMinutesAgo = now - 9 * 60 * 1000; // 9 minutes ago (< 10 mins)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: tenMinutesAgo,
        autoLockTimer: '10mins'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(false);
    });

    it('returns true when session has expired (10mins timer)', async () => {
      const now = Date.now();
      const elevenMinutesAgo = now - 11 * 60 * 1000; // 11 minutes ago (> 10 mins)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: elevenMinutesAgo,
        autoLockTimer: '10mins'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });

    it('returns true when session has expired (immediately timer)', async () => {
      const now = Date.now();
      const twoSecondsAgo = now - 2000; // 2 seconds ago (> 1 second threshold)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 1000,
        lastActive: twoSecondsAgo,
        autoLockTimer: 'immediately'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });

    it('returns false when session is still active (immediately timer)', async () => {
      const now = Date.now();
      const halfSecondAgo = now - 500; // 0.5 seconds ago (< 1 second threshold)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 100,
        lastActive: halfSecondAgo,
        autoLockTimer: 'immediately'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(false);
    });

    it('returns false when session is still active (30mins timer)', async () => {
      const now = Date.now();
      const twentyFiveMinutesAgo = now - 25 * 60 * 1000; // 25 minutes ago (< 30 mins)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: twentyFiveMinutesAgo,
        autoLockTimer: '30mins'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(false);
    });

    it('returns true when session has expired (30mins timer)', async () => {
      const now = Date.now();
      const thirtyFiveMinutesAgo = now - 35 * 60 * 1000; // 35 minutes ago (> 30 mins)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: thirtyFiveMinutesAgo,
        autoLockTimer: '30mins'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });

    it('returns false when session is still active (1hr timer)', async () => {
      const now = Date.now();
      const fiftyFiveMinutesAgo = now - 55 * 60 * 1000; // 55 minutes ago (< 60 mins)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: fiftyFiveMinutesAgo,
        autoLockTimer: '1hr'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(false);
    });

    it('returns true when session has expired (1hr timer)', async () => {
      const now = Date.now();
      const sixtyFiveMinutesAgo = now - 65 * 60 * 1000; // 65 minutes ago (> 60 mins)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: sixtyFiveMinutesAgo,
        autoLockTimer: '1hr'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });

    it('returns false when session is still active (4hrs timer)', async () => {
      const now = Date.now();
      const threeAndHalfHoursAgo = now - 3.5 * 60 * 60 * 1000; // 3.5 hours ago (< 4 hours)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: threeAndHalfHoursAgo,
        autoLockTimer: '4hrs'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(false);
    });

    it('returns true when session has expired (4hrs timer)', async () => {
      const now = Date.now();
      const fiveHoursAgo = now - 5 * 60 * 60 * 1000; // 5 hours ago (> 4 hours)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 10000,
        lastActive: fiveHoursAgo,
        autoLockTimer: '4hrs'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });

    it('uses default timer when autoLockTimer is unknown', async () => {
      const now = Date.now();
      const twoSecondsAgo = now - 2000; // 2 seconds ago (> 1 second default)
      
      jest.setSystemTime(now);
      
      const sessionData = {
        password: 'test',
        enteredAt: now - 1000,
        lastActive: twoSecondsAgo,
        autoLockTimer: 'unknown-timer'
      };
      
      mockStorage.get.mockResolvedValue(sessionData);

      const result = await isSessionExpired();

      expect(result).toBe(true);
    });
  });
});