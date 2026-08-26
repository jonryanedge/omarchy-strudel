# Maintainer: <your-name>
pkgname=omarchy-strudel
pkgver=0.1.0
pkgrel=1
pkgdesc="Background Strudel live-coded music for Omarchy Linux"
arch=('any')
url="https://github.com/<user>/omarchy-strudel"
license=('AGPL-3.0-or-later')
depends=('nodejs' 'pipewire')
makedepends=('npm' 'base-devel')
optdepends=(
  'omarchy-shell: menubar integration via Omarchy shell plugin'
  'waybar: legacy menubar integration'
  'walker: menu popup for the menubar icon'
  'rofi: alternative menu popup'
  'jq: for the CLI and menu scripts'
)
source=("${pkgname}-${pkgver}.tar.gz::${url}/archive/v${pkgver}.tar.gz")
sha256sums=('SKIP')

package() {
  cd "${srcdir}/${pkgname}-${pkgver}"

  # Install Node.js app to /usr/lib/omarchy-strudel
  install -dm755 "${pkgdir}/usr/lib/omarchy-strudel"
  cp -r src package.json "${pkgdir}/usr/lib/omarchy-strudel/"

  # Install vendored node_modules
  cd "${pkgdir}/usr/lib/omarchy-strudel"
  npm install --production --no-cache --no-fund --no-audit
  cd "${srcdir}/${pkgname}-${pkgver}"

  # Install CLI tools
  install -Dm755 bin/omarchy-strudel "${pkgdir}/usr/bin/omarchy-strudel"
  install -Dm755 bin/omarchy-strudel-daemon "${pkgdir}/usr/bin/omarchy-strudel-daemon"
  install -Dm755 bin/omarchy-strudel-menu "${pkgdir}/usr/bin/omarchy-strudel-menu"

  # Install legacy Waybar module
  install -Dm755 lib/waybar-module.sh "${pkgdir}/usr/lib/omarchy-strudel/waybar-module.sh"

  # Install bundled songs
  install -dm755 "${pkgdir}/usr/share/omarchy-strudel/songs"
  install -Dm644 songs/*.js "${pkgdir}/usr/share/omarchy-strudel/songs/"

  # Install default config
  install -Dm644 share/default-config.json "${pkgdir}/usr/share/omarchy-strudel/default-config.json"

  # Install post-install script
  install -Dm755 share/install.sh "${pkgdir}/usr/share/omarchy-strudel/install.sh"

  # Install systemd user service
  install -Dm644 systemd/omarchy-strudel.service "${pkgdir}/usr/lib/systemd/user/omarchy-strudel.service"

  # Install license
  install -Dm644 LICENSE "${pkgdir}/usr/share/licenses/${pkgname}/LICENSE"
}
