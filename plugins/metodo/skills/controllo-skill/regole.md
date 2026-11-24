# Regole del controllo

## Indice

- Regole principali: 1 Indice nei file lunghi · 2 Libertà giusta e regole fisse · 3 Scritta per il modello di oggi · 4 SKILL.md corto, tutto a un passo · 5 Lista con il "torna indietro" · 6 Controllo finale ed esempi · 7 Chi la userà
- Regole aggiuntive: 8 Rigidità dei modelli · 9 Bivio scritto · 10 Prove · 11 Niente ragionamento trascritto · 12 Errori che dicono cosa non va
- Controlli veloci
- Fatti di Claude Code utili al controllo
- Fonti

Ogni regola dice cosa vale, come si controlla e come si sistema. Le citazioni vengono dalle fonti in fondo.

## Regole principali

### 1. Indice nei file lunghi
Un file di supporto oltre le 100 righe apre con un indice delle sezioni, nello stesso ordine. Motivo: Claude a volte legge solo l'inizio dei file lunghi.
- Controllo: conta le righe dei file collegati; per quelli oltre 100 cerca l'indice nelle prime righe.
- Sistemazione: aggiungi in cima "Indice" con una riga per sezione.

### 2. Libertà giusta e regole fisse
Il dettaglio di un passaggio cresce con il costo dell'errore. Passaggi fragili o costosi (soldi, dati cancellati, messaggi a clienti): comando o script esatto ("bassa libertà"). Molti modi giusti: basta l'obiettivo ("alta libertà"). Nel mezzo: pseudocodice o script con parametri.
- Controllo: per ogni passaggio chiediti "se Claude lo fa in un altro modo, cosa succede?". Segnala i passaggi rischiosi scritti vaghi e quelli semplici bloccati senza motivo.
- Regole "mai/sempre/obbligatorio": per ognuna indica il costo di una violazione. Se una violazione costa soldi o dati, valuta un **hook** (vedi "Fatti di Claude Code") e indica prima di quale azione partirebbe. Le altre restano scritte, con il motivo accanto.
- Per lavori in blocco, distruttivi o ad alto rischio: piano scritto in un file → validato da uno script → eseguito.

### 3. Scritta per il modello di oggi
La guida di Fable 5: "Skills developed for prior models are often too prescriptive [...] and can degrade output quality". La guida generale (Opus 4.5 e successivi): dove c'era "CRITICAL: You MUST use this tool when...", basta "Use this tool when...". Claude è già molto capace: nella skill resta solo ciò che non sa da solo (prezzi, clienti, regole interne, convenzioni non scritte).
- Controllo: segnala maiuscole insistite, "CRITICAL/MUST" ripetuti, elenchi rigidi dove l'ordine non conta, spiegazioni di cose ovvie.
- Sistemazione: proponi i tagli **come prova**: stesso lavoro con e senza, si tiene la versione migliore. La guida delle skill usa ancora "ALWAYS" per i modelli da seguire alla lettera (regola 8): quello resta.
- Descrizione: terza persona, cosa fa **e** quando usarla ("Prepara i preventivi. Usala quando..."). Il nome ha al massimo 64 caratteri, solo minuscole, numeri e trattini, senza "anthropic" e "claude". La descrizione ha al massimo 1024 caratteri (guida) e in Claude Code viene troncata a 1536 insieme a `when_to_use`. Segnala le descrizioni vaghe o senza il "quando". Per le skill manuali (`disable-model-invocation: true`) la descrizione è per l'utente: basta una riga.
- Più modelli: Haiku vuole più indicazioni, Opus meno spiegazioni. Se Haiku salta un passaggio, quel passaggio va scritto più chiaro o diventa uno script.

### 4. SKILL.md corto, tutto a un passo
SKILL.md resta sotto le 500 righe (senza intestazione) e fa da indice. Ogni file di dettaglio è collegato **direttamente** da SKILL.md: i riferimenti annidati vengono letti in parte. Un file per area. Le istruzioni più importanti stanno in cima, perché dopo la compattazione Claude Code tiene solo i primi 5.000 token di ogni skill.
- Controllo: righe di SKILL.md, file collegati, file raggiungibili solo a catena, regole importanti in fondo.
- Sistemazione: sposta in file a parte ciò che serve solo ad alcuni lavori, collega tutto da SKILL.md, porta in cima le regole che non devono sfuggire.

### 5. Lista con il "torna indietro"
Lavori con più di tre o quattro passaggi in ordine preciso: passaggi numerati, una lista che Claude copia nella risposta e spunta, e sotto ogni controllo dove tornare se fallisce (valida → correggi → ripeti). Se l'ordine non conta, la lista non serve.
- Sistemazione: numera, aggiungi la lista da copiare e righe come "se il totale non torna, torna al passo 2".

### 6. Controllo finale ed esempi
Dove la qualità conta (testi per clienti, documenti, dati) la skill finisce con un controllo del risultato su una lista, la correzione e il ricontrollo finché tutto passa. Dove conta lo stile, due o tre esempi con richiesta e risultato: rendono lo stile meglio di una descrizione.
- Sistemazione: lista breve + "finisci solo quando tutti i controlli passano"; esempi dove servono. Se un lavoro sbaglia per un motivo non previsto, proponi all'utente una regola nuova: la approva lui.

