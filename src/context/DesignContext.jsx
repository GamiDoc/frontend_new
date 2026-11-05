import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { designApi } from '../api/design';
import { sessionApi } from '../api/session';
import { projectApi } from '../api/project';
import { useWizard } from './WizardContext';
import { useAuth } from './AuthContext';
import {
    DESIGN_SECTIONS,
    getSection,
    contentToValues,
    valuesToContent,
    sectionProgress,
    hasAnyValue,
} from '../data/designSections';

/* ═══════════════════════════════════════════════════════════════════════════
   DesignContext — stato e logica della sezione Design System
   ═══════════════════════════════════════════════════════════════════════════

   Qui sta TUTTA la logica del Design System: le pagine e i componenti si limitano
   a leggere i valori con `useDesign()` e a chiamare le azioni. Chi lavora sulla
   grafica non ha bisogno di modificare questo file.

   Regole del flusso (le impone il backend, internal/design; qui vengono rispecchiate):
   - Step 0 "The Spark" facoltativo, poi le 6 sezioni in ordine (1 → 6).
   - Primo passaggio obbligato: le sezioni si aprono solo in ordine
     (si possono compilare o saltare). Finito il giro, navigazione libera.
   - "Riprendi" riapre l'ultima pagina visitata (salvata per progetto/sessione).
   - La dashboard si sblocca dopo il primo passaggio, se almeno una sezione ha contenuto.

   Due "scope" (dove vengono salvati i dati):
   - ospite  → sessione anonima /sessions/{id}/design, tenuta solo per la sessione del browser (FR-28)
   - utente  → progetto /projects/{id}/design, salvato in modo permanente (FR-29)

   ───────────────────────────────────────────────────────────────────────────
   Cosa espone useDesign() (l'API usata da pagine e componenti)
   ───────────────────────────────────────────────────────────────────────────
   Stato
     status            ultimo stato ricevuto dal backend (spark, cursor, sezioni…)
     drafts            valori dei form, per sezione: drafts[n][chiaveCampo]
     currentSection    numero della sezione aperta in `ds-section`
     loading           true mentre si avvia/apre un design
     saving            true durante un salvataggio (usalo per disabilitare i pulsanti)
     error             messaggio d'errore da mostrare, oppure null
     firstPassDone     true dopo il primo passaggio completo
     frontier          prossima sezione da fare nel primo passaggio (null dopo)
     dashboardUnlocked true quando la dashboard è accessibile
     progress          progress[n] = { filled, total, percent, complete }
     dashboardSections righe della dashboard: { number, title, summary, status, percent }
                       status: 'complete' | 'in_progress' | 'current' | 'not_started'
     overall           { percent, completeCount, sectionCount }
     isGuest           true se si lavora da ospite
     hasDesign         true se c'è un design caricato
     designInProgress  true se il design caricato è iniziato (banner "unfinished design")
     pendingDraftSave  true se "Save as a draft" aspetta il login
     draftSavedAt      timestamp dell'ultimo "Save as a draft" riuscito

   Helper di navigazione
     canOpenSection(n)  la sezione n si può aprire adesso?
     stepNumberOf(n)    posizione per "STEP x OF 6" (la Spark non è contata)
     previousOf(n)      sezione precedente (null = si torna alla Spark)
     nextOf(n)          sezione successiva (null = dopo l'ultima si va all'Overview)

   Azioni
     startDesign() · openDesignProject(id) · resumeDesign() · discardDesign()
     submitSpark(testo, { navigate }) · skipSpark()
     updateField(n, chiave, valore) · goToSection(n) · continueFrom(n, { skip }) · goBackFrom(n)
     loadDashboard() · goToDashboard() · continueWhereLeftOff()
     generateReports() · loadReportHistory()
     saveAsDraft()  → 'needs-auth' | true | false
   ═══════════════════════════════════════════════════════════════════════════ */

const DesignContext = createContext(null);

