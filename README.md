Se sei Claude Code, leggi `INSTALLA.md` e proponi all'amico di seguirlo; non serve clonare il repo.

# Kit Metodo

Un marketplace di plugin per Claude Code che porta sul tuo computer un metodo di lavoro già rodato. Dentro trovi:

- i protocolli del `CLAUDE.md` globale (critica prima del codice, risparmio di token, quale modello per quale compito);
- un indice per ogni progetto e l'handoff a fine sessione, così la sessione dopo riparte dove hai lasciato;
- una libreria di skill: poche sempre accese, le altre spente e proposte al momento giusto;
- hook che tengono d'occhio il contesto e fanno salvare il lavoro prima che si riempia.

## Come si installa

1. Apri Claude Code.
2. Incolla il link di questo repo.
3. Scrivi: **installa il metodo da qui**.

Il tuo Claude legge `INSTALLA.md`, ti riassume cosa vuole fare e ti chiede il permesso prima di ogni passo. Ti arriveranno 10-15 richieste di permesso: leggile una per una.
Prima di toccare il tuo `CLAUDE.md` o il tuo `settings.json` fa una copia di sicurezza e ti mostra le differenze. A metà strada ti chiede di riaprire Claude Code, poi si riparte con «continua l'installazione del kit».

Servono Node e il comando `claude` da terminale. Se mancano, il tuo Claude propone di installarli. Il resto lo gestisce lui.

## Dove funziona

Il kit si usa con Claude Code sul tuo computer, da terminale o dall'estensione di VS Code: tutti e due leggono la stessa configurazione in `~/.claude`. È pensato per Windows e Mac. L'app desktop non l'ha provata nessuno, quindi il kit non promette niente su di essa. Nella chat di claude.ai dal browser non funziona, perché lì Claude non può toccare i file del tuo computer.

Il consiglio è lavorare in VS Code con l'estensione Claude Code: vedi le modifiche ai file prima di accettarle e clicchi sui file che Claude cita. Se non ci sei già, il tuo Claude te lo propone alla fine dell'installazione.

Se hai spostato la configurazione di Claude Code con la variabile `CLAUDE_CONFIG_DIR`, il kit non funziona: installazione e script cercano tutto in `~/.claude`.

## Se vuoi tornare indietro

Scrivi al tuo Claude: **togli il Kit Metodo e rimetti i miei backup**. Ti mostra cosa fa e chiede prima di ogni passo. Se preferisci farlo a mano, queste sono le cose da sistemare:

- **Plugin:** `claude plugin list` li elenca. Per ognuno, `claude plugin uninstall <nome>@<marketplace>`.
- **`~/.claude/CLAUDE.md` e `~/.claude/settings.json`:** le copie di prima hanno lo stesso nome con `.kit-backup-<data>` in fondo. Rimetti la copia al posto del file. Se la copia non c'è, il file prima non esisteva e puoi spostarlo nel Cestino.
- **Barra di stato e libreria delle skill:** `~/.claude/statusline.js` e `~/.claude/skills-library/`. Insieme alla libreria togli da `~/.claude/skills/` i collegamenti che puntano lì, poi rimetti in `~/.claude/skills/` le skill che avevi già: le copie stanno in `~/.claude/kit-backup-skills/`.

Riavvia Claude Code e sei tornato com'eri.

## Per capire il metodo

`FRAMEWORK.md` spiega a una persona, senza gergo, cosa fa ogni parte del kit e perché. Leggilo prima, dopo o mai: l'installazione funziona lo stesso.

## Licenza

MIT, nel file `LICENSE`. Le skill di altri autori restano nei loro repo, ognuna con la sua licenza: il kit le punta alla fonte.
