import AsyncStorage from "@react-native-async-storage/async-storage";

import { ConsentRecord as ConsentRecordSchema } from "@/src/_generated/be_fe.zod";

const DEVICE_ID_KEY = "device_id";
const CONSENT_RECORD_KEY = "consent_record";

export type LocalConsentRecord = {
  deviceId: string;
  consentedAt: string;
};

// crypto.randomUUID() covers this app's current web-only MVP target (see
// root CLAUDE.md); the fallback only matters if this ever runs somewhere
// without it (e.g. a native build, or an older browser).
const generateDeviceId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

// Memoizes the in-flight lookup/creation itself (not just its eventual
// result) at module scope - without this, two calls racing before the
// first one's AsyncStorage.setItem lands (e.g. two settings toggles fired
// in quick succession on a brand-new install) would each find no existing
// id, each generate their OWN new uuid, and each write theirs last-write-
// wins, leaving concurrent writes tagged with different device ids for
// what is actually the same device.
let deviceIdPromise: Promise<string> | null = null;

// Stable per-device id, generated once and reused for the life of the
// install - referenced by the consent record below so the server can tell
// which device originally recorded a given account's consent.
export const getOrCreateDeviceId = (): Promise<string> => {
  if (!deviceIdPromise) {
    deviceIdPromise = (async (): Promise<string> => {
      const existingDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (existingDeviceId) {
        return existingDeviceId;
      }
      const newDeviceId = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, newDeviceId);
      return newDeviceId;
      // A transient AsyncStorage failure here would otherwise leave
      // deviceIdPromise permanently pointed at this same rejected promise -
      // every later call would keep getting that stale rejection forever
      // (until app restart) instead of getting a chance to retry. Resetting
      // the memo before rethrowing lets the next caller start a fresh
      // attempt.
    })().catch((storageError) => {
      deviceIdPromise = null;
      throw storageError;
    });
  }
  return deviceIdPromise;
};

export const getLocalConsentRecord =
  async (): Promise<LocalConsentRecord | null> => {
    const storedRecord = await AsyncStorage.getItem(CONSENT_RECORD_KEY);
    if (!storedRecord) {
      return null;
    }
    try {
      // safeParse (not `as`) so a value written by a future/incompatible
      // version of this app never gets treated as a valid record.
      const parsedRecord = ConsentRecordSchema.safeParse(
        JSON.parse(storedRecord),
      );
      return parsedRecord.success ? parsedRecord.data : null;
    } catch {
      return null;
    }
  };

// Called once, when the user accepts the consent gate (issue #31) - before
// any account exists. The recorded timestamp is what later proves consent
// predates the account when it's exchanged with the server at first login.
export const recordLocalConsent = async (): Promise<LocalConsentRecord> => {
  const deviceId = await getOrCreateDeviceId();
  const consentRecord: LocalConsentRecord = {
    deviceId,
    consentedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CONSENT_RECORD_KEY, JSON.stringify(consentRecord));
  return consentRecord;
};