// sessionStorage: l'id della sessione ospite sparisce alla chiusura del browser (FR-28).
const GUEST_SCOPE_KEY = 'gamidoc.designSession';
// localStorage: ultimo progetto aperto, per riprenderlo dopo un reload.
const PROJECT_SCOPE_KEY = 'gamidoc.designProject';
// Attesa dopo l'ultima modifica prima dell'auto-save.
const AUTOSAVE_DELAY = 1000;
// Il Design System non ha (ancora) un campo per il nome del progetto.
const DEFAULT_PROJECT_NAME = 'Untitled design project';
// Codici d'errore del backend che indicano uno stato locale non allineato: si ricarica lo stato.
const FLOW_ERRORS = ['SECTION_LOCKED', 'DASHBOARD_LOCKED'];
// localStorage: ultima pagina visitata di ogni design, per "riprendi" (chiave + scope).
const LAST_PAGE_KEY = 'gamidoc.designLastPage';
// Ordine delle sezioni nel primo passaggio (lo stesso del backend, internal/design).
const ORDER = DESIGN_SECTIONS.map((s) => s.number);

// Nome logico della schermata → valore di `page` registrato in App.jsx.
const PAGE_FOR = {
    spark: 'ds-spark',
    section: 'ds-section',
    dashboard: 'ds-dashboard',
};

function readStoredScope() {
    try {
        const sid = sessionStorage.getItem(GUEST_SCOPE_KEY);
        if (sid) return { kind: 'session', id: sid };
        const pid = localStorage.getItem(PROJECT_SCOPE_KEY);
        if (pid) return { kind: 'project', id: pid };
    } catch {
        /* storage disabilitato: si riparte da zero */
    }
    return null;
}

function storeScope(scope) {
    try {
        sessionStorage.removeItem(GUEST_SCOPE_KEY);
        localStorage.removeItem(PROJECT_SCOPE_KEY);
        if (scope?.kind === 'session')
            sessionStorage.setItem(GUEST_SCOPE_KEY, scope.id);
        if (scope?.kind === 'project')
            localStorage.setItem(PROJECT_SCOPE_KEY, scope.id);
    } catch {
        /* storage disabilitato */
    }
}

function lastPageKey(scope) {
    return `${LAST_PAGE_KEY}.${scope.kind}.${scope.id}`;
}

// Ultima pagina visitata: { target: 'spark' | 'section' | 'dashboard', section? }.
function readLastPage(scope) {
    if (!scope) return null;
    try {
        return JSON.parse(localStorage.getItem(lastPageKey(scope)));
    } catch {
        return null;
    }
}

function storeLastPage(scope, target, section) {
    if (!scope) return;
    try {
        localStorage.setItem(
            lastPageKey(scope),
            JSON.stringify({ target, section }),
        );
    } catch {
        /* storage disabilitato */
    }
}

// Stato del backend → valori dei form di tutte le sezioni.
function valuesFromStatus(status) {
    const drafts = {};
    for (const section of DESIGN_SECTIONS) {
        drafts[section.number] = contentToValues(
            section,
            status?.sections?.[String(section.number)]?.content,
        );
    }
    return drafts;
}

// Forma confrontabile dei valori di una sezione, per capire se ci sono modifiche non salvate.
function serialize(section, values) {
    return JSON.stringify(valuesToContent(section, values));
}

