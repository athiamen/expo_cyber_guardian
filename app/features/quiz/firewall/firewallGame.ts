import { Audio } from 'expo-av';
import type { QuizDifficulty } from '../data/quizCatalogData';

export type FirewallDataItem = {
  key: string;
  icon: string;
  label: string;
};

export type FirewallMovingObject = {
  id: number;
  kind: 'data' | 'bad' | 'power';
  icon: string;
  label: string;
  x: number;
  y: number;
  speed: number;
  drift: number;
};

export const FIREWALL_FALL_MULTIPLIER: Record<QuizDifficulty, number> = {
  easy: 1,
  medium: 1.18,
  hard: 1.38,
};

export const FIREWALL_MAX_SHIELD = 100;
export const FIREWALL_BAD_HIT_SHIELD_LOSS = 25;

export const FIREWALL_DATA_ITEMS: FirewallDataItem[] = [
  { key: 'name', icon: '👶', label: 'Nom complet' },
  { key: 'address', icon: '🏠', label: 'Adresse' },
  { key: 'phone', icon: '📞', label: 'Téléphone' },
  { key: 'email', icon: '✉️', label: 'Email' },
  { key: 'shield', icon: '🛡️', label: 'Bouclier' },
  { key: 'photo', icon: '📷', label: 'Photo' },
  { key: 'school', icon: '🏫', label: 'École' },
  { key: 'birth', icon: '🎂', label: 'Naissance' },
];

export const FIREWALL_FLOW_BY_QUESTION: Record<string, { dataKey: string; threatIcon: string; dataIcon: string }> = {
  'Q6-1': { dataKey: 'name', threatIcon: '🦠', dataIcon: '👶' },
  'Q6-2': { dataKey: 'address', threatIcon: '👾', dataIcon: '🏠' },
  'Q6-3': { dataKey: 'phone', threatIcon: '🎣', dataIcon: '📞' },
  'Q6-4': { dataKey: 'shield', threatIcon: '📨', dataIcon: '🛡️' },
  'Q6-5': { dataKey: 'photo', threatIcon: '🕵️', dataIcon: '📷' },
  'Q6-6': { dataKey: 'email', threatIcon: '🧨', dataIcon: '✉️' },
  'Q6-7': { dataKey: 'school', threatIcon: '🕳️', dataIcon: '🏫' },
  'Q6-8': { dataKey: 'birth', threatIcon: '⏳', dataIcon: '🎂' },
};

export const FIREWALL_LEVEL_LABELS: Record<QuizDifficulty, string> = {
  easy: 'Débutant',
  medium: 'Intermédiaire',
  hard: 'Expert',
};

const FIREWALL_DATA_ICONS = ['👶', '🏠', '📞', '✉️', '🛡️', '📷', '🏫', '🎂'] as const;
const FIREWALL_POWER_ICONS = ['🛡️', '🔢', '🐢', '🧲', '❤️'] as const;
const FIREWALL_BAD_ICONS = ['🦠', '🎣', '📨', '👾', '💣'] as const;

function encodeBase64(bytes: Uint8Array) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const third = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const triplet = (first << 16) | (second << 8) | third;

    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }

  return output;
}

function createToneDataUri(frequency: number, durationSeconds: number, volume: number) {
  const sampleRate = 22050;
  const sampleCount = Math.max(1, Math.round(sampleRate * durationSeconds));
  const dataSize = sampleCount;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      bytes[offset + index] = value.charCodeAt(index);
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const time = sampleIndex / sampleRate;
    const envelope = Math.min(1, sampleIndex / 120) * Math.max(0, 1 - sampleIndex / sampleCount);
    const sample = Math.sin(2 * Math.PI * frequency * time) * 127 * volume * envelope;
    bytes[44 + sampleIndex] = Math.max(0, Math.min(255, Math.round(128 + sample)));
  }

  return `data:audio/wav;base64,${encodeBase64(bytes)}`;
}

const FIREWALL_SOUND_URIS = {
  data: createToneDataUri(880, 0.08, 0.26),
  power: createToneDataUri(660, 0.1, 0.24),
  bad: createToneDataUri(180, 0.14, 0.32),
} as const;

function pickRandom<T>(items: readonly T[]): T {
  const fallback = items[0];
  if (fallback === undefined) {
    throw new Error('pickRandom requires a non-empty array');
  }

  return items[Math.floor(Math.random() * items.length)] ?? fallback;
}

export function pickRandomFirewallKind(): FirewallMovingObject['kind'] {
  const roll = Math.random();
  if (roll < 0.5) {
    return 'data';
  }

  if (roll < 0.8) {
    return 'bad';
  }

  return 'power';
}

export function buildRandomFirewallVisuals(kind: FirewallMovingObject['kind']) {
  if (kind === 'data') {
    return { icon: pickRandom(FIREWALL_DATA_ICONS), label: 'Donnée' };
  }

  if (kind === 'bad') {
    return { icon: pickRandom(FIREWALL_BAD_ICONS), label: 'Menace' };
  }

  return { icon: pickRandom(FIREWALL_POWER_ICONS), label: 'Power-up' };
}

export function createFirewallObjects(width: number, height: number, difficulty: QuizDifficulty): FirewallMovingObject[] {
  const safeWidth = Math.max(width, 320);
  const safeHeight = Math.max(height, 260);
  const lanes = [0.15, 0.35, 0.58, 0.78];
  const count = 6;
  const speedBase = difficulty === 'easy' ? 48 : difficulty === 'medium' ? 64 : 82;
  const driftMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.08 : 1.16;

  return Array.from({ length: count }, (_, index) => {
    const kind = pickRandomFirewallKind();
    const { icon, label } = buildRandomFirewallVisuals(kind);
    const laneX = safeWidth * pickRandom(lanes);
    const jitter = (Math.random() - 0.5) * 32;
    const speed = speedBase + Math.random() * 36;
    const drift = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 16) * driftMultiplier;

    return {
      id: index + 1,
      kind,
      icon,
      label,
      x: Math.round(clamp(laneX + jitter, 24, safeWidth - 24)),
      y: -Math.round(60 + Math.random() * safeHeight * 0.4 + index * 28),
      speed,
      drift,
    };
  });
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function playFirewallCollisionSound(kind: 'data' | 'bad' | 'power') {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: FIREWALL_SOUND_URIS[kind] },
      { shouldPlay: true, volume: 1 }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) {
        return;
      }

      if (status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
  } catch {
    // Best-effort audio only.
  }
}
