import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

// Διαθέσιμες γλώσσες
export type Language = "en" | "el" | "de";

// Όλες οι μεταφράσεις
const translations = {
  en: {
    // App
    appName: "MyTools",
    appSubtitle: "Professional Tool Management",

    // Dashboard
    assignTool: "Assign Tool",
    returnTool: "Return Tool",
    findTool: "Find Tool",
    items: "Items",
    inUse: "In Use",
    available: "Available",
    workers: "Workers",
    needsAttention: "Needs Attention",
    everythingGood: "Everything looks good.",
    more: "More",
    warehouse: "Warehouse",
    scan: "Scan",
    history: "History",
    exportPdf: "Export PDF",
    lowStock: "Low stock",
    qty: "Qty",

    // Inventory
    inventory: "Inventory",
    searchPlaceholder: "Search tool, worker, location...",
    refreshFromCloud: "Refresh from Cloud",
    addAssignTools: "+ Add / Assign Tools",
    noToolsYet: "No tools yet",
    noResultsFound: "No results found",
    loading: "Loading...",
    saveChanges: "Save Changes",
    deleteTool: "Delete Tool",
    close: "Close",
    quantity: "Quantity",
    status: "Status",

    // Workers
    workerAssignments: "Active worker assignments",
    toolLines: "Tool Lines",
    totalQty: "Total Qty",
    noBorrowedTools: "No borrowed tools",
    returnAll: "↩️ Return All",
    copy: "Copy",
    delete: "Delete",

    // Worker Details
    workerOverview: "Worker Overview",
    assignedTools: "Assigned tools and project status",
    broken: "Broken",
    missing: "Missing",
    edit: "Edit",
    return: "Return",
    addMoreTools: "+ Add More Tools",

    // Settings
    settings: "Settings",
    appPreferences: "App preferences and data control",
    companyName: "Company Name",
    saveSettings: "Save Settings",
    darkMode: "Dark Mode",
    account: "Account",
    loggedIn: "You are logged in. Tap below to sign out.",
    logout: "Logout",
    addWorker: "👷 Add Worker",
    addWorkerHint: "Add a worker to your company. They must first create an account with this email.",
    workerEmail: "Worker email",
    addWorkerButton: "Add Worker",
    adding: "Adding...",
    backup: "Backup",
    backupHint: "Export or import tools, workers, warehouse stock and history.",
    exportBackup: "Export Backup",
    importBackup: "Import Backup",
    dangerZone: "Danger Zone",
    resetHint: "Reset deletes all local app data from this device.",
    resetApp: "Reset Application",

    // Login
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    email: "Email",
    password: "Password",
    login: "Login",
    register: "Create Account",
    alreadyHaveAccount: "Already have an account? Login",
    continueWithoutLogin: "Continue without login",
    companyNamePlaceholder: "Company Name (e.g. Elektro GmbH)",

    // Alerts
    saved: "Saved",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",

    // Language
    language: "Language",
    selectLanguage: "Select Language",
  },

  el: {
    // App
    appName: "MyTools",
    appSubtitle: "Επαγγελματική Διαχείριση Εργαλείων",

    // Dashboard
    assignTool: "Ανάθεση Εργαλείου",
    returnTool: "Επιστροφή Εργαλείου",
    findTool: "Εύρεση Εργαλείου",
    items: "Αντικείμενα",
    inUse: "Σε Χρήση",
    available: "Διαθέσιμα",
    workers: "Εργαζόμενοι",
    needsAttention: "Χρειάζεται Προσοχή",
    everythingGood: "Όλα είναι καλά.",
    more: "Περισσότερα",
    warehouse: "Αποθήκη",
    scan: "Σάρωση",
    history: "Ιστορικό",
    exportPdf: "Εξαγωγή PDF",
    lowStock: "Χαμηλό απόθεμα",
    qty: "Ποσ",

    // Inventory
    inventory: "Απογραφή",
    searchPlaceholder: "Αναζήτηση εργαλείου, εργαζόμενου...",
    refreshFromCloud: "Ανανέωση από Cloud",
    addAssignTools: "+ Προσθήκη / Ανάθεση",
    noToolsYet: "Δεν υπάρχουν εργαλεία",
    noResultsFound: "Δεν βρέθηκαν αποτελέσματα",
    loading: "Φόρτωση...",
    saveChanges: "Αποθήκευση",
    deleteTool: "Διαγραφή",
    close: "Κλείσιμο",
    quantity: "Ποσότητα",
    status: "Κατάσταση",

    // Workers
    workerAssignments: "Ενεργές αναθέσεις εργαζομένων",
    toolLines: "Γραμμές",
    totalQty: "Συνολική Ποσ.",
    noBorrowedTools: "Δεν υπάρχουν δανεισμένα",
    returnAll: "↩️ Επιστροφή Όλων",
    copy: "Αντιγραφή",
    delete: "Διαγραφή",

    // Worker Details
    workerOverview: "Επισκόπηση Εργαζόμενου",
    assignedTools: "Ανατεθειμένα εργαλεία και project",
    broken: "Χαλασμένο",
    missing: "Λείπει",
    edit: "Επεξεργασία",
    return: "Επιστροφή",
    addMoreTools: "+ Προσθήκη Εργαλείων",

    // Settings
    settings: "Ρυθμίσεις",
    appPreferences: "Προτιμήσεις και έλεγχος δεδομένων",
    companyName: "Όνομα Εταιρείας",
    saveSettings: "Αποθήκευση",
    darkMode: "Σκοτεινή Λειτουργία",
    account: "Λογαριασμός",
    loggedIn: "Είστε συνδεδεμένοι. Πατήστε για αποσύνδεση.",
    logout: "Αποσύνδεση",
    addWorker: "👷 Προσθήκη Εργαζόμενου",
    addWorkerHint: "Προσθέστε εργαζόμενο. Πρέπει πρώτα να δημιουργήσει λογαριασμό.",
    workerEmail: "Email εργαζόμενου",
    addWorkerButton: "Προσθήκη",
    adding: "Προσθήκη...",
    backup: "Αντίγραφο Ασφαλείας",
    backupHint: "Εξαγωγή ή εισαγωγή δεδομένων.",
    exportBackup: "Εξαγωγή",
    importBackup: "Εισαγωγή",
    dangerZone: "Επικίνδυνη Ζώνη",
    resetHint: "Διαγράφει όλα τα τοπικά δεδομένα.",
    resetApp: "Επαναφορά Εφαρμογής",

    // Login
    welcomeBack: "Καλώς ήρθατε",
    createAccount: "Δημιουργία λογαριασμού",
    email: "Email",
    password: "Κωδικός",
    login: "Σύνδεση",
    register: "Δημιουργία Λογαριασμού",
    alreadyHaveAccount: "Έχετε ήδη λογαριασμό; Σύνδεση",
    continueWithoutLogin: "Συνέχεια χωρίς σύνδεση",
    companyNamePlaceholder: "Όνομα εταιρείας",

    // Alerts
    saved: "Αποθηκεύτηκε",
    error: "Σφάλμα",
    success: "Επιτυχία",
    cancel: "Ακύρωση",
    confirm: "Επιβεβαίωση",
    back: "Πίσω",

    // Language
    language: "Γλώσσα",
    selectLanguage: "Επιλογή Γλώσσας",
  },

  de: {
    // App
    appName: "MyTools",
    appSubtitle: "Professionelle Werkzeugverwaltung",

    // Dashboard
    assignTool: "Werkzeug zuweisen",
    returnTool: "Werkzeug zurückgeben",
    findTool: "Werkzeug suchen",
    items: "Artikel",
    inUse: "In Verwendung",
    available: "Verfügbar",
    workers: "Mitarbeiter",
    needsAttention: "Aufmerksamkeit erforderlich",
    everythingGood: "Alles in Ordnung.",
    more: "Mehr",
    warehouse: "Lager",
    scan: "Scannen",
    history: "Verlauf",
    exportPdf: "PDF exportieren",
    lowStock: "Niedriger Bestand",
    qty: "Menge",

    // Inventory
    inventory: "Inventar",
    searchPlaceholder: "Werkzeug, Mitarbeiter suchen...",
    refreshFromCloud: "Aus Cloud aktualisieren",
    addAssignTools: "+ Hinzufügen / Zuweisen",
    noToolsYet: "Noch keine Werkzeuge",
    noResultsFound: "Keine Ergebnisse",
    loading: "Laden...",
    saveChanges: "Änderungen speichern",
    deleteTool: "Werkzeug löschen",
    close: "Schließen",
    quantity: "Menge",
    status: "Status",

    // Workers
    workerAssignments: "Aktive Mitarbeiterzuweisungen",
    toolLines: "Werkzeugzeilen",
    totalQty: "Gesamt",
    noBorrowedTools: "Keine ausgeliehenen Werkzeuge",
    returnAll: "↩️ Alle zurückgeben",
    copy: "Kopieren",
    delete: "Löschen",

    // Worker Details
    workerOverview: "Mitarbeiterübersicht",
    assignedTools: "Zugewiesene Werkzeuge und Projekt",
    broken: "Defekt",
    missing: "Fehlt",
    edit: "Bearbeiten",
    return: "Zurückgeben",
    addMoreTools: "+ Werkzeuge hinzufügen",

    // Settings
    settings: "Einstellungen",
    appPreferences: "App-Einstellungen",
    companyName: "Firmenname",
    saveSettings: "Speichern",
    darkMode: "Dunkelmodus",
    account: "Konto",
    loggedIn: "Sie sind angemeldet. Tippen zum Abmelden.",
    logout: "Abmelden",
    addWorker: "👷 Mitarbeiter hinzufügen",
    addWorkerHint: "Mitarbeiter zur Firma hinzufügen.",
    workerEmail: "Mitarbeiter E-Mail",
    addWorkerButton: "Hinzufügen",
    adding: "Hinzufügen...",
    backup: "Datensicherung",
    backupHint: "Daten exportieren oder importieren.",
    exportBackup: "Exportieren",
    importBackup: "Importieren",
    dangerZone: "Gefahrenzone",
    resetHint: "Löscht alle lokalen Daten.",
    resetApp: "App zurücksetzen",

    // Login
    welcomeBack: "Willkommen zurück",
    createAccount: "Konto erstellen",
    email: "E-Mail",
    password: "Passwort",
    login: "Anmelden",
    register: "Konto erstellen",
    alreadyHaveAccount: "Haben Sie ein Konto? Anmelden",
    continueWithoutLogin: "Ohne Anmeldung fortfahren",
    companyNamePlaceholder: "Firmenname (z.B. Elektro GmbH)",

    // Alerts
    saved: "Gespeichert",
    error: "Fehler",
    success: "Erfolg",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    back: "Zurück",

    // Language
    language: "Sprache",
    selectLanguage: "Sprache auswählen",
  },
};

const LANGUAGE_KEY = "mytools-language";

// Παίρνει τη γλώσσα του κινητού
const getDeviceLanguage = (): Language => {
  const locale =
    Platform.OS === "ios"
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        "en"
      : NativeModules.I18nManager?.localeIdentifier || "en";

  if (locale.startsWith("el")) return "el";
  if (locale.startsWith("de")) return "de";
  return "en";
};

let currentLanguage: Language = getDeviceLanguage();

// Φορτώνει αποθηκευμένη γλώσσα
export const loadLanguage = async () => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (saved && (saved === "en" || saved === "el" || saved === "de")) {
    currentLanguage = saved as Language;
  }
};

// Αλλάζει γλώσσα
export const setLanguage = async (lang: Language) => {
  currentLanguage = lang;
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

// Επιστρέφει τρέχουσα γλώσσα
export const getLanguage = (): Language => currentLanguage;

// Μεταφράζει
export const t = (key: keyof typeof translations.en): string => {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
};

export default translations;