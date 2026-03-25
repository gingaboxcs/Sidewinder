import { SlideTab } from "./SlideTab";
import { TitleBar } from "./TitleBar";
import { useStore } from "../../stores/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isSlid = useStore((s) => s.isSlid);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent">
      <SlideTab />
      {isSlid && (
        <div className="flex flex-col flex-1 min-w-0 bg-slate-900 text-slate-100 rounded-l-lg overflow-hidden">
          <TitleBar />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
