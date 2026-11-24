// Hook UserPromptSubmit + PostToolUse. Il compact automatico scatta al 60% (CLAUDE_AUTOCOMPACT_PCT_OVERRIDE in settings.json)
// e la sessione riparte da sola. Questo hook è la rete di sicurezza se il compact non scatta: al 70% fa aggiornare l'handoff,
// oltre l'85% ordina di fermarsi. La % la scrive statusline.js in ~/.claude/context-pct/<session_id> (la stessa della barra).
const fs = require('fs'), path = require('path'), os = require('os');
const SOGLIA = 85, HANDOFF = 70, GIORNI = 7;

// Al massimo una volta al giorno cancella i file di sessioni più vecchi di GIORNI (i file "_..." come _window restano).
function pulisci(dir) {
  const marker = path.join(dir, '_pulizia'), ora = Date.now(), giorno = 864e5;
  try { if (ora - fs.statSync(marker).mtimeMs < giorno) return; } catch {}
  try { fs.writeFileSync(marker, ''); } catch { return; }
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('_')) continue;
    const p = path.join(dir, f);
    try { if (ora - fs.statSync(p).mtimeMs > GIORNI * giorno) fs.unlinkSync(p); } catch {}
  }
}

// Piano B (VS Code non esegue la statusLine): token dell'ultima risposta nel transcript / finestra salvata dalla barra.
function fromTranscript(file, dir) {
  try {
    const fd = fs.openSync(file, 'r'), size = fs.fstatSync(fd).size, len = Math.min(size, 512 * 1024);
    const buf = Buffer.alloc(len); fs.readSync(fd, buf, 0, len, size - len); fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n').reverse();
    for (const l of lines) {
      if (l.includes('"compact_boundary"')) return 0; // dopo un /compact l'ultimo uso registrato è quello vecchio
      if (!l.includes('"usage"')) continue;
      let u; try { u = JSON.parse(l).message?.usage; } catch { continue; }
      if (!u || u.input_tokens == null) continue;
      const used = u.input_tokens + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      let win = 200000;
      try { win = Number(fs.readFileSync(path.join(dir, '_window'), 'utf8')) || win; } catch {}
      return Math.round((used / win) * 100);
    }
  } catch {}
  return 0;
}

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let data;
  try { data = JSON.parse(input); } catch { return; }
  if (!data.session_id) return;
  const dir = path.join(os.homedir(), '.claude', 'context-pct');
  try { pulisci(dir); } catch {}
  let pct;
  try { pct = Number(fs.readFileSync(path.join(dir, data.session_id), 'utf8')); } catch { pct = fromTranscript(data.transcript_path, dir); }
  const flag = path.join(dir, data.session_id + '.avvisato'), hflag = path.join(dir, data.session_id + '.handoff');
  const event = data.hook_event_name;
  const say = (msg) => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: msg } }));
  // sotto soglia (es. dopo un compact) gli avvisi si riarmano
  if (!(pct >= HANDOFF)) { for (const f of [flag, hflag]) try { fs.unlinkSync(f); } catch {} return; }
  if (pct < SOGLIA) {
    if (fs.existsSync(hflag)) return;
    try { fs.writeFileSync(hflag, ''); } catch {}
    return say(`REGOLA DEL METODO: il contesto è al ${pct}% (soglia handoff ${HANDOFF}%). Al primo punto sicuro (azione in corso chiusa, niente a metà) ` +
      `aggiorna l'handoff del progetto con la skill handoff, senza chiedere e senza fermarti; poi continua a lavorare. ` +
      `Il compact automatico (al 60%) non è scattato: questo è il piano di riserva. Non chiedere all'utente di fare /clear.`);
  }
  // durante il lavoro l'avviso parte una volta sola per sessione, per non ripeterlo a ogni comando
  if (event === 'PostToolUse') {
    if (fs.existsSync(flag)) return;
    try { fs.writeFileSync(flag, ''); } catch {}
  }
  const msg = `REGOLA DEL METODO: il contesto è al ${pct}% (soglia ${SOGLIA}%). Fermati: non iniziare nuovi compiti né nuovi passi. ` +
    `Chiudi solo l'azione in corso se lasciarla a metà rompe qualcosa, poi di' all'utente a che punto sei e suggeriscigli di fare /handoff e poi /clear.`;
  say(msg);
});
