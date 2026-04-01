import { useState, useEffect, useRef } from "react";
import { useStore } from "../../stores/store";
import { searchNotesWithQuery } from "../../lib/tauri";
import { t } from "../../lib/i18n";
import type { SearchResult } from "../../types";

export function SearchView() {
  const vaults = useStore((s) => s.vaults);
  const setActiveVault = useStore((s) => s.setActiveVault);
  const toggleNote = useStore((s) => s.toggleNote);
  const setView = useStore((s) => s.setView);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const vaultTuples: [string, string, string][] = vaults
          .filter((v) => !v.id.startsWith("elysium-"))
          .map((v) => [v.id, v.name, v.path]);
        const res = await searchNotesWithQuery(vaultTuples, query.trim());
        setResults(res);
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, vaults]);

  const openResult = (result: SearchResult) => {
    setActiveVault(result.vaultId);
    // Small delay for vault to load, then expand the note
    setTimeout(() => {
      toggleNote(result.note.absolutePath);
    }, 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className="absolute left-3 top-1/2 -translate-y-1/2 text-app-faint">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                setView("vault-list");
              }
            }}
            placeholder={t("searchNotes")}
            className="w-full bg-black/20 border border-neutral-700 rounded-lg pl-10 pr-3 py-2
                       text-sm text-app focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {searching && (
          <p className="text-app-faint text-xs text-center py-4">{t("searching")}</p>
        )}

        {!searching && query.trim() && results.length === 0 && (
          <p className="text-app-faint text-xs text-center py-4">{t("noResults")}</p>
        )}

        {!query.trim() && (
          <p className="text-app-faint text-xs text-center py-8">
            {t("searchAcross")}
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-1">
            {results.map((result, i) => (
              <button
                key={`${result.note.absolutePath}-${i}`}
                onClick={() => openResult(result)}
                className="w-full text-left px-3 py-2 rounded-lg bg-neutral-800/70 hover:bg-neutral-800/90
                           border border-neutral-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-app truncate">{result.note.filename}</span>
                  <span className="text-[10px] text-app-faint shrink-0 ml-2">{result.vaultName}</span>
                </div>
                {result.matchedLine && (
                  <p className="text-xs text-app-muted mt-0.5 truncate">{result.matchedLine}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
