import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../stores/store";
import { loadElysiumItems, openInElysium, readNoteMetadata, updateNoteFrontmatter } from "../../lib/tauri";
import { getItemIcon } from "./ElysiumIcons";
import { t } from "../../lib/i18n";
import type { ElysiumItem } from "../../types";

interface Props {
  absolutePath: string;
}

/**
 * Picks the linked Elysium item ID from a note's frontmatter.
 * Notes can reference any of: goalId, taskId, projectId, eventId, appointmentId,
 * habitId, reminderId. Also accepts a generic `id` if `type` is set.
 */
function pickLinkedId(metadata: Record<string, string>): { id: string; type: string } | null {
  const candidates: [string, string][] = [
    ["goalId", "goal"],
    ["taskId", "task"],
    ["projectId", "project"],
    ["eventId", "event"],
    ["appointmentId", "appointment"],
    ["habitId", "habit"],
    ["reminderId", "reminder"],
  ];
  for (const [key, type] of candidates) {
    if (metadata[key]) return { id: metadata[key], type };
  }
  // Fall back to generic id + type
  if (metadata.id && metadata.type) return { id: metadata.id, type: metadata.type };
  return null;
}

function formatRelativeDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch {
    return iso;
  }
}

export function LinkedItemCard({ absolutePath }: Props) {
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const elysiumItems = useStore((s) => s.elysiumItems);
  const setElysiumItems = useStore((s) => s.setElysiumItems);
  const elysiumItemsLoadedAt = useStore((s) => s.elysiumItemsLoadedAt);
  const [metadata, setMetadata] = useState<Record<string, string> | null>(null);
  const [item, setItem] = useState<ElysiumItem | null>(null);

  // Fetch frontmatter metadata when path changes
  useEffect(() => {
    let cancelled = false;
    readNoteMetadata(absolutePath)
      .then((m) => { if (!cancelled) setMetadata(m); })
      .catch(() => { if (!cancelled) setMetadata({}); });
    return () => { cancelled = true; };
  }, [absolutePath]);

  // Memoize so the object identity is stable across renders
  const linked = useMemo(
    () => (metadata ? pickLinkedId(metadata) : null),
    [metadata],
  );
  const linkedId = linked?.id;
  const linkedType = linked?.type;

  // Load Elysium items if needed (cache for 60s).
  // Depend on primitive IDs, NOT the linked object, to avoid an infinite loop.
  useEffect(() => {
    if (!linkedId || !elysiumConfig.enabled || !elysiumConfig.opentimePath) return;
    const stale = Date.now() - elysiumItemsLoadedAt > 60_000;
    if (elysiumItems.length === 0 || stale) {
      loadElysiumItems(elysiumConfig.opentimePath)
        .then(setElysiumItems)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedId, elysiumConfig.enabled, elysiumConfig.opentimePath]);

  // Match the item by ID
  useEffect(() => {
    if (!linkedId) { setItem(null); return; }
    const found = elysiumItems.find((it) => it.id === linkedId);
    if (found) setItem(found);
  }, [linkedId, elysiumItems]);
  // Suppress unused warning
  void linkedType;

  if (!linked || !metadata) return null;

  // Fall back to frontmatter values if item not loaded yet
  const title = item?.title || metadata.goalTitle || metadata.title || linked.id;
  const itemType = item?.type || linked.type;
  const progress = item?.progress;
  const targetDate = item?.targetDate || item?.due || item?.start || item?.scheduledStart || item?.time;

  const handleOpen = async () => {
    try {
      await openInElysium(itemType, linked.id);
    } catch (e) {
      console.error("Failed to open in Elysium:", e);
    }
  };

  const handleUnlink = async () => {
    try {
      // Clear all link-related keys
      await updateNoteFrontmatter(absolutePath, {
        goalId: null, taskId: null, projectId: null, eventId: null,
        appointmentId: null, habitId: null, reminderId: null,
        goalTitle: null, taskTitle: null, projectTitle: null, eventTitle: null,
        appointmentTitle: null, habitTitle: null, reminderTitle: null,
      });
      setMetadata({});
      setItem(null);
    } catch (e) {
      console.error("Failed to unlink:", e);
    }
  };

  return (
    <div className="mb-3 flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-700/50 bg-neutral-800/40">
      <div className="shrink-0">{getItemIcon(itemType, item?.kind, 18)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-app font-medium truncate">{title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-app-faint capitalize">{itemType}</span>
          {targetDate && (
            <span className="text-[10px] text-app-faint">{formatRelativeDate(targetDate)}</span>
          )}
          {progress != null && (
            <span className="text-[10px] text-app-faint">{Math.round(progress * 100)}%</span>
          )}
        </div>
      </div>
      <button
        onClick={handleOpen}
        className="shrink-0 text-[10px] px-2 py-1 rounded bg-neutral-700/50 hover:bg-neutral-700 text-app-muted hover:text-app cursor-pointer transition-colors"
        title={t("openInElysium")}
      >
        {t("openInElysium")}
      </button>
      <button
        onClick={handleUnlink}
        className="shrink-0 p-1 text-app-faint hover:text-red-400 cursor-pointer transition-colors"
        title={t("unlinkFromElysium")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
