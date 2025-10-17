import { sanitizeHtml, escapeHtml } from './sanitize';

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);

  const escapedText = escapeHtml(text);
  const escapedQuery = escapeHtml(query);
  const regex = new RegExp(`(${escapeRegex(escapedQuery)})`, 'gi');
  const highlighted = escapedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');

  return sanitizeHtml(highlighted);
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
