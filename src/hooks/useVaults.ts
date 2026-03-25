import { useCallback, useEffect } from "react";
import { loadConfig, addVault as addVaultApi, removeVault as removeVaultApi, updateVault as updateVaultApi } from "../lib/tauri";
import { useStore } from "../stores/store";
import type { Vault, ViewMode } from "../types";

export function useVaults() {
  const vaults = useStore((s) => s.vaults);
  const setVaults = useStore((s) => s.setVaults);

  const refresh = useCallback(async () => {
    try {
      const config = await loadConfig();
      setVaults(config.vaults);
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  }, [setVaults]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addVault = useCallback(
    async (name: string, path: string, viewMode: ViewMode = "accordion", recursive = false) => {
      const vault = await addVaultApi(name, path, viewMode, recursive);
      await refresh();
      return vault;
    },
    [refresh]
  );

  const removeVault = useCallback(
    async (id: string) => {
      await removeVaultApi(id);
      await refresh();
    },
    [refresh]
  );

  const updateVault = useCallback(
    async (vault: Vault) => {
      await updateVaultApi(vault);
      await refresh();
    },
    [refresh]
  );

  return { vaults, addVault, removeVault, updateVault, refresh };
}
