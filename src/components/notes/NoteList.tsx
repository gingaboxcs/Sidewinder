import { useStore } from "../../stores/store";
import { AccordionView } from "./AccordionView";
import { NoteListHeader } from "./NoteListHeader";

export function NoteList() {
  const vault = useStore((s) => {
    const vaults = s.vaults;
    return vaults.find((v) => v.id === s.activeVaultId);
  });

  if (!vault) return null;

  return (
    <>
      <NoteListHeader />
      <AccordionView />
    </>
  );
}
