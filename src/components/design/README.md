# Design System: guida per la parte grafica

La logica del Design System è già completa. Manca solo la grafica: oggi le pagine hanno markup essenziale, classi `ds-*` e nessuno stile. Questa guida dice cosa si può cambiare liberamente e cosa no.

## Dove sta cosa

| File                                   | Contenuto                                                               | Si tocca per la grafica?  |
| -------------------------------------- | ----------------------------------------------------------------------- | ------------------------- |
| `src/pages/design/DesignSpark.jsx`     | Step 0 "The Spark" (`page = 'ds-spark'`)                                | sì, il markup             |
| `src/pages/design/DesignSection.jsx`   | una qualsiasi delle 6 sezioni (`ds-section`)                            | sì, il markup             |
| `src/pages/design/DesignDashboard.jsx` | "Your project overview" (`ds-dashboard`)                                | sì, il markup             |
| `src/components/design/*.jsx`          | barra in alto, campi, form di sezione, pulsante bozza, promemoria login | sì, il markup             |
| `src/data/designSections.js`           | domande, opzioni, descrizioni di ogni sezione                           | solo i testi (vedi sotto) |
| `src/context/DesignContext.jsx`        | tutta la logica: salvataggi, ordine delle sezioni, dashboard            | no                        |
| `src/api/design.js`                    | chiamate al backend                                                     | no                        |

Ogni file `.jsx` comincia con un commento che spiega cosa fa la pagina o il componente e quali classi usa.

## Regole

1. **Il markup si può riscrivere.** Struttura, tag e classi sono liberi, a patto di lasciare:
    - le chiamate alle azioni (`onClick={() => continueFrom(...)}`, `onChange(...)`, ecc.);
    - i valori letti da `useDesign()`.
2. **Il CSS va in `src/styles/`** (vedi `src/styles/index.css`): layout comune in `layout/ds-page.css` e `layout/ds-stepper.css`, una pagina in `pages/design-<pagina>.css` (es. `design-spark.css`, `design-context.css`). Per stilare una sola sezione usa `.ds-page--<id sezione>`. Tutte le classi del Design System iniziano con `ds-`, quindi non si scontrano con il resto.
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

| Classe                                                                                                                                                                                                      | Dove                | Cosa è                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------- |
| `ds-page`, `ds-page--spark / --section / --dashboard / --locked`                                                                                                                                            | tutte le pagine     | contenitore di pagina                               |
| `ds-page--context`, `--timeline`, `--personalization`, `--gameful-core`, `--feedback`, `--technical`                                                                                                        | `ds-section`        | stile di una singola sezione                        |
| `ds-main`, `ds-intro`, `ds-error`, `ds-loading`                                                                                                                                                             | tutte le pagine     | corpo, introduzione, errore, caricamento            |
| `ds-actions`, `ds-btn`, `ds-btn--primary / --secondary / --link`                                                                                                                                            | tutte le pagine     | barra dei pulsanti in fondo                         |
| `ds-step-header`, `ds-step-count`, `ds-step-segments`, `ds-step-segment`, `ds-step-label`, `ds-overview-btn`                                                                                                | `DesignStepHeader`  | barra "STEP n OF 6"                                 |
| `ds-group`, `ds-group--<id>`, `ds-group--collapsible` (un `<details>`), `ds-group-header`, `ds-group-title`, `ds-group-description`                                                                         | `DesignSectionForm` | card bianche dei mockup                             |
| `ds-field`, `ds-field--chips / --cards / --checklist / --checks / --slider / --input / --text / --loop / --list`, `ds-field--half`, `ds-field-label`, `ds-field-heading`, `ds-field-title`, `ds-field-hint` | `DesignField`       | singolo campo                                       |
| `ds-options`, `ds-option`, `ds-option--selected`, `ds-option--other`, `ds-option-plus`, `ds-option-title`, `ds-option-description`, `ds-other-input`, `ds-info`                                             | `DesignField`       | chip e card ("Other" + suo campo di testo, icona ⓘ) |
| `ds-checks`, `ds-checks--cols-<n>`, `ds-check`, `ds-check-input`, `ds-check-title`, `ds-check-description`                                                                                                  | `DesignField`       | liste di checkbox                                   |
| `ds-loop`, `ds-loop-badge`, `ds-loop-description`                                                                                                                                                           | Gameful Core        | righe apribili Core loop / Long loop                |
| `ds-list`, `ds-list-tabs`, `ds-list-tab`, `ds-list-tab--active`, `ds-list-add`, `ds-list-item`, `ds-list-item-name`, `ds-list-remove`                                                                       | Feedback            | feedback component ripetibili                       |
| `ds-range`, `ds-range-value`, `ds-input`, `ds-textarea`                                                                                                                                                     | `DesignField`       | slider e campi di testo                             |
| `ds-dashboard-nav`, `ds-dashboard-nav-item`                                                                                                                                                                 | `ds-dashboard`      | barra delle sezioni in alto                         |
| `ds-dashboard-header`, `ds-dashboard-overall`, `ds-dashboard-percent`, `ds-progress`                                                                                                                        | `ds-dashboard`      | testata con percentuale e barra                     |
| `ds-dashboard-cards`, `ds-dashboard-card`, `ds-dashboard-card--<stato>`, `ds-card-title`, `ds-card-status`, `ds-card-summary`, `ds-card-percent`                                                            | `ds-dashboard`      | card delle 6 sezioni                                |
| `ds-reports-latest`, `ds-reports-history`                                                                                                                                                                   | `ds-dashboard`      | link ai PDF                                         |
| `ds-draft-status`                                                                                                                                                                                           | `SaveDraftButton`   | messaggio "Draft saved."                            |
| `ds-login-reminder`                                                                                                                                                                                         | `LoginReminder`     | promemoria login per gli ospiti                     |

## Cosa manca nei mockup (Flow 2.0)

Grafica fatta: navbar, The Spark, The context. Gli altri step hanno solo markup e classi.
I campi con `provisional: true` in `designSections.js` non sono (del tutto) definiti dai mockup:

- **Re-onboarding** (Experience Timeline): la tendina è chiusa nel mockup.
- **Game loops** (Gameful Core): cosa si apre cliccando Core loop / Long loop; per ora un testo libero. L'upload dello schizzo del loop (PNG/JPEG) non c'è: il backend non ha un endpoint per i file del design.
- **Elementi di gioco** per categoria (Gameful Core): non sono nel mockup, seguono la tassonomia di Toda et al.
- **"Link with specific game element"** (Feedback): il selettore non è nel mockup; per ora un campo di testo.
- **Evaluation** (Feedback and Evaluation): la descrizione la cita ma il mockup mostra solo i feedback component.
- **Technical requirements**: le 9 tendine sono chiuse nel mockup; per ora un testo libero ciascuna.
- I testi delle icone ⓘ sono provvisori.
- Il promemoria di login per gli ospiti (`LoginReminder`), lo **storico dei PDF** in dashboard e la conferma "Draft saved.".
- Il **chatbot** e "Improve with AI": non ancora implementati.
