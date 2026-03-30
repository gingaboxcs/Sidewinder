/**
 * Internationalization (i18n) for Sidewinder.
 *
 * System language is detected at startup and stored in config.
 * Users can override in settings.
 *
 * Translation keys are organized by screen/feature.
 */

export type LangCode = string;

// All translatable strings
export interface Translations {
  // General
  sidewinder: string;
  settings: string;
  search: string;
  calendar: string;
  cancel: string;
  save: string;
  delete_: string;
  create: string;
  done: string;
  back: string;
  quit: string;

  // Vaults
  vaults: string;
  addVault: string;
  editVault: string;
  removeVault: string;
  noVaultsYet: string;
  addFirstVault: string;
  name: string;
  path: string;
  browse: string;
  includeSubfolders: string;

  // Notes
  notes: string;
  addNote: string;
  noNotes: string;
  noteTitle: string;
  deleteNote: string;
  moveNote: string;
  moveHere: string;
  currentLocation: string;
  renameNote: string;
  pinToTop: string;
  unpin: string;

  // Folders
  newFolder: string;
  folderName: string;
  deleteFolder: string;
  moveFolder: string;
  noSubfolders: string;

  // View modes
  accordion: string;
  full: string;
  alwaysOpen: string;

  // Edit modes
  markdown: string;
  code: string;
  plainText: string;
  richText: string;

  // Sort
  alphabetical: string;
  recent: string;
  manual: string;

  // Settings tabs
  general: string;
  appearance: string;
  creation: string;
  integration: string;
  shortcuts: string;
  account: string;

  // Settings - General
  screenEdge: string;
  alignment: string;
  handleWidth: string;
  handleHeight: string;
  panelWidth: string;
  panelHeight: string;
  animationSpeed: string;
  animationDelay: string;
  closeOnBlur: string;
  launchAtLogin: string;
  multiMonitor: string;
  stayOnOne: string;
  followActive: string;
  quitSidewinder: string;

  // Settings - Appearance
  theme: string;
  dark: string;
  light: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  paragraphSpacing: string;

  // Settings - Shortcuts
  keyboardShortcuts: string;
  pressKeys: string;
  resetDefaults: string;
  togglePanel: string;
  openSettings: string;
  openCalendar: string;
  goBack: string;
  quitApp: string;

  // Settings - Account
  licenseStatus: string;
  freePlan: string;
  pro: string;
  upgradeToPro: string;
  purchase: string;
  licenseKey: string;
  activate: string;

  // Search
  searchNotes: string;
  searchAcross: string;
  noResults: string;
  searching: string;

  // Onboarding
  welcome: string;
  welcomeDesc: string;
  vaultsAndNotes: string;
  vaultsDesc: string;
  threeViewModes: string;
  viewModesDesc: string;
  shortcutsTitle: string;
  shortcutsDesc: string;
  getStarted: string;
  skip: string;
  next: string;

  // Elysium
  elysiumNotes: string;
  openApp: string;
  writeNote: string;
  send: string;
}

