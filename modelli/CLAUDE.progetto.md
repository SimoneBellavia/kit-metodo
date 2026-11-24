# <Nome del progetto>: cos'è in una riga

<Scopo in 2-3 righe: cosa si costruisce, per chi, perché.>

> 🧭 **Questo file è l'indice.** I dettagli stanno nei file linkati sotto.

<!-- Come usare questo modello: copialo come CLAUDE.md nella cartella del progetto quando scopo e prime decisioni sono chiari
     (non al primo messaggio). Sostituisci ogni <segnaposto>, poi cancella questi commenti.
     Resta sotto le 200 righe: quando cresce, il dettaglio va in docs/ e qui resta un link.
     Ogni fatto vive in un solo file: non copiare date o stati in più posti.
     Controllo: node "<METODO>/scripts/hub-check.js" <cartella del progetto> -->

---

## Come si lavora qui

1. **Lingua:** <la lingua di risposte e documenti>.
2. **Le decisioni chiuse sono vincolanti:** si cambiano solo in modo esplicito, modificando la tabella «Decisioni» qui sotto.
3. **`docs/` è la fonte di verità:** descrive le decisioni, non l'implementazione.
4. **Le ricerche si fanno con `/research`.**
5. **Handoff:** a fine sessione `/handoff` scrive in `<dove: un file da sovrascrivere, oppure una cartella come Claude/handoff/>`, e la sessione dopo riparte da lì.
6. **Git e rilascio:** <regole: branch, cosa non va mai in git, chi approva un push o un deploy>.

---

## Regole d'oro

Gli invarianti del dominio: quello che non si viola mai, qualunque sia il compito.

- <Sicurezza e dati personali: cosa non esce mai dal progetto>
- <Tono e linguaggio verso gli utenti>
- <Altro invariante del dominio>

---

## Decisioni

| Tema | Scelta (data) |
|---|---|
| <Tema> | <Scelta> (<data>) |

**Stato:** <a che punto è il progetto, aggiornato a fine di ogni task>.

---

## Documenti

| File | Leggilo quando |
|---|---|
| `docs/<nome>.md` | <quando serve questo approfondimento> |

I link ai file si scrivono relativi (testo tra parentesi quadre, percorso tra parentesi tonde) e solo quando il file esiste: `hub-check.js` segnala i link rotti.

---

## Skill del progetto

- **Sempre accese:** <quali, per questo progetto>.
- **Da ricordare qui:** <skill spente o manuali che servono in questo progetto, con una riga sul quando>.
