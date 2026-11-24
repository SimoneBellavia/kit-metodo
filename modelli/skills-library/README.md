# Libreria skill: indice, uso e scelte

Questo file è l'unica tabella delle skill e dei pacchetti (plugin) che hai. Claude lo legge quando si installa, sposta o discute una skill, e lo aggiorna a ogni modifica.
Lo stato (accesa o spenta) non sta qui: lo dice `skills.js list`, che lo legge dal disco.

## 1. Come è organizzata

```
~/.claude/skills-library/        ← magazzino, organizzato a bucket
  engineering/   lavoro quotidiano sul codice
  productivity/  flussi di lavoro non legati al codice (intervistare, insegnare, scrivere documenti)
  design/        UI, grafica, motion
  misc/          tenute ma usate di rado; casi particolari e stack specifici
  in-progress/   beta o sperimentali
  deprecated/    non più usate
~/.claude/skills/<nome>          ← cartella che Claude Code legge davvero (un solo livello)
```

**Perché due cartelle.** Claude Code vede solo `~/.claude/skills/<nome>/SKILL.md`, a un livello: una cartella `engineering/` dentro `skills/` non verrebbe scoperta.
Quindi la libreria ha i bucket, e le skill **accese** sono collegate dentro `~/.claude/skills/` (junction su Windows, symlink su Mac).
Una skill nella libreria ma non collegata è **installata e inerte**: costa zero contesto.

### Comandi

Un nome per chiamata. `<METODO>` è la cartella del plugin `metodo`.

```
node "<METODO>/scripts/skills.js" list                    # tutte, con stato
node "<METODO>/scripts/skills.js" on <nome>               # accende per tutti i progetti
node "<METODO>/scripts/skills.js" off <nome>              # spegne (la skill resta in libreria)
node "<METODO>/scripts/skills.js" on <nome> --project <cartella>   # accende solo in quel progetto
```

Questi comandi valgono per le skill della libreria, non per i plugin. Con `--project` il collegamento va in `<cartella>/.claude/skills/` e viene aggiunto al `.gitignore` del progetto.
`off` scollega soltanto: se `~/.claude/skills/<nome>` è una cartella vera e non un collegamento, lo script si rifiuta e non cancella niente.
Se il nome esiste già, lo script si ferma e lo dice: decidi tu se sostituire.
Una skill appena accesa compare nella lista di Claude Code alla sessione successiva (a volte subito).

### Dove mettere una skill nuova

| Se la skill… | Bucket |
|---|---|
| serve per scrivere, rivedere o fare debug del **codice** | `engineering/` |
| è un flusso **non** di codice (intervista, studio, documenti, messaggi) | `productivity/` |
| riguarda **UI, grafica, animazioni, tipografia** | `design/` |
| è di nicchia, per uno stack specifico, o la usi di rado | `misc/` |
| è beta o sperimentale | `in-progress/` |
| non la usi più | `deprecated/` |

Procedura:

1. Copia la cartella in `<bucket>/<nome>/`.
2. Lancia `/controllo-skill <nome>` (è manuale: la lanci tu) e approva le correzioni.
3. Accendila con `skills.js on <nome>`.
4. Aggiungi una riga nella tabella della sezione 2, e se la skill viene da fuori una riga nella sezione 4.

## 2. Tutte le skill e i pacchetti

Una riga per skill o pacchetto. Tipo: `skill` (cartella della libreria, si accende con `skills.js`) o `plugin` (non sta nella libreria, si accende con `claude plugin`, vedi sotto la tabella).
La colonna «Quando proporla» dice a Claude in quale situazione ricordarti il pacchetto, anche se è spento.

