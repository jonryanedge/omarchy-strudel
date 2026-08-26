# omarchy-strudel

Background [Strudel](https://strudel.cc) live-coded music for [Omarchy Linux](https://omarchy.org) — plays **Coastline by eddyflux** on login, with a menubar icon to change songs, upload custom Strudel code, or disable playback.

---

## What is this?

- **Strudel** is a JavaScript port of TidalCycles, a live-coding pattern language for algorithmic music. It normally runs in a browser via the Web Audio API.
- **Omarchy** is an opinionated Arch Linux + Hyprland setup by DHH. Its current shell (`omarchy-shell`, v3.0+) is built on Quickshell/QML, with a first-class plugin system for bar widgets, panels, and services. Config lives in `~/.config/omarchy/shell.json`.
- **Coastline by eddyflux** is a Strudel track that loads samples from `github:eddyflux/crate`. It will be the default song.

---

## Two Deliverables

This project ships as **two separate deliverables** to respect Omarchy's architecture and the AGPL license:

### Deliverable 1: Arch Linux Package (`omarchy-strudel`)

The core package containing the playback engine, daemon, CLI tools, bundled songs, and systemd service. Installable via:

```bash
omarchy pkg add omarchy-strudel   # from the Omarchy package repo
# or
yay -S omarchy-strudel            # from AUR
```

This package is **AGPL-3.0-or-later** (required by Strudel's license). It does NOT modify any Omarchy defaults — it's purely opt-in.

### Deliverable 2: Omarchy Shell Plugin (`omarchy-strudel-bar`)

A separate git repository containing the Quickshell/QML bar widget that shows the music icon and handles click actions. Installable via:

```bash
omarchy plugin add https://github.com/<user>/omarchy-strudel-bar.git --enable --yes
```

The plugin is a thin UI layer — it shells out to `omarchy-strudel` CLI commands for all actual functionality. This separation means:
- The package can be used without the plugin (CLI-only, or with a legacy Waybar module)
- The plugin can be reviewed independently before enabling (per Omarchy's plugin security model)
- Neither deliverable touches the base Omarchy repo or its default package list

**Note:** For users not on Omarchy v3.0+ (or who prefer Waybar), the package also ships a legacy Waybar custom module script that outputs the same Waybar-style JSON.

---

## Why Not In the Default Image?

**License conflict**: Strudel is AGPL-3.0-or-later; Omarchy is MIT. AGPL code in the base image would create licensing tension that DHH likely won't accept.

**Philosophy**: Omarchy is "opinionated" and developer-focused. Auto-playing background music is a strong opinion that doesn't belong in a minimal base image.

**Architecture fit**: Omarchy's plugin system (`omarchy plugin add`) and package repo (`omarchy pkg add`) are specifically designed for third-party integrations. That's the right path.

**Dependency weight**: Node.js + native audio bindings + vendored npm packages would add non-trivial size to the ISO.

The correct integration path is: package repo (opt-in install) + shell plugin (opt-in bar widget). Not the base image.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                  DELIVERABLE 1: Package                   │
│                                                          │
│  ┌──────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │  systemd     │──►│  strudel-   │──►│  Playback    │  │
│  │  user service│   │  daemon     │   │  Engine      │  │
│  │  (autostart) │   │  (Node.js)  │   │  (strudel-   │  │
│  └──────────────┘   └─────────────┘   │   node)      │  │
│                         │              └──────────────┘  │
│                    Unix socket               │           │
│                   $XDG_RUNTIME_DIR/     ┌─────┴─────┐    │
│                     omarchy-strudel.sock │ PipeWire  │    │
│                         │                └───────────┘    │
│  ┌──────────────┐       │                                 │
│  │  CLI tool    │──────►│                                 │
│  │  omarchy-    │       │                                 │
│  │  strudel     │       │                                 │
│  └──────────────┘       │                                 │
│                         │                                 │
│  ┌──────────────┐       │                                 │
│  │  Menu script │──────►│                                 │
│  │  omarchy-    │       │                                 │
│  │  strudel-menu│       │                                 │
│  └──────────────┘       │                                 │
│                         │                                 │
│              ┌──────────┴──────────┐                      │
│              │ ~/.config/          │                      │
│              │   omarchy-strudel/  │                      │
│              │   ├── config.json   │                      │
│              │   ├── songs/        │                      │
│              │   │   ├── coastline │                      │
│              │   │   └── custom/   │                      │
│              │   └── state.json    │                      │
│              └─────────────────────┘                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              DELIVERABLE 2: Shell Plugin                  │
│                                                          │
│  ┌──────────────────────────────────┐                    │
│  │  omarchy-strudel-bar (QML)       │                    │
│  │  ├── manifest.json               │                    │
│  │  └── BarWidget.qml               │                    │
│  │                                  │                    │
│  │  Shows icon + tooltip in bar     │                    │
│  │  Left click → omarchy-strudel-   │                    │
│  │    menu (rofi/walker popup)      │                    │
│  │  Right click → play/pause toggle │                    │
│  │  Scroll → volume up/down         │                    │
│  └──────────────────────────────────┘                    │
│              │                                           │
│              │ shells out to omarchy-strudel CLI          │
│              ▼                                           │
└──────────────────────────────────────────────────────────┘
```

### Components

| Component | Deliverable | Technology | Purpose |
|-----------|-------------|-----------|---------|
| **Playback Engine** | 1 (package) | Node.js + `@strudel/*` + `node-web-audio-api` | Runs Strudel patterns headlessly, outputs audio via PipeWire |
| **Daemon** | 1 (package) | Node.js daemon with Unix socket IPC | Manages playback state, song switching, enable/disable |
| **CLI Tool** | 1 (package) | Bash script wrapping Node.js client | `omarchy-strudel play`, `stop`, `switch`, etc. |
| **Menu Script** | 1 (package) | Bash + walker/rofi | Full menu: change song, upload, disable, volume |
| **Systemd Service** | 1 (package) | systemd user unit | Autostart on login |
| **Bar Widget** | 2 (plugin) | Quickshell/QML | Shows icon + status in the Omarchy bar |
| **Legacy Waybar Module** | 1 (package) | Bash script → Waybar JSON | For older Omarchy versions using Waybar |
| **PKGBUILD** | 1 (package) | Arch Linux PKGBUILD | Packages everything into an installable `.pkg.tar.zst` |

---

## Key Technical Decisions

### 1. Headless Strudel Playback

Strudel normally requires a browser (Web Audio API). We use `@strudel/core` + `@strudel/mini` + `@strudel/tonal` + `@strudel/webaudio` backed by `node-web-audio-api` (Rust-based native audio). This outputs directly to the system audio server (PipeWire on Omarchy) — no browser, no Electron.

We vendor the approach from [`strudel-node`](https://github.com/AndrewAComb/strudel-node) directly rather than depending on it as a library, to keep control over the runtime and minimize dependencies.

**Fallback:** If the Web Audio approach proves unstable on some systems, we can use [`rendel`](https://github.com/wyote4094/rendel) to pre-render patterns to WAV and play them with `pw-play`. This loses live-coding flexibility but is very robust.

### 2. Menubar Integration (Two Paths)

**Omarchy v3.0+ (Quickshell):** A first-party shell plugin with `manifest.json` declaring `kinds: ["bar-widget"]`. The QML widget shells out to `omarchy-strudel status` for display data and `omarchy-strudel-menu` for the click action. Installed via `omarchy plugin add`.

**Legacy (Waybar):** A shell script at `/usr/lib/omarchy-strudel/waybar-module.sh` that outputs Waybar-style JSON. Users add a `custom/omarchy-strudel` module to their Waybar config. Same JSON format works in both systems.

### 3. IPC Protocol

A simple line-based JSON protocol over a Unix socket at `$XDG_RUNTIME_DIR/omarchy-strudel.sock`:

**Commands (client → daemon):**
```json
{"cmd": "status"}
{"cmd": "play"}
{"cmd": "pause"}
{"cmd": "stop"}
{"cmd": "next"}
{"cmd": "prev"}
{"cmd": "switch", "song": "coastline.js"}
{"cmd": "load", "code": "...strudel code..."}
{"cmd": "load_file", "path": "/path/to/song.js"}
{"cmd": "enable"}
{"cmd": "disable"}
{"cmd": "volume", "level": 0.8}
{"cmd": "list"}
```

**Responses (daemon → client):**
```json
{"ok": true, "state": "playing", "song": "coastline.js", "artist": "eddyflux", "volume": 0.7}
{"ok": true, "songs": [{"name": "coastline.js", "artist": "eddyflux"}, ...]}
{"ok": false, "error": "no song loaded"}
```

### 4. Song Format

Songs are plain JavaScript files containing Strudel code. They live in `~/.config/omarchy-strudel/songs/`. Each file is a self-contained Strudel pattern that uses `samples()`, `setcps()`, and ends with a pattern expression (no `$:` needed — the daemon evaluates the last expression).

Bundled songs ship to `/usr/share/omarchy-strudel/songs/` and are copied to the user's config on first run.

### 5. License

Strudel is **AGPL-3.0-or-later**. Both deliverables are AGPL-3.0-or-later to remain compatible. The `coastline.js` track is by eddyflux (from the Strudel workshop examples / patternuary 2024). The eddyflux/crate samples are on GitHub.

The Omarchy shell plugin, being a derivative that shells out to the AGPL daemon, is also AGPL-3.0-or-later.

---

## File Layout (Repository — Deliverable 1)

```
omarchy-strudel/
├── PLAN.md                          # This document
├── LICENSE                          # AGPL-3.0
├── README.md                        # User documentation
├── PKGBUILD                         # Arch Linux package build
├── .omarchy/
│   └── package.json                 # Omarchy package metadata (source: local)
│
├── package.json                     # Node.js project manifest
├── src/                             # Node.js playback daemon
│   ├── daemon.mjs                   # Main daemon: socket server, state management
│   ├── playback.mjs                 # Strudel playback engine (strudel-node approach)
│   ├── config.mjs                   # Config/state file management
│   ├── songs.mjs                    # Song discovery, loading, validation
│   └── ipc.mjs                      # Unix socket IPC helpers
│
├── songs/                           # Bundled songs
│   └── coastline.js                 # Coastline by eddyflux (default)
│
├── bin/                             # CLI tools installed to /usr/bin
│   ├── omarchy-strudel              # Main control command (status, play, stop, etc.)
│   ├── omarchy-strudel-daemon       # Daemon entry point (called by systemd)
│   └── omarchy-strudel-menu         # Menu launcher (for menubar click action)
│
├── lib/                             # Shell helpers installed to /usr/lib/omarchy-strudel
│   └── waybar-module.sh             # Legacy Waybar custom module script
│
├── systemd/
│   └── omarchy-strudel.service      # systemd user unit
│
└── share/
    ├── default-config.json          # Default config template
    └── install.sh                   # Post-install hook: set up user config
```

## File Layout (Repository — Deliverable 2)

Separate git repo (`omarchy-strudel-bar`):

```
omarchy-strudel-bar/
├── LICENSE                          # AGPL-3.0
├── README.md                        # Plugin documentation
├── manifest.json                    # Omarchy shell plugin manifest
└── BarWidget.qml                    # QML bar widget
```

### Installed File Layout (Package)

```
/usr/bin/omarchy-strudel                    # CLI control tool
/usr/bin/omarchy-strudel-daemon             # Daemon entry point
/usr/bin/omarchy-strudel-menu               # Menu launcher
/usr/lib/omarchy-strudel/                   # Node.js app
  ├── src/daemon.mjs
  ├── src/playback.mjs
  ├── src/config.mjs
  ├── src/songs.mjs
  ├── src/ipc.mjs
  ├── node_modules/                        # Vendored dependencies
  └── package.json
/usr/lib/omarchy-strudel/waybar-module.sh   # Legacy Waybar module
/usr/share/omarchy-strudel/                 # Shared data
  ├── songs/coastline.js                    # Default song
  └── default-config.json                   # Config template
/usr/lib/systemd/user/omarchy-strudel.service  # systemd unit
```

User config (created on first run / post-install):
```
~/.config/omarchy-strudel/
  ├── config.json                           # Settings (enabled, volume, current song)
  ├── state.json                            # Runtime state (persisted)
  └── songs/
      ├── coastline.js                      # Copied from /usr/share on first run
      └── custom/                           # User-uploaded songs
```

Plugin install location (Deliverable 2):
```
~/.config/omarchy/plugins/omarchy.strudel-bar/
  ├── manifest.json
  └── BarWidget.qml
```

---

## Implementation Roadmap

### Phase 1: Playback Engine
**Goal:** Play Coastline from the command line with audio output.

1. Set up Node.js project with `@strudel/core`, `@strudel/mini`, `@strudel/tonal`, `@strudel/webaudio`, `node-web-audio-api`
2. Write `coastline.js` with the full eddyflux track code
3. Create `src/playback.mjs` — load a `.js` file, evaluate the Strudel pattern, play it in a loop
4. Implement basic controls: start, stop, switch song

**Deliverable:** `omarchy-strudel-daemon` can play `coastline.js` and output sound.

### Phase 2: Daemon & IPC
**Goal:** A persistent daemon controllable via CLI.

1. Implement Unix socket server in `src/daemon.mjs`
2. Implement the IPC protocol (commands + responses) in `src/ipc.mjs`
3. Implement state management (current song, playing/paused, volume, enabled)
4. Implement config persistence (`src/config.mjs`) — `config.json`, `state.json`
5. Implement song discovery (`src/songs.mjs`) — scan `songs/` directory
6. Write `bin/omarchy-strudel` CLI tool that sends commands to the daemon

**Deliverable:** `omarchy-strudel play`, `omarchy-strudel stop`, `omarchy-strudel switch coastline.js` all work.

### Phase 3: Menubar Integration
**Goal:** Icon in the Omarchy bar with working controls.

1. Write the legacy Waybar module script (`lib/waybar-module.sh`) — queries daemon, returns JSON
2. Write the menu launcher (`bin/omarchy-strudel-menu`) using walker/rofi for:
   - Play / Pause / Stop
   - Next / Previous song
   - Select from song list
   - Upload custom Strudel file (file picker)
   - Enable / Disable
   - Volume control
3. Create the Omarchy shell plugin (Deliverable 2): `manifest.json` + `BarWidget.qml`

**Deliverable:** Bar icon shows status; clicking it opens the menu; menu actions control playback.

### Phase 4: Systemd Service & Autostart
**Goal:** Music starts automatically on login.

1. Write `omarchy-strudel.service` systemd user unit (starts after PipeWire)
2. Install the unit to `/usr/lib/systemd/user/`
3. Post-install script enables the service
4. Handle the "enabled" config flag — if user disabled it, service starts but stays idle

**Deliverable:** Reboot → music plays. `omarchy-strudel disable` → stays off across reboots.

### Phase 5: Custom Song Upload
**Goal:** Users can add their own Strudel code.

1. File upload via the menu (file picker → copy to `~/.config/omarchy-strudel/songs/custom/`)
2. Direct code input: `omarchy-strudel load -` reads from stdin
3. Validate Strudel code before accepting (basic syntax check)
4. Auto-discover new songs in the custom directory
5. Handle errors gracefully (bad code → show error, keep playing current song)

**Deliverable:** User can write Strudel code, upload it, and it appears in the song list.

### Phase 6: PKGBUILD & Packaging
**Goal:** Installable Arch Linux package.

1. Write `PKGBUILD` that depends on `nodejs`, `pipewire`, bundles vendored `node_modules/`
2. Write `.omarchy/package.json` metadata for the Omarchy package repo
3. Test with `makepkg` and `pacman -U`
4. Optionally submit to the `omarchy-pkgs` repository or AUR

**Deliverable:** `omarchy pkg add omarchy-strudel` installs the full package.

### Phase 7: Polish & Edge Cases
**Goal:** Production quality.

1. Graceful degradation: if PipeWire isn't ready, retry with backoff
2. Volume control via PipeWire (not just Strudel gain)
3. Don't play if audio session is active (optional, via MPRIS/WirePlumber)
4. Fade in/out on start/stop/switch to avoid clicks
5. Logging to `~/.local/state/omarchy-strudel/daemon.log`
6. Uninstall cleanup (remove bar module entry, disable service)

---

## Dependencies

### Runtime (pacman)
| Package | Purpose |
|---------|---------|
| `nodejs` | Run the Strudel playback daemon |
| `pipewire` | Audio output (already on Omarchy) |

### Node.js (vendored in package)
| Package | Purpose |
|---------|---------|
| `@strudel/core` | Pattern engine, scheduler |
| `@strudel/mini` | Mini-notation parser |
| `@strudel/tonal` | Chord/voicing/scale helpers (used by coastline) |
| `@strudel/webaudio` | Web Audio output binding (superdough) |
| `node-web-audio-api` | Native Web Audio API for Node.js (Rust-backed) |

### Build (makepkg)
| Package | Purpose |
|---------|---------|
| `npm` | Install Node.js dependencies during build |
| `base-devel` | Standard build tools |

### Optional (for menubar)
| Package | Purpose |
|---------|---------|
| `omarchy-shell` | Bar integration via plugin (v3.0+) |
| `waybar` | Legacy bar integration |
| `walker` or `rofi` | Menu popup for the menubar icon |

---

## The Coastline Track

The default song, by eddyflux (patternuary 2024 #4), uses the `eddyflux/crate` sample bank and General MIDI sounds:

```javascript
// "coastline" @by eddyflux
// @version 1.0
samples('github:eddyflux/crate')
setcps(.75)
let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
stack(
  stack( // DRUMS
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.5)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  , // CHORDS
  chords.offset(-1).voicing().s("gm_epiano1:1")
  .phaser(4).room(.5)
  , // MELODY
  n("<0!3 1*2>").set(chords).mode("root:g2")
  .voicing().s("gm_acoustic_bass"),
  chords.n("[0 <4 3 <2 5>>*2](<3 5>,8)")
  .anchor("D5").voicing()
  .segment(4).clip(rand.range(.4,.8))
  .room(.75).shape(.3).delay(.25)
  .fm(sine.range(3,8).slow(8))
  .lpf(sine.range(500,1000).slow(8)).lpq(5)
  .rarely(ply("2")).chunk(4, fast(2))
  .gain(perlin.range(.6, .9))
  .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
```

Source: [Strudel workshop](https://strudel.cc/workshop/getting-started/) / [REPL link](https://strudel.cc/?cgpbyPDDd8ZH)

---

## Key References

- **Omarchy**: [omarchy.org](https://omarchy.org) / [GitHub](https://github.com/basecamp/omarchy) / [Manual](https://omarchy.org/manual/)
- **Omarchy Shell**: [shell/README.md](https://github.com/basecamp/omarchy/blob/quattro/shell/README.md) — plugin system, manifest schema, IPC
- **Omarchy Bar**: [shell/plugins/bar/README.md](https://github.com/basecamp/omarchy/blob/quattro/shell/plugins/bar/README.md) — widget catalog, shell.json config
- **Omarchy Packages**: [omacom-io/omarchy-pkgs](https://github.com/omacom-io/omarchy-pkgs) — package repo, build system
- **Omarchy AGENTS.md**: [AGENTS.md](https://github.com/basecamp/omarchy/blob/quattro/AGENTS.md) — coding conventions, command naming
- **Strudel**: [strudel.cc](https://strudel.cc) / [npm packages](https://www.npmjs.com/search?q=%40strudel) / [REPL docs](https://strudel.cc/technical-manual/repl/)
- **strudel-node**: [github.com/AndrewAcomb/strudel-node](https://github.com/AndrewAcomb/strudel-node) — Node.js runtime reference
- **rendel** (fallback): [github.com/wyote4094/rendel](https://github.com/wyote4094/rendel) — headless render to WAV
- **Arch PKGBUILD**: [ArchWiki - Creating packages](https://wiki.archlinux.org/title/Creating_packages)
- **Coastline track**: eddyflux / [eddyflux.cc](https://eddyflux.cc) / [eddyflux/crate samples](https://github.com/eddyflux/crate)
