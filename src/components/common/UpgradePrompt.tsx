import { useStore } from "../../stores/store";

interface Props {
  feature: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, compact }: Props) {
  const setView = useStore((s) => s.setView);

  if (compact) {
    return (
      <button
        onClick={() => setView("settings")}
        className="text-[10px] px-2 py-1 rounded text-amber-400 bg-amber-400/10 cursor-pointer hover:bg-amber-400/20 transition-colors"
      >
        Upgrade to unlock {feature}
      </button>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-amber-400/20 bg-amber-400/5">
      <p className="text-sm text-app font-medium mb-1">Upgrade to Sidewinder Pro</p>
      <p className="text-xs text-app-muted mb-3">
        {feature} is available with Sidewinder Pro ($4.99 one-time) or with an active Elysium Basic/Pro subscription.
      </p>
      <button
        onClick={() => setView("settings")}
        style={{ backgroundColor: "var(--accent)" }}
        className="px-4 py-1.5 rounded text-sm text-white cursor-pointer transition-colors"
      >
        View Upgrade Options
      </button>
    </div>
  );
}
