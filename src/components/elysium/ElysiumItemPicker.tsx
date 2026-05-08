import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../stores/store";
import { loadElysiumItems, updateNoteFrontmatter } from "../../lib/tauri";
import { getItemIcon } from "./ElysiumIcons";
import { t } from "../../lib/i18n";
import type { ElysiumItem } from "../../types";

interface Props {
  notePath: string;
  onClose: () => void;
  onLinked?: () => void;
}

const TYPE_TO_ID_KEY: Record<string, string> = {
  goal: "goalId",
  task: "taskId",
  project: "projectId",
  event: "eventId",
  appointment: "appointmentId",
  habit: "habitId",
  reminder: "reminderId",
};

const TYPE_TO_TITLE_KEY: Record<string, string> = {
  goal: "goalTitle",
  task: "taskTitle",
  project: "projectTitle",
  event: "eventTitle",
  appointment: "appointmentTitle",
  habit: "habitTitle",
  reminder: "reminderTitle",
};

const ALL_LINK_KEYS = Object.values(TYPE_TO_ID_KEY).concat(Object.values(TYPE_TO_TITLE_KEY));

export function ElysiumItemPicker({ notePath, onClose, onLinked }: Props) {
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const elysiumItems = useStore((s) => s.elysiumItems);
  const setElysiumItems = useStore((s) => s.setElysiumItems);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");

  // Refresh items when picker opens
  useEffect(() => {
    if (!elysiumConfig.opentimePath) return;
    loadElysiumItems(elysiumConfig.opentimePath)
      .then(setElysiumItems)
      .catch((e) => setError(String(e)));
  }, [elysiumConfig.opentimePath, setElysiumItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return elysiumItems
      .filter((it) => filterType === "all" || it.type === filterType)
      .filter((it) => !q || it.title.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [elysiumItems, search, filterType]);

  const handleLink = async (item: ElysiumItem) => {
    const idKey = TYPE_TO_ID_KEY[item.type] || `${item.type}Id`;
    const titleKey = TYPE_TO_TITLE_KEY[item.type] || `${item.type}Title`;
    setLinking(true);
    try {
      // First remove any existing link keys, then set the new ones
      const updates: Record<string, string | null> = {};
      for (const key of ALL_LINK_KEYS) updates[key] = null;
      updates[idKey] = item.id;
      updates[titleKey] = item.title;
      await updateNoteFrontmatter(notePath, updates);
      onLinked?.();
      onClose();
    } catch (e: any) {
      setError(String(e?.message || e));
      setLinking(false);
    }
  };

  const types = [
    { id: "all", label: "All" },
    { id: "goal", label: t("goal") },
    { id: "task", label: t("task") },
    { id: "project", label: t("project") },
    { id: "event", label: t("event") },
    { id: "appointment", label: t("appointment") },
    { id: "habit", label: t("habit") },
    { id: "reminder", label: t("reminder") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[90%] max-w-md max-h-[80vh] bg-neutral-900 border border-neutral-700 rounded-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-neutral-700/50">
          <h2 className="text-base font-semibold text-app">{t("linkToElysium")}</h2>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchItems")}
            className="w-full mt-2 bg-black/30 border border-neutral-700 rounded px-2.5 py-1.5
                       text-sm text-app focus:outline-none focus:border-neutral-500"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {types.map((tp) => (
              <button
                key={tp.id}
                onClick={() => setFilterType(tp.id)}
                style={filterType === tp.id ? { backgroundColor: "var(--accent)" } : undefined}
                className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  filterType === tp.id ? "text-white" : "bg-neutral-800 text-app-muted hover:bg-neutral-700"
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {error && <p className="text-xs text-red-400 px-2 py-1">{error}</p>}
          {filtered.length === 0 ? (
            <p className="text-sm text-app-faint text-center py-8">{t("noResults")}</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLink(item)}
                disabled={linking}
                className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50"
              >
                <div className="shrink-0">{getItemIcon(item.type, item.kind, 16)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-app truncate">{item.title}</p>
                  <p className="text-[10px] text-app-faint capitalize">{item.type}</p>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-3 border-t border-neutral-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded bg-neutral-700 text-app-muted hover:bg-neutral-600 hover:text-app cursor-pointer transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
