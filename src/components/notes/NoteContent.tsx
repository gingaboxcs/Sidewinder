import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import hljs from "highlight.js";
import { saveNote } from "../../lib/tauri";
import { useStore } from "../../stores/store";
import type { EditMode } from "../../types";
import { t } from "../../lib/i18n";

interface Props {
  content: string;
  absolutePath: string;
  editMode: EditMode;
  startInEditMode?: boolean;
}

export function NoteContent({ content, absolutePath, editMode, startInEditMode }: Props) {
  switch (editMode) {
    case "code":
      return <CodeEditor content={content} absolutePath={absolutePath} startInEditMode={startInEditMode} />;
    case "plaintext":
      return <PlainTextEditor content={content} absolutePath={absolutePath} startInEditMode={startInEditMode} />;
    default:
      return <MarkdownEditor content={content} absolutePath={absolutePath} startInEditMode={startInEditMode} />;
  }
}

// ─── Shared autosave hook ─────────────────────────────────────────────────────

function useAutosave(content: string, absolutePath: string) {
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const setNoteContent = useStore((s) => s.setNoteContent);
  const latestContent = useRef(content);

  useEffect(() => {
    latestContent.current = content;
  }, [content]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const doSave = useCallback(async (text: string) => {
    if (text === latestContent.current) return;
    setSaveStatus("saving");
    try {
      await saveNote(absolutePath, text);
      setNoteContent(absolutePath, text);
      latestContent.current = text;
      setSaveStatus("saved");
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      console.error("Failed to save note:", e);
      setSaveStatus("");
    }
  }, [absolutePath, setNoteContent]);

  const scheduleSave = useCallback((text: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => doSave(text), 800);
  }, [doSave]);

  const saveNow = useCallback((text: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    doSave(text);
  }, [doSave]);

  return { saveStatus, scheduleSave, saveNow };
}

function SaveIndicator({ status }: { status: string }) {
  if (!status) return null;
  return (
    <span className="text-[10px] text-app-faint">
      {status === "saving" ? t("saving") : t("saved")}
    </span>
  );
}

// ─── Markdown Editor ──────────────────────────────────────────────────────────

function MarkdownEditor({ content, absolutePath, startInEditMode }: { content: string; absolutePath: string; startInEditMode?: boolean }) {
  const [isEditing, setIsEditing] = useState(startInEditMode || content === "");
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveStatus, scheduleSave, saveNow } = useAutosave(content, absolutePath);

  useEffect(() => {
    if (!isEditing) setEditContent(content);
  }, [content, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [isEditing, editContent]);

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2 sticky top-0 z-10 py-1" style={{ backgroundColor: "inherit" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-app-faint">{t("markdown")}</span>
            <SaveIndicator status={saveStatus} />
          </div>
          <button
            onClick={() => { saveNow(editContent); setIsEditing(false); }}
            className="text-[10px] text-app-faint hover:text-app cursor-pointer px-1.5 py-0.5"
          >{t("done")}</button>
        </div>
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => { setEditContent(e.target.value); scheduleSave(e.target.value); }}
          onKeyDown={(e) => { if (e.key === "Escape") { saveNow(editContent); setIsEditing(false); } }}
          onBlur={() => saveNow(editContent)}
          className="w-full bg-black/20 border border-neutral-700 rounded px-3 py-2
                     text-app focus:outline-none focus:border-neutral-500 resize-none text-sm leading-relaxed"
          spellCheck
        />
      </div>
    );
  }

  return (
    <div onDoubleClick={() => setIsEditing(true)} className="cursor-text group relative">
      <div className="markdown-content text-sm text-app leading-relaxed">
        <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</Markdown>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-app-faint hover:text-app cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>
    </div>
  );
}

// ─── Code Editor with syntax highlighting ─────────────────────────────────────

