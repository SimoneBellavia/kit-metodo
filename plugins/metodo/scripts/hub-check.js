#!/usr/bin/env node
// Controlla l'hub CLAUDE.md di un progetto: sotto 200 righe, riga 🧭 in cima,
// le 5 sezioni (per parola chiave nel titolo), link relativi che esistono.
// Uso: node hub-check.js [cartella...]   (default: .)   Esce 0 se tutti passano, 1 altrimenti.
const fs = require('node:fs');
const path = require('node:path');

const SEZIONI = { // parola chiave nel titolo "## " -> nome della sezione
  'come si lavora': 'Come si lavora qui',
  "regole d'oro": "Regole d'oro",
  decisioni: 'Decisioni',
  documenti: 'Documenti',
  skill: 'Skill del progetto',
};
const LINK = /\]\(([^)\s]+)\)/g;

function problemi(cartella) {
  const hub = path.join(cartella, 'CLAUDE.md');
  if (!fs.existsSync(hub) || !fs.statSync(hub).isFile()) return ['manca CLAUDE.md'];
  const testo = fs.readFileSync(hub, 'utf8').replace(/^\uFEFF/, '');
  const righe = testo.split(/\r?\n/);
  if (righe[righe.length - 1] === '') righe.pop(); // l'a capo finale non è una riga
  const out = [];
  if (righe.length >= 200) out.push(`${righe.length} righe (limite 200: il dettaglio va in docs/)`);
  if (!righe.slice(0, 12).some((r) => r.includes('🧭'))) out.push("manca la riga «🧭 Questo file è l'indice» in cima");
  const titoli = righe.filter((r) => r.startsWith('## ')).map((r) => r.toLowerCase());
  for (const [chiave, nome] of Object.entries(SEZIONI)) {
    if (!titoli.some((t) => t.includes(chiave))) out.push(`manca la sezione «${nome}»`);
  }
  righe.forEach((r, i) => {
    for (const [, dest] of r.matchAll(LINK)) {
      if (/^[a-z]+:|^#|^mailto:/.test(dest)) continue;
      const senzaAncora = dest.split('#')[0];
      let p;
      try {
        p = decodeURIComponent(senzaAncora);
      } catch {
        out.push(`r${i + 1}: link rotto → ${dest}`); // % malformato
        continue;
      }
      if (p && !fs.existsSync(path.join(cartella, p))) out.push(`r${i + 1}: link rotto → ${dest}`);
    }
  });
  return out;
}

function main(argv) {
  let esito = 0;
  for (const a of argv.length ? argv : ['.']) {
    const pr = problemi(a);
    console.log(`${pr.length ? 'NO ' : 'OK '} ${a}`);
    for (const x of pr) console.log(`    - ${x}`);
    if (pr.length) esito = 1;
  }
  return esito;
}

module.exports = { problemi };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
