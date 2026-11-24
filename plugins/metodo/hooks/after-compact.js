// SessionStart (matcher "compact"): dopo un compact fa rileggere l'ultimo handoff del progetto,
// così la ripartenza è come dopo /clear (riassunto + handoff aggiornato).
// Candidati: i percorsi .md con "handoff" nel nome, su righe del CLAUDE.md del progetto (es. appunti/handoff.md),
// più quelli in Claude/handoff/ e handoff/. Vince il giorno più recente nel nome (AAAA-MM-GG), così un link vecchio nel CLAUDE.md non copre quelli nuovi.
// Prova: node after-compact.js --self-test
const fs = require('fs')
const path = require('path')
const os = require('os')

function findHandoffs(cwd) {
  const files = []
  try {
    for (const line of fs.readFileSync(path.join(cwd, 'CLAUDE.md'), 'utf8').split('\n')) {
      if (!/handoff/i.test(line)) continue
      for (const m of line.match(/[^\s()`[\]<>]+\.md\b/g) || []) {
        if (!/handoff/i.test(m)) continue // la riga può citare altri .md, es. "regola nel CLAUDE.md globale"
        let rel = m
        try { rel = decodeURIComponent(m) } catch {}
        files.push(path.resolve(cwd, rel))
      }
    }
  } catch {}
  for (const dir of ['Claude/handoff', 'handoff']) {
    const full = path.join(cwd, dir)
    try { for (const f of fs.readdirSync(full)) if (f.endsWith('.md')) files.push(path.join(full, f)) } catch {}
  }
  // Conta il giorno nel nome (AAAA-MM-GG-...), non la data del file: correggere un handoff vecchio
  // non lo rende "l'ultimo" (anche la data di creazione cambia, perché Edit riscrive il file).
  // Senza data nel nome vale il giorno di modifica. Stesso giorno: prima il modificato più di recente.
  const found = []
  for (const p of [...new Set(files)]) {
    let t
    try { const s = fs.statSync(p); if (!s.isFile()) continue; t = s.mtimeMs } catch { continue }
    const m = path.basename(p).match(/^\d{4}-\d{2}-\d{2}/)
    const d = new Date(t)
    const day = m ? m[0] : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    found.push({ p, t, day })
  }
  found.sort((a, b) => b.day.localeCompare(a.day) || b.t - a.t)
  return found.filter(f => f.day === (found[0] && found[0].day)).map(f => f.p)
}

const findHandoff = cwd => findHandoffs(cwd)[0] || null

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'after-compact-'))
  const mk = (rel, text = 'x', age = 0) => {
    const p = path.join(root, rel)
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, text)
    const t = new Date(Date.now() - age * 1000)
    fs.utimesSync(p, t, t)
    return p
  }
  const check = (name, got, want) => {
    const ok = got === want
    console.log(`${ok ? 'OK ' : 'KO '} ${name}${ok ? '' : `: atteso ${want}, avuto ${got}`}`)
    return ok
  }
  let ok = true
  // 1. percorso dal CLAUDE.md (più recente di un handoff vecchio in Claude/handoff), con %20 nel link
  mk('a/Claude/handoff/vecchio.md', 'x', 3600)
  const appunti = mk('a/appunti mio/handoff.md')
  mk('a/CLAUDE.md', '| Ultimo handoff | [qui](appunti%20mio/handoff.md) |\n**Handoff** (regola nel CLAUDE.md globale), vedi `docs/stato.md`\n')
  ok &= check('percorso dal CLAUDE.md', findHandoff(path.join(root, 'a')), appunti)
  // 2. Claude/handoff, con un link vecchio nel CLAUDE.md che non deve vincere
  mk('b/handoff/2026-01-01.md', 'x', 7200)
  const nuovo = mk('b/Claude/handoff/2026-11-21.md')
  mk('b/CLAUDE.md', 'Handoff: il più recente è [questo](handoff/2026-01-01.md); modello `Claude/handoff/AAAA-MM-GG-<argomento>.md`\n')
  ok &= check('Claude/handoff', findHandoff(path.join(root, 'b')), nuovo)
  // 3. nessun handoff
  mk('c/CLAUDE.md', 'Niente da vedere\n')
  ok &= check('nessun handoff', findHandoff(path.join(root, 'c')), null)
  // 4. un handoff di un giorno prima, corretto oggi, non deve superare quello del giorno dopo
  mk('d/Claude/handoff/2026-11-20-vecchio.md')
  const recente = mk('d/Claude/handoff/2026-11-21-nuovo.md', 'x', 3600)
  ok &= check('handoff vecchio modificato', findHandoff(path.join(root, 'd')), recente)
  // 5. stesso giorno nel nome: li nomina tutti, il modificato per ultimo per primo
  const b1 = mk('e/Claude/handoff/2026-11-21-a.md')
  const b2 = mk('e/Claude/handoff/2026-11-21-b.md', 'x', 3600)
  mk('e/Claude/handoff/2026-11-19-c.md')
  ok &= check('stesso giorno', findHandoffs(path.join(root, 'e')).join('|'), [b1, b2].join('|'))
  fs.rmSync(root, { recursive: true, force: true })
  process.exitCode = ok ? 0 : 1
}

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  let cwd = process.cwd()
  try { cwd = JSON.parse(fs.readFileSync(0, 'utf8')).cwd || cwd } catch {}
  const [p, ...pari] = findHandoffs(cwd)
  if (p) {
    const scelta = pari.length
      ? `l'handoff più recente tra ${[p, ...pari].join(', ')} (stesso giorno nel nome: decide il contenuto, per esempio "sostituisce...")`
      : `l'handoff ${p}`
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `Compact appena fatto: prima di continuare rileggi ${scelta} (una volta sola) e riparti dalla sua sezione «In sospeso».`,
      },
    }))
  }
}