| Nome | Tipo | Cosa fa | Quando proporla |
|---|---|---|---|
| `metodo` | plugin | `handoff`, `controllo-skill`, `research`, `wait-what`, l'hook del contesto, gli script `skills.js` e `hub-check.js` | Sempre acceso, non spegnerlo |
| `pocock-base` | plugin | `grill-me`, `grilling` (domande per allinearsi e stressare un piano), `teach` (imparare un argomento in più sessioni), `to-questionnaire` (dubbi da girare a un'altra persona), `retro` (lezioni a fine sessione), `writing-for-agents` | Sempre acceso: idee o piani da stressare, studio, fine sessione lunga, testi che leggerà un agente |
| `stop-slop` | plugin | Toglie dai testi in prosa i tic da scrittura automatica | Sempre acceso: testi da rivedere o da pubblicare |
| `superpowers` | plugin | Spec, piano ed esecuzione con subagenti, debug sistematico, test first | Sempre acceso: progettare e scrivere codice, bug che resiste |
| `ponytail` | plugin | Modalità «sviluppatore pigro»: la soluzione completa col minimo codice nuovo | Sempre acceso: ogni lavoro sul codice |
| `design-*` (6 plugin) | plugin | `design-impeccable`, `design-apple-design`, `design-ui-ux-pro-max`, `design-make-interfaces-feel-better`, `design-motion-ui`, `design-hallmark`: uno per skill, perché un plugin del marketplace ha una sola fonte. Stile, palette, font, animazioni, pagine da zero | Spenti: palette e font, pagina web da zero, stile preso da un sito. I risultati vanno vagliati |
| `qualita-web` | plugin | `web-quality-audit`: qualità e prestazioni di un sito | Spento: prima di pubblicare un sito, o quando è lento |
| `ingegneria-avanzata` | plugin | `wayfinder`, `domain-modeling`, `codebase-design`, `grill-with-docs`, `to-spec`, `to-tickets`, `prototype`, `git-guardrails-claude-code` | Spento: progetto software vero (architettura, modello del dominio), progetto di codice con git, progetto nuovo ed enorme (chiedi se usare `wayfinder` o `superpowers`) |
| `presentazioni` | plugin | `wowerpoint`: deck PDF di slide da un singolo documento | Spento: quando serve un deck da un documento |
| `marketing` | plugin | 43 skill di marketing: copy, ads, social, vendite | Spento: progetti business |
| `marketing-brand` | plugin | 27 skill di brand building | Spento: progetti business che costruiscono un marchio, insieme a `marketing` |
| `frontend-design` | plugin | Rivede e costruisce interfacce web curate | Spento: rivedere o costruire interfacce web |
| `code-review` | plugin | Rivede un diff, una PR o un percorso e segnala i bug | Spento: prima di chiudere una modifica importante |
| `claude-security` | plugin | Audit di sicurezza del codice | Spento: sito o app con login, dati o pagamenti; prima di un rilascio |
| `hyperframes` | plugin | Slide e presentazioni con video animati | Spento: solo presentazioni, non siti web |
| `claude-seo` | plugin | SEO tecnica e di contenuto | Spento: marketing e siti da posizionare, insieme a `marketing` |

Le skill che aggiungi dopo l'installazione vanno in questa tabella, con Tipo `skill`.

**Come si accende un plugin spento per un progetto** (i plugin del kit e quelli esterni, non `skills.js`): dalla cartella del progetto,
`claude plugin enable <plugin>@<marketplace> --scope project`. Scrive `enabledPlugins` in `.claude/settings.json` del progetto. `--scope user` lo accende per tutti i progetti, `--scope local` solo per te in quel progetto. `claude plugin disable` con lo stesso `--scope` lo spegne. Il nome completo `<plugin>@<marketplace>` lo mostra `claude plugin list`; per i plugin del kit il marketplace è `kit-metodo`.

## 3. Regole di scelta

### Di due skill che fanno lo stesso lavoro, una sola accesa

Se due skill coprono lo stesso compito, ne resta accesa una sola, la migliore. L'altra resta in libreria, spenta, e si elenca qui con la differenza.
Due skill simili accese si contendono lo stesso compito e Claude sceglie a caso. Non spegnere mai una skill di nascosto: dillo.

| Compito | Accesa | Spenta | Differenza |
|---|---|---|---|
| <compito condiviso> | `<nome>` | `<nome>` | <in cosa si distinguono> |

### Automatica o solo a richiesta

- **Automatica** (default): Claude legge la descrizione della skill a ogni conversazione e la carica da solo quando il contesto sembra giusto.
  Costo: poche decine di token fissi per skill, e il rischio che scatti nel momento sbagliato.
- **Solo a richiesta:** nel frontmatter di `SKILL.md` c'è la riga `disable-model-invocation: true`. Si usa solo scrivendo `/nome`. Costo zero, ma devi ricordarti che esiste.
- **Regola pratica:** manuale se la skill modifica file, impostazioni o hook, lancia agenti in background, ha un doppio uso oppure ne duplica un'altra.
  Automatica se è solo un riferimento di consultazione con un trigger chiaro.
- **Come cambiare:** aggiungi o togli `disable-model-invocation: true` nel `SKILL.md` della libreria, e annota la modifica nella sezione 4:
  un aggiornamento dalla fonte la cancellerebbe.

## 4. Origini e modifiche locali

Una riga per ogni skill che arriva da fuori o che hai modificato. `controllo-skill` legge e aggiorna questa tabella.

| Skill | Fonte | Commit | Modifiche |
|---|---|---|---|
