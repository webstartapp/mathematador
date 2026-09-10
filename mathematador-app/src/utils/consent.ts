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

// Stable per-device id, generated once and reused for the life of the
// install - referenced by the consent record below so the server can tell
// which device originally recorded a given account's consent.
export const getOrCreateDeviceId = async (): Promise<string> => {
  const existingDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existingDeviceId) {
    return existingDeviceId;
  }
  const newDeviceId = generateDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, newDeviceId);
  return newDeviceId;
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
