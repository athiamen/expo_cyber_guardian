import AsyncStorageNative from "@react-native-async-storage/async-storage";

const memoryStore = new Map<string, string>();

function isNativeError(err: unknown) {
  try {
    if (!err) return false;
    const msg = (err as Error).message ?? String(err);
    return (
      msg.includes("Native module is null") || msg.includes("cannot access")
    );
  } catch {
    return false;
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorageNative.getItem(key);
  } catch (err) {
    if (isNativeError(err)) {
      // fallback to memory store during development when native module isn't available
      console.warn(
        "[asyncStorageSafe] falling back to in-memory storage for",
        key,
      );
      return memoryStore.get(key) ?? null;
    }
    throw err;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorageNative.setItem(key, value);
  } catch (err) {
    if (isNativeError(err)) {
      // fallback to memory store
      console.warn(
        "[asyncStorageSafe] falling back to in-memory storage for",
        key,
      );
      memoryStore.set(key, value);
      return;
    }
    throw err;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorageNative.removeItem(key);
  } catch (err) {
    if (isNativeError(err)) {
      // fallback to memory store
      console.warn(
        "[asyncStorageSafe] falling back to in-memory storage remove for",
        key,
      );
      memoryStore.delete(key);
      return;
    }
    throw err;
  }
}

export default {
  getItem,
  setItem,
  removeItem,
};