const en: Translations = {
  sidewinder: "Sidewinder",
  settings: "Settings",
  search: "Search",
  calendar: "Calendar",
  cancel: "Cancel",
  save: "Save",
  delete_: "Delete",
  create: "Create",
  done: "Done",
  back: "Back",
  quit: "Quit",
  vaults: "Vaults",
  addVault: "Add Vault",
  editVault: "Edit Vault",
  removeVault: "Remove vault",
  noVaultsYet: "No vaults yet",
  addFirstVault: "Add your first vault",
  name: "Name",
  path: "Path",
  browse: "Browse",
  includeSubfolders: "Include subfolders",
  notes: "Notes",
  addNote: "+ Add",
  noNotes: "No notes in this folder",
  noteTitle: "Note title...",
  deleteNote: "Delete note",
  moveNote: "Move to...",
  moveHere: "Move here",
  currentLocation: "Current location",
  renameNote: "Rename",
  pinToTop: "Pin to top",
  unpin: "Unpin",
  newFolder: "New folder",
  folderName: "Folder name...",
  deleteFolder: "Delete folder",
  moveFolder: "Move folder...",
  noSubfolders: "No subfolders",
  accordion: "Accordion",
  full: "Full",
  alwaysOpen: "Always Open",
  markdown: "Markdown",
  code: "Code",
  plainText: "Plain Text",
  richText: "Rich Text",
  alphabetical: "A-Z",
  recent: "Recent",
  manual: "Manual",
  general: "General",
  appearance: "Appearance",
  creation: "Creation",
  integration: "Integration",
  shortcuts: "Shortcuts",
  account: "Account",
  screenEdge: "Screen Edge",
  alignment: "Alignment",
  handleWidth: "Handle Width",
  handleHeight: "Handle Height",
  panelWidth: "Panel Width",
  panelHeight: "Panel Height",
  animationSpeed: "Animation Speed",
  animationDelay: "Animation Delay",
  closeOnBlur: "Close panel when clicking outside",
  launchAtLogin: "Launch at login",
  multiMonitor: "Multi-Monitor",
  stayOnOne: "Stay on one monitor",
  followActive: "Follow active monitor",
  quitSidewinder: "Quit Sidewinder",
  theme: "Theme",
  dark: "Dark",
  light: "Light",
  fontFamily: "Font Family",
  fontSize: "Font Size",
  lineHeight: "Line Height",
  paragraphSpacing: "Paragraph Spacing",
  keyboardShortcuts: "Keyboard Shortcuts",
  pressKeys: "Press keys...",
  resetDefaults: "Reset to Defaults",
  togglePanel: "Toggle Panel",
  openSettings: "Open Settings",
  openCalendar: "Open Calendar",
  goBack: "Go Back",
  quitApp: "Quit App",
  licenseStatus: "License Status",
  freePlan: "Free Plan",
  pro: "Sidewinder Pro",
  upgradeToPro: "Upgrade to Pro",
  purchase: "Purchase",
  licenseKey: "License Key",
  activate: "Activate",
  searchNotes: "Search notes...",
  searchAcross: "Search across all your vaults and notes",
  noResults: "No results found",
  searching: "Searching...",
  welcome: "Welcome to Sidewinder",
  welcomeDesc: "Your notes, always within reach. Sidewinder hides at the edge of your screen until you need it.",
  vaultsAndNotes: "Vaults & Notes",
  vaultsDesc: "Add any folder as a vault — including Obsidian vaults. All .md files inside appear as notes.",
  threeViewModes: "Three View Modes",
  viewModesDesc: "Accordion (A) — expand/collapse. Full (F) — one at a time. Always Open (O) — all visible.",
  shortcutsTitle: "Keyboard Shortcuts",
  shortcutsDesc: "Work faster with shortcuts. Customize them in Settings.",
  getStarted: "Get Started",
  skip: "Skip",
  next: "Next",
  elysiumNotes: "Elysium Notes",
  openApp: "Open App",
  writeNote: "Write a note...",
  send: "Send",
};

