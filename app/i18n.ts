import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

export type Language = "en" | "el" | "de";

export const translations = {
  en: {
    appName: "MyTools", appSubtitle: "Professional Tool Management",
    assignTool: "Assign Tool", returnTool: "Return Tool", findTool: "Find Tool",
    items: "Items", inUse: "In Use", available: "Available", workers: "Workers",
    needsAttention: "Needs Attention", everythingGood: "Everything looks good.",
    more: "More", warehouse: "Warehouse", scan: "Scan", history: "History",
    exportPdf: "Export PDF", lowStock: "Low stock", qty: "Qty",
    inventory: "Inventory", searchPlaceholder: "Search tool, worker, location...",
    refreshFromCloud: "Refresh from Cloud", addAssignTools: "+ Add / Assign Tools",
    noToolsYet: "No tools yet", noResultsFound: "No results found", loading: "Loading...",
    saveChanges: "Save Changes", deleteTool: "Delete Tool", close: "Close",
    quantity: "Quantity", status: "Status",
    workerAssignments: "Active worker assignments", toolLines: "Tool Lines",
    totalQty: "Total Qty", noBorrowedTools: "No borrowed tools",
    returnAll: "↩️ Return All", copy: "Copy", delete: "Delete",
    workerOverview: "Worker Overview", assignedTools: "Assigned tools",
    broken: "Broken", missing: "Missing", edit: "Edit", return: "Return",
    addMoreTools: "+ Add More Tools",
    settings: "Settings", appPreferences: "App preferences and data control",
    companyName: "Company Name", saveSettings: "Save Settings", darkMode: "Dark Mode",
    account: "Account", loggedIn: "You are logged in.", logout: "Logout",
    addWorker: "👷 Add Worker", addWorkerHint: "Add a worker to your company.",
    workerEmail: "Worker email", addWorkerButton: "Add Worker", adding: "Adding...",
    backup: "Backup", backupHint: "Export or import data.",
    exportBackup: "Export Backup", importBackup: "Import Backup",
    dangerZone: "Danger Zone", resetHint: "Reset deletes all local data.",
    resetApp: "Reset Application",
    welcomeBack: "Welcome back", createAccount: "Create your account",
    email: "Email", password: "Password", login: "Login", register: "Create Account",
    alreadyHaveAccount: "Already have an account? Login",
    continueWithoutLogin: "Continue without login",
    companyNamePlaceholder: "Company Name (e.g. Elektro GmbH)",
    saved: "Saved", error: "Error", success: "Success",
    cancel: "Cancel", confirm: "Confirm", back: "Back",
    language: "Language", selectLanguage: "Select Language",
  },
  el: {
    appName: "MyTools", appSubtitle: "Επαγγελματική Διαχείριση Εργαλείων",
    assignTool: "Ανάθεση Εργαλείου", returnTool: "Επιστροφή Εργαλείου", findTool: "Εύρεση Εργαλείου",
    items: "Αντικείμενα", inUse: "Σε Χρήση", available: "Διαθέσιμα", workers: "Εργαζόμενοι",
    needsAttention: "Χρειάζεται Προσοχή", everythingGood: "Όλα είναι καλά.",
    more: "Περισσότερα", warehouse: "Αποθήκη", scan: "Σάρωση", history: "Ιστορικό",
    exportPdf: "Εξαγωγή PDF", lowStock: "Χαμηλό απόθεμα", qty: "Ποσ",
    inventory: "Απογραφή", searchPlaceholder: "Αναζήτηση εργαλείου, εργαζόμενου...",
    refreshFromCloud: "Ανανέωση από Cloud", addAssignTools: "+ Προσθήκη / Ανάθεση",
    noToolsYet: "Δεν υπάρχουν εργαλεία", noResultsFound: "Δεν βρέθηκαν αποτελέσματα", loading: "Φόρτωση...",
    saveChanges: "Αποθήκευση", deleteTool: "Διαγραφή", close: "Κλείσιμο",
    quantity: "Ποσότητα", status: "Κατάσταση",
    workerAssignments: "Ενεργές αναθέσεις", toolLines: "Γραμμές",
    totalQty: "Συνολική Ποσ.", noBorrowedTools: "Δεν υπάρχουν δανεισμένα",
    returnAll: "↩️ Επιστροφή Όλων", copy: "Αντιγραφή", delete: "Διαγραφή",
    workerOverview: "Επισκόπηση Εργαζόμενου", assignedTools: "Ανατεθειμένα εργαλεία",
    broken: "Χαλασμένο", missing: "Λείπει", edit: "Επεξεργασία", return: "Επιστροφή",
    addMoreTools: "+ Προσθήκη Εργαλείων",
    settings: "Ρυθμίσεις", appPreferences: "Προτιμήσεις εφαρμογής",
    companyName: "Όνομα Εταιρείας", saveSettings: "Αποθήκευση", darkMode: "Σκοτεινή Λειτουργία",
    account: "Λογαριασμός", loggedIn: "Είστε συνδεδεμένοι.", logout: "Αποσύνδεση",
    addWorker: "👷 Προσθήκη Εργαζόμενου", addWorkerHint: "Προσθέστε εργαζόμενο.",
    workerEmail: "Email εργαζόμενου", addWorkerButton: "Προσθήκη", adding: "Προσθήκη...",
    backup: "Αντίγραφο Ασφαλείας", backupHint: "Εξαγωγή ή εισαγωγή δεδομένων.",
    exportBackup: "Εξαγωγή", importBackup: "Εισαγωγή",
    dangerZone: "Επικίνδυνη Ζώνη", resetHint: "Διαγράφει όλα τα τοπικά δεδομένα.",
    resetApp: "Επαναφορά Εφαρμογής",
    welcomeBack: "Καλώς ήρθατε", createAccount: "Δημιουργία λογαριασμού",
    email: "Email", password: "Κωδικός", login: "Σύνδεση", register: "Δημιουργία Λογαριασμού",
    alreadyHaveAccount: "Έχετε λογαριασμό; Σύνδεση",
    continueWithoutLogin: "Συνέχεια χωρίς σύνδεση",
    companyNamePlaceholder: "Όνομα εταιρείας",
    saved: "Αποθηκεύτηκε", error: "Σφάλμα", success: "Επιτυχία",
    cancel: "Ακύρωση", confirm: "Επιβεβαίωση", back: "Πίσω",
    language: "Γλώσσα", selectLanguage: "Επιλογή Γλώσσας",
  },
  de: {
    appName: "MyTools", appSubtitle: "Professionelle Werkzeugverwaltung",
    assignTool: "Werkzeug zuweisen", returnTool: "Werkzeug zurückgeben", findTool: "Werkzeug suchen",
    items: "Artikel", inUse: "In Verwendung", available: "Verfügbar", workers: "Mitarbeiter",
    needsAttention: "Aufmerksamkeit erforderlich", everythingGood: "Alles in Ordnung.",
    more: "Mehr", warehouse: "Lager", scan: "Scannen", history: "Verlauf",
    exportPdf: "PDF exportieren", lowStock: "Niedriger Bestand", qty: "Menge",
    inventory: "Inventar", searchPlaceholder: "Werkzeug, Mitarbeiter suchen...",
    refreshFromCloud: "Aus Cloud aktualisieren", addAssignTools: "+ Hinzufügen / Zuweisen",
    noToolsYet: "Noch keine Werkzeuge", noResultsFound: "Keine Ergebnisse", loading: "Laden...",
    saveChanges: "Änderungen speichern", deleteTool: "Werkzeug löschen", close: "Schließen",
    quantity: "Menge", status: "Status",
    workerAssignments: "Aktive Zuweisungen", toolLines: "Werkzeugzeilen",
    totalQty: "Gesamt", noBorrowedTools: "Keine ausgeliehenen Werkzeuge",
    returnAll: "↩️ Alle zurückgeben", copy: "Kopieren", delete: "Löschen",
    workerOverview: "Mitarbeiterübersicht", assignedTools: "Zugewiesene Werkzeuge",
    broken: "Defekt", missing: "Fehlt", edit: "Bearbeiten", return: "Zurückgeben",
    addMoreTools: "+ Werkzeuge hinzufügen",
    settings: "Einstellungen", appPreferences: "App-Einstellungen",
    companyName: "Firmenname", saveSettings: "Speichern", darkMode: "Dunkelmodus",
    account: "Konto", loggedIn: "Sie sind angemeldet.", logout: "Abmelden",
    addWorker: "👷 Mitarbeiter hinzufügen", addWorkerHint: "Mitarbeiter hinzufügen.",
    workerEmail: "Mitarbeiter E-Mail", addWorkerButton: "Hinzufügen", adding: "Hinzufügen...",
    backup: "Datensicherung", backupHint: "Daten exportieren oder importieren.",
    exportBackup: "Exportieren", importBackup: "Importieren",
    dangerZone: "Gefahrenzone", resetHint: "Löscht alle lokalen Daten.",
    resetApp: "App zurücksetzen",
    welcomeBack: "Willkommen zurück", createAccount: "Konto erstellen",
    email: "E-Mail", password: "Passwort", login: "Anmelden", register: "Konto erstellen",
    alreadyHaveAccount: "Haben Sie ein Konto? Anmelden",
    continueWithoutLogin: "Ohne Anmeldung fortfahren",
    companyNamePlaceholder: "Firmenname (z.B. Elektro GmbH)",
    saved: "Gespeichert", error: "Fehler", success: "Erfolg",
    cancel: "Abbrechen", confirm: "Bestätigen", back: "Zurück",
    language: "Sprache", selectLanguage: "Sprache auswählen",
  },
};