export function DesignProvider({ children }) {
    const { setPage } = useWizard();
    const { user, loading: authLoading } = useAuth();

    const [scope, setScopeState] = useState(null);
    const [status, setStatus] = useState(null);
    const [drafts, setDrafts] = useState(() => valuesFromStatus(null));
    const [currentSection, setCurrentSection] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [pendingDraftSave, setPendingDraftSave] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState(null);

    // Le azioni sono asincrone: i ref garantiscono che leggano sempre i valori più recenti.
    const scopeRef = useRef(null);
    const statusRef = useRef(null);
    const draftsRef = useRef(drafts);
    // Per ogni sezione, il contenuto (serializzato) che il backend ha confermato per ultimo.
    const savedRef = useRef({});

    const setScope = useCallback((next) => {
        scopeRef.current = next;
        setScopeState(next);
        storeScope(next);
    }, []);

    const setDraftsAndRef = useCallback((updater) => {
        setDrafts((prev) => {
            const next = updater(prev);
            draftsRef.current = next;
            return next;
        });
    }, []);

    const isDirty = useCallback(
        (section, values) =>
            serialize(section, values) !== savedRef.current[section.number],
        [],
    );

    // Applica uno stato ricevuto dal backend. Le sezioni con modifiche locali non ancora
    // salvate le mantengono, a meno di `force` (cambio di progetto/sessione).
    const applyStatus = useCallback(
        (next, { force = false } = {}) => {
            statusRef.current = next;
            setStatus(next);
            const fresh = valuesFromStatus(next);
            setDraftsAndRef((prev) => {
                const merged = { ...prev };
                for (const section of DESIGN_SECTIONS) {
                    const n = section.number;
                    const hasLocalEdits =
                        savedRef.current[n] !== undefined &&
                        isDirty(section, prev[n]);
                    if (force || !hasLocalEdits) merged[n] = fresh[n];
                }
                return merged;
            });
            for (const section of DESIGN_SECTIONS) {
                savedRef.current[section.number] = serialize(
                    section,
                    fresh[section.number],
                );
            }
        },
        [setDraftsAndRef, isDirty],
    );

    const reset = useCallback(() => {
        setScope(null);
        statusRef.current = null;
        setStatus(null);
        savedRef.current = {};
        setDraftsAndRef(() => valuesFromStatus(null));
        setCurrentSection(1);
        setPendingDraftSave(false);
    }, [setScope, setDraftsAndRef]);

    // Trasforma un errore del backend in un messaggio. Se il backend rifiuta un passo del
    // flusso, ricarica lo stato così l'interfaccia torna allineata.
    const handleError = useCallback(
        async (e, fallback) => {
            if (e.code === 'SESSION_NOT_FOUND') {
                reset();
                setError(
                    'Your guest session has expired. Start a new design to continue.',
                );
                return;
            }
            if (FLOW_ERRORS.includes(e.code) && scopeRef.current) {
                try {
                    applyStatus(await designApi.get(scopeRef.current));
                } catch {
                    /* resta l'errore originale */
                }
            }
            setError(e.message || fallback);
        },
        [applyStatus, reset],
    );

    // ── Stato derivato del flusso ────────────────────────────────────────────
    const firstPassDone = Boolean(status?.firstPassDone);

    const isVisited = useCallback(
        (n) => Boolean(status?.sections?.[String(n)]?.visited),
        [status],
    );

    // Prossima sezione accettata dal backend nel primo passaggio; null dopo il primo passaggio.
    const frontier = useMemo(() => {
        if (!status || firstPassDone) return null;
        return ORDER[status.cursor || 0] ?? null;
    }, [status, firstPassDone]);

    const canOpenSection = useCallback(
        (n) => firstPassDone || isVisited(n) || n === frontier,
        [firstPassDone, frontier, isVisited],
    );

    const stepNumberOf = useCallback((n) => {
        const index = ORDER.indexOf(n);
        return index === -1 ? null : index + 1;
    }, []);

    const previousOf = useCallback((n) => {
        const index = ORDER.indexOf(n);
        return index <= 0 ? null : ORDER[index - 1];
    }, []);

    const nextOf = useCallback((n) => {
        const index = ORDER.indexOf(n);
        return index === -1 ? null : (ORDER[index + 1] ?? null);
    }, []);

    const progress = useMemo(() => {
        const bySection = {};
        for (const section of DESIGN_SECTIONS)
            bySection[section.number] = sectionProgress(
                section,
                drafts[section.number],
            );
        return bySection;
    }, [drafts]);

    // Stessa regola del backend (FR-11): primo passaggio fatto + almeno una sezione compilata.
    const dashboardUnlocked =
        firstPassDone &&
        DESIGN_SECTIONS.some((s) => hasAnyValue(s, drafts[s.number]));

    // ── Navigazione ──────────────────────────────────────────────────────────
    // Ogni cambio di pagina viene ricordato, così "riprendi" torna esattamente lì.
    const go = useCallback(
        (target, sectionNumber) => {
            if (sectionNumber) setCurrentSection(sectionNumber);
            storeLastPage(scopeRef.current, target, sectionNumber);
            setPage(PAGE_FOR[target]);
        },
        [setPage],
    );

    // Dove aprire un design appena caricato: l'ultima pagina visitata, se si può ancora
    // aprire; altrimenti dashboard (se il primo passaggio è finito) o il prossimo passo.
    const openLanding = useCallback(
        (next) => {
            const s = next || statusRef.current;
            const last = readLastPage(scopeRef.current);
            if (s && last) {
                const n = last.section;
                const sectionOpen =
                    s.firstPassDone ||
                    s.sections?.[String(n)]?.visited ||
                    n === ORDER[s.cursor || 0];
                if (last.target === 'spark') return go('spark');
                if (last.target === 'section' && getSection(n) && sectionOpen)
                    return go('section', n);
                if (last.target === 'dashboard' && s.firstPassDone)
                    return go('dashboard');
            }
            if (!s || (!s.cursor && !s.spark)) return go('spark');
            if (s.firstPassDone) return go('dashboard');
            return go('section', ORDER[s.cursor || 0] ?? 1);
        },
        [go],
    );

    const goToSection = useCallback(
        (n) => {
            if (!canOpenSection(n)) return false;
            go('section', n);
            return true;
        },
        [canOpenSection, go],
    );

    const goBackFrom = useCallback(
        (n) => {
            const previous = previousOf(n);
            if (previous) go('section', previous);
            else go('spark');
        },
        [previousOf, go],
    );

    const goToDashboard = useCallback(() => go('dashboard'), [go]);

    // ── Caricamento e ripresa ────────────────────────────────────────────────
    const loadScope = useCallback(
        async (nextScope) => {
            setScope(nextScope);
            const next = await designApi.get(nextScope);
            applyStatus(next, { force: true });
            return next;
        },
        [applyStatus, setScope],
    );

    // Al reload riprende l'ultimo design (da ospite solo nella stessa sessione del browser).
    const resumedRef = useRef(false);
    useEffect(() => {
        if (authLoading || resumedRef.current) return;
        resumedRef.current = true;
        const stored = readStoredScope();
        if (!stored || (stored.kind === 'project' && !user)) return;
        designApi
            .get(stored)
            .then((next) => {
                setScope(stored);
                applyStatus(next, { force: true });
            })
            .catch(() => storeScope(null)); // scaduto o non più accessibile: lo si dimentica
    }, [authLoading, user, setScope, applyStatus]);

    // Dopo il logout un progetto non è più accessibile.
    useEffect(() => {
        if (!authLoading && !user && scopeRef.current?.kind === 'project')
            reset();
    }, [user, authLoading, reset]);

    // ── Avvio / apertura di un design ────────────────────────────────────────
    // Ospite → nuova sessione; utente loggato → nuovo progetto.
    const startDesign = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let nextScope;
            if (user) {
                const project = await projectApi.create(
                    DEFAULT_PROJECT_NAME,
                    '',
                );
                nextScope = { kind: 'project', id: project.projectId };
            } else {
                const session = await sessionApi.create();
                nextScope = {
                    kind: 'session',
                    id: session.sessionId || session.id,
                };
            }
            await loadScope(nextScope);
            go('spark');
        } catch (e) {
            await handleError(e, 'Unable to start a new design.');
        } finally {
            setLoading(false);
        }
    }, [user, loadScope, go, handleError]);

    const openDesignProject = useCallback(
        async (projectId) => {
            setLoading(true);
            setError(null);
            try {
                openLanding(
                    await loadScope({ kind: 'project', id: projectId }),
                );
            } catch (e) {
                await handleError(e, 'Unable to open this design.');
            } finally {
                setLoading(false);
            }
        },
        [loadScope, openLanding, handleError],
    );

    const resumeDesign = useCallback(() => openLanding(), [openLanding]);

    // ── Step 0: The Spark ────────────────────────────────────────────────────
    // Una Spark non vuota fa precompilare al backend le sezioni vuote (risposta: prefillApplied).
    // `navigate: false` salva senza cambiare pagina (usato da "Save as a draft").
    const submitSpark = useCallback(
        async (text, { navigate = true } = {}) => {
            setSaving(true);
            setError(null);
            try {
                const result = await designApi.saveSpark(
                    scopeRef.current,
                    text,
                );
                applyStatus(result.designStatus);
                if (navigate) go('section', 1);
                return result;
            } catch (e) {
                await handleError(e, 'Unable to save your notes.');
                return null;
            } finally {
                setSaving(false);
            }
        },
        [applyStatus, go, handleError],
    );

    const skipSpark = useCallback(() => go('section', 1), [go]);

    // ── Sezioni ──────────────────────────────────────────────────────────────
    const updateField = useCallback(
        (sectionNumber, key, value) => {
            setDraftsAndRef((prev) => ({
                ...prev,
                [sectionNumber]: { ...prev[sectionNumber], [key]: value },
            }));
        },
        [setDraftsAndRef],
    );

    // Salva una sezione sul backend. Una sezione vuota (o `skip`) viene segnata come
    // "visitata senza contenuto". `complete` dice al backend se tutti i campi obbligatori
    // sono compilati.
    const persistSection = useCallback(
        async (n, { skip = false } = {}) => {
            const section = getSection(n);
            const values = draftsRef.current[n];
            const body =
                skip || !hasAnyValue(section, values)
                    ? { skip: true }
                    : {
                          content: valuesToContent(section, values),
                          complete: sectionProgress(section, values).complete,
                      };
            const result = await designApi.saveSection(
                scopeRef.current,
                n,
                body,
            );
            if (!body.skip) savedRef.current[n] = serialize(section, values);
            applyStatus(result.designStatus);
            return result.designStatus;
        },
        [applyStatus],
    );

    // "Continue" / "Skip": salva e poi va alla scelta del percorso (dopo Context, al primo
    // passaggio), alla sezione successiva del percorso, o alla dashboard dopo l'ultima.
    const continueFrom = useCallback(
        async (n, { skip = false } = {}) => {
            setSaving(true);
            setError(null);
            try {
                await persistSection(n, { skip });
                const following = nextOf(n);
                return following ? go('section', following) : go('dashboard');
            } catch (e) {
                await handleError(e, 'Unable to save this section.');
            } finally {
                setSaving(false);
            }
        },
        [persistSection, nextOf, go, handleError],
    );

    // ── Auto-save (FR-28, FR-29) ─────────────────────────────────────────────
    // Riguarda solo le sezioni già visitate: al primo passaggio il primo salvataggio della
    // sezione corrente fa avanzare il flusso sul backend, quindi avviene solo con Continue/Skip.
    const needsAutosave = useCallback(
        (section, values) =>
            isVisited(section.number) &&
            hasAnyValue(section, values) &&
            isDirty(section, values),
        [isVisited, isDirty],
    );

    useEffect(() => {
        if (!scopeRef.current || !statusRef.current) return undefined;
        const dirty = DESIGN_SECTIONS.filter((s) =>
            needsAutosave(s, drafts[s.number]),
        );
        if (dirty.length === 0) return undefined;
        const timer = setTimeout(async () => {
            try {
                for (const s of dirty) await persistSection(s.number);
            } catch (e) {
                await handleError(e, 'Auto-save failed.');
            }
        }, AUTOSAVE_DELAY);
        return () => clearTimeout(timer);
    }, [drafts, needsAutosave, persistSection, handleError]);

    // ── Dashboard ────────────────────────────────────────────────────────────
    // Stati e percentuali sono calcolati qui dallo schema dei campi: il backend dà solo
    // 0/50/100 %, il mockup mostra valori intermedi. 'current' = sezione aperta per ultima.
    const dashboardSections = useMemo(
        () =>
            DESIGN_SECTIONS.map((section) => {
                const p = progress[section.number];
                let state = 'not_started';
                if (p.complete) state = 'complete';
                else if (section.number === currentSection) state = 'current';
                else if (hasAnyValue(section, drafts[section.number]))
                    state = 'in_progress';
                return {
                    number: section.number,
                    title: section.navName,
                    summary: section.summary,
                    status: state,
                    percent: p.percent,
                };
            }),
        [progress, drafts, currentSection],
    );

    const overall = useMemo(() => {
        const total = dashboardSections.reduce((sum, s) => sum + s.percent, 0);
        return {
            percent: Math.round(total / DESIGN_SECTIONS.length),
            completeCount: dashboardSections.filter(
                (s) => s.status === 'complete',
            ).length,
            sectionCount: DESIGN_SECTIONS.length,
        };
    }, [dashboardSections]);

    // La chiamata serve a far rispettare il blocco della dashboard lato backend:
    // restituisce null se la dashboard non è ancora accessibile.
    const loadDashboard = useCallback(async () => {
        try {
            return await designApi.dashboard(scopeRef.current);
        } catch (e) {
            await handleError(e, 'The overview is not available yet.');
            return null;
        }
    }, [handleError]);

    // "Continue where I left off": prima sezione non ancora completa.
    const continueWhereLeftOff = useCallback(() => {
        const target =
            ORDER.find((n) => !progress[n].complete) ?? ORDER[ORDER.length - 1];
        go('section', target);
    }, [progress, go]);

    // ── Report PDF (FR-22…FR-27) ─────────────────────────────────────────────
    // Una richiesta genera entrambe le versioni: { standard: { url, … }, enhanced: { url, … } }.
    // La versione AI-Enhanced la produce il backend: nel frontend non c'è logica AI.
    const generateReports = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            return await designApi.generatePDF(scopeRef.current);
        } catch (e) {
            await handleError(e, 'Report generation failed.');
            return null;
        } finally {
            setSaving(false);
        }
    }, [handleError]);

    // Storico dei report (più recenti prima): dal backend per un progetto, dallo stato per un ospite.
    const loadReportHistory = useCallback(async () => {
        const s = scopeRef.current;
        if (s?.kind === 'project')
            return (await designApi.reports(s.id)).reports || [];
        return statusRef.current?.reports || [];
    }, []);

    // ── Save as a draft (FR-20, FR-21) ───────────────────────────────────────
    // Utente loggato: i dati sono già salvati, si salvano solo le modifiche in sospeso.
    // Ospite: la pagina apre il login; appena il login riesce, la sessione viene spostata
    // in un nuovo progetto (import-session) e da lì in poi si lavora sul progetto.
    const finishDraftSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            for (const s of DESIGN_SECTIONS) {
                if (needsAutosave(s, draftsRef.current[s.number]))
                    await persistSection(s.number);
            }
            const current = scopeRef.current;
            if (current?.kind === 'session') {
                const project = await projectApi.create(
                    DEFAULT_PROJECT_NAME,
                    '',
                );
                const projectScope = { kind: 'project', id: project.projectId };
                let imported;
                try {
                    imported = await designApi.importSession(
                        project.projectId,
                        current.id,
                    );
                } catch (e) {
                    // Da ospite non era ancora stato inserito nulla: il nuovo progetto vuoto è la bozza.
                    if (e.code !== 'SESSION_DESIGN_EMPTY') throw e;
                    imported = await designApi.get(projectScope);
                }
                setScope(projectScope);
                applyStatus(imported, { force: true });
            }
            setDraftSavedAt(Date.now());
            return true;
        } catch (e) {
            await handleError(e, 'Unable to save your draft.');
            return false;
        } finally {
            setSaving(false);
            setPendingDraftSave(false);
        }
    }, [needsAutosave, persistSection, setScope, applyStatus, handleError]);

    // Restituisce 'needs-auth' (chi chiama deve aprire il login), oppure true / false.
    const saveAsDraft = useCallback(async () => {
        if (!user) {
            setPendingDraftSave(true);
            return 'needs-auth';
        }
        return finishDraftSave();
    }, [user, finishDraftSave]);

    // Il login è avvenuto mentre un "Save as a draft" era in attesa: lo si completa.
    useEffect(() => {
        if (!user || !pendingDraftSave) return;
        queueMicrotask(finishDraftSave); // fuori dal render, per non aggiornare lo stato durante l'effetto
    }, [user, pendingDraftSave, finishDraftSave]);

    return (
        <DesignContext.Provider
            value={{
                // stato
                status,
                drafts,
                currentSection,
                loading,
                saving,
                error,
                firstPassDone,
                frontier,
                dashboardUnlocked,
                progress,
                dashboardSections,
                overall,
                isGuest: scope?.kind === 'session',
                hasDesign: Boolean(scope && status),
                // true when the loaded design has been started (spark, a visited
                // section or any value): drives the "unfinished design" banner
                designInProgress: Boolean(
                    scope &&
                    status &&
                    (status.spark ||
                        status.cursor > 0 ||
                        DESIGN_SECTIONS.some((s) =>
                            hasAnyValue(s, drafts[s.number]),
                        )),
                ),
                pendingDraftSave,
                draftSavedAt,
                // helper di navigazione
                canOpenSection,
                stepNumberOf,
                previousOf,
                nextOf,
                // azioni
                discardDesign: reset, // forgets the design in this browser (a project stays in the Dashboard)
                startDesign,
                openDesignProject,
                resumeDesign,
                submitSpark,
                skipSpark,
                updateField,
                goToSection,
                continueFrom,
                goBackFrom,
                loadDashboard,
                goToDashboard,
                continueWhereLeftOff,
                generateReports,
                loadReportHistory,
                saveAsDraft,
            }}
        >
            {children}
        </DesignContext.Provider>
    );
}

export function useDesign() {
    return useContext(DesignContext);
}
