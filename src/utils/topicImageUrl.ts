const CONVERSATION_PHOTO_IDS = [
  1062, 1074, 1084, 1012, 1015, 1025, 1027, 1031, 1043, 1055, 349, 433, 488,
  657, 669, 674, 678, 694, 736, 756, 819, 880, 903, 984, 1005, 1038, 1086, 398,
  450, 760,
];

export function getGenericTopicImageUrl(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const id = CONVERSATION_PHOTO_IDS[hash % CONVERSATION_PHOTO_IDS.length];
  return `https://picsum.photos/id/${id}/400/600?blur=5`;
}