const LANGUAGE_KEY = "mytools-language";

const getDeviceLanguage = (): Language => {
  const locale = Platform.OS === "ios"
    ? NativeModules.SettingsManager?.settings?.AppleLocale || NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || "en"
    : NativeModules.I18nManager?.localeIdentifier || "en";
  if (locale.startsWith("el")) return "el";
  if (locale.startsWith("de")) return "de";
  return "en";
};

export const loadLanguage = async () => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  const lang = (saved === "en" || saved === "el" || saved === "de") ? saved as Language : getDeviceLanguage();
  const { useToolStore } = require("../toolStore");
  useToolStore.getState().setLanguage(lang);
};

export const setLanguage = async (lang: Language) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  const { useToolStore } = require("../toolStore");
  useToolStore.getState().setLanguage(lang);
};

export const getLanguage = (): Language => {
  const { useToolStore } = require("../toolStore");
  return useToolStore.getState().language;
};

// Κύρια συνάρτηση μετάφρασης — παίρνει γλώσσα από Zustand
export const t = (key: keyof typeof translations.en): string => {
  const { useToolStore } = require("../toolStore");
  const lang = useToolStore.getState().language as Language;
  return translations[lang]?.[key] || translations.en[key] || key;
};

// Hook για χρήση σε components — εξασφαλίζει re-render
export const useTranslation = () => {
  const { useToolStore } = require("../toolStore");
  const language = useToolStore((state: any) => state.language) as Language;
  const tr = (key: keyof typeof translations.en): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
  return { t: tr, language };
};

export default translations;