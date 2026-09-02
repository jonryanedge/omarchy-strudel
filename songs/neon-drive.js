// "neon drive" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// 80s synthwave in A minor — 16th arp, driving 8th bass, big-room snare, DX hook.
// bpm 115 | A minor: Am7 . Fmaj7 . Cmaj7 . Gmaj7
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.48)

stack(
  // DRUMS — 80s backbeat, big gated-room snare
  stack(
    s("bd").struct("[x ~ ~ ~] [x ~ x ~]").gain(.55),
    s("sd").struct("[~ x]*2").gain(.5).room(.7),
    s("hh*8").gain(.14)
  )
  ,
  // BASS — driving 8ths through Am . F . C . G
  note("<a1*8 f1*8 c2*8 g1*8>")
    .s("sawtooth")
    .attack(0).release(.12)
    .lpf(750).gain(.55)
  ,
  // PAD — warm sustained 7ths
  note("[[a2, c3, e3, g3]@7 [f2, a2, c3, e3]@7] [[c3, e3, g3, b3]@7 [g2, b2, d3, fs3]@7]")
    .s("sawtooth")
    .attack(.6).release(1.2)
    .lpf(1300).room(.5)
    .gain(.22)
  ,
  // ARP — 16th arpeggio, the neon sparkle
  note("a3 c4 e4 g4")
    .segment(16)
    .s("square")
    .lpf(sine.range(900, 2600).slow(8)).lpq(3)
    .delay(.25).room(.3)
    .gain(.13)
    .mask("<1 1 1 0>/8")
  ,
  // LEAD — DX e-piano hook
  note("[e5 ~] [~ c5] [d5 ~] [~ a4] [c5 ~] [~ a4] [b4@3 ~]")
    .s("gm_epiano1:1")
    .lpf(2600)
    .room(.5).delay(.3)
    .gain(.3)
    .mask("<1 1 1 0>/4")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
