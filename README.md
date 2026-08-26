# omarchy-strudel

Background [Strudel](https://strudel.cc) live-coded music for [Omarchy Linux](https://omarchy.org). Plays **Coastline by eddyflux** on login, with a menubar icon to change songs, upload custom Strudel code, or disable playback.

## Install

### Option A: Omarchy package repo

```bash
omarchy pkg add omarchy-strudel
```

### Option B: AUR

```bash
yay -S omarchy-strudel
```

### Option C: From source

```bash
git clone https://github.com/<user>/omarchy-strudel.git
cd omarchy-strudel
makepkg -si
```

After installing, run the post-install script:

```bash
/usr/share/omarchy-strudel/install.sh
```

## Menubar icon (Omarchy v3.0+)

Install the shell plugin:

```bash
omarchy plugin add https://github.com/<user>/omarchy-strudel-bar.git --enable --yes
```

The bar widget appears in the right section. Drag it to reposition. Left-click opens the menu, right-click toggles play/pause, middle-click stops.

## Menubar icon (legacy Waybar)

Add to `~/.config/waybar/config.jsonc`:

```json
"custom/omarchy-strudel": {
  "exec": "/usr/lib/omarchy-strudel/waybar-module.sh",
  "interval": 2,
  "on-click": "omarchy-strudel-menu",
  "on-click-right": "omarchy-strudel play"
}
```

Add `"custom/omarchy-strudel"` to your `modules-right` array.

## Usage

```bash
omarchy-strudel status              # show current status
omarchy-strudel play                # start playing
omarchy-strudel stop                # stop playing
omarchy-strudel next                # next song
omarchy-strudel switch coastline.js # switch to a specific song
omarchy-strudel list                # list available songs
omarchy-strudel volume 0.5          # set volume (0.0–1.0)
omarchy-strudel disable             # disable playback
omarchy-strudel enable              # enable playback
omarchy-strudel menu                # open interactive menu
omarchy-strudel load ~/my-song.js   # load and play a custom .js file
```

## Custom songs

Place `.js` files in `~/.config/omarchy-strudel/songs/custom/`. Each file should contain valid Strudel code that ends with a pattern expression. Songs are auto-discovered.

Add metadata comments to your songs:

```javascript
// @title My Song
// @by Your Name
// @version 1.0

samples('github:eddyflux/crate')
note("c e g c").s("sawtooth")
```

## Autostart

The systemd user service is enabled on install. To control:

```bash
systemctl --user enable omarchy-strudel.service   # enable on login
systemctl --user disable omarchy-strudel.service  # disable on login
systemctl --user restart omarchy-strudel.service   # restart daemon
```

If you run `omarchy-strudel disable`, the daemon will start but won't play anything until you run `omarchy-strudel enable`.

## License

AGPL-3.0-or-later (required by Strudel's license). See [LICENSE](LICENSE).

The default song "coastline" is by [eddyflux](https://eddyflux.cc), from the [Strudel workshop](https://strudel.cc/workshop/getting-started/).
