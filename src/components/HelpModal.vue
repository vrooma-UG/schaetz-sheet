<script setup>
defineEmits(['close'])
</script>

<template>
  <div class="help-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true" aria-labelledby="help-title">
    <div class="help-modal">
      <!-- Header -->
      <div class="help-header">
        <div class="help-header-left">
          <span class="material-symbols-outlined" style="font-size:24px;color:var(--primary);">help</span>
          <h2 id="help-title">So funktioniert Schätzsheet</h2>
        </div>
        <button class="help-close" @click="$emit('close')" aria-label="Hilfe schließen">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="help-body">
        <!-- Intro -->
        <p class="help-intro">
          Schätzsheet ist ein webbasiertes Werkzeug zur strukturierten Aufwandsschätzung und Risikobewertung für Projekte.
          Alle Daten werden lokal in deinem Browser gespeichert – es findet keine Übertragung an einen Server statt.
        </p>

        <!-- Workflow overview -->
        <div class="help-steps">
          <div class="help-step">
            <span class="help-step-number">1</span>
            <div>
              <strong>Projekt anlegen</strong>
              <p>Erstelle ein neues Projekt oder importiere ein vorhandenes JSON-File.</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">2</span>
            <div>
              <strong>Ressourcen konfigurieren</strong>
              <p>Definiere Rollen (mit Stundensatz) und Aufgabentypen (mit Aufschlägen).</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">3</span>
            <div>
              <strong>Aufgaben schätzen</strong>
              <p>Trage optimistische und pessimistische Aufwände pro Task ein. Schätzsheet berechnet den Mittelwert und die Gesamtkosten automatisch.</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">4</span>
            <div>
              <strong>Risiken erfassen</strong>
              <p>Dokumentiere Projektrisiken mit Eintrittswahrscheinlichkeit und Auswirkung.</p>
            </div>
          </div>
          <div class="help-step">
            <span class="help-step-number">5</span>
            <div>
              <strong>Dashboard auswerten</strong>
              <p>Verschaffe dir einen Überblick über Aufwand, Kosten und Varianzfaktoren pro Paket, Rolle und Aufgabentyp.</p>
            </div>
          </div>
        </div>

        <div class="help-sections">
          <!-- Projekte -->
          <details class="help-section" open>
            <summary class="help-section-title">
              <span class="material-symbols-outlined">folder_open</span>
              Projekte
            </summary>
            <div class="help-section-body">
              <ul>
                <li>Klicke auf <strong>„Neues Projekt"</strong> um ein leeres Projekt anzulegen.</li>
                <li>Wähle ein bestehendes Projekt aus der Liste aus, um es zu öffnen.</li>
                <li>Projekte können über das <strong>Stift-Symbol</strong> umbenannt werden.</li>
                <li>Mit <strong>„Export"</strong> wird das aktive Projekt als JSON-Datei heruntergeladen.</li>
                <li>Mit <strong>„Import"</strong> kannst du eine zuvor exportierte JSON-Datei wieder einlesen.</li>
              </ul>
            </div>
          </details>

          <!-- Schätzung -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">calculate</span>
              Schätzung
            </summary>
            <div class="help-section-body">
              <ul>
                <li>Jede Zeile repräsentiert eine <strong>Aufgabe (Task)</strong> mit Name, Paket, Rolle und Aufgabentyp.</li>
                <li>Gib einen <strong>optimistischen</strong> und einen <strong>pessimistischen</strong> Aufwand in Personentagen (PT) ein.</li>
                <li>Der <strong>Mittelwert (MW)</strong> wird als einfacher Durchschnitt berechnet: <em>(Opt + Pess) / 2</em>.</li>
                <li>Der <strong>Aufschlag-Faktor</strong> ergibt sich aus den konfigurierten Aufgabentypen (Ressourcen-Ansicht).</li>
                <li>Die <strong>Kosten</strong> berechnen sich aus MW × Faktor × Stundensatz der Rolle.</li>
                <li>Das <strong>Aggregations-Panel</strong> oben zeigt Gesamtaufwand und -kosten auf einen Blick.</li>
              </ul>
            </div>
          </details>

          <!-- Ressourcen -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">groups</span>
              Ressourcen
            </summary>
            <div class="help-section-body">
              <p><strong>Rollen:</strong></p>
              <ul>
                <li>Lege Rollen (z. B. „Senior Developer", „QA") mit einem täglichen Stundensatz (€/Tag) an.</li>
                <li>Jede Aufgabe in der Schätzung wird einer Rolle zugeordnet.</li>
              </ul>
              <p style="margin-top:8px;"><strong>Aufgabentypen:</strong></p>
              <ul>
                <li>Definiere Aufgabentypen (z. B. „Feature", „Bugfix") mit prozentualen Aufschlägen für PM, Testing, Risiko, Dokumentation und Gewährleistung.</li>
                <li>Der resultierende Faktor wird auf den geschätzten Aufwand addiert, um den Gesamtaufwand zu ermitteln.</li>
              </ul>
            </div>
          </details>

          <!-- Dashboard -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">dashboard</span>
              Dashboard
            </summary>
            <div class="help-section-body">
              <ul>
                <li>Das Dashboard zeigt Aufwand und Kosten gegliedert nach <strong>Paketen</strong>, <strong>Aufgabentypen</strong> und <strong>Rollen</strong>.</li>
                <li>Der <strong>Varianzfaktor</strong> (Pess/Opt-Verhältnis) gibt an, wie stark die Schätzungen streuen – je niedriger, desto sicherer die Schätzung.</li>
                <li>Balkendiagramme visualisieren die Verteilung der Kosten und helfen, Kostentreiber schnell zu erkennen.</li>
              </ul>
            </div>
          </details>

          <!-- Risiken -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">warning</span>
              Risiken
            </summary>
            <div class="help-section-body">
              <ul>
                <li>Füge Risiken mit <strong>Kategorie</strong> (Technisch, Organisatorisch, Extern, Finanziell), <strong>Eintrittswahrscheinlichkeit</strong> und <strong>Auswirkung</strong> hinzu.</li>
                <li>Der <strong>erwartete Puffer</strong> wird automatisch berechnet: Wahrscheinlichkeit (%) × Auswirkung (PT).</li>
                <li>Setze den Status eines Risikos auf <strong>„Mitigiert"</strong> oder <strong>„Geschlossen"</strong>, sobald Maßnahmen umgesetzt wurden.</li>
              </ul>
            </div>
          </details>

          <!-- Import / Export -->
          <details class="help-section">
            <summary class="help-section-title">
              <span class="material-symbols-outlined">sync_alt</span>
              Import &amp; Export
            </summary>
            <div class="help-section-body">
              <ul>
                <li>Projekte werden automatisch im <strong>Browser-Speicher (localStorage)</strong> gesichert – auch nach dem Schließen des Tabs.</li>
                <li>Mit <strong>„Export"</strong> lädst du das aktive Projekt als <code>.json</code>-Datei herunter, um es zu teilen oder zu archivieren.</li>
                <li>Mit <strong>„Import"</strong> lädst du eine exportierte Datei und öffnest sie als neues Projekt.</li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      <!-- Footer -->
      <div class="help-footer">
        <button class="btn-primary" style="border-radius:10px;" @click="$emit('close')">
          Verstanden
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.help-modal {
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── Header ── */
.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--outline-variant);
  flex-shrink: 0;
}