### 7. Chi la userà
Ogni pacchetto o programma usato è scritto in SKILL.md con il comando per installarlo; non dare per scontato che sia installato. Percorsi relativi alla cartella della skill, sempre con la barra `/`.
- Controllo: elenca pacchetti, programmi e script; cerca percorsi personali (cartella utente, disco assoluto) e barre rovesciate.
- Sistemazione: sezione "Serve" con i comandi di installazione; percorsi dentro la cartella della skill.

## Regole aggiuntive

### 8. Rigidità dei modelli
Un modello da seguire (report, formato di risposta) dice se va usato identico ("usa esattamente questa struttura") o se è una base da adattare ("forma di base, adattala se serve").

### 9. Bivio scritto
Se un lavoro cambia strada a seconda dei casi (creare o modificare), la skill lo dice all'inizio: "se devi creare, segui questi passaggi; se devi modificare, questi". I rami lunghi vanno in file separati.

### 10. Prove
Ogni skill importante ha almeno tre prove: richieste reali con il risultato atteso. Vanno scritte **prima** della documentazione lunga e provate così:
- senza la skill, per vedere dove Claude sbaglia da solo;
- con la skill, in una sessione nuova, perché il contesto di quando è stata scritta nasconde i buchi.

In Claude Code la si spegne con `"off"` in `skillOverrides`. Per una skill in un plugin si usa `claude plugin eval`. Il plugin `skill-creator` automatizza le prove con `evals/evals.json`.
- Sistemazione: proponi tre richieste prese dal lavoro vero, in un file `prove.md` nella cartella della skill. Obbligatorie per le skill dell'utente; per quelle di altri si propongono solo se toccano clienti, soldi o dati.

### 11. Niente ragionamento trascritto
Su Fable 5, istruzioni che chiedono di trascrivere o spiegare il ragionamento interno nella risposta possono far scattare il rifiuto `reasoning_extraction`, e quel rifiuto non viene ritentato. Sono permesse una breve spiegazione della risposta o un riassunto delle azioni fatte.
- Sistemazione: "ragiona passo passo e scrivi il ragionamento" → "dammi la risposta e una breve spiegazione".

### 12. Errori che dicono cosa non va
Gli script gestiscono gli errori invece di lasciarli a Claude, e i messaggi nominano il problema: "Campo 'data_firma' non trovato. Campi disponibili: ...". Niente costanti senza motivo: ogni valore fisso ha la sua giustificazione.

## Controlli veloci

- Niente informazioni che scadono: il metodo attuale in chiaro, quello vecchio in una sezione "Metodo precedente".
- Lo stesso termine per la stessa cosa, dall'inizio alla fine.
- Una soluzione predefinita; al massimo una seconda per il caso particolare.
- Nomi di file che dicono cosa contengono (`regole-sconti.md`, non `doc2.md`).
- Strumenti MCP con il nome completo, il server davanti (`Server:tool`).
- Script: chiaro se Claude li deve eseguire (il caso normale) o leggere.

## Fatti di Claude Code utili al controllo

- **Hook in una skill**: campo `hooks` nell'intestazione, stesso formato degli hook nei settings. Si registrano quando la skill viene invocata e restano attivi **per il resto della sessione**; con `once: true` si tolgono dopo la prima esecuzione riuscita. Gli hook di skill di progetto richiedono che la cartella sia considerata attendibile.
  ```yaml
  hooks:
    PreToolUse:
      - matcher: "Bash"
        hooks:
          - type: command
            command: "./scripts/controllo.sh"
  ```
- **Compattazione**: dopo il riassunto viene ricaricata l'ultima invocazione di ogni skill, primi 5.000 token ciascuna, 25.000 in tutto, dalla più recente: le skill più vecchie possono sparire. Per riaverla intera, la si richiama.
- **Elenco delle skill**: descrizioni troncate a 1536 caratteri; l'elenco ha un budget pari all'1% della finestra di contesto e, se non basta, toglie per prime le descrizioni delle skill usate meno. Costo reale: `/context`. Valori di `skillOverrides`: `on`, `name-only`, `user-invocable-only`, `off`.
- **Campi dell'intestazione** oltre a `name` e `description`: `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths`, `shell`.
- **Strumenti**: `/skill-doctor` (≥ 2.1.252) dice costo e uso di ogni skill, non è un controllo di qualità. `claude plugin validate` (≥ 2.1.233) trova intestazioni che non si leggono. `claude plugin eval` (≥ 2.1.269) fa le prove con e senza, ma solo per i plugin.

## Fonti

- Guida alle skill: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Skill in Claude Code: https://code.claude.com/docs/en/skills (hook: https://code.claude.com/docs/en/hooks; prove: https://code.claude.com/docs/en/plugin-evals)
- Fable 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
- Guida generale: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
