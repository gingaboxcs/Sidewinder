import { useStore } from "../stores/store";

const FREE_VAULT_LIMIT = 3;

export function useLicense() {
  const licenseConfig = useStore((s) => s.licenseConfig);

  const isPro = licenseConfig.status === "paid" || licenseConfig.status === "elysium";
  const isElysiumUnlock = licenseConfig.status === "elysium";
  const vaultLimit = isPro ? Infinity : FREE_VAULT_LIMIT;

  return { isPro, isElysiumUnlock, vaultLimit, FREE_VAULT_LIMIT };
}
