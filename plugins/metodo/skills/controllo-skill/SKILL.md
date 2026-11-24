---
name: controllo-skill
description: Controlla una o più skill di Claude Code con le regole della guida ufficiale di Anthropic e propone correzioni numerate da approvare. Da lanciare prima di attivare una skill nuova o per rivedere la libreria.
disable-model-invocation: true
argument-hint: "<nome skill | cartella | gruppo della libreria>"
---

# Controllo skill

Il controllo **propone**, l'utente **decide**. Queste regole valgono a ogni esecuzione:

1. I file restano com'erano finché l'utente approva le correzioni indicandone i numeri. Motivo: le skill sono condivise da tutti i progetti, un errore si propaga ovunque.
2. Una skill **di altri** (repo esterno, copia da un altro progetto) riceve solo correzioni piccole e additive: descrizione, indice, percorsi, intestazione. Ogni modifica va annotata nella sezione "Origini e modifiche locali" del README della libreria (`~/.claude/skills-library/README.md`). Se fallisce su un problema grave, proponi di spegnerla o sostituirla. Motivo: riscaricarla dal repo cancella le modifiche locali.
3. I **plugin** si segnalano e basta: un aggiornamento li sovrascrive.
4. Ogni "non rispettata" porta la prova `file:riga`, verificata da te sul file.

## Bivio

- **Skill nuova**, prima di attivarla: tutti i passi su quella sola skill. Se è dell'utente, le prove della regola 10 fanno parte del controllo.
- **Skill esistenti o un gruppo**: tutti i passi, con le skill ordinate per rischio al passo 1.

## Passi

Copia questa lista nella risposta e spuntala man mano:

```
- [ ] 1. Inventario e priorità
- [ ] 2. Divisione del lavoro
- [ ] 3. Controllo regola per regola
- [ ] 4. Verifica dei risultati
- [ ] 5. Report
- [ ] 6. Attesa dell'approvazione
- [ ] 7. Applicazione e ricontrollo
```

1. **Inventario.** Per ogni skill: origine (dell'utente, repo esterno, plugin: vedi la sezione "Origini e modifiche locali" del README), modo (automatica o manuale), righe di SKILL.md, file collegati. Se Claude Code è ≥ 2.1.252, chiedi all'utente di lanciare `/skill-doctor` per sapere quali skill usa davvero. Ordine: skill dell'utente → skill che toccano clienti, soldi o dati da cancellare → le più usate → il resto. Fatto quando ogni skill del gruppo ha origine, modo e priorità.
2. **Divisione.** Con più di tre skill, o file sopra le 300 righe, affida la lettura a subagenti Sonnet, un gruppo ciascuno. Ognuno restituisce, per skill e per regola: esito, `file:riga`, correzione proposta. Tu coordini e non leggi i file interi.
3. **Controllo.** Applica tutte le regole di [regole.md](regole.md), nell'ordine: le 7 principali, le 5 aggiuntive, i controlli veloci. Fatto quando ogni regola ha un esito per ogni skill: rispettata, non rispettata o non applicabile.
4. **Verifica.** Apri `file:riga` di ogni "non rispettata" e confermala. Scarta i falsi positivi. Se un subagente ne ha sbagliati più di due, torna al passo 3 per il suo gruppo.
5. **Report**, nel formato qui sotto.
6. **Fermati** e aspetta i numeri approvati.
7. **Applica** solo quelli. Per le skill di altri aggiorna la sezione "Origini e modifiche locali" del README. Poi ricontrolla le skill modificate con le stesse regole: se una ancora non passa, torna al passo 3 per quella skill. Chiudi con l'elenco delle modifiche, file per file.

## Formato del report

Usa esattamente questa struttura: l'utente approva per numero.

1. Tabella: skill | origine | regole non rispettate | problema più grave.
2. Skill per skill, regola per regola: esito, prova `file:riga`, correzione esatta.
3. Elenco numerato di tutte le correzioni, dalla più importante. Ogni voce dice il tipo: correzione, spegnere, sostituire, prova da fare.

## Controllo finale

Prima di consegnare il report verifica che:
- ogni "non rispettata" abbia `file:riga` controllato da te;
- nessuna correzione riscriva il corpo di una skill di altri;
- l'elenco sia numerato e ordinato per importanza.

Se un punto non passa, torna al passo 4. Consegna solo quando tutti passano.

## Serve

Niente da installare. Facoltativi: Claude Code ≥ 2.1.252 per `/skill-doctor` e ≥ 2.1.269 per `claude plugin eval` (aggiornamento: `claude update`).

Prove di questa skill: [prove.md](prove.md).
