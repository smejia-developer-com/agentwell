# 🤖💚 agentwell

> **Claude Code hook that celebrates every AI task completion — with sound, motivation, and wellness reminders to keep you sharp without burning out.**

<p align="center">
  <img src="https://img.shields.io/npm/v/agentwell?style=for-the-badge&color=blueviolet" alt="npm version"/>
  <img src="https://img.shields.io/badge/Claude_Code-Hook-blueviolet?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude Code Hook"/>
  <img src="https://img.shields.io/badge/Platform-macOS_%7C_Linux_%7C_WSL-informational?style=for-the-badge" alt="Platform"/>
  <img src="https://img.shields.io/badge/Dependencies-Zero-brightgreen?style=for-the-badge" alt="No dependencies"/>
</p>

---

## ✨ What it does

Every time a Claude Code agent finishes a task, **agentwell** fires automatically and:

| | Feature | Description |
|---|---|---|
| 🎵 | **Celebration sound** | Short festive melody synthesized locally — no audio library needed |
| 🎉 | **Motivational message** | Rotates through 15 unique congratulatory phrases |
| 💡 | **Wellness tip** | Rotates through 17 tips: breathing, movement, hydration, burnout prevention |
| 🤖 | **Smart detection** | Different label for main agent `Stop` vs. `SubagentStop` |

**The goal:** keep you energized, prevent burnout, and make AI-assisted programming feel less isolating — the agent celebrates *with* you.

---

## 🖥️ Terminal preview

```
╔══════════════════════════════════════════════════════════════╗
║  🎉  W O O H O O !   Tarea completada ✅  14:32:07
╠══════════════════════════════════════════════════════════════╣
║
║  🔥 ¡Fuego puro! Cada línea de código que escribes es historia.
║
╠══════════════════════════════════════════════════════════════╣
║  💡 TIP DE BIENESTAR:
║
║  🚶 Tu cuerpo necesita moverse. 5 min de caminar = +20% de claridad mental.
║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🚀 Installation

```bash
npm install -g agentwell
agentwell install
```

That's it. Open Claude Code and run `/hooks` to confirm.

---

## 📦 Requirements

- **Node.js** ≥ 16
- **Claude Code** installed and running
- **Python 3** (pre-installed on most systems) — used for audio synthesis
- Audio: `afplay` on macOS (built-in) · `paplay`/`aplay` on Linux · PowerShell on Windows

Zero npm dependencies.

---

## 🔧 CLI commands

```bash
agentwell install     # Install hooks into ~/.claude/settings.json
agentwell uninstall   # Remove agentwell hooks from settings
agentwell status      # Show current installation status
agentwell run         # Fire the panel manually to preview it
agentwell help        # Show help
```

---

## ⚙️ How it works

agentwell hooks into two Claude Code lifecycle events:

| Event | When it fires |
|---|---|
| `Stop` | Main agent finishes its response |
| `SubagentStop` | A subagent completes its task |

The hook is registered in `~/.claude/settings.json` automatically by `agentwell install`.

---

## 🎵 Audio synthesis

agentwell generates a short WAV melody in memory using Python's built-in `wave` and `struct` modules — **zero external audio libraries needed**. The sound plays in the background and never blocks the terminal.

Platform fallback chain:
```
macOS   → afplay  (built-in)
Linux   → paplay  (PulseAudio) → aplay (ALSA)
Windows → PowerShell beep
```

---

## 💬 Message banks

### 🎉 Motivational messages (15, random)
```
⚡ ¡Boom! Otra tarea destruida. Eres imparable.
💎 Calidad de diamante. Así se construyen cosas que duran.
🧠 Mente de arquitecto. Ver cómo resuelves problemas es inspirador.
...
```

### 💡 Wellness tips (17, random)

| Category | Examples |
|---|---|
| 🫁 Breathing | 4-7-8 technique, conscious breathing resets |
| 🚶 Movement | Micro-walks, wrist stretches, desk exercises |
| 💧 Hydration | Water and tea reminders |
| 🌿 Burnout prevention | Pomodoro, sleep hygiene, play breaks |
| 👀 Eye health | 20-20-20 rule |

---

## 🛠️ Customization

Edit `bin/run.js` (after cloning) to:
- Add your own messages to the `CONGRATS` or `WELLNESS` arrays
- Change the melody frequencies in the Python audio block
- Translate messages to English or any other language

---

## 🌍 Team setup

To share agentwell with your whole team, commit the hook to your project:

```bash
# Each team member installs globally once
npm install -g agentwell

# Add to project-level Claude Code settings
agentwell install  # installs to ~/.claude/settings.json (global)
```

Or manually add to `.claude/settings.json` in your repo:

```json
{
  "hooks": {
    "Stop": [{ "hooks": [{ "type": "command", "command": "agentwell run --managed-by agentwell", "async": true, "timeout": 10 }] }],
    "SubagentStop": [{ "hooks": [{ "type": "command", "command": "agentwell run --managed-by agentwell", "async": true, "timeout": 10 }] }]
  }
}
```

---

## 🧠 Philosophy

> The burnout risk in AI-augmented development is underestimated. When an agent can execute 20 tasks in the time it used to take a human to do 1, it's easy to enter a "hyper-productivity trance" — forgetting to breathe, move, or rest.

**agentwell** is a micro-intervention: a small moment of celebration + a gentle reminder that the human behind the keyboard matters more than the velocity of the agent.

---

## 📄 License

MIT — free to use, modify, and share.

---

## 🤝 Contributing

PRs welcome! Ideas:

- [ ] English message bank option via `agentwell install --lang en`
- [ ] Configurable tip categories (opt-out of certain wellness types)
- [ ] `--silent` flag to disable sound in CI/remote environments
- [ ] Session streak counter
- [ ] macOS `say` TTS integration for spoken celebrations

---

## 📬 Publish to npm

```bash
npm login
npm publish
```

Then anyone can install with:

```bash
npm install -g agentwell
agentwell install
```

---

<p align="center">
  Made with ☕ and Claude Code &nbsp;·&nbsp; If agentwell improved your dev day, give it a ⭐
</p>
