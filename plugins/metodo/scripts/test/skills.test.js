const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'skills.js');

// Ambiente finto: home e progetto in cartelle temporanee con uno spazio nel nome.
// skills.js gira sempre come processo figlio con HOME e USERPROFILE sulla home finta.
function ambiente(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'skills home '));
  const progetto = fs.mkdtempSync(path.join(os.tmpdir(), 'skills progetto '));
  t.after(() => {
    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(progetto, { recursive: true, force: true });
  });
  const lib = path.join(home, '.claude', 'skills-library');
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  const run = (...args) => spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8', env });
  const skill = (bucket, nome) => {
    const dir = path.join(lib, bucket, nome);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), '# prova', 'utf8');
    return dir;
  };
  const globale = (nome) => path.join(home, '.claude', 'skills', nome);
  const locale = (nome) => path.join(progetto, '.claude', 'skills', nome);
  return { home, progetto, run, skill, globale, locale };
}

const linkEsiste = (p) => {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
};

test('on globale crea il collegamento e list lo mostra', (t) => {
  const { run, skill, globale } = ambiente(t);
  skill('productivity', 'prova');
  skill('design', 'altra');
  const r = run('on', 'prova');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(linkEsiste(globale('prova')));
  assert.ok(fs.existsSync(path.join(globale('prova'), 'SKILL.md')));
  const l = run('list');
  assert.strictEqual(l.status, 0);
  assert.ok(l.stdout.split('\n').includes('productivity/prova  globale'), l.stdout);
  assert.ok(l.stdout.split('\n').includes('design/altra  spenta'), l.stdout);
});

test('list con la libreria vuota lo dice', (t) => {
  const { run } = ambiente(t);
  const l = run('list');
  assert.strictEqual(l.status, 0);
  assert.ok(l.stdout.includes('Nessuna skill nella libreria'), l.stdout);
});

test('on --project: collegamento e .gitignore, senza duplicati dopo off e on', (t) => {
  const { run, skill, progetto, globale, locale } = ambiente(t);
  skill('engineering', 'prova');
  const r = run('on', 'prova', '--project', progetto);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(linkEsiste(locale('prova')));
  assert.ok(!fs.existsSync(globale('prova')), 'il globale non va toccato');
  const gi = path.join(progetto, '.gitignore');
  assert.strictEqual(fs.readFileSync(gi, 'utf8'), '.claude/skills/prova\n');
  assert.ok(run('list', '--project', progetto).stdout.includes('engineering/prova  spenta, progetto'));
  assert.ok(!run('list').stdout.includes('progetto'), 'senza --project niente ", progetto"');
  assert.strictEqual(run('off', 'prova', '--project', progetto).status, 0);
  assert.ok(!linkEsiste(locale('prova')));
  assert.strictEqual(run('on', 'prova', '--project', progetto).status, 0);
  assert.strictEqual(fs.readFileSync(gi, 'utf8'), '.claude/skills/prova\n');
});

test('.gitignore esistente senza a capo finale: la riga nuova va a capo', (t) => {
  const { run, skill, progetto } = ambiente(t);
  skill('misc', 'prova');
  const gi = path.join(progetto, '.gitignore');
  fs.writeFileSync(gi, 'node_modules', 'utf8');
  assert.strictEqual(run('on', 'prova', '--project', progetto).status, 0);
  assert.strictEqual(fs.readFileSync(gi, 'utf8'), 'node_modules\n.claude/skills/prova\n');
});

test('on su un nome già presente: exit 1, cartella intatta', (t) => {
  const { run, skill, globale } = ambiente(t);
  skill('productivity', 'prova');
  fs.mkdirSync(globale('prova'), { recursive: true });
  fs.writeFileSync(path.join(globale('prova'), 'mio.txt'), 'dati', 'utf8');
  const r = run('on', 'prova');
  assert.strictEqual(r.status, 1);
  assert.ok(!linkEsiste(globale('prova')));
  assert.strictEqual(fs.readFileSync(path.join(globale('prova'), 'mio.txt'), 'utf8'), 'dati');
});

test('on su un nome in due bucket: exit 1 con i due bucket nel messaggio', (t) => {
  const { run, skill, globale } = ambiente(t);
  skill('design', 'doppia');
  skill('misc', 'doppia');
  const r = run('on', 'doppia');
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /design/);
  assert.match(r.stderr, /misc/);
  assert.ok(!fs.existsSync(globale('doppia')));
});

test('on su deprecated/vecchia: exit 1', (t) => {
  const { run, skill, globale } = ambiente(t);
  skill('deprecated', 'vecchia');
  const r = run('on', 'vecchia');
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /deprecated/);
  assert.ok(!fs.existsSync(globale('vecchia')));
});

test('on su una skill che non c\'è: exit 1', (t) => {
  const { run } = ambiente(t);
  assert.strictEqual(run('on', 'inesistente').status, 1);
});

test('off toglie il collegamento e la sorgente nella libreria resta', (t) => {
  const { run, skill, globale } = ambiente(t);
  const src = skill('productivity', 'prova');
  fs.writeFileSync(path.join(src, 'dentro.txt'), 'resta', 'utf8');
  assert.strictEqual(run('on', 'prova').status, 0);
  const r = run('off', 'prova');
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(!fs.existsSync(globale('prova')));
  assert.strictEqual(fs.readFileSync(path.join(src, 'dentro.txt'), 'utf8'), 'resta');
  assert.ok(fs.existsSync(path.join(src, 'SKILL.md')));
});

test('off su una cartella vera: exit 1, cartella e contenuto intatti', (t) => {
  const { run, globale } = ambiente(t);
  fs.mkdirSync(globale('vera'), { recursive: true });
  fs.writeFileSync(path.join(globale('vera'), 'SKILL.md'), 'mia', 'utf8');
  const r = run('off', 'vera');
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /libreria/);
  assert.strictEqual(fs.readFileSync(path.join(globale('vera'), 'SKILL.md'), 'utf8'), 'mia');
});

test('off dove non c\'è niente: exit 1', (t) => {
  const { run } = ambiente(t);
  const r = run('off', 'niente');
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /non è accesa/);
});

test('nome non valido: exit 1 e il disco non si tocca', (t) => {
  const { run, skill, home } = ambiente(t);
  skill('misc', 'prova');
  fs.mkdirSync(path.join(home, 'fuori'));
  for (const nome of ['../fuori', '..', '.', 'a/b', 'a b']) {
    assert.strictEqual(run('on', nome).status, 1, nome);
    assert.strictEqual(run('off', nome).status, 1, nome);
  }
  assert.ok(!fs.existsSync(path.join(home, '.claude', 'skills')));
  assert.ok(fs.existsSync(path.join(home, 'fuori')));
});

test('uso sbagliato: exit 1', (t) => {
  const { run } = ambiente(t);
  assert.strictEqual(run().status, 1);
  assert.strictEqual(run('boh').status, 1);
  assert.strictEqual(run('on').status, 1);
  assert.strictEqual(run('off').status, 1);
  assert.strictEqual(run('on', 'x', '--project').status, 1);
});