.help-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-header-left h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.help-close {
  background: transparent;
  border: none;
  padding: 4px;
  color: var(--on-surface-variant);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
  display: flex;
  align-items: center;
}

.help-close:hover { background: var(--surface-container-high); }

/* ── Body ── */
.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-intro {
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.6;
  background: var(--surface-container);
  border-radius: 12px;
  padding: 14px 16px;
}

/* ── Workflow Steps ── */
.help-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.help-step-number {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.help-step strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
  margin-bottom: 2px;
}

.help-step p {
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.5;
}

/* ── Accordion Sections ── */
.help-sections {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.help-section {
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  overflow: hidden;
}

.help-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
  cursor: pointer;
  list-style: none;
  background: var(--surface-container-low);
  transition: background 0.15s;
  user-select: none;
}

.help-section-title::-webkit-details-marker { display: none; }

.help-section-title:hover {
  background: var(--surface-container);
}

.help-section-title .material-symbols-outlined {
  font-size: 18px;
  color: var(--primary);
}

details[open] .help-section-title {
  background: var(--surface-container);
  border-bottom: 1px solid var(--outline-variant);
}

.help-section-body {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.help-section-body ul {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.help-section-body li { list-style: disc; }

.help-section-body strong { color: var(--on-surface); }

.help-section-body code {
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 12px;
}

/* ── Footer ── */
.help-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--outline-variant);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
