// "morning mist" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Warm ambient in B minor — slow arp, soft pad, gentle heartbeat.
// bpm 120 | B minor: Bm . G . D . A
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:eddyflux/crate')
setcps(.5)

stack(
  // HEARTBEAT — soft kick, once per bar
  s("bd").struct("<[x ~ ~ ~] [~ ~ x ~]>")
    .bank('crate').gain(.35).room(.2)
  ,
  // RIDE — breathing shimmer
  s("rd:<1 2>").bank('crate')
    .gain(.28).room(.4)
    .mask("<0 1>/4")
  ,
  // BASS — Bm . G . D . A, one bar each
  note("<b1@7 g1@7 d2@7 a1@7>")
    .s("gm_acoustic_bass").gain(.75)
  ,
  // PAD — held triads, low-passed
  note("[[b2, d3, fs3]@7 [g2, b2, d3]@7] [[d3, fs3, a3]@7 [a2, cs3, e3]@7]")
    .s("gm_epiano1:1")
    .lpf(900).room(.7).gain(.35)
  ,
  // ARP — slow plucks rising through the chord
  note("b3 fs4 d5 b4 fs4 d4")
    .segment(6).clip(rand.range(.4, .8))
    .s("gm_epiano1:2")
    .room(.75).delay(.3)
    .fm(sine.range(3, 8).slow(8))
    .lpf(sine.range(500, 1200).slow(8)).lpq(4)
    .gain(perlin.range(.4, .65))
    .mask("<1 1 0 1>/8")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
