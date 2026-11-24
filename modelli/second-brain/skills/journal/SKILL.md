---
name: journal
description: Usala solo nelle sessioni aperte nella cartella del second brain, quando l'utente scrive "buongiorno" (briefing di inizio sessione), "chiudi sessione" (nota di sessione) o "fine giornata" (riassunto del giorno). Tiene il diario di lavoro agganciato alle note statiche del vault con i wikilink.
---

# Journal

## Cosa fa

Skill del solo vault: si accende per progetto con
`node skills.js on journal --project <cartella-del-vault>`
(lo script `skills.js` è nel plugin `metodo`),
quindi esiste solo nelle sessioni di Claude Code aperte nella cartella del vault.
Tutti i percorsi qui sotto sono relativi alla radice del vault, che è la cartella di lavoro.

Il vault ha due strati di memoria:

- le note statiche, scritte una volta e tenute aggiornate (cartelle `self/`, `areas/`, `projects/`, `concepts/`, `docs/`, `entities/`, `data/`, `code/`, `outputs/`);
- il diario di lavoro, la memoria dinamica (`workspace/journal/`).

Questa skill gestisce solo il secondo strato e lo aggancia sempre al primo con i `[[wikilink]]`.
Non tocca mai le note statiche.

`workspace/` è esclusa per scelta da `llms.txt` e dal controllo di qualità (vedi `_index.md`):
le note di diario non compaiono in `llms.txt` e non passano da `scripts/quality_gate.py`.
È normale: restano leggibili e linkate, solo non indicizzate.

## Quando usarla

Tre comandi, passati come argomento della skill:

| Comando | Cosa fa | Scrive file? |
|---|---|---|
| `buongiorno` | Briefing di inizio sessione | No |
| `chiudi sessione` | Chiude la sessione di lavoro corrente | Sì, dopo conferma |
| `fine giornata` | Riassume tutte le sessioni della giornata | Sì, dopo conferma |

Se l'argomento non corrisponde chiaramente a uno dei tre (anche con piccole varianti, come "chiudi la sessione" o "fine della giornata"),
chiedi all'utente quale dei tre intende, prima di procedere.

Usa sempre la data di oggi nel formato `AAAA-MM-GG`, mai una data relativa ("ieri", "stamattina").

## Comando: buongiorno (briefing, non scrive)

1. Leggi `llms.txt`.
2. Trova la nota più recente in `workspace/journal/sessions/`: ordina per data nel nome del file e, a parità di data, prendi il suffisso numerico più alto (regola di naming sotto).
3. Rispondi con un briefing di al massimo 5 righe: dove eravamo rimasti, cosa era rimasto aperto (la sezione `## Aperto` dell'ultima sessione), cosa conviene affrontare oggi, in ordine di priorità.
4. Non scrivere e non creare nessun file.

Se `workspace/journal/sessions/` è vuota, dillo e basa il briefing solo su `llms.txt` (per esempio lo stato dei progetti).

## Comando: chiudi sessione (scrive una nota di sessione)

1. Prima di scrivere, riassumi in 3 righe cosa hai capito che è stato fatto. Aspetta l'ok esplicito dell'utente.
2. Scegli il nome del file (regola di naming sotto) e crea `workspace/journal/sessions/sessione-<data>[-N].md`, usando `workspace/journal/_templates/template-sessione.md` come struttura.
3. Frontmatter:
   - `title`: `Sessione <data>`
   - `summary`: una sola frase su cosa è stato fatto
   - `tags`: `[workspace, type/session]`
   - `status: done`
   - `created` e `updated`: la data di oggi
   - `related`: i wikilink alle note statiche toccate, su una riga, tra virgolette, separati da virgola (come in `_index.md`)
4. Corpo in tre sezioni: `## Fatto`, `## Deciso`, `## Aperto`.
5. Ogni nota ha almeno un wikilink a una nota statica che esiste già. Prima di linkare, verifica che la destinazione esista (cerca il file, non fidarti della memoria).
   Se non c'è niente di ovvio da agganciare, chiedi all'utente a cosa collegarla: non inventare note e non lasciare la nota senza wikilink.

## Comando: fine giornata (scrive il riassunto del giorno)

1. Leggi tutte le note `sessione-<data-di-oggi>*.md` in `workspace/journal/sessions/`. Se non ce n'è nessuna, dillo e non scrivere niente.
2. Riassumi in 3 righe cosa è successo nella giornata. Aspetta l'ok esplicito dell'utente.
3. Crea `workspace/journal/daily/<data-di-oggi>.md` usando `workspace/journal/_templates/template-daily.md`.
4. Frontmatter come per la sessione, ma `tags: [workspace, type/daily]` e `related` con i wikilink a tutte le sessioni del giorno più le note principali toccate (verificate come sopra, nessuna inventata).
5. Corpo: un'unica sintesi in `## Fatto`, `## Deciso`, `## Aperto` che fonde le sessioni senza ripeterle riga per riga, poi una sezione `## Sessioni` con i wikilink a ogni nota di sessione del giorno.

## Regola di naming (più sessioni nello stesso giorno)

Prima di scrivere una nota di sessione, cerca in `workspace/journal/sessions/` i file che iniziano per `sessione-<data-di-oggi>`:

- nessuno trovato: `sessione-<data>.md`
- già presenti: `sessione-<data>-N.md`, dove N è il primo intero libero a partire da 2 (quindi `-2`, poi `-3`, e così via)

Mai sovrascrivere una sessione esistente per aggiungerne una nuova nello stesso giorno.

## Stile

Italiano naturale. Niente trattini lunghi: al loro posto virgole, due punti o il trattino breve. Frasi dirette, niente riempitivo.

## Errori comuni

- Scrivere prima dell'ok esplicito: si riassume sempre e si aspetta la conferma, poi si scrive.
- Sovrascrivere una sessione dello stesso giorno invece di aggiungere il suffisso numerico.
- Linkare una nota che non esiste, o lasciare una nota di diario senza nessun `[[wikilink]]` a una nota statica.
- Toccare le note statiche da questa skill: non è il suo compito, gestisce solo `workspace/journal/`.
