/**
 * Topic Icon Mapper for Vocabulary Coach (Mobile)
 * Maps Lucide/database icon slugs to vibrant, native Unicode emojis.
 * If already an emoji, returns it directly.
 */

export const TOPIC_ICON_MAP: Record<string, string> = {
  // Education & Work
  'graduation-cap': '🎓',
  briefcase: '💼',
  laptop: '💻',
  award: '🏆',
  scale: '⚖️',
  'user-check': '🤝',
  'message-square': '💬',

  // Everyday & Personal
  calendar: '⏰',
  utensils: '🍽️',
  'shopping-bag': '🛍️',
  plane: '✈️',
  gamepad: '🎮',
  home: '🏡',
  shirt: '👕',
  users: '👨‍👩‍👧',
  'cloud-sun': '⛅',
  coffee: '☕',

  // Society
  heart: '❤️',
  'map-pin': '📍',
  sparkles: '🎭',
  newspaper: '📰',
  music: '🎨',
  shield: '🛡️',
  zap: '⚡',
  train: '🚆',
  'tree-pine': '🌲',

  // Modern World
  smartphone: '📱',
  cpu: '🤖',
  'share-2': '📲',
  'credit-card': '💳',
  globe: '🌐',
  lock: '🔒',
  'battery-charging': '🔋',
  bot: '🦾',

  // Environment
  thermometer: '🌍',
  sun: '☀️',
  feather: '🐾',
  'trash-2': '♻️',
  wind: '💨',
  'alert-triangle': '🌋',

  // Health & Lifestyle
  activity: '🏃',
  apple: '🥗',
  moon: '🌙',
  'plus-circle': '🏥',
  'eye-off': '🧘',

  // Development & Global Issues
  building: '🏙️',
  compass: '🏛️',
  anchor: '🚢',
  'trending-up': '📈',
};

/**
 * Returns a clean emoji for a given topic icon slug or emoji.
 */
export function getTopicIcon(icon?: string | null): string {
  if (!icon) return '💬';
  const trimmed = icon.trim();
  return TOPIC_ICON_MAP[trimmed] || trimmed || '💬';
}
