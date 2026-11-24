const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { problemi } = require('../hub-check.js');

const SCRIPT = path.join(__dirname, '..', 'hub-check.js');

const HUB_VALIDO = [
  '# Progetto: prova',
  '',
  "> 🧭 **Questo file è l'indice.** I dettagli stanno nei file linkati sotto.",
  '',
  '## Come si lavora qui',
  '1. Si parla italiano.',
  '',
  "## Regole d'oro",
  '- Niente segreti.',
  '',
  '## Decisioni',
  '| Tema | Scelta |',
  '',
  '## Documenti',
  '| File | Leggilo quando |',
  '',
  '## Skill del progetto',
  '- nessuna',
  '',
].join('\n');

// Cartella temporanea con uno spazio nel percorso.
function nuovaCartella(contenuto, { crlfBom = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hub check '));
  if (contenuto !== null) {
    const testo = crlfBom ? '\uFEFF' + contenuto.replace(/\n/g, '\r\n') : contenuto;
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), testo, 'utf8');
  }
  return dir;
}

test('hub valido', () => {
  assert.deepStrictEqual(problemi(nuovaCartella(HUB_VALIDO)), []);
});

test('manca CLAUDE.md', () => {
  assert.deepStrictEqual(problemi(nuovaCartella(null)), ['manca CLAUDE.md']);
});

test('200 righe', () => {
  const lungo = HUB_VALIDO + '\nriga\n'.repeat(200);
  assert.ok(problemi(nuovaCartella(lungo)).some((p) => p.endsWith('righe (limite 200: il dettaglio va in docs/)')));
  // il limite è >= 200: un file di esattamente 200 righe non passa, uno di 199 sì
  const n = HUB_VALIDO.split('\n').length - 1;
  assert.ok(problemi(nuovaCartella(HUB_VALIDO + 'x\n'.repeat(200 - n))).includes('200 righe (limite 200: il dettaglio va in docs/)'));
  assert.deepStrictEqual(problemi(nuovaCartella(HUB_VALIDO + 'x\n'.repeat(199 - n))), []);
});

test('senza 🧭', () => {
  const hub = HUB_VALIDO.replace('🧭', '');
  assert.deepStrictEqual(problemi(nuovaCartella(hub)), ["manca la riga «🧭 Questo file è l'indice» in cima"]);
});

test('senza sezione Decisioni', () => {
  const hub = HUB_VALIDO.replace('## Decisioni', '## Altro');
  assert.deepStrictEqual(problemi(nuovaCartella(hub)), ['manca la sezione «Decisioni»']);
});

test('link rotto', () => {
  const hub = HUB_VALIDO + '\n[x](docs/manca.md)\n';
  const n = hub.split('\n').indexOf('[x](docs/manca.md)') + 1;
  assert.deepStrictEqual(problemi(nuovaCartella(hub)), [`r${n}: link rotto → docs/manca.md`]);
});

test('link con %20', () => {
  const dir = nuovaCartella(HUB_VALIDO + '\n[x](docs/a%20b.md)\n');
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'a b.md'), 'ok');
  assert.deepStrictEqual(problemi(dir), []);
});

test('link esterni, ancore e mailto non contano', () => {
  const hub = HUB_VALIDO + '\n[a](https://esempio.it) [b](#sezione) [c](mailto:x@y.it)\n';
  assert.deepStrictEqual(problemi(nuovaCartella(hub)), []);
});

test('ancora dopo il file: si controlla solo il file', () => {
  const dir = nuovaCartella(HUB_VALIDO + '\n[x](docs/a.md#titolo)\n');
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'a.md'), 'ok');
  assert.deepStrictEqual(problemi(dir), []);
});

test('% malformato: link rotto, lo script non cade', () => {
  const hub = HUB_VALIDO + '\n[x](docs/100%.md)\n';
  const n = hub.split('\n').indexOf('[x](docs/100%.md)') + 1;
  assert.deepStrictEqual(problemi(nuovaCartella(hub)), [`r${n}: link rotto → docs/100%.md`]);
});

test('CRLF e BOM: stesso esito del file LF, con problemi veri', () => {
  // BOM davanti a un titolo "## " (prima riga) e un link rotto: senza strip del BOM la sezione
  // «Come si lavora qui» sparisce; senza split corretto i numeri di riga e i link saltano.
  const hub = [
    '## Come si lavora qui',
    "> 🧭 **Questo file è l'indice.**",
    "## Regole d'oro",
    '## Documenti',
    '[x](docs/manca.md)',
    '## Skill',
    '',
  ].join('\n');
  const atteso = ['manca la sezione «Decisioni»', 'r5: link rotto → docs/manca.md'];
  assert.deepStrictEqual(problemi(nuovaCartella(hub)), atteso);
  assert.deepStrictEqual(problemi(nuovaCartella(hub, { crlfBom: true })), atteso);
});

test('CRLF e BOM: hub valido', () => {
  assert.deepStrictEqual(problemi(nuovaCartella(HUB_VALIDO, { crlfBom: true })), []);
});

test('CLI: exit code 0 e 1', () => {
  const ok = spawnSync('node', [SCRIPT, nuovaCartella(HUB_VALIDO)], { encoding: 'utf8' });
  assert.strictEqual(ok.status, 0);
  assert.match(ok.stdout, /^OK {2}/);
  const no = spawnSync('node', [SCRIPT, nuovaCartella(null)], { encoding: 'utf8' });
  assert.strictEqual(no.status, 1);
  assert.match(no.stdout, /^NO {2}.*\n {4}- manca CLAUDE\.md/);
});

test('CLI: senza argomenti controlla la cartella corrente', () => {
  const r = spawnSync('node', [SCRIPT], { encoding: 'utf8', cwd: nuovaCartella(HUB_VALIDO) });
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout, /^OK {2}\./);
});
