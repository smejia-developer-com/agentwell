#!/usr/bin/env node
// ============================================================
//  agentwell — cli.js
//  Commands: install | uninstall | run | status | help
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const RUN_SCRIPT = path.resolve(__dirname, 'run.js');
const HOOK_CMD = `node "${RUN_SCRIPT}"`;
const MANAGED_TAG = '--managed-by agentwell';
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

// ── Colors ───────────────────────────────────────────────────
const R = s => `\x1b[31m${s}\x1b[0m`;
const G = s => `\x1b[32m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const B = s => `\x1b[1m${s}\x1b[0m`;
const D = s => `\x1b[2m${s}\x1b[0m`;
const C = s => `\x1b[36m${s}\x1b[0m`;

// ── Help ─────────────────────────────────────────────────────
function printHelp() {
  console.log(`
${B('agentwell')} — Claude Code wellness hook 🎉💚

${B('Usage:')}
  agentwell install     Install hooks into ~/.claude/settings.json
  agentwell uninstall   Remove agentwell hooks from settings
  agentwell status      Show current installation status
  agentwell run         Fire the celebration panel manually (test)
  agentwell relax       Play a guided breathing & relaxation audio
  agentwell help        Show this help message

${B('What it does:')}
  Every time a Claude Code agent finishes a task, agentwell:
    🎵  Plays a celebration melody
    🎉  Shows a motivational message
    💡  Shows a developer wellness tip

${B('Hooked events:')}  Stop · SubagentStop

${B('More info:')}  https://github.com/smejia-developer-com/agentwell
`);
}

// ── Settings helpers ─────────────────────────────────────────
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    }
  } catch (e) {
    console.error(R(`⚠ Could not parse ${SETTINGS_PATH}: ${e.message}`));
  }
  return {};
}

function saveSettings(data) {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function makeHookEntry() {
  return {
    type: 'command',
    command: `${HOOK_CMD} ${MANAGED_TAG}`,
    async: true,
    timeout: 10,
  };
}

function isAgentWellEntry(entry) {
  return typeof entry.command === 'string' && entry.command.includes(MANAGED_TAG);
}

// ── Install ──────────────────────────────────────────────────
function install() {
  const settings = loadSettings();
  settings.hooks = settings.hooks || {};

  const EVENTS = ['Stop', 'SubagentStop'];
  let installed = 0;

  for (const event of EVENTS) {
    settings.hooks[event] = settings.hooks[event] || [];

    const alreadyInstalled = settings.hooks[event].some(group =>
      Array.isArray(group.hooks) && group.hooks.some(isAgentWellEntry)
    );

    if (alreadyInstalled) {
      console.log(Y(`⚠  ${event}: already installed — skipping`));
      continue;
    }

    settings.hooks[event].push({ hooks: [makeHookEntry()] });
    installed++;
    console.log(G(`✓  ${event}: hook added`));
  }

  if (installed > 0) {
    saveSettings(settings);
    console.log('\n' + G('✅ agentwell installed successfully!'));
    console.log(D(`   Settings: ${SETTINGS_PATH}`));
    console.log(D('   Verify with /hooks inside Claude Code.\n'));
  } else {
    console.log('\n' + Y('agentwell is already fully installed. Nothing changed.\n'));
  }
}

// ── Uninstall ────────────────────────────────────────────────
function uninstall() {
  const settings = loadSettings();

  if (!settings.hooks) {
    console.log(Y('No hooks section found in settings. Nothing to remove.\n'));
    return;
  }

  let removed = 0;

  for (const event of Object.keys(settings.hooks)) {
    const before = settings.hooks[event].length;

    settings.hooks[event] = settings.hooks[event]
      .map(group => ({
        ...group,
        hooks: (group.hooks || []).filter(h => !isAgentWellEntry(h)),
      }))
      .filter(group => group.hooks && group.hooks.length > 0);

    if (settings.hooks[event].length < before) {
      removed++;
      console.log(G(`✓  ${event}: hook removed`));
    }
  }

  if (removed > 0) {
    saveSettings(settings);
    console.log('\n' + G('✅ agentwell uninstalled.\n'));
  } else {
    console.log(Y('\nNo agentwell hooks found to remove.\n'));
  }
}

// ── Status ───────────────────────────────────────────────────
function status() {
  const settings = loadSettings();

  console.log(B('\nagentwell status:\n'));
  console.log(D(`  Settings file: ${SETTINGS_PATH}\n`));

  for (const event of ['Stop', 'SubagentStop']) {
    const groups = (settings.hooks || {})[event] || [];
    const found = groups.some(g =>
      Array.isArray(g.hooks) && g.hooks.some(isAgentWellEntry)
    );
    const label = found ? G('✓ installed') : R('✗ not found');
    console.log(`  ${event.padEnd(16)} ${label}`);
  }

  console.log();
}

// ── Run (manual test) ────────────────────────────────────────
function run(cmdName) {
  if (cmdName && !process.argv.includes(cmdName)) {
    process.argv.push(cmdName);
  }
  require('./run.js');
}

// ── Router ───────────────────────────────────────────────────
const cmd = process.argv[2];

switch (cmd) {
  case 'install': install(); break;
  case 'uninstall': uninstall(); break;
  case 'status': status(); break;
  case 'run': run(cmd); break;
  case 'relax': run(cmd); break;
  case 'help':
  case '--help':
  case '-h':
  default:
    printHelp();
}
