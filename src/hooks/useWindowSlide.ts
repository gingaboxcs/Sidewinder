import { useCallback, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { slideWindow } from "../lib/tauri";
import { useStore } from "../stores/store";

export function useWindowSlide() {
  const isSlid = useStore((s) => s.isSlid);
  const setSlid = useStore((s) => s.setSlid);

  useEffect(() => {
    const unlisten = listen<boolean>("slide-state", (event) => {
      setSlid(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setSlid]);

  const toggle = useCallback(async () => {
    const newState = !isSlid;
    try {
      await slideWindow(newState);
    } catch (e) {
      console.error("Failed to slide window:", e);
    }
  }, [isSlid]);

  return { isSlid, toggle };
}
