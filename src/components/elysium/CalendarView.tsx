import { useState, useEffect, useMemo, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "../../stores/store";
import { loadElysiumItems, openInElysium } from "../../lib/tauri";
import { getItemIcon } from "./ElysiumIcons";
import type { ElysiumItem } from "../../types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const TYPE_LABELS: Record<string, string> = {
  event: "Event",
  appointment: "Appointment",
  task: "Task",
  goal: "Goal",
  habit: "Habit",
  reminder: "Reminder",
  project: "Project",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export function CalendarView() {
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const [items, setItems] = useState<ElysiumItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const now = new Date();
  const todayDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDefault);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const refreshItems = useCallback(() => {
    if (elysiumConfig.enabled && elysiumConfig.opentimePath) {
      loadElysiumItems(elysiumConfig.opentimePath)
        .then(setItems)
        .catch(console.error);
    }
  }, [elysiumConfig.enabled, elysiumConfig.opentimePath]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // Listen for file system changes to .ot files
  useEffect(() => {
    const unlisten = listen("elysium-schedule-changed", () => {
      refreshItems();
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [refreshItems]);

  const hiddenTypes = new Set(elysiumConfig.hiddenTypes || []);
  const visibleItems = useMemo(() =>
    items.filter((i) => !hiddenTypes.has(i.type)),
    [items, elysiumConfig.hiddenTypes]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(todayDefault); };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, ElysiumItem[]> = {};
    for (const item of visibleItems) {
      const dateStr = getItemDate(item);
      if (dateStr) {
        const d = dateStr.substring(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push(item);
      }
    }
    return map;
  }, [visibleItems]);

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] || []) : [];

  return (
    <div className="p-3 space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 text-app-muted hover:text-app cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-center">
          <span className="text-sm font-semibold text-app">{MONTHS[month]} {year}</span>
          <button onClick={goToday} className="ml-2 text-[10px] text-app-faint hover:text-app cursor-pointer">Today</button>
        </div>
        <button onClick={nextMonth} className="p-1 text-app-muted hover:text-app cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] text-app-faint font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px">
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasItems = !!itemsByDate[dateStr];
          const isToday = dateStr === todayDefault;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => { setSelectedDate(isSelected ? null : dateStr); setExpandedItem(null); }}
              className={`relative p-1 text-xs rounded cursor-pointer transition-colors text-center ${
                isSelected ? "text-white" : isToday ? "text-app font-bold" : "text-app-muted hover:text-app"
              } ${isSelected ? "" : "hover:bg-black/10"}`}
              style={isSelected ? { backgroundColor: "var(--accent)" } : undefined}
            >
              {day}
              {hasItems && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date items */}
      {selectedDate && (
        <div className="space-y-1.5 pt-2 border-t border-neutral-700/30">
          <h3 className="text-xs text-app-muted font-medium">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          {selectedItems.length === 0 ? (
            <p className="text-app-faint text-xs">No items</p>
          ) : (
            selectedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                expanded={expandedItem === item.id}
                onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, expanded, onToggle }: {
  item: ElysiumItem; expanded: boolean; onToggle: () => void;
}) {
  const typeLabel = TYPE_LABELS[item.type] || item.type;

  return (
    <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
      <div
        onClick={onToggle}
        className="flex items-start gap-2 px-2.5 py-2 bg-neutral-800/40 hover:bg-neutral-800/80 cursor-pointer transition-colors"
      >
        <span className="shrink-0 mt-0.5">{getItemIcon(item.type, item.kind, 16)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-app truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-app-faint">{typeLabel}</span>
            {item.start && item.end && (
              <span className="text-[10px] text-app-faint">{formatTime(item.start)} – {formatTime(item.end)}</span>
            )}
            {item.time && <span className="text-[10px] text-app-faint">{formatTime(item.time)}</span>}
            {item.status && (
              <span className="text-[10px] px-1 rounded bg-neutral-700/40 text-app-faint">
                {STATUS_LABELS[item.status] || item.status}
              </span>
            )}
            {item.allDay && <span className="text-[10px] text-app-faint">All day</span>}
            {(() => {
              const rel = getRelativeTime(item);
              return rel ? <span className="text-[10px] text-app-faint">{rel}</span> : null;
            })()}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); openInElysium(item.type, item.id); }}
            className="text-app-faint hover:text-app cursor-pointer p-0.5"
            title="Open in Elysium"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className={`text-app-faint transition-transform ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-2.5 py-2 bg-neutral-900/50 border-t border-neutral-700/30 space-y-1.5">
          {/* Location */}
          {item.location && <Detail label="Location" value={item.location} />}

          {/* Provider (appointments) */}
          {item.provider && <Detail label="Provider" value={item.provider} />}

          {/* Attendees */}
          {item.attendees.length > 0 && <Detail label="Attendees" value={item.attendees.join(", ")} />}

          {/* Timezone */}
          {item.timezone && <Detail label="Timezone" value={item.timezone} />}

          {/* Due date */}
          {item.due && <Detail label="Due" value={formatDate(item.due)} />}

          {/* Target date */}
          {item.targetDate && <Detail label="Target Date" value={formatDate(item.targetDate)} />}

          {/* Scheduled start */}
          {item.scheduledStart && <Detail label="Scheduled Start" value={formatDateTime(item.scheduledStart)} />}

          {/* Progress */}
          {item.progress != null && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-app-faint w-16 shrink-0">Progress</span>
              <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(item.progress * 100)}%`, backgroundColor: "var(--accent)" }} />
              </div>
              <span className="text-[10px] text-app-faint">{Math.round(item.progress * 100)}%</span>
            </div>
          )}

          {/* Priority */}
          {item.priority != null && <Detail label="Priority" value={String(item.priority)} />}

          {/* Estimate / Actual time */}
          {item.estimateMinutes != null && <Detail label="Estimate" value={`${item.estimateMinutes} min`} />}
          {item.actualMinutes != null && <Detail label="Actual" value={`${item.actualMinutes} min`} />}

          {/* Recurrence */}
          {item.recurrence && <Detail label="Recurrence" value={item.recurrence} />}
          {item.repeat && <Detail label="Repeat" value={item.repeat} />}

          {/* Habit pattern */}
          {item.pattern && (
            <Detail label="Pattern" value={[
              item.pattern.freq,
              item.pattern.daysOfWeek.length > 0 ? item.pattern.daysOfWeek.join(", ") : null,
            ].filter(Boolean).join(" — ") || "Custom"} />
          )}

          {/* Habit window */}
          {item.window && (item.window.startTime || item.window.endTime) && (
            <Detail label="Window" value={`${item.window.startTime || "?"} – ${item.window.endTime || "?"}`} />
          )}

          {/* Habit streak */}
          {item.streak && (
            <Detail label="Streak" value={`${item.streak.current ?? 0} current, ${item.streak.longest ?? 0} longest`} />
          )}

          {/* Children (projects) */}
          {item.children.length > 0 && (
            <Detail label="Children" value={`${item.children.length} item(s)`} />
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-app-faint w-16 shrink-0 mt-0.5">Tags</span>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-app-faint">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {item.links.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-app-faint w-16 shrink-0 mt-0.5">Links</span>
              <div className="space-y-0.5">
                {item.links.map((link, i) => (
                  <p key={i} className="text-[10px] text-app-faint truncate">
                    {link.kind === "url" ? (
                      <a href={link.value} className="underline" style={{ color: "var(--accent)" }}>{link.value}</a>
                    ) : (
                      <span>{link.kind}: {link.value}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Description (first line only from the notes field) */}
          {item.notes && (
            <Detail label="Description" value={item.notes.split("\n")[0]} />
          )}

        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-app-faint w-16 shrink-0">{label}</span>
      <span className="text-[10px] text-app">{value}</span>
    </div>
  );
}

function getItemDate(item: ElysiumItem): string | undefined {
  return item.start || item.time || item.due || item.scheduledStart || item.targetDate;
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); }
  catch { return iso; }
}

function formatDate(d: string): string {
  try { return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

function formatDateTime(iso: string): string {
  try { return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  catch { return iso; }
}

function getRelativeTime(item: ElysiumItem): string | null {
  const startStr = item.start || item.time || item.scheduledStart;
  if (!startStr) return null;

  try {
    const start = new Date(startStr);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();

    if (isNaN(diffMs)) return null;

    const absDiff = Math.abs(diffMs);
    const mins = Math.floor(absDiff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (diffMs > 0) {
      // Future
      if (mins < 1) return "Starts now";
      if (mins < 60) return `Starts in ${mins}m`;
      if (hours < 24) return `Starts in ${hours}h ${mins % 60}m`;
      return `Starts in ${days}d`;
    } else {
      // Past — check if currently happening (has end time)
      if (item.end) {
        const end = new Date(item.end);
        if (now < end) {
          const remainMs = end.getTime() - now.getTime();
          const remainMins = Math.floor(remainMs / 60000);
          if (remainMins < 60) return `Happening now \u00b7 ${remainMins}m left`;
          return `Happening now \u00b7 ${Math.floor(remainMins / 60)}h left`;
        }
      }
      if (mins < 60) return `Started ${mins}m ago`;
      if (hours < 24) return `Started ${hours}h ago`;
      return `Started ${days}d ago`;
    }
  } catch {
    return null;
  }
}
