import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  MESSAGES: 'elayra_messages',
  CONTEXT: 'elayra_context',
  USER: 'elayra_user',
} as const;

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export async function loadMessages(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMessages(messages: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
}

export async function loadContext(): Promise<any> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTEXT);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveContext(context: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONTEXT, JSON.stringify(context));
  } catch (e) {
    console.error('Failed to save context:', e);
  }
}

export async function loadUser(): Promise<StoredUser | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveUser(user: StoredUser): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (e) {
    console.error('Failed to clear user:', e);
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.MESSAGES,
      STORAGE_KEYS.CONTEXT,
      STORAGE_KEYS.USER,
    ]);
  } catch (e) {
    console.error('Failed to clear all:', e);
  }
}