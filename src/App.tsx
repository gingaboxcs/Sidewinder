import { AppShell } from "./components/layout/AppShell";
import { VaultList } from "./components/vault/VaultList";
import { NoteList } from "./components/notes/NoteList";
import { FullNoteView } from "./components/notes/FullNoteView";
import { useStore } from "./stores/store";
import "./styles.css";

function App() {
  const view = useStore((s) => s.view);

  return (
    <AppShell>
      {view === "vault-list" && <VaultList />}
      {view === "note-list" && <NoteList />}
      {view === "note-full" && <FullNoteView />}
    </AppShell>
  );
}

export default App;
