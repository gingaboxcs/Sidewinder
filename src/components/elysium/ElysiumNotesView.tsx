import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "../../stores/store";
import { loadElysiumNotes, createElysiumNote, getElysiumUserProfile } from "../../lib/tauri";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { ElysiumNote, ElysiumUserProfile } from "../../types";

export function ElysiumNotesView() {
  const activeVaultId = useStore((s) => s.activeVaultId);
  const vaults = useStore((s) => s.vaults);
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const [notes, setNotes] = useState<ElysiumNote[]>([]);
  const [userProfile, setUserProfile] = useState<ElysiumUserProfile | null>(null);

  const vault = vaults.find((v) => v.id === activeVaultId);
  const isElysiumVault = activeVaultId?.startsWith("elysium-");
  const goalName = vault?.name || "";

  const loadNotes = () => {
    if (!isElysiumVault || !elysiumConfig.opentimePath || !goalName) return;
    loadElysiumNotes(elysiumConfig.opentimePath, goalName)
      .then(setNotes)
      .catch(console.error);
  };

  useEffect(() => {
    loadNotes();
    getElysiumUserProfile().then(setUserProfile).catch(() => {});
    const unlisten = listen("elysium-notes-changed", loadNotes);
    return () => { unlisten.then((fn) => fn()); };
  }, [isElysiumVault, elysiumConfig.opentimePath, goalName]);

  if (!isElysiumVault) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {notes.length === 0 ? (
          <p className="text-app-faint text-sm text-center py-8">No notes yet</p>
        ) : (
          notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))
        )}
      </div>
      <ComposeBar
        goalName={goalName}
        opentimePath={elysiumConfig.opentimePath}
        userProfile={userProfile}
        onSent={loadNotes}
      />
    </div>
  );
}

function ComposeBar({ goalName, opentimePath, userProfile, onSent }: {
  goalName: string; opentimePath: string; userProfile: ElysiumUserProfile | null; onSent: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { elysiumConfig } = useStore.getState();
      const authorName = elysiumConfig.authorNameOverride || userProfile?.displayName || "Sidewinder User";
      const authorEmail = elysiumConfig.authorEmailOverride || userProfile?.email || "";
      await createElysiumNote(
        opentimePath,
        goalName,
        text.trim(),
        authorName,
        authorEmail,
      );
      setText("");
      onSent();
    } catch (e) {
      console.error("Failed to create note:", e);
    } finally {
      setSending(false);
    }
  };

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const displayName = (() => {
    const { elysiumConfig } = useStore.getState();
    return elysiumConfig.authorNameOverride || userProfile?.displayName || "";
  })();
  const avatarUrl = userProfile?.profilePictureUrl || "";
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  return (
    <div className="shrink-0 p-3 border-t border-neutral-700/30">
      <div className="flex gap-2 items-end">
        {/* User avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0 mb-0.5" />
        ) : displayName ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mb-0.5"
               style={{ backgroundColor: avatarColor }}>
            {initials}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a note..."
          rows={1}
          className="flex-1 bg-black/20 border border-neutral-700 rounded-lg px-3 py-2
                     text-sm text-app focus:outline-none focus:border-neutral-500 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={text.trim() && !sending ? { backgroundColor: "var(--accent)" } : undefined}
          className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            text.trim() && !sending
              ? "text-white"
              : "bg-neutral-800 text-app-faint cursor-not-allowed"
          }`}
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
      <p className="text-[10px] text-app-faint mt-1">Enter to send, Shift+Enter for new line</p>
    </div>
  );
}

function NoteCard({ note }: { note: ElysiumNote }) {
  const initials = getInitials(note.author);
  const avatarColor = getAvatarColor(note.author || note.authorEmail);

  return (
    <div className="flex gap-3">
      {note.authorProfilePicture ? (
        <img
          src={note.authorProfilePicture}
          alt={note.author}
          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
          title={note.authorEmail || note.author}
          onError={(e) => {
            const el = e.currentTarget;
            const parent = el.parentElement!;
            const fallback = document.createElement("div");
            fallback.className = "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5";
            fallback.style.backgroundColor = avatarColor;
            fallback.textContent = initials;
            parent.replaceChild(fallback, el);
          }}
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5"
          style={{ backgroundColor: avatarColor }}
          title={note.authorEmail || note.author}
        >
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-app">
            {note.author || note.authorEmail || "Unknown"}
          </span>
          <span className="text-[10px] text-app-faint">
            {formatDate(note.createdAt)}
          </span>
        </div>
        <div className="markdown-content text-sm text-app leading-relaxed">
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{note.content}</Markdown>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 45%)`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return d.toLocaleDateString(undefined, { weekday: "long" });
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}
