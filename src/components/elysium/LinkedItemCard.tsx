import { useEffect, useState } from "react";
import { useStore } from "../../stores/store";
import { loadElysiumItems, openInElysium, readNoteMetadata } from "../../lib/tauri";
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

  const linked = metadata ? pickLinkedId(metadata) : null;

  // Load Elysium items if needed (cache for 60s)
  useEffect(() => {
    if (!linked || !elysiumConfig.enabled || !elysiumConfig.opentimePath) return;
    const stale = Date.now() - elysiumItemsLoadedAt > 60_000;
    if (elysiumItems.length === 0 || stale) {
      loadElysiumItems(elysiumConfig.opentimePath)
        .then(setElysiumItems)
        .catch(() => {});
    }
  }, [linked, elysiumConfig.enabled, elysiumConfig.opentimePath, elysiumItems.length, elysiumItemsLoadedAt, setElysiumItems]);

  // Match the item by ID
  useEffect(() => {
    if (!linked) { setItem(null); return; }
    const found = elysiumItems.find((it) => it.id === linked.id);
    if (found) setItem(found);
  }, [linked, elysiumItems]);

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
    </div>
  );
}
