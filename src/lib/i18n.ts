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
  loading: string;
  apply: string;
  applyChanges: string;
  applying: string;
  panelWillCollapse: string;
  edit: string;
  view: string;
  sort: string;
  override: string;
  language: string;
  untitled: string;
  nameRequired: string;
  pathRequired: string;
  failedToAdd: string;
  failedToSave: string;

  // Vaults
  vaults: string;
  addVault: string;
  editVault: string;
  removeVault: string;
  moveVault: string;
  noVaultsYet: string;
  addFirstVault: string;
  name: string;
  path: string;
  browse: string;
  includeSubfolders: string;
  openElysium: string;

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
  saving: string;
  saved: string;
  noNotesYet: string;

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
  accordionMode: string;
  fullNoteMode: string;
  alwaysOpenMode: string;
  clickToCycle: string;

  // Edit modes
  markdown: string;
  code: string;
  plainText: string;
  richText: string;
  copyNote: string;
  copyContent: string;
  copyContentPlaceholder: string;
  notesPlaceholder: string;
  copyToClipboard: string;
  copied: string;

  // Sort
  alphabetical: string;
  recent: string;
  manual: string;
  newestFirst: string;
  oldestFirst: string;
  zFirst: string;
  aFirst: string;

  // Settings tabs
  general: string;
  appearance: string;
  creation: string;
  integration: string;
  shortcuts: string;
  account: string;
  about: string;
  version: string;
  developer: string;
  website: string;
  checkForUpdates: string;
  upToDate: string;
  updateAvailable: string;
  updating: string;
  moreApps: string;

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
  alignAlongHorizontal: string;
  alignAlongVertical: string;
  instant: string;
  none: string;

  // Settings - Appearance
  theme: string;
  dark: string;
  light: string;
  frostedGlass: string;
  frostedGlassDesc: string;
  proColorsDesc: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  paragraphSpacing: string;
  handleColor: string;
  panelColorLabel: string;
  accentColor: string;
  textColor: string;

  // Settings - Creation
  defaultFormatting: string;
  newNotePosition: string;
  newVaultPosition: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
  center: string;

  // Settings - Shortcuts
  keyboardShortcuts: string;
  pressKeys: string;
  resetDefaults: string;
  togglePanel: string;
  openSettings: string;
  openCalendar: string;
  goBack: string;
  quitApp: string;
  newNote: string;
  newFolderShortcut: string;

  // Settings - Account
  licenseStatus: string;
  freePlan: string;
  pro: string;
  upgradeToPro: string;
  purchase: string;
  licenseKey: string;
  activate: string;
  freeVaultLimit: string;
  proUnlimited: string;
  elysiumSubscriber: string;
  enterLicenseKey: string;

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
  openInElysium: string;
  elysiumIntegration: string;
  elysiumOpenTime: string;
  openTimeFolder: string;
  yourName: string;
  yourEmail: string;
  autoDetect: string;
  noteVaultsDisplay: string;
  showItemTypes: string;
  separateSection: string;
  integratedView: string;
  autoImportNotes: string;

  // Calendar
  today: string;
  progress: string;
  tags: string;
  links: string;
  // Weekdays
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  // Months
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  // Item types
  event: string;
  appointment: string;
  task: string;
  goal: string;
  habit: string;
  reminder: string;
  project: string;
  // Statuses
  toDo: string;
  inProgress: string;
  cancelled: string;

  // Formatting toolbar
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  bulletList: string;
  numberedList: string;
  heading1: string;
  heading2: string;
  heading3: string;
  paragraph: string;
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
  loading: "Loading...",
  apply: "Apply",
  applyChanges: "Apply Changes",
  applying: "Applying...",
  panelWillCollapse: "The panel will collapse and reposition when you apply",
  edit: "Edit",
  view: "View",
  sort: "Sort",
  override: "override",
  language: "Language",
  untitled: "Untitled",
  nameRequired: "Name is required",
  pathRequired: "Path is required",
  failedToAdd: "Failed to add vault",
  failedToSave: "Failed to save",

  vaults: "Vaults",
  addVault: "Add Vault",
  editVault: "Edit Vault",
  removeVault: "Remove vault",
  moveVault: "Move vault...",
  noVaultsYet: "No vaults yet",
  addFirstVault: "Add your first vault",
  name: "Name",
  path: "Path",
  browse: "Browse",
  includeSubfolders: "Include subfolders",
  openElysium: "Open Elysium",

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
  saving: "Saving...",
  saved: "Saved",
  noNotesYet: "No notes yet",

  newFolder: "New folder",
  folderName: "Folder name...",
  deleteFolder: "Delete folder",
  moveFolder: "Move folder...",
  noSubfolders: "No subfolders",

  accordion: "Accordion",
  full: "Full",
  alwaysOpen: "Always Open",
  accordionMode: "Accordion mode",
  fullNoteMode: "Full note mode",
  alwaysOpenMode: "Always open mode",
  clickToCycle: "click to cycle",

  markdown: "Markdown",
  code: "Code",
  plainText: "Plain Text",
  richText: "Rich Text",
  copyNote: "Copy",
  copyContent: "Copy content",
  copyContentPlaceholder: "What to copy when clicked...",
  notesPlaceholder: "Notes...",
  copyToClipboard: "Copy to clipboard",
  copied: "Copied!",

  alphabetical: "A-Z",
  recent: "Recent",
  manual: "Manual",
  newestFirst: "Newest first",
  oldestFirst: "Oldest first",
  zFirst: "Z first",
  aFirst: "A first",

  general: "General",
  appearance: "Appearance",
  creation: "Creation",
  integration: "Integration",
  shortcuts: "Shortcuts",
  account: "Account",
  about: "About",
  version: "Version",
  developer: "Developer",
  website: "Website",
  checkForUpdates: "Check for Updates",
  upToDate: "You're up to date!",
  updateAvailable: "Update available",
  updating: "Updating...",
  moreApps: "More Apps",

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
  alignAlongHorizontal: "Alignment along horizontal axis",
  alignAlongVertical: "Alignment along vertical axis",
  instant: "Instant",
  none: "None",

  theme: "Theme",
  dark: "Dark",
  light: "Light",
  frostedGlass: "Frosted Glass",
  frostedGlassDesc: "Translucent blur effect on handle and panel",
  proColorsDesc: "Custom colors, fonts, and typography are available with Sidewinder Pro.",
  fontFamily: "Font Family",
  fontSize: "Font Size",
  lineHeight: "Line Height",
  paragraphSpacing: "Paragraph Spacing",
  handleColor: "Handle",
  panelColorLabel: "Panel",
  accentColor: "Accent",
  textColor: "Text",

  defaultFormatting: "Default Formatting",
  newNotePosition: "New Note Position",
  newVaultPosition: "New Vault Position",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
  center: "Center",

  keyboardShortcuts: "Keyboard Shortcuts",
  pressKeys: "Press keys...",
  resetDefaults: "Reset to Defaults",
  togglePanel: "Toggle Panel",
  openSettings: "Open Settings",
  openCalendar: "Open Calendar",
  goBack: "Go Back",
  quitApp: "Quit App",
  newNote: "New Note",
  newFolderShortcut: "New Folder",

  licenseStatus: "License Status",
  freePlan: "Free Plan",
  pro: "Sidewinder Pro",
  upgradeToPro: "Upgrade to Pro",
  purchase: "Purchase",
  licenseKey: "License Key",
  activate: "Activate",
  freeVaultLimit: "3 vaults included",
  proUnlimited: "Unlimited vaults, custom themes & more",
  elysiumSubscriber: "Elysium Subscriber",
  enterLicenseKey: "Enter license key",

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
  openInElysium: "Open in Elysium",
  elysiumIntegration: "Elysium Integration",
  elysiumOpenTime: "Elysium OpenTime",
  openTimeFolder: "OpenTime Folder",
  yourName: "Your Name",
  yourEmail: "Your Email",
  autoDetect: "Auto-detect from Elysium",
  noteVaultsDisplay: "Note Vaults Display",
  showItemTypes: "Show Item Types",
  separateSection: "Separate section",
  integratedView: "Integrated with vaults",
  autoImportNotes: "Auto-import note vaults",

  today: "Today",
  progress: "Progress",
  tags: "Tags",
  links: "Links",
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
  event: "Event",
  appointment: "Appointment",
  task: "Task",
  goal: "Goal",
  habit: "Habit",
  reminder: "Reminder",
  project: "Project",
  toDo: "To Do",
  inProgress: "In Progress",
  cancelled: "Cancelled",

  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  bulletList: "Bullet list",
  numberedList: "Numbered list",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  paragraph: "Paragraph",
};

