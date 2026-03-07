#!/usr/bin/env node
// ============================================================
//  agentwell — run.js
//  Fired by Claude Code on Stop / SubagentStop events
// ============================================================

'use strict';

const { execSync, spawn } = require('child_process');
const os  = require('os');
const fs  = require('fs');

// ── ANSI colors ──────────────────────────────────────────────
const R       = '\x1b[0m';
const BOLD    = '\x1b[1m';
const DIM     = '\x1b[2m';
const YELLOW  = '\x1b[38;5;220m';
const GREEN   = '\x1b[38;5;118m';
const CYAN    = '\x1b[38;5;81m';
const MAGENTA = '\x1b[38;5;213m';
const WHITE   = '\x1b[38;5;255m';

// ── Message banks ────────────────────────────────────────────
const CONGRATS = [
  '🚀 ¡Increíble trabajo! Acabas de hacer que la magia suceda.',
  '⚡ ¡Boom! Otra tarea destruida. Eres imparable.',
  '🎯 ¡Exactamente lo que se necesitaba! Mente brillante en acción.',
  '🔥 ¡Fuego puro! Cada línea de código que escribes es historia.',
  '💎 Calidad de diamante. Así se construyen cosas que duran.',
  '🌟 ¡Estrella! La consistencia que muestras separa a los grandes.',
  '🏆 Nivel completado. Los mejores devs no nacen, se forjan — como tú.',
  '🎸 ¡Riff perfecto! Tu código tiene ritmo y estructura. Eso es arte.',
  '🧠 Mente de arquitecto. Ver cómo resuelves problemas es inspirador.',
  '✨ Magia pura. Convertiste ideas abstractas en realidad funcional.',
  '💪 ¡Fuerza total! Cada tarea completada es un músculo mental más fuerte.',
  '🎉 ¡WOOHOO! Eso fue una tarea bien ejecutada. Siéntete orgulloso.',
  '🌊 Fluyendo perfecto. Cuando entras en zona, nadie te detiene.',
  '🔮 Visión de futuro y ejecución del presente. Combinación ganadora.',
  '🦅 ¡Alta vuelta! Perspectiva clara y ejecución precisa. Así se hace.',
];

const WELLNESS = [
  '💨 Respira 4-7-8 → inhala 4s, retén 7s, exhala 8s. Reset instantáneo.',
  '🫁 5 respiraciones profundas = más oxígeno al cerebro = mejor código.',
  '🌬️ Micro-pausa: inhala 4s, exhala 6s. Tu sistema nervioso te lo agradece.',
  '🚶 Tu cuerpo necesita moverse. 5 min de caminar = +20% de claridad mental.',
  '🧘 Levántate y estira cuello y hombros 30 segundos. El código mejora.',
  '🤸 Estira las muñecas en círculos — 10s cada dirección. Devs sanos = más código.',
  '👀 Regla 20-20-20: mira algo a 6 metros por 20 segundos. Tus ojos te lo agradecen.',
  '💧 ¿Cuándo tomaste agua por última vez? Hidratación = rendimiento cognitivo.',
  '🫖 Un té o agua con limón puede ser el reset que necesitas ahora.',
  '🌿 Recuerda: los sprints son importantes, pero la maratón también.',
  '⏰ Pomodoro: 25 min de enfoque + 5 min de pausa. ¿Cuándo fue tu último break?',
  '🌙 El cerebro consolida aprendizajes durmiendo. Protege tu sueño.',
  '🎮 Una pausa lúdica de 5 min recarga más creatividad que seguir forzando.',
  '🌳 Si puedes, asómate a una ventana 2 minutos. La naturaleza reduce el cortisol.',
  '🧩 Burnout no llega de golpe. Cuando todo se siente pesado, es señal de pausa.',
  '🎵 Música sin letra mientras programas = menos distracción cognitiva.',
  '🏃 10 sentadillas o una caminata corta. La circulación alimenta la creatividad.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Read Claude Code event from stdin ────────────────────────
function readStdin() {
  try {
    const raw = fs.readFileSync('/dev/stdin', 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ── Play celebration melody (no external deps) ───────────────
function playSound() {
  const platform = os.platform();

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

  function hasPython() {
    try { execSync('python3 --version', { stdio: 'ignore' }); return true; } catch { return false; }
  }
  function hasCmd(cmd) {
    try { execSync(`command -v ${cmd}`, { stdio: 'ignore', shell: true }); return true; } catch { return false; }
  }

  try {
    if (platform === 'darwin' && hasPython()) {
      const py = pyMelody + `\nsubprocess.run(['afplay', tmp])\nos.unlink(tmp)\n`;
      spawn('python3', ['-c', py], { detached: true, stdio: 'ignore' }).unref();

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
function printPanel(hookEvent) {
  const isSubagent = hookEvent === 'SubagentStop';
  const taskLabel  = isSubagent ? 'Subagente completado 🤖' : 'Tarea completada ✅';
  const ts         = new Date().toLocaleTimeString('en-GB');
  const congrats   = pick(CONGRATS);
  const wellness   = pick(WELLNESS);
  const bar        = '═'.repeat(62);

  process.stdout.write('\n');
  process.stdout.write(`${YELLOW}${BOLD}╔${bar}╗${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}  ${WHITE}${BOLD}🎉  W O O H O O !   ${taskLabel}${R}  ${DIM}${ts}${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}╠${bar}╣${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}  ${GREEN}${BOLD}${congrats}${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}╠${bar}╣${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}  ${CYAN}${BOLD}💡 TIP DE BIENESTAR:${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}  ${MAGENTA}${wellness}${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}║${R}\n`);
  process.stdout.write(`${YELLOW}${BOLD}╚${bar}╝${R}\n`);
  process.stdout.write('\n');
}

// ── Main ─────────────────────────────────────────────────────
const isTest    = process.argv.includes('--test');
const hookEvent = isTest ? 'Stop' : (readStdin().hook_event_name || 'Stop');

playSound();
printPanel(hookEvent);
process.exit(0);
