---
title: Second Brain - Indice generale
summary: Punto d'ingresso del vault: mappa delle cartelle di contenuto e dei rispettivi indici locali.
tags: [index, vault]
status: active
created: AAAA-MM-GG
updated: AAAA-MM-GG
related: "[[indice-self]],[[indice-aree]],[[indice-progetti]],[[indice-fonti]],[[indice-concetti]],[[indice-docs]],[[indice-entita]],[[indice-dati]],[[indice-codice]],[[indice-output]]"
---

# Second Brain - Indice generale

Questo vault è la memoria scritta del mio lavoro, in sole note Markdown.
Ogni cartella di contenuto ha un indice locale che elenca le note al suo interno.
L'indice va aggiornato a ogni nota nuova: è il modo in cui il vault evita le note orfane man mano che cresce.

## Cartelle di contenuto

- [[indice-self]]: chi opera nel vault
- [[indice-aree]]: le aree funzionali ricorrenti di lavoro
- [[indice-progetti]]: i progetti attivi e il loro stato
- [[indice-fonti]]: le fonti esterne citate da più note
- [[indice-concetti]]: le definizioni riusabili
- [[indice-docs]]: documenti e procedure operative
- [[indice-entita]]: aziende, prodotti e strumenti
- [[indice-dati]]: i dati puntuali (indicatori, prezzi, confronti)
- [[indice-codice]]: architettura e automazioni tecniche
- [[indice-output]]: i deliverable concreti consegnati

## Regole del vault

1. **Una nota, un'idea.** Il nome del file è il nome del link: minuscolo, parole unite da trattini, unico in tutto il vault.
2. **Frontmatter completo** in ogni nota: `title`, `summary` (una frase), `tags`, `status`, `created`, `updated`, e `related` con i link principali.
3. **Corpo di al massimo 300 righe.** Oltre, la nota si spezza in due.
4. **Almeno 3 link in uscita** verso note vere. I link verso gli indici non contano. Finché le note vere sono poche, il minimo è il numero di altre note vere che esistono (con una sola nota vera basta linkare il suo indice e `_index`).
5. **Zero link rotti e zero note orfane.** Ogni nota nuova entra nell'indice della sua cartella, e le note si linkano tra loro.
6. **Un solo grafo connesso**: nessuna isola.
7. **Niente segreti nel vault** (password, token, chiavi). Niente file che non siano Markdown, salvo gli script.
8. **Le note dicono i fatti e il loro perché**, non copiano documenti: rimandano al file vero con un percorso.
9. **`llms.txt` e `_showcase/` sono derivati**: li scrivono gli script, mai a mano.

Prefissi dei nomi, per riconoscere a colpo d'occhio il tipo di nota:
`indice-`, `area-`, `progetto-`, `concetto-`, `azienda-`, `prodotto-`, `strumento-`, `procedura-`, `kpi-`, `deliverable-`.

## Controlli

Dalla radice del vault (Windows con `py`, Mac con `python3`):

- `scripts/quality_gate.py`: verifica le regole 2-6 e il frontmatter. Deve stampare `OK, 0 errori` prima di ogni commit.
- `scripts/generate_llms_txt.py`: riscrive `llms.txt`, l'elenco di tutte le note con il loro summary. Claude lo legge per primo.
- `scripts/generate_showcase.py`: riscrive `_showcase/showcase.md`, con i conti del vault.

## Cartelle escluse dal grafo

- `sources/`: fonti esterne, materiale grezzo.
- `workspace/`: bozze, appunti di lavoro e diario delle sessioni (`workspace/journal/`). Non è nota atomica e non entra in `llms.txt`.
