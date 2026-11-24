# Modello del second brain (opzionale)

Un vault di sole note Markdown, con indici, regole fisse e tre script di controllo. Il kit non lo installa da solo: lo si copia solo se l'utente lo vuole.

## Cosa c'è

| Percorso | Cos'è |
|---|---|
| `vault/` | Lo schema del vault: `_index.md` con le regole, 10 cartelle con il loro indice, i modelli del diario in `workspace/journal/_templates/`, `.gitignore` |
| `vault/scripts/quality_gate.py` | Controllo di qualità: frontmatter, lunghezza, link, orfane, grafo connesso |
| `vault/scripts/generate_llms_txt.py` | Scrive `llms.txt`, l'elenco di tutte le note con il loro summary |
| `vault/scripts/generate_showcase.py` | Scrive `_showcase/showcase.md`, con i conti del vault |
| `skills/journal/SKILL.md` | La skill `journal`: `buongiorno`, `chiudi sessione`, `fine giornata` |

## Come si installa (per il Claude dell'amico)

1. Chiedi all'utente dove mettere il vault, per esempio `Workspace/SecondBrain/`. Se la cartella esiste già e non è vuota, fermati e chiedi: non si sovrascrive niente.
2. Copia l'intero contenuto di `vault/` in quella cartella, mantenendo la struttura.
3. Nei file `.md` copiati, sostituisci `AAAA-MM-GG` con la data di oggi (nelle cartelle `self/`, `areas/`, ..., `outputs/` e in `_index.md`). Nei modelli di `workspace/journal/_templates/` il segnaposto resta.
4. Copia `skills/journal/` in `~/.claude/skills-library/productivity/journal/` e accendila solo per il vault: `node skills.js on journal --project <cartella-del-vault>`.
5. Controlla che gli script girino. Dalla radice del vault, su Windows `py scripts/quality_gate.py`, sul Mac `python3 scripts/quality_gate.py`. Deve stampare `OK, 0 errori`.
6. Dillo all'utente: il vault parte vuoto, e le note vere le scrive lui con Claude.

## Requisiti

Python 3.8 o più recente, solo libreria standard (niente `pip install`). Servono solo per i tre script e sono facoltativi: il vault funziona anche senza.
Gli script trovano la radice del vault dalla propria posizione (la cartella sopra `scripts/`), quindi funzionano da qualunque cartella si lanciano.
