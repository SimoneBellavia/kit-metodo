#!/usr/bin/env node
// Accende e spegne le skill della libreria collegandole in ~/.claude/skills (o in un progetto).
// Uso: node skills.js list | on <nome> | off <nome> [--project <cartella>]
// "off" toglie solo il collegamento: la skill resta nella libreria.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const BUCKETS = ['engineering', 'productivity', 'design', 'misc', 'in-progress', 'deprecated'];
const USO = 'Uso: node skills.js list | on <nome> | off <nome> [--project <cartella>]';

const libreria = () => path.join(os.homedir(), '.claude', 'skills-library');

function esisteDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

// lstat vede anche i collegamenti rotti, che existsSync direbbe assenti.
function esisteQualcosa(p) {
  try { fs.lstatSync(p); return true; } catch { return false; }
}

// Bucket della libreria in cui compare la skill.
function trova(nome) {
  return BUCKETS.filter((b) => esisteDir(path.join(libreria(), b, nome)));
}

function lista(progetto) {
  let trovate = 0;
  for (const bucket of BUCKETS) {
    const dir = path.join(libreria(), bucket);
    if (!esisteDir(dir)) continue;
    const nomi = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
    for (const nome of nomi) {
      let stato = esisteQualcosa(path.join(os.homedir(), '.claude', 'skills', nome)) ? 'globale' : 'spenta';
      if (progetto && esisteQualcosa(path.join(progetto, '.claude', 'skills', nome))) stato += ', progetto';
      console.log(`${bucket}/${nome}  ${stato}`);
      trovate++;
    }
  }
  // il silenzio sembrerebbe un errore
  if (!trovate) console.log(`Nessuna skill nella libreria (${libreria()}).`);
  return 0;
}

function accendi(nome, progetto) {
  const trovate = trova(nome);
  if (trovate.length === 0) return errore(`${nome}: non c'è nella libreria`);
  if (trovate.length > 1) return errore(`${nome}: è in più bucket (${trovate.join(', ')}), tienine uno solo`);
  if (trovate[0] === 'deprecated') return errore(`${nome}: è in deprecated, non si accende`);

  const base = progetto ? path.join(progetto, '.claude', 'skills') : path.join(os.homedir(), '.claude', 'skills');
  const link = path.join(base, nome);
  if (esisteQualcosa(link)) return errore(`${nome}: esiste già in ${base}, non tocco niente`);

  fs.mkdirSync(base, { recursive: true });
  const sorgente = path.join(libreria(), trovate[0], nome);
  fs.symlinkSync(sorgente, link, process.platform === 'win32' ? 'junction' : 'dir');
  if (progetto) ignora(progetto, nome);
  console.log(`${nome}: accesa (${trovate[0]}/${nome})`);
  return 0;
}

// Aggiunge `.claude/skills/<nome>` al .gitignore del progetto, solo se manca.
function ignora(progetto, nome) {
  const file = path.join(progetto, '.gitignore');
  const riga = `.claude/skills/${nome}`;
  const attuale = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (attuale.split(/\r?\n/).some((r) => r.trim() === riga)) return;
  const acapo = attuale === '' || attuale.endsWith('\n') ? '' : '\n';
  fs.appendFileSync(file, `${acapo}${riga}\n`, 'utf8');
}

function spegni(nome, progetto) {
  const base = progetto ? path.join(progetto, '.claude', 'skills') : path.join(os.homedir(), '.claude', 'skills');
  const link = path.join(base, nome);
  let info;
  try { info = fs.lstatSync(link); } catch { return errore(`${nome}: non è accesa in ${base}`); }
  if (!info.isSymbolicLink()) {
    return errore(`${nome}: in ${base} è una cartella vera, non un collegamento della libreria. Non la tocco: spostala a mano nella libreria`);
  }
  // unlink toglie solo il collegamento (anche una junction), mai il contenuto della sorgente.
  fs.unlinkSync(link);
  console.log(`${nome}: spenta`);
  return 0;
}

function errore(messaggio) {
  console.error(messaggio);
  return 1;
}

function main(argv) {
  const args = [...argv];
  let progetto = null;
  const i = args.indexOf('--project');
  if (i !== -1) {
    progetto = args[i + 1];
    if (!progetto) return errore(USO);
    args.splice(i, 2);
  }
  const [comando, nome, ...resto] = args;
  if (comando === 'list' && nome === undefined) return lista(progetto);
  if ((comando === 'on' || comando === 'off') && nome !== undefined && resto.length === 0) {
    if (!/^[A-Za-z0-9._-]+$/.test(nome) || nome === '.' || nome === '..') return errore(`${nome}: nome non valido`);
    return comando === 'on' ? accendi(nome, progetto) : spegni(nome, progetto);
  }
  return errore(USO);
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
