import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export interface TocItem {
  /** Heading anchor id, matching the ids rehype-slug assigns when rendering. */
  id: string;
  /** Heading text, e.g. "The seven crystal systems". */
  text: string;
  /** Heading depth (2 or 3). */
  level: number;
}

/**
 * Extract h2/h3 headings from a raw MDX source so a page can render an
 * "on this page" table of contents. Slugs are generated with the same
 * github-slugger algorithm rehype-slug uses, so anchors line up with the
 * rendered headings.
 */
export function extractHeadings(source: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  visit(tree, "heading", (node) => {
    const level = node.depth;
    if (level < 2 || level > 3) return;

    const text = toString(node).trim();
    if (!text) return;

    items.push({ id: slugger.slug(text), text, level });
  });

  return items;
}