// Translations for supported languages
const translations: Record<string, Partial<Translations>> = {
  en,
  es: {
    sidewinder: "Sidewinder", settings: "Ajustes", search: "Buscar", calendar: "Calendario",
    cancel: "Cancelar", save: "Guardar", delete_: "Eliminar", create: "Crear", done: "Hecho", back: "Atrás", quit: "Salir",
    loading: "Cargando...", apply: "Aplicar", applyChanges: "Aplicar Cambios", applying: "Aplicando...",
    panelWillCollapse: "El panel se colapsará y reposicionará al aplicar",
    edit: "Editar", view: "Vista", sort: "Ordenar", override: "personalizado", language: "Idioma",
    untitled: "Sin título", nameRequired: "El nombre es obligatorio", pathRequired: "La ruta es obligatoria",
    failedToAdd: "Error al añadir bóveda", failedToSave: "Error al guardar",
    vaults: "Bóvedas", addVault: "Añadir Bóveda", editVault: "Editar Bóveda", removeVault: "Eliminar bóveda", moveVault: "Mover bóveda...",
    noVaultsYet: "Sin bóvedas aún", addFirstVault: "Añade tu primera bóveda",
    name: "Nombre", path: "Ruta", browse: "Explorar", includeSubfolders: "Incluir subcarpetas", openElysium: "Abrir Elysium",
    notes: "Notas", addNote: "+ Añadir", noNotes: "Sin notas en esta carpeta", noteTitle: "Título de la nota...",
    deleteNote: "Eliminar nota", moveNote: "Mover a...", moveHere: "Mover aquí", currentLocation: "Ubicación actual",
    renameNote: "Renombrar", pinToTop: "Fijar arriba", unpin: "Desfijar",
    saving: "Guardando...", saved: "Guardado", noNotesYet: "Sin notas aún",
    newFolder: "Nueva carpeta", folderName: "Nombre de carpeta...", deleteFolder: "Eliminar carpeta", moveFolder: "Mover carpeta...", noSubfolders: "Sin subcarpetas",
    accordion: "Acordeón", full: "Completo", alwaysOpen: "Siempre Abierto",
    accordionMode: "Modo acordeón", fullNoteMode: "Modo nota completa", alwaysOpenMode: "Modo siempre abierto", clickToCycle: "clic para cambiar",
    markdown: "Markdown", code: "Código", plainText: "Texto Plano", richText: "Texto Enriquecido",
    alphabetical: "A-Z", recent: "Reciente", manual: "Manual",
    newestFirst: "Más reciente primero", oldestFirst: "Más antiguo primero", zFirst: "Z primero", aFirst: "A primero",
    general: "General", appearance: "Apariencia", creation: "Creación", integration: "Integración", shortcuts: "Atajos", account: "Cuenta",
    screenEdge: "Borde de Pantalla", alignment: "Alineación",
    handleWidth: "Ancho del asa", handleHeight: "Alto del asa", panelWidth: "Ancho del panel", panelHeight: "Alto del panel",
    animationSpeed: "Velocidad de animación", animationDelay: "Retardo de animación",
    closeOnBlur: "Cerrar panel al hacer clic fuera", launchAtLogin: "Iniciar al arrancar",
    multiMonitor: "Multi-Monitor", stayOnOne: "Quedarse en un monitor", followActive: "Seguir monitor activo",
    quitSidewinder: "Salir de Sidewinder",
    alignAlongHorizontal: "Alineación en eje horizontal", alignAlongVertical: "Alineación en eje vertical",
    instant: "Instantáneo", none: "Ninguno",
    theme: "Tema", dark: "Oscuro", light: "Claro",
    frostedGlass: "Cristal esmerilado", frostedGlassDesc: "Efecto de desenfoque translúcido en asa y panel",
    proColorsDesc: "Colores, fuentes y tipografía personalizados disponibles con Sidewinder Pro.",
    fontFamily: "Fuente", fontSize: "Tamaño de fuente", lineHeight: "Altura de línea", paragraphSpacing: "Espaciado de párrafo",
    handleColor: "Asa", panelColorLabel: "Panel", accentColor: "Acento", textColor: "Texto",
    defaultFormatting: "Formato predeterminado", newNotePosition: "Posición de nueva nota", newVaultPosition: "Posición de nueva bóveda",
    top: "Arriba", bottom: "Abajo", left: "Izquierda", right: "Derecha", center: "Centro",
    keyboardShortcuts: "Atajos de Teclado", pressKeys: "Presione teclas...", resetDefaults: "Restablecer",
    togglePanel: "Alternar Panel", openSettings: "Abrir Ajustes", openCalendar: "Abrir Calendario",
    goBack: "Volver", quitApp: "Salir de la App", newNote: "Nueva Nota", newFolderShortcut: "Nueva Carpeta",
    licenseStatus: "Estado de Licencia", freePlan: "Plan Gratuito", pro: "Sidewinder Pro",
    upgradeToPro: "Mejorar a Pro", purchase: "Comprar", licenseKey: "Clave de Licencia", activate: "Activar",
    freeVaultLimit: "3 bóvedas incluidas", proUnlimited: "Bóvedas ilimitadas, temas personalizados y más",
    elysiumSubscriber: "Suscriptor de Elysium", enterLicenseKey: "Ingrese clave de licencia",
    searchNotes: "Buscar notas...", searchAcross: "Buscar en todas tus bóvedas y notas",
    noResults: "Sin resultados", searching: "Buscando...",
    welcome: "Bienvenido a Sidewinder",
    welcomeDesc: "Tus notas, siempre al alcance. Sidewinder se oculta en el borde de tu pantalla hasta que lo necesites.",
    vaultsAndNotes: "Bóvedas y Notas",
    vaultsDesc: "Añade cualquier carpeta como bóveda — incluyendo bóvedas de Obsidian. Todos los archivos .md aparecen como notas.",
    threeViewModes: "Tres Modos de Vista",
    viewModesDesc: "Acordeón (A) — expandir/colapsar. Completo (F) — uno a la vez. Siempre Abierto (O) — todos visibles.",
    shortcutsTitle: "Atajos de Teclado", shortcutsDesc: "Trabaja más rápido con atajos. Personalízalos en Ajustes.",
    getStarted: "Comenzar", skip: "Saltar", next: "Siguiente",
    elysiumNotes: "Notas de Elysium", openApp: "Abrir App", writeNote: "Escribe una nota...", send: "Enviar",
    openInElysium: "Abrir en Elysium", elysiumIntegration: "Integración Elysium", elysiumOpenTime: "Elysium OpenTime",
    openTimeFolder: "Carpeta OpenTime", yourName: "Tu Nombre", yourEmail: "Tu Email",
    autoDetect: "Detectar automáticamente de Elysium", noteVaultsDisplay: "Visualización de bóvedas de notas",
    showItemTypes: "Mostrar tipos de elementos", separateSection: "Sección separada", integratedView: "Integrado con bóvedas",
    autoImportNotes: "Auto-importar bóvedas de notas",
    today: "Hoy", progress: "Progreso", tags: "Etiquetas", links: "Enlaces",
    sun: "Dom", mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb",
    january: "Enero", february: "Febrero", march: "Marzo", april: "Abril", may: "Mayo", june: "Junio",
    july: "Julio", august: "Agosto", september: "Septiembre", october: "Octubre", november: "Noviembre", december: "Diciembre",
    event: "Evento", appointment: "Cita", task: "Tarea", goal: "Meta", habit: "Hábito", reminder: "Recordatorio", project: "Proyecto",
    toDo: "Por Hacer", inProgress: "En Progreso", cancelled: "Cancelado",
    bold: "Negrita", italic: "Cursiva", underline: "Subrayado", strikethrough: "Tachado",
    bulletList: "Lista con viñetas", numberedList: "Lista numerada",
    heading1: "Título 1", heading2: "Título 2", heading3: "Título 3", paragraph: "Párrafo",
  },
  fr: {
    settings: "Paramètres", search: "Rechercher", calendar: "Calendrier",
    cancel: "Annuler", save: "Enregistrer", delete_: "Supprimer", create: "Créer", done: "Terminé", back: "Retour", quit: "Quitter",
    loading: "Chargement...", apply: "Appliquer", applyChanges: "Appliquer les modifications", applying: "Application...",
    panelWillCollapse: "Le panneau se repliera et se repositionnera lors de l'application",
    edit: "Modifier", view: "Vue", sort: "Trier", override: "personnalisé", language: "Langue",
    untitled: "Sans titre", nameRequired: "Le nom est requis", pathRequired: "Le chemin est requis",
    failedToAdd: "Échec de l'ajout du coffre", failedToSave: "Échec de la sauvegarde",
    vaults: "Coffres", addVault: "Ajouter un Coffre", editVault: "Modifier le Coffre", removeVault: "Supprimer le coffre", moveVault: "Déplacer le coffre...",
    noVaultsYet: "Aucun coffre", addFirstVault: "Ajoutez votre premier coffre",
    name: "Nom", path: "Chemin", browse: "Parcourir", includeSubfolders: "Inclure les sous-dossiers", openElysium: "Ouvrir Elysium",
    notes: "Notes", addNote: "+ Ajouter", noNotes: "Aucune note dans ce dossier", noteTitle: "Titre de la note...",
    deleteNote: "Supprimer la note", moveNote: "Déplacer vers...", moveHere: "Déplacer ici", currentLocation: "Emplacement actuel",
    renameNote: "Renommer", pinToTop: "Épingler en haut", unpin: "Désépingler",
    saving: "Sauvegarde...", saved: "Sauvegardé", noNotesYet: "Aucune note pour l'instant",
    newFolder: "Nouveau dossier", folderName: "Nom du dossier...", deleteFolder: "Supprimer le dossier", moveFolder: "Déplacer le dossier...", noSubfolders: "Aucun sous-dossier",
    accordion: "Accordéon", full: "Complet", alwaysOpen: "Toujours Ouvert",
    accordionMode: "Mode accordéon", fullNoteMode: "Mode note complète", alwaysOpenMode: "Mode toujours ouvert", clickToCycle: "cliquer pour changer",
    markdown: "Markdown", code: "Code", plainText: "Texte Brut", richText: "Texte Enrichi",
    alphabetical: "A-Z", recent: "Récent", manual: "Manuel",
    newestFirst: "Plus récent d'abord", oldestFirst: "Plus ancien d'abord", zFirst: "Z d'abord", aFirst: "A d'abord",
    general: "Général", appearance: "Apparence", creation: "Création", integration: "Intégration", shortcuts: "Raccourcis", account: "Compte",
    screenEdge: "Bord de l'écran", alignment: "Alignement",
    handleWidth: "Largeur de la poignée", handleHeight: "Hauteur de la poignée", panelWidth: "Largeur du panneau", panelHeight: "Hauteur du panneau",
    animationSpeed: "Vitesse d'animation", animationDelay: "Délai d'animation",
    closeOnBlur: "Fermer le panneau en cliquant à l'extérieur", launchAtLogin: "Lancer au démarrage",
    multiMonitor: "Multi-écran", stayOnOne: "Rester sur un écran", followActive: "Suivre l'écran actif",
    quitSidewinder: "Quitter Sidewinder",
    alignAlongHorizontal: "Alignement le long de l'axe horizontal", alignAlongVertical: "Alignement le long de l'axe vertical",
    instant: "Instantané", none: "Aucun",
    theme: "Thème", dark: "Sombre", light: "Clair",
    frostedGlass: "Verre givré", frostedGlassDesc: "Effet de flou translucide sur la poignée et le panneau",
    proColorsDesc: "Couleurs, polices et typographie personnalisées disponibles avec Sidewinder Pro.",
    fontFamily: "Police", fontSize: "Taille de police", lineHeight: "Hauteur de ligne", paragraphSpacing: "Espacement des paragraphes",
    handleColor: "Poignée", panelColorLabel: "Panneau", accentColor: "Accent", textColor: "Texte",
    defaultFormatting: "Format par défaut", newNotePosition: "Position nouvelle note", newVaultPosition: "Position nouveau coffre",
    top: "Haut", bottom: "Bas", left: "Gauche", right: "Droite", center: "Centre",
    keyboardShortcuts: "Raccourcis Clavier", pressKeys: "Appuyez sur les touches...", resetDefaults: "Réinitialiser",
    togglePanel: "Basculer le Panneau", openSettings: "Ouvrir les Paramètres", openCalendar: "Ouvrir le Calendrier",
    goBack: "Retour", quitApp: "Quitter l'App", newNote: "Nouvelle Note", newFolderShortcut: "Nouveau Dossier",
    licenseStatus: "État de la Licence", freePlan: "Plan Gratuit", pro: "Sidewinder Pro",
    upgradeToPro: "Passer à Pro", purchase: "Acheter", licenseKey: "Clé de Licence", activate: "Activer",
    freeVaultLimit: "3 coffres inclus", proUnlimited: "Coffres illimités, thèmes personnalisés et plus",
    elysiumSubscriber: "Abonné Elysium", enterLicenseKey: "Entrez la clé de licence",
    searchNotes: "Rechercher des notes...", searchAcross: "Rechercher dans tous vos coffres et notes",
    noResults: "Aucun résultat", searching: "Recherche en cours...",
    welcome: "Bienvenue dans Sidewinder",
    welcomeDesc: "Vos notes, toujours à portée de main. Sidewinder se cache au bord de votre écran jusqu'à ce que vous en ayez besoin.",
    vaultsAndNotes: "Coffres et Notes",
    vaultsDesc: "Ajoutez n'importe quel dossier comme coffre — y compris les coffres Obsidian. Tous les fichiers .md apparaissent comme notes.",
    threeViewModes: "Trois Modes d'Affichage",
    viewModesDesc: "Accordéon (A) — développer/réduire. Complet (F) — un à la fois. Toujours Ouvert (O) — tous visibles.",
    shortcutsTitle: "Raccourcis Clavier", shortcutsDesc: "Travaillez plus vite avec les raccourcis. Personnalisez-les dans les Paramètres.",
    getStarted: "Commencer", skip: "Passer", next: "Suivant",
    elysiumNotes: "Notes Elysium", openApp: "Ouvrir l'App", writeNote: "Écrire une note...", send: "Envoyer",
    openInElysium: "Ouvrir dans Elysium", elysiumIntegration: "Intégration Elysium", elysiumOpenTime: "Elysium OpenTime",
    openTimeFolder: "Dossier OpenTime", yourName: "Votre Nom", yourEmail: "Votre Email",
    autoDetect: "Détection automatique depuis Elysium", noteVaultsDisplay: "Affichage des coffres de notes",
    showItemTypes: "Afficher les types d'éléments", separateSection: "Section séparée", integratedView: "Intégré aux coffres",
    autoImportNotes: "Auto-importer les coffres de notes",
    today: "Aujourd'hui", progress: "Progression", tags: "Tags", links: "Liens",
    sun: "Dim", mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam",
    january: "Janvier", february: "Février", march: "Mars", april: "Avril", may: "Mai", june: "Juin",
    july: "Juillet", august: "Août", september: "Septembre", october: "Octobre", november: "Novembre", december: "Décembre",
    event: "Événement", appointment: "Rendez-vous", task: "Tâche", goal: "Objectif", habit: "Habitude", reminder: "Rappel", project: "Projet",
    toDo: "À Faire", inProgress: "En Cours", cancelled: "Annulé",
    bold: "Gras", italic: "Italique", underline: "Souligné", strikethrough: "Barré",
    bulletList: "Liste à puces", numberedList: "Liste numérotée",
    heading1: "Titre 1", heading2: "Titre 2", heading3: "Titre 3", paragraph: "Paragraphe",
  },
  de: {
    settings: "Einstellungen", search: "Suchen", calendar: "Kalender",
    cancel: "Abbrechen", save: "Speichern", delete_: "Löschen", create: "Erstellen", done: "Fertig", back: "Zurück", quit: "Beenden",
    loading: "Laden...", apply: "Anwenden", applyChanges: "Änderungen anwenden", applying: "Wird angewendet...",
    panelWillCollapse: "Das Panel wird beim Anwenden eingeklappt und neu positioniert",
    edit: "Bearbeiten", view: "Ansicht", sort: "Sortieren", override: "angepasst", language: "Sprache",
    untitled: "Unbenannt", nameRequired: "Name ist erforderlich", pathRequired: "Pfad ist erforderlich",
    failedToAdd: "Tresor konnte nicht hinzugefügt werden", failedToSave: "Speichern fehlgeschlagen",
    vaults: "Tresore", addVault: "Tresor hinzufügen", editVault: "Tresor bearbeiten", removeVault: "Tresor entfernen", moveVault: "Tresor verschieben...",
    noVaultsYet: "Noch keine Tresore", addFirstVault: "Fügen Sie Ihren ersten Tresor hinzu",
    name: "Name", path: "Pfad", browse: "Durchsuchen", includeSubfolders: "Unterordner einschließen", openElysium: "Elysium öffnen",
    notes: "Notizen", addNote: "+ Hinzufügen", noNotes: "Keine Notizen in diesem Ordner", noteTitle: "Notiztitel...",
    deleteNote: "Notiz löschen", moveNote: "Verschieben nach...", moveHere: "Hierhin verschieben", currentLocation: "Aktueller Ort",
    renameNote: "Umbenennen", pinToTop: "Oben anheften", unpin: "Lösen",
    saving: "Speichert...", saved: "Gespeichert", noNotesYet: "Noch keine Notizen",
    newFolder: "Neuer Ordner", folderName: "Ordnername...", deleteFolder: "Ordner löschen", moveFolder: "Ordner verschieben...", noSubfolders: "Keine Unterordner",
    accordion: "Akkordeon", full: "Vollständig", alwaysOpen: "Immer Offen",
    accordionMode: "Akkordeon-Modus", fullNoteMode: "Vollansicht-Modus", alwaysOpenMode: "Immer-offen-Modus", clickToCycle: "klicken zum Wechseln",
    markdown: "Markdown", code: "Code", plainText: "Klartext", richText: "Rich Text",
    alphabetical: "A-Z", recent: "Aktuell", manual: "Manuell",
    newestFirst: "Neueste zuerst", oldestFirst: "Älteste zuerst", zFirst: "Z zuerst", aFirst: "A zuerst",
    general: "Allgemein", appearance: "Aussehen", creation: "Erstellung", integration: "Integration", shortcuts: "Tastenkürzel", account: "Konto",
    screenEdge: "Bildschirmrand", alignment: "Ausrichtung",
    handleWidth: "Griffbreite", handleHeight: "Griffhöhe", panelWidth: "Panelbreite", panelHeight: "Panelhöhe",
    animationSpeed: "Animationsgeschwindigkeit", animationDelay: "Animationsverzögerung",
    closeOnBlur: "Panel beim Klicken außerhalb schließen", launchAtLogin: "Beim Anmelden starten",
    multiMonitor: "Multi-Monitor", stayOnOne: "Auf einem Monitor bleiben", followActive: "Aktivem Monitor folgen",
    quitSidewinder: "Sidewinder beenden",
    alignAlongHorizontal: "Ausrichtung entlang der horizontalen Achse", alignAlongVertical: "Ausrichtung entlang der vertikalen Achse",
    instant: "Sofort", none: "Keine",
    theme: "Design", dark: "Dunkel", light: "Hell",
    frostedGlass: "Milchglas", frostedGlassDesc: "Transluzenter Unschärfeeffekt auf Griff und Panel",
    proColorsDesc: "Eigene Farben, Schriften und Typografie mit Sidewinder Pro verfügbar.",
    fontFamily: "Schriftart", fontSize: "Schriftgröße", lineHeight: "Zeilenhöhe", paragraphSpacing: "Absatzabstand",
    handleColor: "Griff", panelColorLabel: "Panel", accentColor: "Akzent", textColor: "Text",
    defaultFormatting: "Standardformat", newNotePosition: "Neue-Notiz-Position", newVaultPosition: "Neue-Tresor-Position",
    top: "Oben", bottom: "Unten", left: "Links", right: "Rechts", center: "Mitte",
    keyboardShortcuts: "Tastenkürzel", pressKeys: "Tasten drücken...", resetDefaults: "Zurücksetzen",
    togglePanel: "Panel umschalten", openSettings: "Einstellungen öffnen", openCalendar: "Kalender öffnen",
    goBack: "Zurück", quitApp: "App beenden", newNote: "Neue Notiz", newFolderShortcut: "Neuer Ordner",
    licenseStatus: "Lizenzstatus", freePlan: "Kostenloser Plan", pro: "Sidewinder Pro",
    upgradeToPro: "Auf Pro upgraden", purchase: "Kaufen", licenseKey: "Lizenzschlüssel", activate: "Aktivieren",
    freeVaultLimit: "3 Tresore enthalten", proUnlimited: "Unbegrenzte Tresore, eigene Designs und mehr",
    elysiumSubscriber: "Elysium-Abonnent", enterLicenseKey: "Lizenzschlüssel eingeben",
    searchNotes: "Notizen suchen...", searchAcross: "In allen Tresoren und Notizen suchen",
    noResults: "Keine Ergebnisse", searching: "Suche...",
    welcome: "Willkommen bei Sidewinder",
    welcomeDesc: "Ihre Notizen, immer griffbereit. Sidewinder versteckt sich am Bildschirmrand, bis Sie es brauchen.",
    vaultsAndNotes: "Tresore & Notizen",
    vaultsDesc: "Fügen Sie jeden Ordner als Tresor hinzu — auch Obsidian-Tresore. Alle .md-Dateien erscheinen als Notizen.",
    threeViewModes: "Drei Ansichtsmodi",
    viewModesDesc: "Akkordeon (A) — auf/zuklappen. Vollständig (F) — einer nach dem anderen. Immer Offen (O) — alle sichtbar.",
    shortcutsTitle: "Tastenkürzel", shortcutsDesc: "Arbeiten Sie schneller mit Tastenkombinationen. Passen Sie diese in den Einstellungen an.",
    getStarted: "Loslegen", skip: "Überspringen", next: "Weiter",
    elysiumNotes: "Elysium-Notizen", openApp: "App öffnen", writeNote: "Notiz schreiben...", send: "Senden",
    openInElysium: "In Elysium öffnen", elysiumIntegration: "Elysium-Integration", elysiumOpenTime: "Elysium OpenTime",
    openTimeFolder: "OpenTime-Ordner", yourName: "Ihr Name", yourEmail: "Ihre E-Mail",
    autoDetect: "Automatisch von Elysium erkennen", noteVaultsDisplay: "Anzeige der Notiz-Tresore",
    showItemTypes: "Elementtypen anzeigen", separateSection: "Separater Bereich", integratedView: "In Tresore integriert",
    autoImportNotes: "Notiz-Tresore automatisch importieren",
    today: "Heute", progress: "Fortschritt", tags: "Tags", links: "Links",
    sun: "So", mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat: "Sa",
    january: "Januar", february: "Februar", march: "März", april: "April", may: "Mai", june: "Juni",
    july: "Juli", august: "August", september: "September", october: "Oktober", november: "November", december: "Dezember",
    event: "Ereignis", appointment: "Termin", task: "Aufgabe", goal: "Ziel", habit: "Gewohnheit", reminder: "Erinnerung", project: "Projekt",
    toDo: "Zu Erledigen", inProgress: "In Bearbeitung", cancelled: "Abgesagt",
    bold: "Fett", italic: "Kursiv", underline: "Unterstrichen", strikethrough: "Durchgestrichen",
    bulletList: "Aufzählung", numberedList: "Nummerierte Liste",
    heading1: "Überschrift 1", heading2: "Überschrift 2", heading3: "Überschrift 3", paragraph: "Absatz",
  },
  ja: {
    settings: "設定", search: "検索", calendar: "カレンダー",
    cancel: "キャンセル", save: "保存", delete_: "削除", create: "作成", done: "完了", back: "戻る", quit: "終了",
    loading: "読み込み中...", apply: "適用", applyChanges: "変更を適用", applying: "適用中...",
    panelWillCollapse: "適用するとパネルが折りたたまれて再配置されます",
    edit: "編集", view: "表示", sort: "並び替え", override: "カスタム", language: "言語",
    untitled: "無題", nameRequired: "名前は必須です", pathRequired: "パスは必須です",
    failedToAdd: "保管庫の追加に失敗しました", failedToSave: "保存に失敗しました",
    vaults: "保管庫", addVault: "保管庫追加", editVault: "保管庫編集", removeVault: "保管庫削除", moveVault: "保管庫を移動...",
    noVaultsYet: "保管庫がありません", addFirstVault: "最初の保管庫を追加",
    name: "名前", path: "パス", browse: "参照", includeSubfolders: "サブフォルダーを含む", openElysium: "Elysiumを開く",
    notes: "ノート", addNote: "+ 追加", noNotes: "このフォルダにノートがありません", noteTitle: "ノートのタイトル...",
    deleteNote: "ノートを削除", moveNote: "移動先...", moveHere: "ここに移動", currentLocation: "現在の場所",
    renameNote: "名前変更", pinToTop: "上部に固定", unpin: "固定解除",
    saving: "保存中...", saved: "保存済み", noNotesYet: "ノートはまだありません",
    newFolder: "新しいフォルダ", folderName: "フォルダ名...", deleteFolder: "フォルダを削除", moveFolder: "フォルダを移動...", noSubfolders: "サブフォルダなし",
    accordion: "アコーディオン", full: "フル", alwaysOpen: "常に開く",
    accordionMode: "アコーディオンモード", fullNoteMode: "フルノートモード", alwaysOpenMode: "常に開くモード", clickToCycle: "クリックで切替",
    markdown: "Markdown", code: "コード", plainText: "プレーンテキスト", richText: "リッチテキスト",
    alphabetical: "A-Z", recent: "最近", manual: "手動",
    newestFirst: "新しい順", oldestFirst: "古い順", zFirst: "Z順", aFirst: "A順",
    general: "一般", appearance: "外観", creation: "作成", integration: "連携", shortcuts: "ショートカット", account: "アカウント",
    screenEdge: "画面端", alignment: "配置",
    handleWidth: "ハンドル幅", handleHeight: "ハンドル高さ", panelWidth: "パネル幅", panelHeight: "パネル高さ",
    animationSpeed: "アニメーション速度", animationDelay: "アニメーション遅延",
    closeOnBlur: "外部クリックでパネルを閉じる", launchAtLogin: "ログイン時に起動",
    multiMonitor: "マルチモニター", stayOnOne: "1つのモニターに固定", followActive: "アクティブモニターに追従",
    quitSidewinder: "Sidewinderを終了",
    alignAlongHorizontal: "水平軸に沿った配置", alignAlongVertical: "垂直軸に沿った配置",
    instant: "即時", none: "なし",
    theme: "テーマ", dark: "ダーク", light: "ライト",
    frostedGlass: "すりガラス", frostedGlassDesc: "ハンドルとパネルの半透明ぼかし効果",
    proColorsDesc: "カスタムカラー、フォント、タイポグラフィはSidewinder Proで利用可能です。",
    fontFamily: "フォント", fontSize: "フォントサイズ", lineHeight: "行の高さ", paragraphSpacing: "段落間隔",
    handleColor: "ハンドル", panelColorLabel: "パネル", accentColor: "アクセント", textColor: "テキスト",
    defaultFormatting: "デフォルトフォーマット", newNotePosition: "新規ノートの位置", newVaultPosition: "新規保管庫の位置",
    top: "上", bottom: "下", left: "左", right: "右", center: "中央",
    keyboardShortcuts: "キーボードショートカット", pressKeys: "キーを押してください...", resetDefaults: "リセット",
    togglePanel: "パネル切替", openSettings: "設定を開く", openCalendar: "カレンダーを開く",
    goBack: "戻る", quitApp: "アプリ終了", newNote: "新規ノート", newFolderShortcut: "新規フォルダ",
    licenseStatus: "ライセンス状態", freePlan: "無料プラン", pro: "Sidewinder Pro",
    upgradeToPro: "Proにアップグレード", purchase: "購入", licenseKey: "ライセンスキー", activate: "有効化",
    freeVaultLimit: "3保管庫含む", proUnlimited: "無制限保管庫、カスタムテーマなど",
    elysiumSubscriber: "Elysium購読者", enterLicenseKey: "ライセンスキーを入力",
    searchNotes: "ノートを検索...", searchAcross: "すべての保管庫とノートを横断検索",
    noResults: "結果なし", searching: "検索中...",
    welcome: "Sidewinderへようこそ",
    welcomeDesc: "あなたのノートは常に手の届くところに。Sidewinderは必要になるまで画面の端に隠れています。",
    vaultsAndNotes: "保管庫とノート",
    vaultsDesc: "任意のフォルダを保管庫として追加 — Obsidian保管庫を含む。すべての.mdファイルがノートとして表示されます。",
    threeViewModes: "3つの表示モード",
    viewModesDesc: "アコーディオン (A) — 展開/折りたたみ。フル (F) — 1つずつ。常に開く (O) — すべて表示。",
    shortcutsTitle: "キーボードショートカット", shortcutsDesc: "ショートカットで効率アップ。設定でカスタマイズできます。",
    getStarted: "始める", skip: "スキップ", next: "次へ",
    elysiumNotes: "Elysiumノート", openApp: "アプリを開く", writeNote: "ノートを書く...", send: "送信",
    openInElysium: "Elysiumで開く", elysiumIntegration: "Elysium連携", elysiumOpenTime: "Elysium OpenTime",
    openTimeFolder: "OpenTimeフォルダ", yourName: "あなたの名前", yourEmail: "あなたのメール",
    autoDetect: "Elysiumから自動検出", noteVaultsDisplay: "ノート保管庫の表示",
    showItemTypes: "アイテムタイプを表示", separateSection: "別セクション", integratedView: "保管庫と統合",
    autoImportNotes: "ノート保管庫を自動インポート",
    today: "今日", progress: "進捗", tags: "タグ", links: "リンク",
    sun: "日", mon: "月", tue: "火", wed: "水", thu: "木", fri: "金", sat: "土",
    january: "1月", february: "2月", march: "3月", april: "4月", may: "5月", june: "6月",
    july: "7月", august: "8月", september: "9月", october: "10月", november: "11月", december: "12月",
    event: "イベント", appointment: "予定", task: "タスク", goal: "目標", habit: "習慣", reminder: "リマインダー", project: "プロジェクト",
    toDo: "未着手", inProgress: "進行中", cancelled: "キャンセル",
    bold: "太字", italic: "斜体", underline: "下線", strikethrough: "取り消し線",
    bulletList: "箇条書き", numberedList: "番号付きリスト",
    heading1: "見出し1", heading2: "見出し2", heading3: "見出し3", paragraph: "段落",
  },
  ko: {
    settings: "설정", search: "검색", calendar: "캘린더",
    cancel: "취소", save: "저장", delete_: "삭제", create: "만들기", done: "완료", back: "뒤로", quit: "종료",
    loading: "로딩 중...", apply: "적용", applyChanges: "변경 적용", applying: "적용 중...",
    panelWillCollapse: "적용 시 패널이 접히고 재배치됩니다",
    edit: "편집", view: "보기", sort: "정렬", override: "사용자 지정", language: "언어",
    untitled: "제목 없음", nameRequired: "이름은 필수입니다", pathRequired: "경로는 필수입니다",
    failedToAdd: "보관함 추가 실패", failedToSave: "저장 실패",
    vaults: "보관함", addVault: "보관함 추가", editVault: "보관함 편집", removeVault: "보관함 제거", moveVault: "보관함 이동...",
    noVaultsYet: "보관함이 없습니다", addFirstVault: "첫 번째 보관함을 추가하세요",
    name: "이름", path: "경로", browse: "찾아보기", includeSubfolders: "하위 폴더 포함", openElysium: "Elysium 열기",
    notes: "노트", addNote: "+ 추가", noNotes: "이 폴더에 노트가 없습니다", noteTitle: "노트 제목...",
    deleteNote: "노트 삭제", moveNote: "이동...", moveHere: "여기로 이동", currentLocation: "현재 위치",
    renameNote: "이름 변경", pinToTop: "상단 고정", unpin: "고정 해제",
    saving: "저장 중...", saved: "저장됨", noNotesYet: "아직 노트가 없습니다",
    newFolder: "새 폴더", folderName: "폴더 이름...", deleteFolder: "폴더 삭제", moveFolder: "폴더 이동...", noSubfolders: "하위 폴더 없음",
    accordion: "아코디언", full: "전체", alwaysOpen: "항상 열림",
    accordionMode: "아코디언 모드", fullNoteMode: "전체 노트 모드", alwaysOpenMode: "항상 열림 모드", clickToCycle: "클릭하여 전환",
    markdown: "Markdown", code: "코드", plainText: "일반 텍스트", richText: "서식 있는 텍스트",
    alphabetical: "A-Z", recent: "최근", manual: "수동",
    newestFirst: "최신 순", oldestFirst: "오래된 순", zFirst: "Z 순", aFirst: "A 순",
    general: "일반", appearance: "모양", creation: "생성", integration: "연동", shortcuts: "단축키", account: "계정",
    screenEdge: "화면 가장자리", alignment: "정렬",
    handleWidth: "핸들 너비", handleHeight: "핸들 높이", panelWidth: "패널 너비", panelHeight: "패널 높이",
    animationSpeed: "애니메이션 속도", animationDelay: "애니메이션 지연",
    closeOnBlur: "외부 클릭 시 패널 닫기", launchAtLogin: "로그인 시 실행",
    multiMonitor: "다중 모니터", stayOnOne: "하나의 모니터에 유지", followActive: "활성 모니터 따라가기",
    quitSidewinder: "Sidewinder 종료",
    alignAlongHorizontal: "수평축을 따른 정렬", alignAlongVertical: "수직축을 따른 정렬",
    instant: "즉시", none: "없음",
    theme: "테마", dark: "다크", light: "라이트",
    frostedGlass: "반투명 유리", frostedGlassDesc: "핸들과 패널의 반투명 블러 효과",
    proColorsDesc: "맞춤 색상, 글꼴 및 타이포그래피는 Sidewinder Pro에서 사용 가능합니다.",
    fontFamily: "글꼴", fontSize: "글꼴 크기", lineHeight: "줄 높이", paragraphSpacing: "단락 간격",
    handleColor: "핸들", panelColorLabel: "패널", accentColor: "강조", textColor: "텍스트",
    defaultFormatting: "기본 서식", newNotePosition: "새 노트 위치", newVaultPosition: "새 보관함 위치",
    top: "위", bottom: "아래", left: "왼쪽", right: "오른쪽", center: "가운데",
    keyboardShortcuts: "키보드 단축키", pressKeys: "키를 누르세요...", resetDefaults: "초기화",
    togglePanel: "패널 전환", openSettings: "설정 열기", openCalendar: "캘린더 열기",
    goBack: "뒤로", quitApp: "앱 종료", newNote: "새 노트", newFolderShortcut: "새 폴더",
    licenseStatus: "라이선스 상태", freePlan: "무료 플랜", pro: "Sidewinder Pro",
    upgradeToPro: "Pro로 업그레이드", purchase: "구매", licenseKey: "라이선스 키", activate: "활성화",
    freeVaultLimit: "3개 보관함 포함", proUnlimited: "무제한 보관함, 맞춤 테마 등",
    elysiumSubscriber: "Elysium 구독자", enterLicenseKey: "라이선스 키 입력",
    searchNotes: "노트 검색...", searchAcross: "모든 보관함과 노트에서 검색",
    noResults: "결과 없음", searching: "검색 중...",
    welcome: "Sidewinder에 오신 것을 환영합니다",
    welcomeDesc: "당신의 노트, 항상 손닿는 곳에. Sidewinder는 필요할 때까지 화면 가장자리에 숨어 있습니다.",
    getStarted: "시작하기", skip: "건너뛰기", next: "다음",
    send: "보내기", writeNote: "노트 작성...",
    openInElysium: "Elysium에서 열기", elysiumIntegration: "Elysium 연동", elysiumOpenTime: "Elysium OpenTime",
    openTimeFolder: "OpenTime 폴더", yourName: "이름", yourEmail: "이메일",
    autoDetect: "Elysium에서 자동 감지", noteVaultsDisplay: "노트 보관함 표시",
    showItemTypes: "항목 유형 표시", separateSection: "별도 섹션", integratedView: "보관함과 통합",
    autoImportNotes: "노트 보관함 자동 가져오기",
    today: "오늘", progress: "진행률", tags: "태그", links: "링크",
    sun: "일", mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토",
    january: "1월", february: "2월", march: "3월", april: "4월", may: "5월", june: "6월",
    july: "7월", august: "8월", september: "9월", october: "10월", november: "11월", december: "12월",
    event: "이벤트", appointment: "약속", task: "작업", goal: "목표", habit: "습관", reminder: "알림", project: "프로젝트",
    toDo: "할 일", inProgress: "진행 중", cancelled: "취소됨",
    bold: "굵게", italic: "기울임", underline: "밑줄", strikethrough: "취소선",
    bulletList: "글머리 기호", numberedList: "번호 매기기",
    heading1: "제목 1", heading2: "제목 2", heading3: "제목 3", paragraph: "단락",
  },
  zh: {
    settings: "设置", search: "搜索", calendar: "日历",
    cancel: "取消", save: "保存", delete_: "删除", create: "创建", done: "完成", back: "返回", quit: "退出",
    loading: "加载中...", apply: "应用", applyChanges: "应用更改", applying: "应用中...",
    panelWillCollapse: "应用后面板将折叠并重新定位",
    edit: "编辑", view: "视图", sort: "排序", override: "自定义", language: "语言",
    untitled: "未命名", nameRequired: "名称为必填", pathRequired: "路径为必填",
    failedToAdd: "添加仓库失败", failedToSave: "保存失败",
    vaults: "仓库", addVault: "添加仓库", editVault: "编辑仓库", removeVault: "移除仓库", moveVault: "移动仓库...",
    noVaultsYet: "暂无仓库", addFirstVault: "添加你的第一个仓库",
    name: "名称", path: "路径", browse: "浏览", includeSubfolders: "包含子文件夹", openElysium: "打开 Elysium",
    notes: "笔记", addNote: "+ 添加", noNotes: "此文件夹中没有笔记", noteTitle: "笔记标题...",
    deleteNote: "删除笔记", moveNote: "移动到...", moveHere: "移动到此处", currentLocation: "当前位置",
    renameNote: "重命名", pinToTop: "置顶", unpin: "取消置顶",
    saving: "保存中...", saved: "已保存", noNotesYet: "暂无笔记",
    newFolder: "新建文件夹", folderName: "文件夹名...", deleteFolder: "删除文件夹", moveFolder: "移动文件夹...", noSubfolders: "无子文件夹",
    accordion: "折叠", full: "完整", alwaysOpen: "常开",
    accordionMode: "折叠模式", fullNoteMode: "完整笔记模式", alwaysOpenMode: "常开模式", clickToCycle: "点击切换",
    general: "通用", appearance: "外观", creation: "创建", integration: "集成", shortcuts: "快捷键", account: "账户",
    screenEdge: "屏幕边缘", alignment: "对齐",
    theme: "主题", dark: "深色", light: "浅色",
    frostedGlass: "毛玻璃", frostedGlassDesc: "手柄和面板的半透明模糊效果",
    searchNotes: "搜索笔记...", noResults: "未找到结果", searching: "搜索中...",
    welcome: "欢迎使用 Sidewinder", getStarted: "开始使用", skip: "跳过", next: "下一步",
    send: "发送", writeNote: "写一条笔记...",
    openInElysium: "在 Elysium 中打开",
    today: "今天", progress: "进度", tags: "标签", links: "链接",
    sun: "日", mon: "一", tue: "二", wed: "三", thu: "四", fri: "五", sat: "六",
    january: "一月", february: "二月", march: "三月", april: "四月", may: "五月", june: "六月",
    july: "七月", august: "八月", september: "九月", october: "十月", november: "十一月", december: "十二月",
    event: "事件", appointment: "预约", task: "任务", goal: "目标", habit: "习惯", reminder: "提醒", project: "项目",
    toDo: "待办", inProgress: "进行中", cancelled: "已取消",
    bold: "粗体", italic: "斜体", underline: "下划线", strikethrough: "删除线",
    bulletList: "无序列表", numberedList: "有序列表",
    heading1: "标题1", heading2: "标题2", heading3: "标题3", paragraph: "段落",
  },
  "zh-TW": {
    settings: "設定", search: "搜尋", calendar: "日曆",
    cancel: "取消", save: "儲存", delete_: "刪除", create: "建立", done: "完成", back: "返回", quit: "結束",
    loading: "載入中...", apply: "套用", applyChanges: "套用變更", applying: "套用中...",
    panelWillCollapse: "套用後面板將摺疊並重新定位",
    edit: "編輯", view: "檢視", sort: "排序", override: "自訂", language: "語言",
    untitled: "未命名", nameRequired: "名稱為必填", pathRequired: "路徑為必填",
    vaults: "儲藏庫", addVault: "新增儲藏庫", editVault: "編輯儲藏庫", removeVault: "移除儲藏庫",
    notes: "筆記", addNote: "+ 新增", noNotes: "此資料夾中沒有筆記",
    newFolder: "新增資料夾", general: "一般", appearance: "外觀", shortcuts: "快捷鍵", account: "帳戶",
    theme: "主題", dark: "深色", light: "淺色",
    frostedGlass: "毛玻璃", frostedGlassDesc: "把手和面板的半透明模糊效果",
    searchNotes: "搜尋筆記...", noResults: "找不到結果", searching: "搜尋中...",
    welcome: "歡迎使用 Sidewinder", getStarted: "開始使用", skip: "略過", next: "下一步",
    send: "傳送", writeNote: "寫一則筆記...",
    today: "今天",
    sun: "日", mon: "一", tue: "二", wed: "三", thu: "四", fri: "五", sat: "六",
    january: "一月", february: "二月", march: "三月", april: "四月", may: "五月", june: "六月",
    july: "七月", august: "八月", september: "九月", october: "十月", november: "十一月", december: "十二月",
    bold: "粗體", italic: "斜體", underline: "底線", strikethrough: "刪除線",
  },
  pt: {
    settings: "Configurações", search: "Pesquisar", calendar: "Calendário",
    cancel: "Cancelar", save: "Salvar", delete_: "Excluir", create: "Criar", done: "Pronto", back: "Voltar", quit: "Sair",
    loading: "Carregando...", apply: "Aplicar", applyChanges: "Aplicar Alterações", applying: "Aplicando...",
    panelWillCollapse: "O painel será recolhido e reposicionado ao aplicar",
    edit: "Editar", view: "Visualizar", sort: "Ordenar", override: "personalizado", language: "Idioma",
    untitled: "Sem título", nameRequired: "Nome é obrigatório", pathRequired: "Caminho é obrigatório",
    failedToAdd: "Falha ao adicionar cofre", failedToSave: "Falha ao salvar",
    vaults: "Cofres", addVault: "Adicionar Cofre", editVault: "Editar Cofre", removeVault: "Remover cofre",
    notes: "Notas", addNote: "+ Adicionar", noNotes: "Nenhuma nota nesta pasta",
    newFolder: "Nova pasta", general: "Geral", appearance: "Aparência", shortcuts: "Atalhos", account: "Conta",
    theme: "Tema", dark: "Escuro", light: "Claro",
    frostedGlass: "Vidro fosco", frostedGlassDesc: "Efeito de desfoque translúcido na alça e painel",
    searchNotes: "Pesquisar notas...", noResults: "Nenhum resultado", searching: "Pesquisando...",
    welcome: "Bem-vindo ao Sidewinder", getStarted: "Começar", skip: "Pular", next: "Próximo",
    send: "Enviar", writeNote: "Escreva uma nota...",
    today: "Hoje",
    sun: "Dom", mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb",
    january: "Janeiro", february: "Fevereiro", march: "Março", april: "Abril", may: "Maio", june: "Junho",
    july: "Julho", august: "Agosto", september: "Setembro", october: "Outubro", november: "Novembro", december: "Dezembro",
    bold: "Negrito", italic: "Itálico", underline: "Sublinhado", strikethrough: "Tachado",
  },
  it: {
    settings: "Impostazioni", search: "Cerca", calendar: "Calendario",
    cancel: "Annulla", save: "Salva", delete_: "Elimina", create: "Crea", done: "Fatto", back: "Indietro", quit: "Esci",
    loading: "Caricamento...", apply: "Applica", applyChanges: "Applica Modifiche", applying: "Applicazione...",
    panelWillCollapse: "Il pannello si chiuderà e si riposizionerà quando applichi",
    edit: "Modifica", view: "Vista", sort: "Ordina", override: "personalizzato", language: "Lingua",
    untitled: "Senza titolo", nameRequired: "Il nome è obbligatorio", pathRequired: "Il percorso è obbligatorio",
    failedToAdd: "Impossibile aggiungere la cassaforte", failedToSave: "Salvataggio fallito",
    vaults: "Cassaforti", addVault: "Aggiungi Cassaforte", editVault: "Modifica Cassaforte", removeVault: "Rimuovi cassaforte",
    notes: "Note", addNote: "+ Aggiungi", noNotes: "Nessuna nota in questa cartella",
    newFolder: "Nuova cartella", general: "Generale", appearance: "Aspetto", shortcuts: "Scorciatoie", account: "Account",
    theme: "Tema", dark: "Scuro", light: "Chiaro",
    frostedGlass: "Vetro smerigliato", frostedGlassDesc: "Effetto sfocatura translucida su maniglia e pannello",
    searchNotes: "Cerca note...", noResults: "Nessun risultato", searching: "Ricerca...",
    welcome: "Benvenuto in Sidewinder", getStarted: "Inizia", skip: "Salta", next: "Avanti",
    send: "Invia", writeNote: "Scrivi una nota...",
    today: "Oggi",
    sun: "Dom", mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat: "Sab",
    january: "Gennaio", february: "Febbraio", march: "Marzo", april: "Aprile", may: "Maggio", june: "Giugno",
    july: "Luglio", august: "Agosto", september: "Settembre", october: "Ottobre", november: "Novembre", december: "Dicembre",
    bold: "Grassetto", italic: "Corsivo", underline: "Sottolineato", strikethrough: "Barrato",
  },
  ru: {
    settings: "Настройки", search: "Поиск", calendar: "Календарь",
    cancel: "Отмена", save: "Сохранить", delete_: "Удалить", create: "Создать", done: "Готово", back: "Назад", quit: "Выход",
    loading: "Загрузка...", apply: "Применить", applyChanges: "Применить изменения", applying: "Применение...",
    panelWillCollapse: "Панель свернётся и перепозиционируется при применении",
    edit: "Редактировать", view: "Вид", sort: "Сортировка", override: "пользовательский", language: "Язык",
    untitled: "Без названия", nameRequired: "Имя обязательно", pathRequired: "Путь обязателен",
    failedToAdd: "Не удалось добавить хранилище", failedToSave: "Не удалось сохранить",
    vaults: "Хранилища", addVault: "Добавить хранилище", editVault: "Редактировать хранилище", removeVault: "Удалить хранилище",
    notes: "Заметки", addNote: "+ Добавить", noNotes: "Нет заметок в этой папке",
    newFolder: "Новая папка", general: "Общие", appearance: "Оформление", shortcuts: "Горячие клавиши", account: "Аккаунт",
    theme: "Тема", dark: "Тёмная", light: "Светлая",
    frostedGlass: "Матовое стекло", frostedGlassDesc: "Полупрозрачный эффект размытия на ручке и панели",
    searchNotes: "Поиск заметок...", noResults: "Ничего не найдено", searching: "Поиск...",
    welcome: "Добро пожаловать в Sidewinder", getStarted: "Начать", skip: "Пропустить", next: "Далее",
    send: "Отправить", writeNote: "Написать заметку...",
    today: "Сегодня",
    sun: "Вс", mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб",
    january: "Январь", february: "Февраль", march: "Март", april: "Апрель", may: "Май", june: "Июнь",
    july: "Июль", august: "Август", september: "Сентябрь", october: "Октябрь", november: "Ноябрь", december: "Декабрь",
    bold: "Жирный", italic: "Курсив", underline: "Подчёркнутый", strikethrough: "Зачёркнутый",
  },
  ar: {
    settings: "الإعدادات", search: "بحث", calendar: "التقويم",
    cancel: "إلغاء", save: "حفظ", delete_: "حذف", create: "إنشاء", done: "تم", back: "رجوع", quit: "خروج",
    loading: "جاري التحميل...", apply: "تطبيق", applyChanges: "تطبيق التغييرات", applying: "جاري التطبيق...",
    edit: "تحرير", view: "عرض", sort: "ترتيب", override: "مخصص", language: "اللغة",
    untitled: "بدون عنوان",
    vaults: "الخزائن", notes: "الملاحظات", addNote: "+ إضافة", noNotes: "لا توجد ملاحظات في هذا المجلد",
    newFolder: "مجلد جديد", general: "عام", appearance: "المظهر", shortcuts: "اختصارات", account: "الحساب",
    theme: "السمة", dark: "داكن", light: "فاتح",
    frostedGlass: "زجاج مصنفر", frostedGlassDesc: "تأثير ضبابي شفاف على المقبض واللوحة",
    searchNotes: "البحث في الملاحظات...", noResults: "لا نتائج", searching: "جاري البحث...",
    welcome: "مرحبًا بك في Sidewinder", getStarted: "ابدأ", skip: "تخطي", next: "التالي",
    send: "إرسال",
    today: "اليوم",
    sun: "أحد", mon: "اثن", tue: "ثلث", wed: "أربع", thu: "خمس", fri: "جمع", sat: "سبت",
    january: "يناير", february: "فبراير", march: "مارس", april: "أبريل", may: "مايو", june: "يونيو",
    july: "يوليو", august: "أغسطس", september: "سبتمبر", october: "أكتوبر", november: "نوفمبر", december: "ديسمبر",
  },
  tr: {
    settings: "Ayarlar", search: "Ara", calendar: "Takvim",
    cancel: "İptal", save: "Kaydet", delete_: "Sil", create: "Oluştur", done: "Tamam", back: "Geri", quit: "Çık",
    loading: "Yükleniyor...", apply: "Uygula", applyChanges: "Değişiklikleri Uygula", applying: "Uygulanıyor...",
    edit: "Düzenle", view: "Görünüm", sort: "Sırala", override: "özel", language: "Dil",
    untitled: "Başlıksız",
    vaults: "Kasalar", notes: "Notlar", addNote: "+ Ekle", noNotes: "Bu klasörde not yok",
    newFolder: "Yeni klasör", general: "Genel", appearance: "Görünüm", shortcuts: "Kısayollar", account: "Hesap",
    theme: "Tema", dark: "Koyu", light: "Açık",
    frostedGlass: "Buzlu cam", frostedGlassDesc: "Tutamak ve panelde yarı saydam bulanıklaştırma efekti",
    searchNotes: "Not ara...", noResults: "Sonuç bulunamadı", searching: "Aranıyor...",
    welcome: "Sidewinder'a Hoş Geldiniz", getStarted: "Başla", skip: "Atla", next: "İleri",
    send: "Gönder",
    today: "Bugün",
    sun: "Paz", mon: "Pzt", tue: "Sal", wed: "Çar", thu: "Per", fri: "Cum", sat: "Cmt",
    january: "Ocak", february: "Şubat", march: "Mart", april: "Nisan", may: "Mayıs", june: "Haziran",
    july: "Temmuz", august: "Ağustos", september: "Eylül", october: "Ekim", november: "Kasım", december: "Aralık",
  },
  nl: {
    settings: "Instellingen", search: "Zoeken", calendar: "Kalender",
    cancel: "Annuleren", save: "Opslaan", delete_: "Verwijderen", create: "Aanmaken", done: "Klaar", back: "Terug", quit: "Afsluiten",
    loading: "Laden...", apply: "Toepassen", applyChanges: "Wijzigingen toepassen", applying: "Toepassen...",
    edit: "Bewerken", view: "Weergave", sort: "Sorteren", override: "aangepast", language: "Taal",
    untitled: "Naamloos",
    vaults: "Kluizen", notes: "Notities", addNote: "+ Toevoegen", noNotes: "Geen notities in deze map",
    newFolder: "Nieuwe map", general: "Algemeen", appearance: "Uiterlijk", shortcuts: "Sneltoetsen", account: "Account",
    theme: "Thema", dark: "Donker", light: "Licht",
    frostedGlass: "Matglas", frostedGlassDesc: "Doorschijnend vervagingseffect op handvat en paneel",
    searchNotes: "Notities zoeken...", noResults: "Geen resultaten", searching: "Zoeken...",
    welcome: "Welkom bij Sidewinder", getStarted: "Aan de slag", skip: "Overslaan", next: "Volgende",
    send: "Versturen",
    today: "Vandaag",
    sun: "Zo", mon: "Ma", tue: "Di", wed: "Wo", thu: "Do", fri: "Vr", sat: "Za",
    january: "Januari", february: "Februari", march: "Maart", april: "April", may: "Mei", june: "Juni",
    july: "Juli", august: "Augustus", september: "September", october: "Oktober", november: "November", december: "December",
  },
  pl: {
    settings: "Ustawienia", search: "Szukaj", calendar: "Kalendarz",
    cancel: "Anuluj", save: "Zapisz", delete_: "Usuń", create: "Utwórz", done: "Gotowe", back: "Wstecz", quit: "Zamknij",
    loading: "Ładowanie...", apply: "Zastosuj", applyChanges: "Zastosuj zmiany", applying: "Stosowanie...",
    edit: "Edytuj", view: "Widok", sort: "Sortuj", override: "niestandardowy", language: "Język",
    untitled: "Bez tytułu",
    vaults: "Skarbce", notes: "Notatki", addNote: "+ Dodaj", noNotes: "Brak notatek w tym folderze",
    newFolder: "Nowy folder", general: "Ogólne", appearance: "Wygląd", shortcuts: "Skróty", account: "Konto",
    theme: "Motyw", dark: "Ciemny", light: "Jasny",
    frostedGlass: "Matowe szkło", frostedGlassDesc: "Efekt półprzezroczystego rozmycia na uchwycie i panelu",
    searchNotes: "Szukaj notatek...", noResults: "Brak wyników", searching: "Szukanie...",
    welcome: "Witamy w Sidewinder", getStarted: "Rozpocznij", skip: "Pomiń", next: "Dalej",
    send: "Wyślij",
    today: "Dziś",
    sun: "Ndz", mon: "Pon", tue: "Wt", wed: "Śr", thu: "Czw", fri: "Pt", sat: "Sob",
    january: "Styczeń", february: "Luty", march: "Marzec", april: "Kwiecień", may: "Maj", june: "Czerwiec",
    july: "Lipiec", august: "Sierpień", september: "Wrzesień", october: "Październik", november: "Listopad", december: "Grudzień",
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
