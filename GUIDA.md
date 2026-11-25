# Guida per chi parte da zero (Mac)

Questa guida ti porta dall'inizio alla fine: installi Visual Studio Code, ci metti Claude Code, installi il metodo e impari a usarlo.
Non serve saper programmare. Ci vogliono 30-40 minuti. Tieni a portata di mano:

- l'account Claude che usi già nell'app, con abbonamento Pro o Max;
- la password del Mac;
- il link del kit che ti hanno mandato.

> **Una regola per sempre:** i tuoi progetti li fai in **Visual Studio Code**, non nell'app Claude. Nell'app, la chat e Cowork lavorano in un ambiente separato e non vedono il metodo installato sul tuo Mac. VS Code invece lo usa.

---

## Parte 1: installare Visual Studio Code

1. Apri Safari e vai su `https://code.visualstudio.com`. Premi il pulsante blu **Download for macOS**.
2. Apri la cartella **Download** (nel Dock, o dal Finder). Trovi **Visual Studio Code**: trascinalo nella cartella **Applicazioni**.
3. Apri **Applicazioni** e fai doppio clic su **Visual Studio Code**. Il Mac ti avvisa che è stata scaricata da Internet: premi **Apri**.
4. Tienilo nel Dock: tasto destro sull'icona blu in basso → **Opzioni** → **Mantieni nel Dock**.

## Parte 2: mettere Claude Code dentro VS Code

5. In VS Code premi **Cmd + Shift + X**: a sinistra si apre il pannello delle estensioni.
6. Nella casella di ricerca scrivi **Claude Code**. Scegli quella di **Anthropic** e premi **Install**.
7. Crea una cartella per i tuoi progetti. Nel Finder apri **Documenti**, poi menu **File → Nuova cartella**, e chiamala **Progetti**.
8. In VS Code: menu **File → Open Folder…** (apri cartella), scegli **Progetti** e premi **Apri**. Se VS Code chiede *«Do you trust the authors…?»*, premi **Yes, I trust the authors**. VS Code è in inglese: in questa guida trovi i nomi dei suoi menu come li vedi, con la traduzione tra parentesi quando serve.
9. Apri Claude: clicca l'icona a forma di scintilla nella barra stretta di icone a sinistra. In alternativa, in basso a destra c'è la scritta **✻ Claude Code**: cliccala. Se non trovi né l'una né l'altra, premi **Cmd + Shift + P**, scrivi **Claude Code** e scegli la voce con **Open**.
10. La prima volta compare il pulsante **Sign in** (accedi): premilo, si apre il browser, entra con il tuo account Claude, dai l'ok e torna in VS Code. Poi compare una lista di primi passi, *Learn Claude Code*: puoi guardarla o saltarla.

## Parte 3: installare il metodo

11. Nella chat di Claude incolla il messaggio con il link del kit che ti hanno mandato, e premi **Invio**.
12. Claude ti spiega cosa vuole fare e ti chiede se cominciare. Scrivi **sì**.
13. Arriveranno 10-15 richieste di permesso: prima di lanciare un comando o modificare un file, Claude si ferma e ti mostra cosa vuole fare, con i pulsanti per accettare o rifiutare.
    - se ti è chiaro cosa vuole fare, accetta;
    - se non ti è chiaro, rifiuta e scrivi *«spiegamelo con parole semplici»*, poi decidi.

    Prima di modificare i tuoi file, Claude ne fa sempre una copia di sicurezza.
14. **Riavviare VS Code.** Claude a volte ti chiede di riavviare. Succede almeno una volta, a metà strada, e a volte una seconda.
    - Premi **Cmd + Q**: VS Code si chiude del tutto. Chiudere solo la chat non basta.
    - Riapri VS Code dal Dock e apri Claude (punto 9).
    - Scrivi: **continua l'installazione del kit**.
15. Se ti dice che manca **Node**, ti dà il link `nodejs.org`:
    - scarica la versione **LTS** (il pulsante grande) e apri il file scaricato;
    - premi **Continua**, poi **Accetta**, poi **Installa**, e inserisci la password del Mac;
    - torna in VS Code e scrivi a Claude *«fatto»*.
16. Se ti chiede di accedere nel terminale: in VS Code apri il menu **Terminal → New Terminal** (nuovo terminale), in basso si apre una finestrella. Scrivi `claude` e premi **Invio**, accedi nel browser come al punto 10, poi scrivi `/exit` e premi **Invio**. Torna nella chat di Claude e scrivi *«fatto»*.
17. Se ti chiede quali plugin opzionali tenere e non sai cosa scegliere, scrivi *«tieni le scelte consigliate dal kit»*.
18. Alla fine Claude controlla che tutto funzioni e ti spiega come si usa.
19. Scrivigli *«fammi il resoconto per chi mi ha mandato il kit»*. Rileggilo: se non c'è niente di privato, mandalo.

## Parte 4: usarlo tutti i giorni

- **Ogni progetto ha la sua cartella**, dentro **Documenti/Progetti**. Per cominciare apri VS Code, fai **File → Open Folder…**, scegli la cartella del progetto e apri Claude.
- **Racconta cosa vuoi fare.** Claude ti dice prima i punti deboli dell'idea, poi propone come farla. Per i lavori grandi la scrive in un documento (la *spec*), poi in un piano a passi, poi la esegue.
- **Le modifiche le vedi prima.** VS Code ti mostra il file com'era e come diventa: accetti o rifiuti.
- **Un argomento per sessione.** Quando hai finito un lavoro, o Claude ti avvisa che la memoria della chat si sta riempiendo:
  - scrivi `/handoff`: Claude si segna a che punto sei;
  - poi scrivi `/clear`: la chat riparte pulita.

  La volta dopo apri la stessa cartella, dici cosa vuoi fare e Claude riparte da dove avevi lasciato.
- **Le skill** sono capacità extra: scrivere testi, fare ricerche, progettare grafica. Claude te le propone quando servono: tu rispondi sì o no.
- **Per fermare Claude** mentre lavora, premi **Esc**.
- **Se qualcosa non va,** chiedi a Claude *«cosa è successo?»*, oppure manda uno screenshot a chi ti ha mandato il kit.

Vuoi capire meglio il metodo? Leggi `FRAMEWORK.md`, quando ti va: per usarlo non serve.