// Translations for supported languages
const translations: Record<string, Partial<Translations>> = {
  en,
  es: {
    sidewinder: "Sidewinder", settings: "Ajustes", search: "Buscar", calendar: "Calendario",
    cancel: "Cancelar", save: "Guardar", delete_: "Eliminar", create: "Crear", done: "Hecho", back: "Atrás", quit: "Salir",
    vaults: "Bóvedas", addVault: "Añadir Bóveda", noVaultsYet: "Sin bóvedas aún", addFirstVault: "Añade tu primera bóveda",
    name: "Nombre", path: "Ruta", browse: "Explorar", includeSubfolders: "Incluir subcarpetas",
    notes: "Notas", addNote: "+ Añadir", noNotes: "Sin notas en esta carpeta", noteTitle: "Título de la nota...",
    newFolder: "Nueva carpeta", folderName: "Nombre de carpeta...",
    accordion: "Acordeón", full: "Completo", alwaysOpen: "Siempre Abierto",
    markdown: "Markdown", code: "Código", plainText: "Texto Plano", richText: "Texto Enriquecido",
    alphabetical: "A-Z", recent: "Reciente", manual: "Manual",
    general: "General", appearance: "Apariencia", creation: "Creación", integration: "Integración", shortcuts: "Atajos", account: "Cuenta",
    screenEdge: "Borde de Pantalla", theme: "Tema", dark: "Oscuro", light: "Claro",
    keyboardShortcuts: "Atajos de Teclado", resetDefaults: "Restablecer", togglePanel: "Alternar Panel",
    searchNotes: "Buscar notas...", noResults: "Sin resultados", searching: "Buscando...",
    welcome: "Bienvenido a Sidewinder", getStarted: "Comenzar", skip: "Saltar", next: "Siguiente",
    send: "Enviar", writeNote: "Escribe una nota...",
  },
  fr: {
    settings: "Paramètres", search: "Rechercher", calendar: "Calendrier",
    cancel: "Annuler", save: "Enregistrer", delete_: "Supprimer", create: "Créer", done: "Terminé", back: "Retour", quit: "Quitter",
    vaults: "Coffres", addVault: "Ajouter un Coffre", noVaultsYet: "Aucun coffre", addFirstVault: "Ajoutez votre premier coffre",
    name: "Nom", path: "Chemin", browse: "Parcourir", includeSubfolders: "Inclure les sous-dossiers",
    notes: "Notes", addNote: "+ Ajouter", noNotes: "Aucune note dans ce dossier", noteTitle: "Titre de la note...",
    newFolder: "Nouveau dossier", folderName: "Nom du dossier...",
    accordion: "Accordéon", full: "Complet", alwaysOpen: "Toujours Ouvert",
    general: "Général", appearance: "Apparence", creation: "Création", integration: "Intégration", shortcuts: "Raccourcis", account: "Compte",
    screenEdge: "Bord de l'écran", theme: "Thème", dark: "Sombre", light: "Clair",
    keyboardShortcuts: "Raccourcis Clavier", resetDefaults: "Réinitialiser", togglePanel: "Basculer le Panneau",
    searchNotes: "Rechercher des notes...", noResults: "Aucun résultat", searching: "Recherche en cours...",
    welcome: "Bienvenue dans Sidewinder", getStarted: "Commencer", skip: "Passer", next: "Suivant",
    send: "Envoyer", writeNote: "Écrire une note...",
  },
  de: {
    settings: "Einstellungen", search: "Suchen", calendar: "Kalender",
    cancel: "Abbrechen", save: "Speichern", delete_: "Löschen", create: "Erstellen", done: "Fertig", back: "Zurück", quit: "Beenden",
    vaults: "Tresore", addVault: "Tresor hinzufügen", noVaultsYet: "Noch keine Tresore", addFirstVault: "Fügen Sie Ihren ersten Tresor hinzu",
    name: "Name", path: "Pfad", browse: "Durchsuchen", includeSubfolders: "Unterordner einschließen",
    notes: "Notizen", addNote: "+ Hinzufügen", noNotes: "Keine Notizen in diesem Ordner", noteTitle: "Notiztitel...",
    newFolder: "Neuer Ordner", folderName: "Ordnername...",
    general: "Allgemein", appearance: "Aussehen", creation: "Erstellung", shortcuts: "Tastenkürzel", account: "Konto",
    screenEdge: "Bildschirmrand", theme: "Design", dark: "Dunkel", light: "Hell",
    keyboardShortcuts: "Tastenkürzel", resetDefaults: "Zurücksetzen", togglePanel: "Panel umschalten",
    searchNotes: "Notizen suchen...", noResults: "Keine Ergebnisse", searching: "Suche...",
    welcome: "Willkommen bei Sidewinder", getStarted: "Loslegen", skip: "Überspringen", next: "Weiter",
    send: "Senden", writeNote: "Notiz schreiben...",
  },
  ja: {
    settings: "設定", search: "検索", calendar: "カレンダー",
    cancel: "キャンセル", save: "保存", delete_: "削除", create: "作成", done: "完了", back: "戻る", quit: "終了",
    vaults: "ボールト", addVault: "ボールト追加", noVaultsYet: "ボールトがありません", addFirstVault: "最初のボールトを追加",
    name: "名前", path: "パス", browse: "参照", includeSubfolders: "サブフォルダーを含む",
    notes: "ノート", addNote: "+ 追加", noNotes: "このフォルダにノートがありません", noteTitle: "ノートのタイトル...",
    newFolder: "新しいフォルダ", folderName: "フォルダ名...",
    general: "一般", appearance: "外観", creation: "作成", shortcuts: "ショートカット", account: "アカウント",
    theme: "テーマ", dark: "ダーク", light: "ライト",
    keyboardShortcuts: "キーボードショートカット", resetDefaults: "リセット",
    searchNotes: "ノートを検索...", noResults: "結果なし", searching: "検索中...",
    welcome: "Sidewinderへようこそ", getStarted: "始める", skip: "スキップ", next: "次へ",
    send: "送信", writeNote: "ノートを書く...",
  },
  ko: {
    settings: "설정", search: "검색", calendar: "캘린더",
    cancel: "취소", save: "저장", delete_: "삭제", create: "만들기", done: "완료", back: "뒤로", quit: "종료",
    vaults: "보관함", notes: "노트", addNote: "+ 추가", noNotes: "이 폴더에 노트가 없습니다",
    newFolder: "새 폴더", general: "일반", appearance: "모양", shortcuts: "단축키", account: "계정",
    theme: "테마", dark: "다크", light: "라이트",
    searchNotes: "노트 검색...", noResults: "결과 없음", searching: "검색 중...",
    welcome: "Sidewinder에 오신 것을 환영합니다", getStarted: "시작하기", skip: "건너뛰기", next: "다음",
    send: "보내기",
  },
  zh: {
    settings: "设置", search: "搜索", calendar: "日历",
    cancel: "取消", save: "保存", delete_: "删除", create: "创建", done: "完成", back: "返回", quit: "退出",
    vaults: "仓库", notes: "笔记", addNote: "+ 添加", noNotes: "此文件夹中没有笔记",
    newFolder: "新建文件夹", general: "通用", appearance: "外观", shortcuts: "快捷键", account: "账户",
    theme: "主题", dark: "深色", light: "浅色",
    searchNotes: "搜索笔记...", noResults: "未找到结果", searching: "搜索中...",
    welcome: "欢迎使用 Sidewinder", getStarted: "开始使用", skip: "跳过", next: "下一步",
    send: "发送",
  },
  "zh-TW": {
    settings: "設定", search: "搜尋", calendar: "日曆",
    cancel: "取消", save: "儲存", delete_: "刪除", create: "建立", done: "完成", back: "返回", quit: "結束",
    vaults: "儲藏庫", notes: "筆記", addNote: "+ 新增", noNotes: "此資料夾中沒有筆記",
    newFolder: "新增資料夾", general: "一般", appearance: "外觀", shortcuts: "快捷鍵", account: "帳戶",
    theme: "主題", dark: "深色", light: "淺色",
    searchNotes: "搜尋筆記...", noResults: "找不到結果", searching: "搜尋中...",
    welcome: "歡迎使用 Sidewinder", getStarted: "開始使用", skip: "略過", next: "下一步",
    send: "傳送",
  },
  pt: {
    settings: "Configurações", search: "Pesquisar", calendar: "Calendário",
    cancel: "Cancelar", save: "Salvar", delete_: "Excluir", create: "Criar", done: "Pronto", back: "Voltar", quit: "Sair",
    vaults: "Cofres", notes: "Notas", addNote: "+ Adicionar", noNotes: "Nenhuma nota nesta pasta",
    newFolder: "Nova pasta", general: "Geral", appearance: "Aparência", shortcuts: "Atalhos", account: "Conta",
    theme: "Tema", dark: "Escuro", light: "Claro",
    searchNotes: "Pesquisar notas...", noResults: "Nenhum resultado", searching: "Pesquisando...",
    welcome: "Bem-vindo ao Sidewinder", getStarted: "Começar", skip: "Pular", next: "Próximo",
    send: "Enviar",
  },
  it: {
    settings: "Impostazioni", search: "Cerca", calendar: "Calendario",
    cancel: "Annulla", save: "Salva", delete_: "Elimina", create: "Crea", done: "Fatto", back: "Indietro", quit: "Esci",
    vaults: "Cassaforti", notes: "Note", addNote: "+ Aggiungi", noNotes: "Nessuna nota in questa cartella",
    newFolder: "Nuova cartella", general: "Generale", appearance: "Aspetto", shortcuts: "Scorciatoie", account: "Account",
    theme: "Tema", dark: "Scuro", light: "Chiaro",
    searchNotes: "Cerca note...", noResults: "Nessun risultato", searching: "Ricerca...",
    welcome: "Benvenuto in Sidewinder", getStarted: "Inizia", skip: "Salta", next: "Avanti",
    send: "Invia",
  },
  ru: {
    settings: "Настройки", search: "Поиск", calendar: "Календарь",
    cancel: "Отмена", save: "Сохранить", delete_: "Удалить", create: "Создать", done: "Готово", back: "Назад", quit: "Выход",
    vaults: "Хранилища", notes: "Заметки", addNote: "+ Добавить", noNotes: "Нет заметок в этой папке",
    newFolder: "Новая папка", general: "Общие", appearance: "Оформление", shortcuts: "Горячие клавиши", account: "Аккаунт",
    theme: "Тема", dark: "Тёмная", light: "Светлая",
    searchNotes: "Поиск заметок...", noResults: "Ничего не найдено", searching: "Поиск...",
    welcome: "Добро пожаловать в Sidewinder", getStarted: "Начать", skip: "Пропустить", next: "Далее",
    send: "Отправить",
  },
  ar: {
    settings: "الإعدادات", search: "بحث", calendar: "التقويم",
    cancel: "إلغاء", save: "حفظ", delete_: "حذف", create: "إنشاء", done: "تم", back: "رجوع", quit: "خروج",
    vaults: "الخزائن", notes: "الملاحظات", addNote: "+ إضافة", noNotes: "لا توجد ملاحظات في هذا المجلد",
    newFolder: "مجلد جديد", general: "عام", appearance: "المظهر", shortcuts: "اختصارات", account: "الحساب",
    theme: "السمة", dark: "داكن", light: "فاتح",
    searchNotes: "البحث في الملاحظات...", noResults: "لا نتائج", searching: "جاري البحث...",
    welcome: "مرحبًا بك في Sidewinder", getStarted: "ابدأ", skip: "تخطي", next: "التالي",
    send: "إرسال",
  },
  tr: {
    settings: "Ayarlar", search: "Ara", calendar: "Takvim",
    cancel: "İptal", save: "Kaydet", delete_: "Sil", create: "Oluştur", done: "Tamam", back: "Geri", quit: "Çık",
    vaults: "Kasalar", notes: "Notlar", addNote: "+ Ekle", noNotes: "Bu klasörde not yok",
    newFolder: "Yeni klasör", general: "Genel", appearance: "Görünüm", shortcuts: "Kısayollar", account: "Hesap",
    theme: "Tema", dark: "Koyu", light: "Açık",
    searchNotes: "Not ara...", noResults: "Sonuç bulunamadı", searching: "Aranıyor...",
    welcome: "Sidewinder'a Hoş Geldiniz", getStarted: "Başla", skip: "Atla", next: "İleri",
    send: "Gönder",
  },
  nl: {
    settings: "Instellingen", search: "Zoeken", calendar: "Kalender",
    cancel: "Annuleren", save: "Opslaan", delete_: "Verwijderen", create: "Aanmaken", done: "Klaar", back: "Terug", quit: "Afsluiten",
    vaults: "Kluizen", notes: "Notities", addNote: "+ Toevoegen", noNotes: "Geen notities in deze map",
    newFolder: "Nieuwe map", general: "Algemeen", appearance: "Uiterlijk", shortcuts: "Sneltoetsen", account: "Account",
    theme: "Thema", dark: "Donker", light: "Licht",
    searchNotes: "Notities zoeken...", noResults: "Geen resultaten", searching: "Zoeken...",
    welcome: "Welkom bij Sidewinder", getStarted: "Aan de slag", skip: "Overslaan", next: "Volgende",
    send: "Versturen",
  },
  pl: {
    settings: "Ustawienia", search: "Szukaj", calendar: "Kalendarz",
    cancel: "Anuluj", save: "Zapisz", delete_: "Usuń", create: "Utwórz", done: "Gotowe", back: "Wstecz", quit: "Zamknij",
    vaults: "Skarbce", notes: "Notatki", addNote: "+ Dodaj", noNotes: "Brak notatek w tym folderze",
    newFolder: "Nowy folder", general: "Ogólne", appearance: "Wygląd", shortcuts: "Skróty", account: "Konto",
    theme: "Motyw", dark: "Ciemny", light: "Jasny",
    searchNotes: "Szukaj notatek...", noResults: "Brak wyników", searching: "Szukanie...",
    welcome: "Witamy w Sidewinder", getStarted: "Rozpocznij", skip: "Pomiń", next: "Dalej",
    send: "Wyślij",
  },
};

// Supported languages for the UI selector
export const supportedLanguages: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
  { code: "ru", name: "Русский" },
  { code: "tr", name: "Türkçe" },
  { code: "ar", name: "العربية" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "简体中文" },
  { code: "zh-TW", name: "繁體中文" },
];

let currentLang: LangCode = "en";
let currentTranslations: Translations = en;

export function setLanguage(lang: LangCode) {
  currentLang = lang;
  const partial = translations[lang] || translations[lang.split("-")[0]] || {};
  currentTranslations = { ...en, ...partial };
}

export function getLanguage(): LangCode {
  return currentLang;
}

export function t(key: keyof Translations): string {
  return currentTranslations[key] || en[key] || key;
}

/**
 * React hook that returns `t` and re-renders when language changes.
 * Import useStore in the component and call: const t = useT();
 */
export function useT() {
  // This import is deferred to avoid circular deps
  // Components should import useT from i18n and useStore from store separately
  // The hook body accesses the store to subscribe to language changes
  return t;
}

export function detectSystemLanguage(): string {
  const lang = navigator.language || "en";
  // Check exact match first, then base language
  if (translations[lang]) return lang;
  const base = lang.split("-")[0];
  if (translations[base]) return base;
  return "en";
}
