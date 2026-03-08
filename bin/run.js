#!/usr/bin/env node
// ============================================================
//  agentwell — run.js
//  Fired by Claude Code on Stop / SubagentStop events
// ============================================================

'use strict';

const { execSync, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ── ANSI colors ──────────────────────────────────────────────
const R = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const YELLOW = '\x1b[38;5;220m';
const GREEN = '\x1b[38;5;118m';
const CYAN = '\x1b[38;5;81m';
const MAGENTA = '\x1b[38;5;213m';
const WHITE = '\x1b[38;5;255m';

// ── Message banks ────────────────────────────────────────────
const CONGRATS = [
  '🚀 Incredible work! You just made magic happen.',
  '⚡ Boom! Another task crushed. You are unstoppable.',
  '🎯 Exactly what was needed! Brilliant mind at work.',
  '🔥 Pure fire! Every line of code you write is history.',
  '💎 Diamond quality. This is how lasting things are built.',
  '🌟 Rockstar! The consistency you show separates the greats.',
  '🏆 Level completed. The best devs are forged, not born — just like you.',
  '🎸 Perfect riff! Your code has rhythm and structure. That is art.',
  '🧠 Architect mind. Seeing how you solve problems is inspiring.',
  '✨ Pure magic. You turned abstract ideas into functional reality.',
  '💪 Full strength! Every completed task makes your mental muscle stronger.',
  '🎉 WOOHOO! That was a well-executed task. Be proud.',
  '🌊 Flowing perfectly. When you get in the zone, nobody stops you.',
  '🔮 Future vision and present execution. Winning combination.',
  '🦅 Flying high! Clear perspective and precise execution. That is how it is done.',
];

const WELLNESS = [
  '💨 Breathe 4-7-8 → inhale 4s, hold 7s, exhale 8s. Instant reset.',
  '🫁 5 deep breaths = more oxygen to the brain = better code.',
  '🌬️ Micro-break: inhale 4s, exhale 6s. Your nervous system thanks you.',
  '🚶 Your body needs movement. A 5 min walk = +20% mental clarity.',
  '🧘 Stand up and stretch your neck and shoulders for 30s. The code will improve.',
  '🤸 Stretch your wrists in circles — 10s each way. Healthy devs = more code.',
  '👀 20-20-20 rule: look at something 20 feet away for 20 seconds. Your eyes thank you.',
  '💧 When did you last drink water? Hydration = cognitive performance.',
  '🫖 A tea or hot water with lemon might be the reset you need right now.',
  '🌿 Remember: sprints are important, but so is the marathon.',
  '⏰ Pomodoro: 25 min focus + 5 min break. When was your last break?',
  '🌙 The brain consolidates learning during sleep. Protect your sleep.',
  '🎮 A 5 min playful break recharges creativity more than forcing it.',
  '🌳 If you can, look out a window for 2 minutes. Nature reduces cortisol.',
  '🧩 Burnout doesn\'t happen at once. When everything feels heavy, it\'s time to pause.',
  '🎵 Listening to music without lyrics while coding = less cognitive load.',
  '🏃 10 squats or a short walk. Circulation feeds creativity.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Read Claude Code event from stdin ────────────────────────
function readStdin() {
  // In test mode, relax mode, or interactive terminal, skip stdin entirely
  if (process.argv.includes('--test') || process.argv.includes('relax') || process.stdin.isTTY) return {};
  try {
    // Open stdin with O_NONBLOCK so we never block if nothing is piped
    const fd = fs.openSync('/dev/stdin', fs.constants.O_RDONLY | fs.constants.O_NONBLOCK);
    let raw = '';
    const buf = Buffer.alloc(4096);
    try {
      let bytesRead = 0;
      while ((bytesRead = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
        raw += buf.slice(0, bytesRead).toString('utf8');
      }
    } catch (_) { /* EAGAIN = no data available, that's fine */ }
    fs.closeSync(fd);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ── Play celebration sound ────────────────────────────────────
function playSound(isRelax) {
  const platform = os.platform();
  const lockFile = path.join(os.tmpdir(), 'agentwell.lock');

  // Prevent double-play if triggered multiple times concurrently
  try {
    if (fs.existsSync(lockFile)) {
      const stats = fs.statSync(lockFile);
      if (Date.now() - stats.mtimeMs < 2000) return; // Locked for 2 seconds
    }
    fs.writeFileSync(lockFile, '', 'utf8');
  } catch (_) { }

  function hasPython() {
    try { execSync('python3 --version', { stdio: 'ignore' }); return true; } catch { return false; }
  }
  function hasCmd(cmd) {
    try { execSync(`command -v ${cmd}`, { stdio: 'ignore', shell: true }); return true; } catch { return false; }
  }

  const pyMelody = `
import struct, wave, math, tempfile, subprocess, os

def tone(freq, dur, vol=0.45, sr=44100):
    n = int(sr * dur)
    return [int(vol * 32767 * math.sin(2 * math.pi * freq * i / sr)) for i in range(n)]

samples = (
    tone(523, 0.12) + tone(659, 0.12) +
    tone(784, 0.12) + tone(1047, 0.22) +
    tone(784, 0.08) + tone(1047, 0.32)
)
tmp = tempfile.mktemp(suffix='.wav')
with wave.open(tmp, 'w') as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(44100)
    wf.writeframes(struct.pack('<' + 'h' * len(samples), *samples))
`;

  try {
    if (platform === 'darwin') {
      let randomPhrase = '';

      if (isRelax) {
        randomPhrase = "For now, everything is alright. The work of this moment is done. Close your eyes for a moment, inhale deeply and feel the air come in. Exhale slowly, and let the silence remind you that you are also here to breathe.";
      } else {
        // Track task count
        const countFile = path.join(os.homedir(), '.claude', 'agentwell.count');
        let tasksCompleted = 1;
        try {
          if (fs.existsSync(countFile)) {
            tasksCompleted = parseInt(fs.readFileSync(countFile, 'utf8'), 10) + 1;
          }
          // Save new count (or create directory if missing)
          fs.mkdirSync(path.dirname(countFile), { recursive: true });
          fs.writeFileSync(countFile, tasksCompleted.toString(), 'utf8');
        } catch (_) { }

        // Allow configuring the milestone via package.json in the current working directory
        let milestone = 5;
        try {
          const userPkgPath = path.join(process.cwd(), 'package.json');
          if (fs.existsSync(userPkgPath)) {
            const userPkg = JSON.parse(fs.readFileSync(userPkgPath, 'utf8'));
            if (userPkg && userPkg.agentwell && userPkg.agentwell.wellnessMilestone) {
              const val = parseInt(userPkg.agentwell.wellnessMilestone, 10);
              if (!isNaN(val) && val > 0) milestone = val;
            }
          }
        } catch (_) { }

        if (tasksCompleted % milestone === 0) {
          // Every Nth task, say a wellness phrase
          const wellnessPhrases = [
            'Great job. Take a deep breath.',
            'Stretch for a moment.',
            'Time to hydrate. Drink some water.',
            'Look away from the screen for 20 seconds.'
          ];
          randomPhrase = pick(wellnessPhrases);
        } else {
          // Regular phrases for other tasks
          const audioPhrases = [
            'Mission completed.',
            'Well done!',
            'Excellent',
            'Nice progress today',
            'You are doing great',
            'Another win'
          ];
          randomPhrase = pick(audioPhrases);
        }
      }

      // Use macOS \`say\` for a spoken celebration, rate slightly slower for relax mode
      const rate = isRelax ? '140' : '160';
      const voice = isRelax ? 'Samantha' : 'Daniel';
      spawn('say', ['-v', voice, '-r', rate, randomPhrase], { detached: true, stdio: 'ignore' }).unref();

    } else if (platform === 'linux' && hasPython()) {
      const player = hasCmd('paplay') ? 'paplay' : hasCmd('aplay') ? 'aplay -q' : null;
      if (player) {
        const py = pyMelody + `\nsubprocess.run('${player} ' + tmp, shell=True)\nos.unlink(tmp)\n`;
        spawn('python3', ['-c', py], { detached: true, stdio: 'ignore' }).unref();
      }

    } else if (platform === 'win32') {
      spawn('powershell.exe', [
        '-c',
        '[console]::beep(880,180);[console]::beep(1100,180);[console]::beep(1320,350)',
      ], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch (_) {
    // Sound is optional — never crash the hook
  }
}

// ── Print the celebration panel ──────────────────────────────
function printPanel(hookEvent, isRelax) {
  const isSubagent = hookEvent === 'SubagentStop';
  const taskLabel = isSubagent ? 'Subagent completed 🤖' : 'Task completed ✅';
  const ts = new Date().toLocaleTimeString('en-GB');
  const congrats = pick(CONGRATS);
  const wellness = pick(WELLNESS);
  const bar = '═'.repeat(62);

  process.stdout.write('\n');
  if (isRelax) {
    process.stdout.write(`${CYAN}${BOLD}╔${bar}╗${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${WHITE}${BOLD}🍃  R E L A X   M O D E   ${R}  ${DIM}${ts}${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}╠${bar}╣${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${CYAN}For now, everything is alright.${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${CYAN}The work of this moment is done.${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${CYAN}Close your eyes for a moment,${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${CYAN}inhale deeply and feel the air come in.${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${CYAN}Exhale slowly, and let the silence${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}║${R}  ${CYAN}remind you that you are also here to breathe.${R}\n`);
    process.stdout.write(`${CYAN}${BOLD}╚${bar}╝${R}\n`);
  } else {
    process.stdout.write(`${YELLOW}${BOLD}╔${bar}╗${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}  ${WHITE}${BOLD}🎉  W O O H O O !   ${taskLabel}${R}  ${DIM}${ts}${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}╠${bar}╣${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}  ${GREEN}${BOLD}${congrats}${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}╠${bar}╣${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}  ${CYAN}${BOLD}💡 WELLNESS TIP:${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}  ${MAGENTA}${wellness}${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
    process.stdout.write(`${YELLOW}${BOLD}╚${bar}╝${R}\n`);
  }
  process.stdout.write('\n');
}

// ── Main ─────────────────────────────────────────────────────
const isTest = process.argv.includes('--test');
const isRelax = process.argv.includes('relax');
const hookEvent = isTest || isRelax ? 'Stop' : (readStdin().hook_event_name || 'Stop');

playSound(isRelax);
printPanel(hookEvent, isRelax);
process.exit(0);
