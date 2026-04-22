import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import { useStore } from "../../stores/store";
import { loadConfig, saveConfig, repositionWindow } from "../../lib/tauri";
import type { Edge, Alignment, EditMode, InsertPosition, WindowConfig, LicenseConfig, ShortcutsConfig } from "../../types";
import { useLicense } from "../../hooks/useLicense";
import { supportedLanguages, setLanguage, getLanguage, t } from "../../lib/i18n";

type SettingsTab = "general" | "appearance" | "creation" | "integration" | "shortcuts" | "account" | "about";

export function Settings() {
  const windowConfig = useStore((s) => s.windowConfig);
  const setWindowConfig = useStore((s) => s.setWindowConfig);
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const setElysiumConfig = useStore((s) => s.setElysiumConfig);
  const licenseConfig = useStore((s) => s.licenseConfig);
  const setLicenseConfig = useStore((s) => s.setLicenseConfig);
  const shortcutsConfig = useStore((s) => s.shortcutsConfig);
  const setShortcutsConfig = useStore((s) => s.setShortcutsConfig);
  const setSlid = useStore((s) => s.setSlid);

  const [localConfig, setLocalConfig] = useState<WindowConfig>(windowConfig);
  const [localElysium, setLocalElysium] = useState(elysiumConfig);
  const [localLicense, setLocalLicense] = useState(licenseConfig);
  const [localShortcuts, setLocalShortcuts] = useState(shortcutsConfig);
  const [localLanguage, setLocalLanguage] = useState(getLanguage());
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = await loadConfig();
      config.window = localConfig;
      config.elysium = localElysium;
      config.license = localLicense;
      config.shortcuts = localShortcuts;
      config.language = localLanguage;
      await saveConfig(config);
      setLanguage(localLanguage);
      useStore.getState().setLanguage(localLanguage);
      setWindowConfig(localConfig);
      setElysiumConfig(localElysium);
      setLicenseConfig(localLicense);
      setShortcutsConfig(localShortcuts);
      setSlid(false);
      await repositionWindow();
    } catch (e) {
      console.error("Failed to save settings:", e);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(windowConfig)
    || JSON.stringify(localElysium) !== JSON.stringify(elysiumConfig)
    || JSON.stringify(localLicense) !== JSON.stringify(licenseConfig)
    || JSON.stringify(localShortcuts) !== JSON.stringify(shortcutsConfig)
    || localLanguage !== getLanguage();

  // Subscribe to language changes for re-render
  useStore((s) => s.language);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "general", label: t("general") },
    { id: "appearance", label: t("appearance") },
    { id: "creation", label: t("creation") },
    { id: "integration", label: t("integration") },
    { id: "shortcuts", label: t("shortcuts") },
    { id: "account", label: t("account") },
    { id: "about", label: t("about") },
  ];

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-neutral-700/50 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? { backgroundColor: "var(--accent)" } : undefined}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "text-white"
                : "text-app-muted hover:text-app hover:bg-black/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {activeTab === "general" && (
          <GeneralTab localConfig={localConfig} setLocalConfig={setLocalConfig}
                      localLanguage={localLanguage} setLocalLanguage={setLocalLanguage} />
        )}
        {activeTab === "appearance" && (
          <AppearanceTab localConfig={localConfig} setLocalConfig={setLocalConfig} />
        )}
        {activeTab === "creation" && (
          <CreationTab localConfig={localConfig} setLocalConfig={setLocalConfig} />
        )}
        {activeTab === "integration" && (
          <IntegrationTab localElysium={localElysium} setLocalElysium={setLocalElysium} />
        )}
        {activeTab === "shortcuts" && (
          <ShortcutsTab localShortcuts={localShortcuts} setLocalShortcuts={setLocalShortcuts} />
        )}
        {activeTab === "account" && (
          <AccountTab localLicense={localLicense} setLocalLicense={setLocalLicense} />
        )}
        {activeTab === "about" && (
          <AboutTab />
        )}
      </div>

      {/* Save button — always visible */}
      <div className="pt-4 mt-auto">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={hasChanges && !saving ? { backgroundColor: "var(--accent)" } : undefined}
          className={`w-full py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
            hasChanges && !saving
              ? "text-white"
              : "bg-neutral-800 text-app-faint cursor-not-allowed"
          }`}
        >
          {saving ? t("applying") : t("applyChanges")}
        </button>
        {hasChanges && (
          <p className="text-[10px] text-amber-400/70 text-center mt-2">
            {t("panelWillCollapse")}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ localConfig, setLocalConfig, localLanguage, setLocalLanguage }: {
  localConfig: WindowConfig;
  setLocalConfig: (c: WindowConfig) => void;
  localLanguage: string;
  setLocalLanguage: (l: string) => void;
}) {
  const isHorizontalEdge = localConfig.edge === "top" || localConfig.edge === "bottom";

  const alignmentLabels: Record<Alignment, string> = isHorizontalEdge
    ? { start: t("left"), center: t("center"), end: t("right") }
    : { start: t("top"), center: t("center"), end: t("bottom") };

  const thicknessLabel = isHorizontalEdge ? t("handleHeight") : t("handleWidth");
  const lengthLabel = isHorizontalEdge ? t("handleWidth") : t("handleHeight");

  return (
    <>
      {/* Language */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("language")}</label>
        <select
          value={localLanguage}
          onChange={(e) => {
            setLocalLanguage(e.target.value);
            setLanguage(e.target.value);
            useStore.getState().setLanguage(e.target.value);
          }}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                     text-sm text-app focus:outline-none focus:border-neutral-500"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {/* Edge Position */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("screenEdge")}</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["left", "top", "right", "bottom"] as Edge[]).map((edge) => (
            <button
              key={edge}
              onClick={() => setLocalConfig({ ...localConfig, edge })}
              style={localConfig.edge === edge ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.edge === edge
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {edge.charAt(0).toUpperCase() + edge.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {isHorizontalEdge ? t("alignAlongHorizontal") : t("alignAlongVertical")}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(["start", "center", "end"] as Alignment[]).map((align) => (
            <button
              key={align}
              onClick={() => setLocalConfig({ ...localConfig, alignment: align })}
              style={localConfig.alignment === align ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.alignment === align
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {alignmentLabels[align]}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <PositionPreview config={localConfig} />

      {/* Handle Thickness */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {thicknessLabel}: {localConfig.handleThickness}px
        </label>
        <input type="range" min={10} max={80} value={localConfig.handleThickness}
          onChange={(e) => setLocalConfig({ ...localConfig, handleThickness: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>10px</span><span>80px</span>
        </div>
      </div>

      {/* Handle Length */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {lengthLabel}: {localConfig.handleLength}px
        </label>
        <input type="range" min={10} max={400} value={localConfig.handleLength}
          onChange={(e) => setLocalConfig({ ...localConfig, handleLength: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>10px</span><span>400px</span>
        </div>
      </div>

      {/* Panel Width */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("panelWidth")}: {localConfig.panelWidthPct}%
        </label>
        <input type="range" min={10} max={100} value={localConfig.panelWidthPct}
          onChange={(e) => setLocalConfig({ ...localConfig, panelWidthPct: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>10%</span><span>100%</span>
        </div>
      </div>

      {/* Panel Height */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("panelHeight")}: {localConfig.panelHeightPct}%
        </label>
        <input type="range" min={10} max={100} value={localConfig.panelHeightPct}
          onChange={(e) => setLocalConfig({ ...localConfig, panelHeightPct: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>10%</span><span>100%</span>
        </div>
      </div>

      {/* Animation Speed */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("animationSpeed")}: {localConfig.animationDuration}ms
        </label>
        <input type="range" min={0} max={800} step={10} value={localConfig.animationDuration}
          onChange={(e) => setLocalConfig({ ...localConfig, animationDuration: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>{t("instant")}</span><span>800ms</span>
        </div>
      </div>

      {/* Animation Delay */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("animationDelay")}: {localConfig.animationDelay}ms
        </label>
        <input type="range" min={0} max={500} step={10} value={localConfig.animationDelay}
          onChange={(e) => setLocalConfig({ ...localConfig, animationDelay: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>{t("none")}</span><span>500ms</span>
        </div>
      </div>

      {/* Behavior */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setLocalConfig({ ...localConfig, closeOnBlur: !localConfig.closeOnBlur })}
            style={localConfig.closeOnBlur ? { backgroundColor: "var(--accent)" } : undefined}
            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
              localConfig.closeOnBlur ? "" : "bg-neutral-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                localConfig.closeOnBlur ? "translate-x-4" : ""
              }`}
            />
          </button>
          <span className="text-sm text-app-muted">{t("closeOnBlur")}</span>
        </label>
      </div>

      {/* Launch at login */}
      <LaunchAtLoginToggle />

      {/* Monitor behavior */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("multiMonitor")}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { id: "primary" as const, label: t("stayOnOne") },
            { id: "follow" as const, label: t("followActive") },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setLocalConfig({ ...localConfig, monitorMode: id })}
              style={localConfig.monitorMode === id ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.monitorMode === id
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function LaunchAtLoginToggle() {
  const [autostart, setAutostart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isEnabled().then((enabled) => {
      setAutostart(enabled);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = async () => {
    try {
      if (autostart) {
        await disable();
        setAutostart(false);
      } else {
        await enable();
        setAutostart(true);
      }
    } catch (e) {
      console.error("Failed to toggle autostart:", e);
    }
  };

  if (loading) return null;

  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer">
        <button
          type="button"
          onClick={toggle}
          style={autostart ? { backgroundColor: "var(--accent)" } : undefined}
          className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
            autostart ? "" : "bg-neutral-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              autostart ? "translate-x-4" : ""
            }`}
          />
        </button>
        <span className="text-sm text-app-muted">{t("launchAtLogin")}</span>
      </label>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

const fontOptions = [
  "System",
  "Inter",
  "Helvetica Neue",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Menlo",
  "Monaco",
  "Fira Code",
  "JetBrains Mono",
];

function AppearanceTab({ localConfig, setLocalConfig }: {
  localConfig: WindowConfig;
  setLocalConfig: (c: WindowConfig) => void;
}) {
  const { isPro } = useLicense();

  // Free users get theme toggle and that's it
  return (
    <>
      {/* Theme — available to all */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("theme")}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["dark", "light"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => setLocalConfig({
                ...localConfig,
                theme,
                textColor: theme === "light" ? "#232323" : "#ebebeb",
                panelColor: theme === "light" ? "#ebebeb" : "#232323",
              })}
              style={localConfig.theme === theme ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.theme === theme
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {theme === "dark" ? t("dark") : t("light")}
            </button>
          ))}
        </div>
      </div>

      {/* Vibrancy — available to all */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-app">{t("frostedGlass")}</span>
          <p className="text-[10px] text-app-faint mt-0.5">{t("frostedGlassDesc")}</p>
        </div>
        <button
          onClick={() => setLocalConfig({ ...localConfig, vibrancy: !localConfig.vibrancy })}
          className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
            localConfig.vibrancy ? "" : "bg-neutral-700"
          }`}
          style={localConfig.vibrancy ? { backgroundColor: "var(--accent)" } : undefined}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
            localConfig.vibrancy ? "left-[18px]" : "left-[3px]"
          }`} />
        </button>
      </div>

      {!isPro && (
        <div className="p-3 rounded-lg border border-amber-400/20 bg-amber-400/5">
          <p className="text-xs text-app-muted">
            {t("proColorsDesc")}
          </p>
        </div>
      )}

      <div className={`space-y-5 ${!isPro ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorPicker label={t("handleColor")} value={localConfig.handleColor}
          onChange={(v) => setLocalConfig({ ...localConfig, handleColor: v })} />
        <ColorPicker label={t("panelColorLabel")} value={localConfig.panelColor}
          onChange={(v) => setLocalConfig({ ...localConfig, panelColor: v })} />
        <ColorPicker label={t("accentColor")} value={localConfig.accentColor}
          onChange={(v) => setLocalConfig({ ...localConfig, accentColor: v })} />
        <ColorPicker label={t("textColor")} value={localConfig.textColor}
          onChange={(v) => setLocalConfig({ ...localConfig, textColor: v })} />
      </div>
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("fontFamily")}</label>
        <select
          value={localConfig.fontFamily}
          onChange={(e) => setLocalConfig({ ...localConfig, fontFamily: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                     text-sm text-app focus:outline-none focus:border-neutral-500"
        >
          {fontOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("fontSize")}: {localConfig.fontSize}px
        </label>
        <input type="range" min={10} max={24} value={localConfig.fontSize}
          onChange={(e) => setLocalConfig({ ...localConfig, fontSize: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>10px</span><span>24px</span>
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("lineHeight")}: {(localConfig.lineHeight / 100).toFixed(1)}
        </label>
        <input type="range" min={100} max={250} step={10} value={localConfig.lineHeight}
          onChange={(e) => setLocalConfig({ ...localConfig, lineHeight: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>1.0</span><span>2.5</span>
        </div>
      </div>

      {/* Paragraph Spacing */}
      <div>
        <label className="text-xs text-app-muted block mb-2">
          {t("paragraphSpacing")}: {localConfig.paragraphSpacing}px
        </label>
        <input type="range" min={0} max={32} value={localConfig.paragraphSpacing}
          onChange={(e) => setLocalConfig({ ...localConfig, paragraphSpacing: parseInt(e.target.value) })}
          className="w-full" />
        <div className="flex justify-between text-[10px] text-app-faint mt-0.5">
          <span>0px</span><span>32px</span>
        </div>
      </div>
      </div>

    </>
  );
}

// ─── Creation Tab ─────────────────────────────────────────────────────────────

function CreationTab({ localConfig, setLocalConfig }: {
  localConfig: WindowConfig;
  setLocalConfig: (c: WindowConfig) => void;
}) {
  return (
    <>
      {/* Default Edit Mode */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("defaultFormatting")}</label>
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { id: "markdown" as EditMode, label: t("markdown") },
            { id: "code" as EditMode, label: t("code") },
            { id: "plaintext" as EditMode, label: t("plainText") },
            { id: "copy" as EditMode, label: t("copyNote") },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setLocalConfig({ ...localConfig, defaultEditMode: id })}
              style={localConfig.defaultEditMode === id ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.defaultEditMode === id
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Default New Note Position */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("newNotePosition")}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { id: "top" as InsertPosition, label: t("top") },
            { id: "bottom" as InsertPosition, label: t("bottom") },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setLocalConfig({ ...localConfig, defaultNotePosition: id })}
              style={localConfig.defaultNotePosition === id ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.defaultNotePosition === id
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Default New Vault Position */}
      <div>
        <label className="text-xs text-app-muted block mb-2">{t("newVaultPosition")}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { id: "top" as InsertPosition, label: t("top") },
            { id: "bottom" as InsertPosition, label: t("bottom") },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setLocalConfig({ ...localConfig, defaultVaultPosition: id })}
              style={localConfig.defaultVaultPosition === id ? { backgroundColor: "var(--accent)" } : undefined}
              className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                localConfig.defaultVaultPosition === id
                  ? "text-white"
                  : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Integration Tab ──────────────────────────────────────────────────────────

import type { ElysiumConfig } from "../../types";
import { getItemIcon } from "../elysium/ElysiumIcons";

function IntegrationTab({ localElysium, setLocalElysium }: {
  localElysium: ElysiumConfig;
  setLocalElysium: (c: ElysiumConfig) => void;
}) {
  const { isPro } = useLicense();

  if (!isPro) {
    return (
      <div className="p-4 rounded-lg border border-amber-400/20 bg-amber-400/5">
        <p className="text-sm text-app font-medium mb-1">{t("elysiumIntegration")}</p>
        <p className="text-xs text-app-muted mb-3">
          Connect Sidewinder to your Elysium account for calendar view, schedule notes, and more. Available with Sidewinder Pro ($4.99) or an active Elysium subscription.
        </p>
      </div>
    );
  }

  const handlePickFolder = async () => {
    useStore.getState().setBlurSuppressed(true);
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected) {
        setLocalElysium({ ...localElysium, opentimePath: selected as string });
      }
    } catch (e) {
      console.error("Failed to pick folder:", e);
    } finally {
      useStore.getState().setBlurSuppressed(false);
    }
  };

  return (
    <>
      <div>
        <h3 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">{t("elysiumOpenTime")}</h3>

        {/* Enable toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setLocalElysium({ ...localElysium, enabled: !localElysium.enabled })}
              style={localElysium.enabled ? { backgroundColor: "var(--accent)" } : undefined}
              className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                localElysium.enabled ? "" : "bg-neutral-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  localElysium.enabled ? "translate-x-4" : ""
                }`}
              />
            </button>
            <span className="text-sm text-app-muted">{t("elysiumIntegration")}</span>
          </label>
        </div>

        {localElysium.enabled && (
          <div className="space-y-4">
            {/* OpenTime folder path */}
            <div>
              <label className="text-xs text-app-muted block mb-2">{t("openTimeFolder")}</label>
              <div className="flex gap-2">
                <input
                  value={localElysium.opentimePath}
                  onChange={(e) => setLocalElysium({ ...localElysium, opentimePath: e.target.value })}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                             text-sm text-app focus:outline-none focus:border-neutral-500"
                  placeholder="/path/to/Elysium"
                />
                <button
                  onClick={handlePickFolder}
                  className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm
                             text-app-muted transition-colors cursor-pointer"
                >
                  Browse
                </button>
              </div>
              <p className="text-[10px] text-app-faint mt-1">
                Select the folder containing your .ot schedule files
              </p>
            </div>

            {/* Author identity */}
            <div>
              <label className="text-xs text-app-muted block mb-2">{t("yourName")}</label>
              <input
                value={localElysium.authorNameOverride}
                onChange={(e) => setLocalElysium({ ...localElysium, authorNameOverride: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app focus:outline-none focus:border-neutral-500"
                placeholder={t("autoDetect")}
              />
              <p className="text-[10px] text-app-faint mt-1">
                Name shown on notes you create. Leave empty to use your Elysium profile name.
              </p>
            </div>

            <div>
              <label className="text-xs text-app-muted block mb-2">{t("yourEmail")}</label>
              <input
                value={localElysium.authorEmailOverride}
                onChange={(e) => setLocalElysium({ ...localElysium, authorEmailOverride: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app focus:outline-none focus:border-neutral-500"
                placeholder={t("autoDetect")}
              />
            </div>

            {/* Auto-import notes */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setLocalElysium({ ...localElysium, autoImportNotes: !localElysium.autoImportNotes })}
                  style={localElysium.autoImportNotes ? { backgroundColor: "var(--accent)" } : undefined}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                    localElysium.autoImportNotes ? "" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      localElysium.autoImportNotes ? "translate-x-4" : ""
                    }`}
                  />
                </button>
                <span className="text-sm text-app-muted">{t("autoImportNotes")}</span>
              </label>
              <p className="text-[10px] text-app-faint mt-1 ml-12">
                Automatically create vaults from schedule items with their notes
              </p>
            </div>

            {/* Display mode */}
            {localElysium.autoImportNotes && (
              <div>
                <label className="text-xs text-app-muted block mb-2">{t("noteVaultsDisplay")}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { id: "separate" as const, label: t("separateSection") },
                    { id: "integrated" as const, label: t("integratedView") },
                  ]).map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setLocalElysium({ ...localElysium, displayMode: id })}
                      style={localElysium.displayMode === id ? { backgroundColor: "var(--accent)" } : undefined}
                      className={`px-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                        localElysium.displayMode === id
                          ? "text-white"
                          : "bg-neutral-800 text-app-muted hover:bg-neutral-700 hover:text-app"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type visibility */}
            <div>
              <label className="text-xs text-app-muted block mb-2">{t("showItemTypes")}</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["goal", "task", "event", "appointment", "habit", "reminder", "project"] as const).map((type) => {
                  const hidden = (localElysium.hiddenTypes || []).includes(type);
                  const toggle = () => {
                    const current = localElysium.hiddenTypes || [];
                    const next = hidden
                      ? current.filter((t) => t !== type)
                      : [...current, type];
                    setLocalElysium({ ...localElysium, hiddenTypes: next });
                  };
                  const labels: Record<string, string> = {
                    goal: "Goals",
                    task: "Tasks",
                    event: "Events",
                    appointment: "Appointments",
                    habit: "Habits",
                    reminder: "Reminders",
                    project: "Odysseys",
                  };
                  return (
                    <button
                      key={type}
                      onClick={toggle}
                      className={`px-2 py-1.5 rounded text-xs transition-colors cursor-pointer text-left flex items-center gap-1.5 ${
                        hidden
                          ? "bg-neutral-800/40 text-app-faint line-through opacity-50"
                          : "bg-neutral-800 text-app-muted"
                      }`}
                    >
                      {getItemIcon(type, undefined, 12)}
                      {labels[type]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Shortcuts Tab ────────────────────────────────────────────────────────────

const shortcutLabels = (): Record<keyof ShortcutsConfig, string> => ({
  togglePanel: t("togglePanel"),
  newNote: t("newNote"),
  newFolder: t("newFolderShortcut"),
  goBack: t("goBack"),
  openSettings: t("openSettings"),
  openCalendar: t("openCalendar"),
  quitApp: t("quitApp"),
});

function ShortcutsTab({ localShortcuts, setLocalShortcuts }: {
  localShortcuts: ShortcutsConfig;
  setLocalShortcuts: (c: ShortcutsConfig) => void;
}) {
  const [recordingKey, setRecordingKey] = useState<keyof ShortcutsConfig | null>(null);

  const handleKeyRecord = (e: React.KeyboardEvent, key: keyof ShortcutsConfig) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      setRecordingKey(null);
      return;
    }

    // Build the shortcut string
    const parts: string[] = [];
    if (e.metaKey || e.ctrlKey) parts.push("CommandOrControl");
    if (e.shiftKey) parts.push("Shift");
    if (e.altKey) parts.push("Alt");

    // Get the actual key
    const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    if (!["Meta", "Control", "Shift", "Alt"].includes(e.key)) {
      parts.push(keyName);
    } else {
      return; // Don't save modifier-only shortcuts
    }

    const shortcut = parts.join("+");
    setLocalShortcuts({ ...localShortcuts, [key]: shortcut });
    setRecordingKey(null);
  };

  const formatShortcut = (shortcut: string) => {
    return shortcut
      .replace("CommandOrControl", navigator.platform.includes("Mac") ? "\u2318" : "Ctrl")
      .replace("Shift", "\u21E7")
      .replace("Alt", navigator.platform.includes("Mac") ? "\u2325" : "Alt")
      .replace(/\+/g, " ");
  };

  return (
    <>
      <div>
        <h3 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">{t("keyboardShortcuts")}</h3>
        <div className="space-y-1">
          {(Object.keys(shortcutLabels()) as Array<keyof ShortcutsConfig>).map((key) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-app-muted">{shortcutLabels()[key]}</span>
              <button
                onClick={() => setRecordingKey(recordingKey === key ? null : key)}
                onKeyDown={(e) => recordingKey === key && handleKeyRecord(e, key)}
                className={`px-2.5 py-1 rounded text-xs font-mono min-w-[100px] text-center cursor-pointer transition-colors ${
                  recordingKey === key
                    ? "bg-red-500/20 text-red-400 border border-red-500/50"
                    : "bg-neutral-800 text-app-muted border border-neutral-700 hover:border-neutral-600"
                }`}
              >
                {recordingKey === key ? t("pressKeys") : formatShortcut(localShortcuts[key])}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => setLocalShortcuts({
            togglePanel: "CommandOrControl+Alt+X",
            newNote: "CommandOrControl+N",
            newFolder: "CommandOrControl+Alt+D",
            goBack: "CommandOrControl+Backspace",
            openSettings: "CommandOrControl+,",
            openCalendar: "CommandOrControl+Alt+C",
            quitApp: "CommandOrControl+Q",
          })}
          className="text-xs text-app-faint hover:text-app cursor-pointer transition-colors"
        >
          {t("resetDefaults")}
        </button>
      </div>

      <div className="p-3 rounded-lg bg-neutral-800/30">
        <p className="text-[10px] text-app-faint">
          Click a shortcut to change it, then press your desired key combination. Press Escape to cancel.
          The "Toggle Panel" shortcut works globally even when Sidewinder isn't focused.
        </p>
      </div>
    </>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────

function AccountTab({ localLicense, setLocalLicense }: {
  localLicense: LicenseConfig;
  setLocalLicense: (c: LicenseConfig) => void;
}) {
  const { isPro, isElysiumUnlock, FREE_VAULT_LIMIT } = useLicense();
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");

  const handleActivateKey = () => {
    if (!keyInput.trim()) return;
    setKeyError("");

    // Validate using the license module
    import("../../lib/license").then(({ validateLicenseKey }) => {
      const cleaned = keyInput.trim().toUpperCase();
      if (validateLicenseKey(cleaned)) {
        setLocalLicense({ status: "paid", licenseKey: cleaned });
        setKeyInput("");
      } else {
        setKeyError("Invalid license key. Please check and try again.");
      }
    });
  };

  // Purchase URL — update this to your Stripe checkout link
  const purchaseUrl = "https://blackdogstudios.io/sidewinder/purchase";

  return (
    <>
      {/* Current status */}
      <div>
        <h3 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">{t("licenseStatus")}</h3>
        <div className="p-4 rounded-lg border border-neutral-700/50 bg-neutral-800/40">
          {isPro ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-app">
                  {t("pro")}
                </span>
              </div>
              {isElysiumUnlock ? (
                <p className="text-xs text-app-muted">
                  Unlocked via your Elysium subscription. Enjoy all features at no extra cost.
                </p>
              ) : (
                <div>
                  <p className="text-xs text-app-muted">
                    License key: <span className="font-mono">{localLicense.licenseKey}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
                <span className="text-sm font-medium text-app">
                  {t("freePlan")}
                </span>
              </div>
              <p className="text-xs text-app-muted">
                {FREE_VAULT_LIMIT} vaults · Dark/Light themes · Markdown editing
              </p>
            </div>
          )}
        </div>
      </div>

      {!isPro && (
        <>
          {/* Purchase */}
          <div>
            <h3 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">{t("upgradeToPro")}</h3>
            <div className="p-4 rounded-lg border border-neutral-700/50 bg-neutral-800/40 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-app">$4.99</span>
                <span className="text-xs text-app-faint">one-time purchase</span>
              </div>
              <ul className="text-xs text-app-muted space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited vaults
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Custom colors, fonts & themes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Code & Rich Text editors
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Elysium integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> All future updates
                </li>
              </ul>
              <button
                style={{ backgroundColor: "var(--accent)" }}
                className="w-full py-2 rounded text-sm font-medium text-white cursor-pointer transition-colors hover:opacity-90"
                onClick={() => {
                  useStore.getState().setBlurSuppressed(true);
                  window.open(purchaseUrl, "_blank");
                  setTimeout(() => useStore.getState().setBlurSuppressed(false), 1000);
                }}
              >
                {t("purchase")} — $4.99
              </button>
              <p className="text-[10px] text-app-faint text-center">
                Secure payment via Stripe · Instant license key delivery
              </p>
            </div>
          </div>

          {/* License key */}
          <div>
            <h3 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">{t("licenseKey")}</h3>
            <div className="flex gap-2">
              <input
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleActivateKey(); }}
                placeholder="SW-XXXX-XXXX-XXXX"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app font-mono focus:outline-none focus:border-neutral-500 uppercase"
              />
              <button
                onClick={handleActivateKey}
                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm
                           text-app-muted transition-colors cursor-pointer"
              >
                {t("activate")}
              </button>
            </div>
            {keyError && <p className="text-xs text-red-400 mt-1">{keyError}</p>}
          </div>

          {/* Elysium unlock */}
          <div className="p-3 rounded-lg bg-neutral-800/30">
            <p className="text-xs text-app-muted">
              <strong className="text-app">Elysium users:</strong> Sidewinder Pro is included free with Elysium Basic and Pro subscriptions. Your subscription is detected automatically when Elysium is installed.
            </p>
          </div>
        </>
      )}

      {isPro && !isElysiumUnlock && (
        <div>
          <button
            onClick={() => setLocalLicense({ status: "free", licenseKey: "" })}
            className="text-xs text-app-faint hover:text-red-400 cursor-pointer transition-colors"
          >
            Deactivate License
          </button>
        </div>
      )}
    </>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function ColorPicker({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-app-muted block mb-2">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1
                     text-[10px] text-app focus:outline-none focus:border-neutral-500"
        />
      </div>
    </div>
  );
}

function PositionPreview({ config }: { config: WindowConfig }) {
  const { edge, alignment, panelWidthPct, panelHeightPct } = config;
  const isHorizontal = edge === "top" || edge === "bottom";

  // Panel as a filled rectangle
  const panelStyle: React.CSSProperties = {
    position: "absolute",
    background: config.panelColor,
    borderRadius: "2px",
    opacity: 0.6,
  };

  // Handle as a small bar on the inside edge of the panel
  const handleStyle: React.CSSProperties = {
    position: "absolute",
    background: config.handleColor,
    borderRadius: "1px",
  };

  if (isHorizontal) {
    const w = `${panelWidthPct}%`;
    const left = alignment === "start" ? "0" : alignment === "end" ? undefined : "50%";
    const right = alignment === "end" ? "0" : undefined;
    const transform = alignment === "center" ? "translateX(-50%)" : undefined;

    Object.assign(panelStyle, {
      width: w, height: "35%", left, right, transform,
      top: edge === "top" ? "0" : undefined,
      bottom: edge === "bottom" ? "0" : undefined,
    });
    // Handle: thin bar on the inside edge, centered within panel width
    Object.assign(handleStyle, {
      width: "20%", height: "4px", left, right, transform,
      top: edge === "top" ? "35%" : undefined,
      bottom: edge === "bottom" ? "35%" : undefined,
    });
  } else {
    const h = `${panelHeightPct}%`;
    const top = alignment === "start" ? "0" : alignment === "end" ? undefined : "50%";
    const bottom = alignment === "end" ? "0" : undefined;
    const transform = alignment === "center" ? "translateY(-50%)" : undefined;

    Object.assign(panelStyle, {
      width: "30%", height: h, top, bottom, transform,
      left: edge === "left" ? "0" : undefined,
      right: edge === "right" ? "0" : undefined,
    });
    // Handle: thin bar on the inside edge, centered within panel height
    const handleTop = alignment === "start" ? "0" : alignment === "end" ? undefined : "50%";
    const handleBottom = alignment === "end" ? "0" : undefined;
    const handleTransform = alignment === "center" ? "translateY(-50%)" : undefined;
    Object.assign(handleStyle, {
      width: "4px", height: "15%", top: handleTop, bottom: handleBottom, transform: handleTransform,
      left: edge === "left" ? "30%" : undefined,
      right: edge === "right" ? "30%" : undefined,
    });
  }

  return (
    <div
      className="relative w-full h-20 rounded overflow-hidden"
      style={{ backgroundColor: config.theme === "light" ? "#c0c0c0" : "#111111", border: "1px solid rgba(128,128,128,0.3)" }}
    >
      <div style={panelStyle} />
      <div style={handleStyle} />
    </div>
  );
}

// ─── About Tab ───────────────────────────────────────────────────────────────

function AboutTab() {
  const [updateState, setUpdateState] = useState<"idle" | "checking" | "available" | "uptodate" | "updating" | "error">("idle");
  const [updateVersion, setUpdateVersion] = useState("");

  const checkForUpdates = async () => {
    setUpdateState("checking");
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (update) {
        setUpdateVersion(update.version);
        setUpdateState("available");
      } else {
        setUpdateState("uptodate");
      }
    } catch {
      setUpdateState("error");
    }
  };

  const doUpdate = async () => {
    setUpdateState("updating");
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");
      const update = await check();
      if (update) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch {
      setUpdateState("error");
    }
  };

  return (
    <>
      {/* App Info */}
      <div className="text-center py-4">
        <h3 className="text-lg font-bold text-app">Sidewinder</h3>
        <p className="text-xs text-app-muted mt-1">{t("version")} {__APP_VERSION__}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-app-muted">{t("developer")}</span>
          <span className="text-app">Black Dog Studios</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-app-muted">{t("website")}</span>
          <a
            href="https://blackdogstudios.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            blackdogstudios.io
          </a>
        </div>
      </div>

      {/* Update Check */}
      <div className="mt-6 p-4 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
        <div className="flex items-center justify-between">
          <div>
            {updateState === "uptodate" && (
              <p className="text-sm text-green-400">{t("upToDate")}</p>
            )}
            {updateState === "available" && (
              <p className="text-sm text-app">
                {t("updateAvailable")}: <span className="font-semibold">v{updateVersion}</span>
              </p>
            )}
            {updateState === "checking" && (
              <p className="text-sm text-app-muted">{t("checkForUpdates")}...</p>
            )}
            {updateState === "updating" && (
              <p className="text-sm text-app-muted">{t("updating")}</p>
            )}
            {updateState === "error" && (
              <p className="text-sm text-red-400">Update check failed</p>
            )}
            {updateState === "idle" && (
              <p className="text-sm text-app-muted">{t("version")} {__APP_VERSION__}</p>
            )}
          </div>
          {updateState === "available" ? (
            <button
              onClick={doUpdate}
              style={{ backgroundColor: "var(--accent)" }}
              className="text-xs px-3 py-1.5 rounded text-white cursor-pointer"
            >
              {t("updating") === t("updating") ? "Update" : t("updating")}
            </button>
          ) : updateState !== "updating" && updateState !== "checking" ? (
            <button
              onClick={checkForUpdates}
              className="text-xs px-3 py-1.5 rounded bg-neutral-700 text-app-muted hover:bg-neutral-600 hover:text-app cursor-pointer transition-colors"
            >
              {t("checkForUpdates")}
            </button>
          ) : null}
        </div>
      </div>

      {/* More Apps */}
      <div className="mt-6">
        <h4 className="text-xs text-app-muted uppercase tracking-wider mb-3">{t("moreApps")}</h4>
        <div className="space-y-2">
          <a
            href="https://elysium.is"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/50 hover:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-sm">E</div>
            <div>
              <p className="text-sm font-medium text-app">Elysium</p>
              <p className="text-[10px] text-app-faint">Life management & scheduling</p>
            </div>
          </a>
          <a
            href="https://blackdogstudios.io/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/50 hover:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-sm">+</div>
            <div>
              <p className="text-sm font-medium text-app">All Apps</p>
              <p className="text-[10px] text-app-faint">See all Black Dog Studios apps</p>
            </div>
          </a>
        </div>
      </div>
    </>
  );
}
