export const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export function extractUrls(text?: string | null): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
}

export function truncateText(text: string, maxLength: number = 60): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
