#!/usr/bin/env node
// Claude Code statusLine: context window usage (%) + remaining/max ratio in k, plus quota/git.
const { execSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input); } catch { data = {}; }

  const RED = '\x1b[31m', YELLOW = '\x1b[33m', GREEN = '\x1b[32m', CYAN = '\x1b[36m', DIM = '\x1b[2m', RESET = '\x1b[0m';

  const model = data.model?.display_name || '?';
  const dir = data.workspace?.current_dir || data.cwd || '';
  const dirName = dir.split(/[\\/]/).pop() || dir;

  const cw = data.context_window || {};
  const maxTokens = cw.context_window_size || 200000;
  const maxK = Math.round(maxTokens / 1000);
  const usedPct = cw.used_percentage != null ? cw.used_percentage : 0;
  const remainingPct = cw.remaining_percentage != null ? cw.remaining_percentage : (100 - usedPct);

  const pct = Math.round(usedPct);
  const remainingK = Math.round(maxK * remainingPct / 100);

  // gli hook non ricevono la % del contesto: la salvo per hooks/context-guard.js
  if (data.session_id) {
    try {
      const fs = require('fs'), path = require('path'), os = require('os');
      const dirPct = path.join(os.homedir(), '.claude', 'context-pct');
      fs.mkdirSync(dirPct, { recursive: true });
      fs.writeFileSync(path.join(dirPct, data.session_id), String(pct));
      fs.writeFileSync(path.join(dirPct, '_window'), String(maxTokens));
    } catch {}
  }

  // soglie basse apposta: oltre il 60% ogni chiamata rilegge troppo contesto, conviene /handoff + /clear
  let barColor = GREEN;
  if (pct >= 60) barColor = RED;
  else if (pct >= 50) barColor = YELLOW;
  const hint = pct >= 60 ? ` ${RED}→ /handoff + /clear${RESET}` : '';

  const BAR_WIDTH = 10;
  const filled = Math.min(BAR_WIDTH, Math.round(pct * BAR_WIDTH / 100));
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);

  let branch = '';
  try {
    branch = execSync('git branch --show-current', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: dir || process.cwd(),
      timeout: 1000,
    }).trim();
  } catch { /* not a git repo or git unavailable */ }

  const rl = data.rate_limits || {};
  const fiveH = rl.five_hour?.used_percentage;
  const sevenD = rl.seven_day?.used_percentage;
  const quotaParts = [];
  if (fiveH != null) quotaParts.push(`5h ${Math.round(fiveH)}%`);
  if (sevenD != null) quotaParts.push(`7g ${Math.round(sevenD)}%`);
  const quotaLabel = quotaParts.length ? ` ${DIM}|${RESET} quota ${quotaParts.join(' ')}` : '';

  const line1 = `${CYAN}[${model}]${RESET} 📁 ${dirName}${branch ? ` ${DIM}|${RESET} 🌿 ${branch}` : ''}`;
  const line2 = `${barColor}${bar}${RESET} ${pct}% memoria ${DIM}|${RESET} ${remainingK}k/${maxK}k rimasti${quotaLabel}${hint}`;

  console.log(line1);
  console.log(line2);
});
