import { Storage } from "@plasmohq/storage";

const storage = new Storage({ area: "local" });

interface SessionData {
  password: string; // Plain password during active session (for signing)
  enteredAt: number; // When session started
  lastActive: number; // When user was last active (updated regularly)
  autoLockTimer: string; // The auto-lock setting (immediately, 10mins, etc.)
}

// Session management functions
export const createSession = async (password: string, autoLockTimer: string): Promise<SessionData> => {
  const now = Date.now();
  const sessionData: SessionData = {
    password,
    enteredAt: now,
    lastActive: now,
    autoLockTimer
  };
  
  await storage.set("gorbag_session", sessionData);
  return sessionData;
};

export const getSession = async (): Promise<SessionData | null> => {
  try {
    const session = await storage.get<SessionData>("gorbag_session");
    return session || null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

export const updateSessionLastActive = async (): Promise<void> => {
  const session = await getSession();
  if (session) {
    session.lastActive = Date.now();
    await storage.set("gorbag_session", session);
  }
};

export const deleteSession = async (): Promise<void> => {
  await storage.remove("gorbag_session");
};

export const isSessionExpired = async (): Promise<boolean> => {
  const session = await getSession();
  if (!session) return true; // No session = expired

  const now = Date.now();
  const lastActive = session.lastActive;
  let lockTime = 0;

  switch (session.autoLockTimer) {
    case "immediately": 
      // Small grace period to allow popup close to be detected
      lockTime = 1000; // 1 second
      break;
    case "10mins": 
      lockTime = 10 * 60 * 1000; 
      break;
    case "30mins": 
      lockTime = 30 * 60 * 1000; 
      break;
    case "1hr": 
      lockTime = 60 * 60 * 1000; 
      break;
    case "4hrs": 
      lockTime = 4 * 60 * 60 * 1000; 
      break;
    default: 
      lockTime = 1000;
  }

  return (now - lastActive) >= lockTime;
};