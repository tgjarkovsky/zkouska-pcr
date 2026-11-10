import { useMemo } from 'react';
import { marked } from 'marked';

// Obsah píšeme my (je v zašifrovaném balíku), proto stačí přímé vykreslení.
export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const html = useMemo(() => marked.parse(text, { async: false, breaks: true }) as string, [text]);
  return <div className={`md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
