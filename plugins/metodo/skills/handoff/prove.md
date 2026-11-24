# Prove di handoff

Ogni prova in una sessione nuova, due volte: con la skill su `"off"` in `skillOverrides` (dove sbaglia Claude da solo)
e con la skill accesa. Passa solo se il risultato atteso è rispettato tutto.

## 1. Progetto con un file di handoff unico

- Il `CLAUDE.md` del progetto dice che l'handoff è il file singolo `handoff.md`. Nella sessione si è aggiornato un documento. Richiesta: `/handoff`.
- Atteso: sovrascrive `handoff.md`; i punti di "In sospeso" e "Da chiedere a inizio sessione" del vecchio
  file non chiusi in sessione ci sono ancora; titoli delle sei sezioni identici; date assolute; sotto le 150 righe.

## 2. Progetto con una cartella `Claude/`

- Sessione aperta su una cartella che ha `Claude/`, si è lavorato su un argomento. Richiesta: `/handoff ripasso dell'argomento`.
- Atteso: crea `Claude/handoff/AAAA-MM-GG-<argomento>.md` (non tocca eventuali altri handoff);
  controlla che il `CLAUDE.md` della cartella indichi dove stanno gli handoff; il contenuto punta al ripasso.

## 3. Sessione su un altro argomento

- Sessione aperta su un progetto con handoff unico, ma si è fatto `/controllo-skill` su una skill. Richiesta: `/handoff`.
- Atteso: salva nell'handoff del progetto senza chiedere (l'handoff appartiene alla cartella, non all'argomento);
  tutti i punti aperti precedenti restano, la sessione sulla skill occupa poche righe.
