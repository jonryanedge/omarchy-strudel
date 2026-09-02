// "strobe lights" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Progressive house in A minor — four-on-floor, pumping supersaw stabs, sine sub.
// bpm 127 | A minor: Am9 . Fmaj9 . Cmaj9 . G9
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.53)

stack(
  // DRUMS — four-on-floor, clap backbeat, offbeat opens
  stack(
    s("bd*4").gain(.6),
    s("cp").struct("[~ x]*2").gain(.5).room(.2),
    s("hh*8").gain(.16),
    s("oh").struct("[~ x]*4").gain(.2).room(.2)
  ).mask("<0 1 1 1>/8")
  ,
  // BASS — sine sub, one root per bar
  note("<a1@7 f1@7 c2@7 g1@7>")
    .s("sine").gain(.8)
  ,
  // CHORDS — supersaw stabs pumped against the kick
  chord("<Am9 Fmaj9 Cmaj9 G9>").dict('ireal').voicing()
    .s("supersaw")
    .attack(.02).release(.25)
    .lpf(sine.range(500, 2400).slow(16)).lpq(4)
    .gain("[.35 .7 .85 .7]")
    .room(.3)
  ,
  // ARP — 16th saw arp, the strobe
  note("a4 c5 e5 g5")
    .segment(8).release(.15)
    .s("sawtooth")
    .lpf(1800)
    .delay(.25).room(.35)
    .gain(.16)
    .mask("<0 1 1 1>/8")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
