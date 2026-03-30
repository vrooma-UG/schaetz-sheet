# MiseEnPlace – Aufwandsschätzung für Projekte

> **MiseEnPlace** ist ein schlankes, browserbasiertes Werkzeug zur strukturierten Aufwandsschätzung und Risikobewertung für IT-Projekte. Alle Daten werden ausschließlich lokal im Browser gespeichert – keine Registrierung, kein Server, kein Datenverlust.

🔗 **Live-Demo:** [vrooma-ug.github.io/schaetz-sheet](https://vrooma-ug.github.io/schaetz-sheet/)

---

## ✨ Features

| Bereich | Beschreibung |
|---|---|
| **Projektverwaltung** | Mehrere Projekte anlegen, umbenennen, löschen und zwischen ihnen wechseln |
| **Ressourcen** | Rollen mit Tagessatz (€/Tag) sowie Aufgabentypen mit prozentualen Aufschlägen (PM, Testing, Risiko, Docs, Gewährleistung) konfigurieren |
| **Schätzmatrix** | Tasks mit optimistischem & pessimistischem Aufwand (Personentage) erfassen – Mittelwert und Kosten werden automatisch berechnet |
| **Risikomanagement** | Risiken nach Kategorie, Eintrittswahrscheinlichkeit und Auswirkung dokumentieren und verfolgen |
| **Dashboard** | Aufwand und Kosten aufgeschlüsselt nach Paketen, Rollen und Aufgabentypen mit Varianzfaktor-Visualisierung |
| **PDF-Export** | Komplettes Projekt als druckfertiges PDF exportieren |
| **JSON Import / Export** | Projekte als `.json`-Datei teilen, archivieren oder wiederherstellen |
| **Offline-fähig** | Kein Backend nötig – alle Daten im `localStorage` des Browsers |

---

## 🚀 Schnellstart (lokal)

**Voraussetzungen:** [Node.js](https://nodejs.org/) ≥ 18 und npm

```bash
# 1. Repository klonen
git clone https://github.com/vrooma-UG/schaetz-sheet.git
cd schaetz-sheet

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Die App ist danach unter `http://localhost:5173` erreichbar.

### Weitere Befehle

```bash
npm run build    # Produktions-Build in ./dist
npm run preview  # Build lokal vorschauen
```

---

## 🗂 Projektstruktur

```
src/
├── components/        # Vue-Komponenten (TaskMatrix, Dashboard, RiskManager, …)
├── models/            # Datenmodelle (createProject, createTask, createRisk, …)
├── services/          # JSON-Import/Export-Logik
├── utils/             # Berechnungen, PDF-Export
├── App.vue            # Root-Komponente & Navigation
└── main.js            # App-Einstiegspunkt
```

---

## 🛠 Tech Stack

| Technologie | Zweck |
|---|---|
| [Vue 3](https://vuejs.org/) | Reaktives UI-Framework (`<script setup>`) |
| [Vite](https://vitejs.dev/) | Build-Tool & Dev-Server |
| [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) | PDF-Generierung |
| [Material Symbols](https://fonts.google.com/icons) | Icon-Set |
| [Inter](https://rsms.me/inter/) | Schriftart |

---

## 📖 Bedienung (Kurzübersicht)

1. **Projekt anlegen** – Klicke auf „Neues Projekt" oder importiere eine `.json`-Datei.
2. **Ressourcen konfigurieren** – Definiere Rollen (mit Stundensatz) und Aufgabentypen (mit Aufschlägen) unter „Ressourcen".
3. **Aufgaben schätzen** – Trage unter „Schätzung" für jeden Task einen optimistischen und pessimistischen Aufwand ein.
4. **Risiken erfassen** – Dokumentiere Projektrisiken unter „Risiken".
5. **Dashboard auswerten** – Überblick über Kosten, Aufwand und Varianz.
6. **Exportieren** – Lade das Projekt als PDF oder JSON herunter.

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).  
© 2026 [vrooma UG](https://github.com/vrooma-UG)
