import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "../../lib/i18n";

interface Props {
  /** The element containing rendered content to search through (markdown/code/plaintext view) */
  contentRef?: React.RefObject<HTMLElement | null>;
  /** The textarea to search within (edit mode) */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
}

interface Match {
  start: number;
  end: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMatches(text: string, query: string, caseSensitive: boolean): Match[] {
  if (!query) return [];
  const flags = caseSensitive ? "g" : "gi";
  const re = new RegExp(escapeRegex(query), flags);
  const matches: Match[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length });
    if (m.index === re.lastIndex) re.lastIndex++; // avoid zero-length infinite loop
  }
  return matches;
}

/**
 * For rendered content: wrap match ranges in <mark> elements by walking text nodes.
 * Returns a cleanup function that removes the marks.
 */
function highlightInElement(
  el: HTMLElement,
  matches: Match[],
  currentIdx: number,
): () => void {
  // Remove any existing marks
  el.querySelectorAll("mark[data-sw-find]").forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  });

  if (matches.length === 0) return () => {};

  // Walk text nodes, tracking running offset, splitting and wrapping when a match falls inside
  let offset = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: { node: Text; start: number; end: number }[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const text = n as Text;
    const len = text.data.length;
    textNodes.push({ node: text, start: offset, end: offset + len });
    offset += len;
  }

  // For each match, find the text node(s) it spans and wrap
  // Process matches in reverse so splitting doesn't shift indices for later ones
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const isCurrent = i === currentIdx;
    for (let j = textNodes.length - 1; j >= 0; j--) {
      const tn = textNodes[j];
      if (m.end <= tn.start || m.start >= tn.end) continue;
      const localStart = Math.max(0, m.start - tn.start);
      const localEnd = Math.min(tn.end - tn.start, m.end - tn.start);
      const node = tn.node;
      const before = node.data.slice(0, localStart);
      const middle = node.data.slice(localStart, localEnd);
      const after = node.data.slice(localEnd);

      const mark = document.createElement("mark");
      mark.setAttribute("data-sw-find", isCurrent ? "current" : "match");
      mark.textContent = middle;
      mark.style.backgroundColor = isCurrent ? "var(--accent)" : "rgba(250, 204, 21, 0.4)";
      mark.style.color = isCurrent ? "#fff" : "inherit";
      mark.style.borderRadius = "2px";
      mark.style.padding = "0 1px";

      const parent = node.parentNode;
      if (!parent) break;
      if (after) parent.insertBefore(document.createTextNode(after), node.nextSibling);
      parent.insertBefore(mark, node.nextSibling);
      if (before) {
        node.data = before;
      } else {
        parent.removeChild(node);
      }
      break; // Only handle single-text-node matches (good enough for plain text)
    }
  }

  return () => {
    el.querySelectorAll("mark[data-sw-find]").forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  };
}

export function FindInNote({ contentRef, textareaRef, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Get text content to search through
  const text = useMemo(() => {
    if (textareaRef?.current) return textareaRef.current.value;
    if (contentRef?.current) return contentRef.current.textContent || "";
    return "";
  }, [contentRef, textareaRef]);

  const matches = useMemo(
    () => findMatches(text, query, caseSensitive),
    [text, query, caseSensitive],
  );

  // Reset index when matches change
  useEffect(() => {
    setCurrentIdx(0);
  }, [matches.length]);

  // Auto-focus the input
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Highlight in DOM whenever matches or currentIdx change
  useEffect(() => {
    // Clean up previous highlights
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = null;

    if (contentRef?.current && matches.length > 0) {
      cleanupRef.current = highlightInElement(contentRef.current, matches, currentIdx);

      // Scroll current match into view
      const currentMark = contentRef.current.querySelector('mark[data-sw-find="current"]');
      if (currentMark) {
        currentMark.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    if (textareaRef?.current && matches.length > 0) {
      const m = matches[currentIdx];
      const ta = textareaRef.current;
      ta.focus();
      ta.setSelectionRange(m.start, m.end);
      // Scroll to selection
      const lineHeight = parseInt(window.getComputedStyle(ta).lineHeight) || 20;
      const linesBeforeMatch = ta.value.slice(0, m.start).split("\n").length;
      ta.scrollTop = Math.max(0, (linesBeforeMatch - 5) * lineHeight);
    }

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [contentRef, textareaRef, matches, currentIdx]);

  const next = () => {
    if (matches.length === 0) return;
    setCurrentIdx((i) => (i + 1) % matches.length);
  };
  const prev = () => {
    if (matches.length === 0) return;
    setCurrentIdx((i) => (i - 1 + matches.length) % matches.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) prev(); else next();
    }
  };

  return (
    <div className="sticky top-0 z-20 mb-2 flex items-center gap-1.5 px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-app-faint shrink-0">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("findInNote")}
        className="flex-1 min-w-0 bg-transparent text-sm text-app focus:outline-none"
      />
      <span className="text-[10px] text-app-faint shrink-0 tabular-nums">
        {matches.length > 0 ? `${currentIdx + 1} of ${matches.length}` : query ? "0 of 0" : ""}
      </span>
      <button
        onClick={() => setCaseSensitive((c) => !c)}
        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono cursor-pointer transition-colors ${
          caseSensitive
            ? "bg-neutral-700 text-app"
            : "text-app-faint hover:text-app-muted"
        }`}
        title={t("caseSensitive")}
      >
        Aa
      </button>
      <button
        onClick={prev}
        disabled={matches.length === 0}
        className="shrink-0 p-1 text-app-faint hover:text-app cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={t("previousMatch")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button
        onClick={next}
        disabled={matches.length === 0}
        className="shrink-0 p-1 text-app-faint hover:text-app cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={t("nextMatch")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <button
        onClick={onClose}
        className="shrink-0 p-1 text-app-faint hover:text-app cursor-pointer transition-colors"
        title={t("close")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
