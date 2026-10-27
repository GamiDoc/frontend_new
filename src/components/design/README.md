# Design System: guida per la parte grafica

La logica del Design System è già completa. Manca solo la grafica: oggi le pagine hanno markup essenziale, classi `ds-*` e nessuno stile. Questa guida dice cosa si può cambiare liberamente e cosa no.

## Dove sta cosa

| File                                    | Contenuto                                                               | Si tocca per la grafica?  |
| --------------------------------------- | ----------------------------------------------------------------------- | ------------------------- |
| `src/pages/design/DesignSpark.jsx`      | Step 0 "The Spark" (`page = 'ds-spark'`)                                | sì, il markup             |
| `src/pages/design/DesignSection.jsx`    | una qualsiasi delle 7 sezioni (`ds-section`)                            | sì, il markup             |
| `src/pages/design/DesignPathChoice.jsx` | "Where to next?" (`ds-path`)                                            | sì, il markup             |
| `src/pages/design/DesignDashboard.jsx`  | "Your project overview" (`ds-dashboard`)                                | sì, il markup             |
| `src/components/design/*.jsx`           | barra in alto, campi, form di sezione, pulsante bozza, promemoria login | sì, il markup             |
| `src/data/designSections.js`            | domande, opzioni, descrizioni di ogni sezione                           | solo i testi (vedi sotto) |
| `src/context/DesignContext.jsx`         | tutta la logica: salvataggi, ordine delle sezioni, dashboard            | no                        |
| `src/api/design.js`                     | chiamate al backend                                                     | no                        |

Ogni file `.jsx` comincia con un commento che spiega cosa fa la pagina o il componente e quali classi usa.

## Regole

1. **Il markup si può riscrivere.** Struttura, tag e classi sono liberi, a patto di lasciare:
    - le chiamate alle azioni (`onClick={() => continueFrom(...)}`, `onChange(...)`, ecc.);
    - i valori letti da `useDesign()`.
2. **Il CSS va in `src/index.css`.** Mettilo in un blocco `/* ===== DESIGN SYSTEM ===== */` in fondo al file, come per le altre sezioni dell'app. Tutte le classi del Design System iniziano con `ds-`, quindi non si scontrano con il resto.
3. **Testi e opzioni dei form** stanno in `designSections.js`.
    - Si possono cambiare `label`, `question`, `description` e `placeholder`.
    - Non vanno cambiati `key` né il testo delle opzioni già usate: finiscono nel backend e nel PDF, e cambiarli rende illeggibili i dati già salvati.
4. **Stati da stilare**:
    - `:disabled` sui pulsanti, che vale mentre si salva (`saving`);
    - `ds-option--selected` / `aria-pressed` / `aria-checked` per le opzioni scelte;
    - `data-unset="true"` sugli slider non ancora impostati;
    - `ds-dashboard-card--complete | --in_progress | --current | --not_started`;
    - `ds-step-segment--done | --current`;
    - `.ds-overview-btn:disabled`, finché la dashboard non è sbloccata.
5. **Le icone** sono nel componente `Icon` (`src/components/Icon.jsx`); per aggiungerne una si aggiunge una voce all'oggetto `icons`.

## Mappa delle classi

| Classe                                                                                                                                           | Dove                | Cosa è                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------------------------------------- |
| `ds-page`, `ds-page--spark / --section / --path / --dashboard / --locked`                                                                        | tutte le pagine     | contenitore di pagina                    |
| `ds-page--context`, `--timeline`, `--personification`, `--gameful-core`, `--technology`, `--impacts`, `--evaluation`                             | `ds-section`        | stile di una singola sezione             |
| `ds-main`, `ds-intro`, `ds-error`, `ds-loading`                                                                                                  | tutte le pagine     | corpo, introduzione, errore, caricamento |
| `ds-actions`, `ds-btn`, `ds-btn--primary / --secondary / --link`                                                                                 | tutte le pagine     | barra dei pulsanti in fondo              |
| `ds-step-header`, `ds-step-count`, `ds-step-segments`, `ds-step-segment`, `ds-step-label`, `ds-overview-btn`                                     | `DesignStepHeader`  | barra "STEP n OF 8"                      |
| `ds-group`, `ds-group--<id>`, `ds-group-phase`, `ds-group-title`, `ds-group-question`, `ds-group-description`                                    | `DesignSectionForm` | card bianche dei mockup                  |
| `ds-tabs`, `ds-tab`, `ds-tab--onboarding / --engagement / --mastering / --fidelity`                                                              | Experience Timeline | schede colorate in alto                  |
| `ds-loop`, `ds-loop--short / --long / --social`, `ds-loop-badge`, `ds-loop-title`                                                                | Gameful Core        | righe apribili dei game loop             |
| `ds-field`, `ds-field--chips / --cards / --radio / --segmented / --select / --slider / --text`, `ds-field-label`                                 | `DesignField`       | singolo campo                            |
| `ds-options`, `ds-option`, `ds-option--selected`, `ds-option-title`, `ds-option-description`, `ds-option-detail`                                 | `DesignField`       | chip, card e voci radio                  |
| `ds-range`, `ds-range-value`, `ds-select`, `ds-textarea`                                                                                         | `DesignField`       | slider, menu a tendina, testo            |
| `ds-path-options`, `ds-path-option`, `ds-path-option--selected`, `ds-path-badge`, `ds-path-title`, `ds-path-blurb`, `ds-path-tags`               | `ds-path`           | le due card del percorso                 |
| `ds-dashboard-nav`, `ds-dashboard-nav-item`                                                                                                      | `ds-dashboard`      | barra delle sezioni in alto              |
| `ds-dashboard-header`, `ds-dashboard-overall`, `ds-dashboard-percent`, `ds-progress`                                                             | `ds-dashboard`      | testata con percentuale e barra          |
| `ds-dashboard-cards`, `ds-dashboard-card`, `ds-dashboard-card--<stato>`, `ds-card-title`, `ds-card-status`, `ds-card-summary`, `ds-card-percent` | `ds-dashboard`      | card delle 7 sezioni                     |
| `ds-reports-latest`, `ds-reports-history`                                                                                                        | `ds-dashboard`      | link ai PDF                              |
| `ds-draft-status`                                                                                                                                | `SaveDraftButton`   | messaggio "Draft saved."                 |
| `ds-login-reminder`                                                                                                                              | `LoginReminder`     | promemoria login per gli ospiti          |

## Cosa manca nei mockup (da disegnare)

- Le sezioni **Technology**, **Impacts & Benefits** ed **Evaluation & Feedback**. I loro campi in `designSections.js` sono provvisori (`provisional: true`).
- Il promemoria di login per gli ospiti (`LoginReminder`) e il pulsante **Skip this section**.
- Lo **storico dei PDF** in dashboard e la conferma "Draft saved.".
- Il **chatbot** e "Improve with AI": non ancora implementati, per ora non hanno markup.
