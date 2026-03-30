import { useState } from "react";
import { loadConfig, saveConfig } from "../../lib/tauri";

interface Props {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Sidewinder",
    description: "Your notes, always within reach. Sidewinder hides at the edge of your screen until you need it.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-app">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
    detail: "Look for the small handle at the edge of your screen. Click it to slide the panel open, click again to hide it.",
  },
  {
    title: "Vaults & Notes",
    description: "Organize your notes in vaults — each vault points to a folder on your computer.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-app">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    detail: "Add any folder as a vault — including Obsidian vaults. All .md files inside appear as notes. Create subfolders to organize further.",
  },
  {
    title: "Three View Modes",
    description: "Choose how your notes are displayed. Set per-vault, per-folder, or per-note.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-app">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    detail: "Accordion (A) — expand/collapse individually. Full (F) — one note at a time. Always Open (O) — all notes visible. Click the badges to cycle.",
  },
  {
    title: "Keyboard Shortcuts",
    description: "Work faster with shortcuts. Customize them all in Settings.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-app">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="6" y1="8" x2="6.01" y2="8" /><line x1="10" y1="8" x2="10.01" y2="8" /><line x1="14" y1="8" x2="14.01" y2="8" /><line x1="18" y1="8" x2="18.01" y2="8" />
        <line x1="6" y1="12" x2="6.01" y2="12" /><line x1="10" y1="12" x2="10.01" y2="12" /><line x1="14" y1="12" x2="14.01" y2="12" /><line x1="18" y1="12" x2="18.01" y2="12" />
        <line x1="8" y1="16" x2="16" y2="16" />
      </svg>
    ),
    detail: `${navigator.platform.includes("Mac") ? "⌘⌥X" : "Ctrl+Alt+X"} — Toggle panel (works globally)\n${navigator.platform.includes("Mac") ? "⌘N" : "Ctrl+N"} — New note\n${navigator.platform.includes("Mac") ? "⌘," : "Ctrl+,"} — Settings\nDouble-click a title to rename it`,
  },
];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleComplete = async () => {
    try {
      const config = await loadConfig();
      config.onboardingComplete = true;
      await saveConfig(config);
    } catch (e) {
      console.error("Failed to save onboarding state:", e);
    }
    onComplete();
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "" : "bg-neutral-700"
            }`}
            style={i === step ? { backgroundColor: "var(--accent)" } : undefined}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-4 opacity-80">
          {current.icon}
        </div>
        <h2 className="text-lg font-bold text-app mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-app-muted mb-4 max-w-[280px]">
          {current.description}
        </p>
        <p className="text-xs text-app-faint max-w-[280px] whitespace-pre-line leading-relaxed">
          {current.detail}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm text-app-muted hover:text-app cursor-pointer transition-colors"
          >
            Back
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="text-sm text-app-faint hover:text-app cursor-pointer transition-colors"
          >
            Skip
          </button>
        )}

        <button
          onClick={isLast ? handleComplete : () => setStep(step + 1)}
          style={{ backgroundColor: "var(--accent)" }}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors hover:opacity-90"
        >
          {isLast ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
