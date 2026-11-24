# Attribuzioni

Il plugin `metodo` contiene tre skill scritte da altri, copiate e modificate come permette la licenza MIT.

## research, wait-what e handoff

- Fonte: https://github.com/mattpocock/skills (commit `abeeaf95660ba9e8b7c753eb38f441ca707a8823`)
- Licenza: MIT, testo qui sotto.

Modifiche fatte rispetto all'originale:

- `research`: aggiunto `disable-model-invocation: true`, così parte solo quando la lancia l'utente.
- `wait-what`: tradotta in italiano. L'originale chiede inglese ASD-STE100; la versione del kit chiede italiano semplice con frasi brevi.
- `handoff` (fonte: `skills/productivity/handoff`): il documento si salva nel progetto, dove dice il `CLAUDE.md`, e non nella cartella temporanea del sistema. Intestazioni fisse in italiano, con la sezione «Da chiedere a inizio sessione» che la sessione successiva legge da sola. Limite di 150 righe, riporto delle voci ancora aperte e controlli prima della consegna. La sezione delle skill suggerite resta, ma come ultima intestazione fissa. Description, argument-hint e regole su duplicati e dati sensibili restano quasi uguali all'originale.

## Testo della licenza

```text
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
