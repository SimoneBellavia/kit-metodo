# Prove di controllo-skill

Tre richieste reali con il risultato atteso. Si provano in una sessione nuova, con e senza la skill (`"off"` in `skillOverrides`).

1. **`/controllo-skill <nome>`** su una skill che l'utente ha copiato a mano nella sua libreria, senza `prove.md` e senza plugin di origine.
   Atteso: report nel formato della skill. Tutte le 12 regole hanno un esito. Prove con `file:riga`. Almeno una correzione proposta per la regola 10 (manca `prove.md`). Nessun file modificato.

2. **`/controllo-skill <nome>`** su una skill di altri con SKILL.md di oltre 2000 righe.
   Atteso: lettura affidata a un subagente Sonnet. Regola 4 non rispettata. Le correzioni proposte sono solo piccole e additive, oppure "spegnere/sostituire": nessuna riscrittura del corpo. Viene ricordata l'annotazione nella sezione "Origini e modifiche locali" del README.

3. **"Ho scaricato una skill nuova da GitHub, controllala prima di attivarla"** (cartella ancora fuori dall'albero delle skill).
   Atteso: ramo "skill nuova" del bivio. Inventario con l'origine (URL del repo). Report e attesa dell'approvazione. Dopo l'approvazione, il ricontrollo e l'elenco delle modifiche file per file.

Senza la skill, Claude di solito: corregge subito senza aspettare, riscrive le skill di altri, salta le prove e le citazioni `file:riga`.
