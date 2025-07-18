
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function normalizeTags(tags: string[]): string[] {
  return tags.map(tag => normalizeTag(tag)).filter(tag => tag.length > 0);
}

export function areTagsEqual(tag1: string, tag2: string): boolean {
  return normalizeTag(tag1) === normalizeTag(tag2);
}