function highlightCode(code: string): string {
  try {
    return hljs.highlightAuto(code).value;
  } catch {
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

function CodeEditor({ content, absolutePath, startInEditMode }: { content: string; absolutePath: string; startInEditMode?: boolean }) {
  const [editContent, setEditContent] = useState(content);
  const [isEditing, setIsEditing] = useState(startInEditMode || content === "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveStatus, scheduleSave, saveNow } = useAutosave(content, absolutePath);

  useEffect(() => {
    if (!isEditing) setEditContent(content);
  }, [content, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [isEditing, editContent]);

  const highlightedView = useMemo(() => highlightCode(content), [content]);
  const highlightedEdit = useMemo(() => highlightCode(editContent), [editContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = editContent.substring(0, start) + "  " + editContent.substring(end);
      setEditContent(newVal);
      scheduleSave(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
    if (e.key === "Escape") {
      saveNow(editContent);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2 sticky top-0 z-10 py-1" style={{ backgroundColor: "inherit" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-app-faint">{t("code")}</span>
            <SaveIndicator status={saveStatus} />
          </div>
          <button
            onClick={() => { saveNow(editContent); setIsEditing(false); }}
            className="text-[10px] text-app-faint hover:text-app cursor-pointer px-1.5 py-0.5"
          >{t("done")}</button>
        </div>
        {/* Overlay approach: highlighted HTML behind, transparent textarea on top */}
        <div className="relative">
          <pre
            className="bg-black/30 border border-transparent rounded px-3 py-2 overflow-x-auto
                       font-mono text-xs leading-5 pointer-events-none whitespace-pre-wrap break-words"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: highlightedEdit + "\n" }}
          />
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => { setEditContent(e.target.value); scheduleSave(e.target.value); }}
            onKeyDown={handleKeyDown}
            onBlur={() => saveNow(editContent)}
            className="absolute inset-0 w-full h-full bg-transparent border border-neutral-700 rounded px-3 py-2
                       text-transparent caret-neutral-200 focus:outline-none focus:border-neutral-500 resize-none
                       font-mono text-xs leading-5 whitespace-pre-wrap break-words"
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div onDoubleClick={() => setIsEditing(true)} className="cursor-text group relative">
      <pre className="bg-black/20 rounded px-3 py-2 overflow-x-auto">
        <code
          className="text-xs font-mono leading-5 hljs whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: highlightedView }}
        />
      </pre>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-app-faint hover:text-app cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>
    </div>
  );
}

// ─── Plain Text WYSIWYG Editor ────────────────────────────────────────────────

function PlainTextEditor({ content, absolutePath, startInEditMode }: { content: string; absolutePath: string; startInEditMode?: boolean }) {
  const editableRef = useRef<HTMLDivElement>(null);
  const { saveStatus, scheduleSave, saveNow } = useAutosave(content, absolutePath);
  const [isEditing, setIsEditing] = useState(startInEditMode || content === "");

  // Populate contentEditable when entering edit mode or when content changes
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = content || "";
    }
  }, [content]);

  // Also populate when switching to edit mode
  const startEditing = () => {
    setIsEditing(true);
    // Need to wait for the contentEditable div to mount
    requestAnimationFrame(() => {
      if (editableRef.current) {
        editableRef.current.innerHTML = content || "";
        editableRef.current.focus();
      }
    });
  };

  const getContent = () => editableRef.current?.innerHTML || "";

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editableRef.current?.focus();
    scheduleSave(getContent());
  };

  const handleInput = () => {
    scheduleSave(getContent());
  };

  const toolbar = (
    <div className="flex items-center gap-0.5 flex-wrap">
      <ToolbarBtn onClick={() => exec("bold")} title={t("bold")}>
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("italic")} title={t("italic")}>
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("underline")} title={t("underline")}>
        <span className="underline">U</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("strikeThrough")} title={t("strikethrough")}>
        <span className="line-through">S</span>
      </ToolbarBtn>
      <div className="w-px h-4 bg-neutral-700 mx-1" />
      <ToolbarBtn onClick={() => exec("insertUnorderedList")} title={t("bulletList")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
          <circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/>
        </svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("insertOrderedList")} title={t("numberedList")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/>
          <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1</text>
          <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2</text>
          <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3</text>
        </svg>
      </ToolbarBtn>
      <div className="w-px h-4 bg-neutral-700 mx-1" />
      <ToolbarBtn onClick={() => exec("formatBlock", "h1")} title={t("heading1")}>
        <span className="text-[10px] font-bold">H1</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("formatBlock", "h2")} title={t("heading2")}>
        <span className="text-[10px] font-bold">H2</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("formatBlock", "h3")} title={t("heading3")}>
        <span className="text-[10px] font-bold">H3</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => exec("formatBlock", "p")} title={t("paragraph")}>
        <span className="text-[10px]">P</span>
      </ToolbarBtn>
      <div className="flex-1" />
      <SaveIndicator status={saveStatus} />
    </div>
  );

  if (!isEditing) {
    return (
      <div onDoubleClick={startEditing} className="cursor-text group relative">
        <div
          className="text-sm text-app leading-relaxed plaintext-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <button
          onClick={startEditing}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-app-faint hover:text-app cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 py-1 mb-2" style={{ backgroundColor: "inherit" }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-app-faint">{t("richText")}</span>
          <button
            onClick={() => { saveNow(getContent()); setIsEditing(false); }}
            className="text-[10px] text-app-faint hover:text-app cursor-pointer px-1.5 py-0.5"
          >{t("done")}</button>
        </div>
        <div className="mt-1.5 px-1 py-1 bg-neutral-800/80 rounded border border-neutral-700/50">
          {toolbar}
        </div>
      </div>
      <div
        ref={editableRef}
        contentEditable
        onInput={handleInput}
        onBlur={() => saveNow(getContent())}
        onKeyDown={(e) => { if (e.key === "Escape") { saveNow(getContent()); setIsEditing(false); } }}
        className="w-full min-h-[60px] bg-black/20 border border-neutral-700 rounded px-3 py-2
                   text-app focus:outline-none focus:border-neutral-500
                   text-sm leading-relaxed plaintext-content"
        suppressContentEditableWarning
      />
    </div>
  );
}

function ToolbarBtn({ onClick, title, children }: {
  onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded text-xs cursor-pointer transition-colors
                 text-app-muted hover:text-app hover:bg-neutral-700/50"
    >
      {children}
    </button>
  );
}
