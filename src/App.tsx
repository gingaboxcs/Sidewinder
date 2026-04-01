import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { AppShell } from "./components/layout/AppShell";
import { VaultList } from "./components/vault/VaultList";
import { NoteList } from "./components/notes/NoteList";
import { FullNoteView } from "./components/notes/FullNoteView";
import { Settings } from "./components/settings/Settings";
import { CalendarView } from "./components/elysium/CalendarView";
import { ElysiumNotesView } from "./components/elysium/ElysiumNotesView";
import { SearchView } from "./components/search/SearchView";
import { Onboarding } from "./components/onboarding/Onboarding";
import { useStore } from "./stores/store";
import { loadConfig, slideWindow, watchElysium, unwatchElysium, getElysiumUserProfile, followMonitor, quitApp } from "./lib/tauri";
import { setLanguage, detectSystemLanguage } from "./lib/i18n";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import "./styles.css";

function App() {
  const view = useStore((s) => s.view);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const windowConfig = useStore((s) => s.windowConfig);
  const closeOnBlur = windowConfig.closeOnBlur;
  const setWindowConfig = useStore((s) => s.setWindowConfig);
  const setVaults = useStore((s) => s.setVaults);
  const setVaultSortMode = useStore((s) => s.setVaultSortMode);
  const setVaultSortDescending = useStore((s) => s.setVaultSortDescending);
  const setVaultOrder = useStore((s) => s.setVaultOrder);
  const setElysiumConfig = useStore((s) => s.setElysiumConfig);
  const setLicenseConfig = useStore((s) => s.setLicenseConfig);
  const setShortcutsConfig = useStore((s) => s.setShortcutsConfig);
  const shortcutsConfig = useStore((s) => s.shortcutsConfig);
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<{ version: string; body: string } | null>(null);
  const [updateStatus, setUpdateStatus] = useState<"" | "downloading" | "installing">("");

  // Check for updates on launch
  useEffect(() => {
    if (!ready) return;
    const checkUpdate = async () => {
      try {
        const update = await check();
        if (update) {
          setUpdateAvailable({ version: update.version, body: update.body || "" });
        }
      } catch (e) {
        console.error("Update check failed:", e);
      }
    };
    // Delay a few seconds so the app finishes loading first
    const timer = setTimeout(checkUpdate, 5000);
    return () => clearTimeout(timer);
  }, [ready]);

  const handleUpdate = async () => {
    try {
      setUpdateStatus("downloading");
      const update = await check();
      if (!update) return;
      setUpdateStatus("installing");
      await update.downloadAndInstall();
      await relaunch();
    } catch (e) {
      console.error("Update failed:", e);
      setUpdateStatus("");
    }
  };

  // Load config before first render
  useEffect(() => {
    loadConfig().then((config) => {
      setVaults(config.vaults);
      setWindowConfig(config.window);
      setVaultSortMode(config.vaultSortMode || "alphabetical");
      setVaultSortDescending(config.vaultSortDescending ?? true);
      setVaultOrder(config.vaultOrder || []);
      if (config.elysium) setElysiumConfig(config.elysium);
      if (config.license) setLicenseConfig(config.license);
      if (config.shortcuts) setShortcutsConfig(config.shortcuts);
      if (!config.onboardingComplete) setShowOnboarding(true);

      // Set language — use saved language or detect from system
      const lang = config.language || detectSystemLanguage();
      setLanguage(lang);
      useStore.getState().setLanguage(lang);

      // Auto-detect Elysium subscription for licensing
      if (config.license?.status !== "paid") {
        getElysiumUserProfile().then((profile) => {
          if (profile.subscriptionStatus === "active" &&
              (profile.subscriptionTier === "basic" || profile.subscriptionTier === "pro")) {
            setLicenseConfig({ status: "elysium", licenseKey: "" });
          }
        }).catch(() => {});
      }

      setReady(true);
    }).catch((e) => {
      console.error("Failed to load config:", e);
      setReady(true);
    });
  }, [setVaults, setWindowConfig, setVaultSortMode, setVaultOrder, setElysiumConfig]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", windowConfig.accentColor);
    root.style.setProperty("--text-color", windowConfig.textColor);
    root.style.setProperty("--font-family", windowConfig.fontFamily === "System" ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" : windowConfig.fontFamily);
    root.style.setProperty("--font-size", `${windowConfig.fontSize}px`);
    root.style.setProperty("--line-height", `${windowConfig.lineHeight / 100}`);
    root.style.setProperty("--paragraph-spacing", `${windowConfig.paragraphSpacing}px`);
    root.setAttribute("data-theme", windowConfig.theme);
  }, [windowConfig]);

  // Close panel when window loses focus
  useEffect(() => {
    if (!closeOnBlur) return;

    const appWindow = getCurrentWebviewWindow();
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      const state = useStore.getState();
      if (!focused && state.isSlid && !state.blurSuppressed) {
        slideWindow(false).catch(console.error);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [closeOnBlur]);

  // Follow active monitor when in follow mode and panel is collapsed
  const monitorMode = windowConfig.monitorMode;
  const isSlid = useStore((s) => s.isSlid);
  useEffect(() => {
    if (monitorMode !== "follow" || isSlid) return;

    // Poll every 500ms to check if active monitor changed
    const interval = setInterval(() => {
      followMonitor().catch(() => {});
    }, 500);

    return () => clearInterval(interval);
  }, [monitorMode, isSlid]);

  // Watch Elysium OpenTime directory for changes
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  useEffect(() => {
    if (!elysiumConfig.enabled || !elysiumConfig.opentimePath) {
      unwatchElysium().catch(() => {});
      return;
    }

    watchElysium(elysiumConfig.opentimePath).catch(console.error);

    return () => {
      unwatchElysium().catch(() => {});
    };
  }, [elysiumConfig.enabled, elysiumConfig.opentimePath]);

  // Register global and in-app keyboard shortcuts
  useEffect(() => {
    if (!ready) return;

    const registerShortcuts = async () => {
      try {
        await unregisterAll();
      } catch { /* ignore */ }

      // Global shortcut: toggle panel (works even when app not focused)
      if (shortcutsConfig.togglePanel) {
        try {
          await register(shortcutsConfig.togglePanel, (event) => {
            if (event.state === "Pressed") {
              const state = useStore.getState();
              slideWindow(!state.isSlid).catch(console.error);
            }
          });
        } catch (e) {
          console.error("Failed to register toggle shortcut:", e);
        }
      }
    };

    registerShortcuts();

    // Parse a shortcut config string into matchable parts
    const matchesShortcut = (e: KeyboardEvent, shortcut: string): boolean => {
      if (!shortcut) return false;
      const parts = shortcut.split("+").map((p) => p.trim());
      const needsMod = parts.includes("CommandOrControl");
      const needsShift = parts.includes("Shift");
      const needsAlt = parts.includes("Alt");
      const keyPart = parts.filter((p) => !["CommandOrControl", "Shift", "Alt"].includes(p))[0];
      if (!keyPart) return false;

      const hasMod = e.metaKey || e.ctrlKey;
      if (needsMod !== hasMod) return false;
      if (needsShift !== e.shiftKey) return false;
      if (needsAlt !== e.altKey) return false;

      // Match by code (most reliable, not affected by shift/layout)
      const upperKey = keyPart.toUpperCase();
      if (upperKey.length === 1 && upperKey >= "A" && upperKey <= "Z") {
        return e.code === `Key${upperKey}`;
      }
      // Special keys
      const specialMap: Record<string, string> = {
        "BACKSPACE": "Backspace", "DELETE": "Delete", "ENTER": "Enter",
        "TAB": "Tab", "ESCAPE": "Escape", "SPACE": "Space",
        ",": ",", ".": ".", "/": "/", ";": ";", "'": "'",
        "[": "[", "]": "]", "\\": "\\", "-": "-", "=": "=",
      };
      const mapped = specialMap[upperKey] || specialMap[keyPart];
      if (mapped) return e.key === mapped || e.key === keyPart;
      return e.key === keyPart || e.key.toUpperCase() === upperKey;
    };

    // In-app keyboard shortcuts
    const sc = shortcutsConfig;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const state = useStore.getState();

      if (matchesShortcut(e, sc.togglePanel)) {
        e.preventDefault();
        slideWindow(!state.isSlid).catch(console.error);
      } else if (matchesShortcut(e, sc.newNote)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sidewinder:new-note"));
      } else if (matchesShortcut(e, sc.newFolder)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sidewinder:new-folder"));
      } else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.code === "KeyF") {
        // Cmd+F — search (hardcoded, not configurable to avoid conflicts)
        e.preventDefault();
        state.setView("search");
      } else if (matchesShortcut(e, sc.openSettings)) {
        e.preventDefault();
        state.setView("settings");
      } else if (matchesShortcut(e, sc.goBack)) {
        e.preventDefault();
        state.goBack();
      } else if (matchesShortcut(e, sc.openCalendar)) {
        e.preventDefault();
        state.setView("calendar");
      } else if (matchesShortcut(e, sc.quitApp)) {
        e.preventDefault();
        quitApp();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unregisterAll().catch(() => {});
    };
  }, [ready, shortcutsConfig]);

  if (!ready) return null;

  if (showOnboarding) {
    return (
      <AppShell>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {updateAvailable && view === "vault-list" && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg border border-neutral-700/50 bg-neutral-800/80 flex items-center justify-between gap-2">
          <p className="text-xs text-app-muted">
            v{updateAvailable.version} available
          </p>
          <button
            onClick={handleUpdate}
            disabled={updateStatus !== ""}
            style={{ backgroundColor: "var(--accent)" }}
            className="text-xs px-2.5 py-1 rounded text-white cursor-pointer disabled:opacity-50"
          >
            {updateStatus === "downloading" ? "Downloading..." : updateStatus === "installing" ? "Installing..." : "Update"}
          </button>
        </div>
      )}
      {view === "vault-list" && <VaultList />}
      {view === "note-list" && (activeVaultId?.startsWith("elysium-") ? <ElysiumNotesView /> : <NoteList />)}
      {view === "note-full" && <FullNoteView />}
      {view === "settings" && <Settings />}
      {view === "calendar" && <CalendarView />}
      {view === "search" && <SearchView />}
    </AppShell>
  );
}

export default App;
