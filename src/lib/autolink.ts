import type { CollectionEntry } from 'astro:content';
import { escapeRegex } from '../utils/search-client';

export interface KeywordLink {
  keyword: string;
  href: string;
  title?: string;
}

type GuideEntry = CollectionEntry<'guias'>;

const BLOCKED_TAGS = new Set(['A', 'CODE', 'PRE']);

export function buildKeywordLinks(guides: GuideEntry[], excludeSlug?: string): KeywordLink[] {
  return guides
    .filter((guide) => guide.slug !== excludeSlug)
    .flatMap((guide) =>
      (guide.data.keywords || []).map((keyword) => ({
        keyword,
        href: `/guias/${guide.slug}`,
        title: guide.data.title,
      }))
    );
}

export function autolinkHtml(html: string, keywords: KeywordLink[]): string {
  if (!html || keywords.length === 0) return html;

  const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
  if (!parser) return html;

  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstElementChild;

  if (!container) return html;

  const hasBlockedAncestor = (node: Node) => {
    let current: Node | null = node;
    while (current && current !== container) {
      if (current instanceof Element && BLOCKED_TAGS.has(current.tagName)) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  };

  for (const keyword of keywords) {
    const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let replaced = false;

    while (walker.nextNode() && !replaced) {
      const textNode = walker.currentNode as Text;
      if (!textNode.data.trim() || hasBlockedAncestor(textNode)) continue;

      const regex = new RegExp(`(${escapeRegex(keyword.keyword)})`, 'i');
      const match = textNode.data.match(regex);

      if (!match) continue;

      const before = textNode.data.slice(0, match.index ?? 0);
      const after = textNode.data.slice((match.index ?? 0) + match[0].length);

      const link = doc.createElement('a');
      link.href = keyword.href;
      link.textContent = match[0];
      link.setAttribute('class', 'auto-link');
      if (keyword.title) {
        link.setAttribute('title', keyword.title);
      }

      const fragment = doc.createDocumentFragment();
      if (before) fragment.append(before);
      fragment.append(link);
      if (after) fragment.append(after);

      textNode.replaceWith(fragment);
      replaced = true;
    }
  }

  return container.innerHTML;
}
