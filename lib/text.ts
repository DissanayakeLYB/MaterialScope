import { toString } from "mdast-util-to-string";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Strip an MDX source down to plain prose (headings, paragraphs, table cells,
 * callout bodies, and code are all included; JSX components contribute their
 * text children). Whitespace is collapsed to single spaces. Used for search
 * indexing and for generating human-readable descriptions/excerpts.
 */
export function mdxToPlainText(source: string): string {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  return toString(tree).replace(/\s+/g, " ").trim();
}

/**
 * A short, sentence-broken excerpt of an MDX source. Falls back to a hard cut
 * if there's no word boundary near the limit.
 */
export function excerpt(source: string, maxLength = 160): string {
  const text = mdxToPlainText(source);
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return `${cut.slice(0, end).trim()}…`;
}
