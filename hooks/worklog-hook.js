#!/usr/bin/env node
// momlee-guide worklog enforcement hook (mechanical, harness-executed).
// Modes:
//   track — PostToolUse(Bash): mark the session "worklog pending" after a
//           git commit in a MomLee repo.
//   clear — PostToolUse(Notion create/update): commit was logged, clear it.
//   gate  — Stop: block finishing the turn once if commits were never logged.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const mode = process.argv[2];
let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) { /* no input — fail open */ }
  const sessionId = String(input.session_id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '');
  const marker = path.join(os.tmpdir(), `momlee-worklog-pending-${sessionId}`);

  if (mode === 'track') {
    const cmd = String((input.tool_input && input.tool_input.command) || '');
    const cwd = String(input.cwd || '');
    const isCommit = /git\s+(commit|.*&&\s*git\s+commit)/.test(cmd);
    const isMomlee = /momlee/i.test(cmd) || /momlee/i.test(cwd);
    if (isCommit && isMomlee) {
      try { fs.writeFileSync(marker, new Date().toISOString()); } catch (_) {}
    }
    return process.exit(0);
  }

  if (mode === 'clear') {
    try { fs.unlinkSync(marker); } catch (_) {}
    return process.exit(0);
  }

  if (mode === 'gate') {
    // Never loop: if we're already continuing because of a stop hook, pass.
    if (input.stop_hook_active) return process.exit(0);
    if (fs.existsSync(marker)) {
      try { fs.unlinkSync(marker); } catch (_) {}
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason:
          'momlee-worklog gate: git commits were made in a MomLee repo this ' +
          'session and nothing was logged to the Notion Dev Changelog. Log the ' +
          'meaningful change NOW per momlee-worklog (one row via the Notion ' +
          'MCP, or the planning/from-sivan.md git fallback if Notion is not ' +
          'connected). If the commits were trivial (typo/formatting only), ' +
          'state that explicitly to the user instead of logging.',
      }));
      return process.exit(0);
    }
    return process.exit(0);
  }

  process.exit(0);
});
