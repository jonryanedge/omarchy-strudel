// "deep focus" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Ambient in Bb minor — drone bass, sparse e-piano motif, wind wash, no drums.
// bpm 144 | Bb minor: bass Bbm . Fm drone
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:eddyflux/crate')
setcps(.6)

stack(
  // PULSE — soft tick to keep time, mostly masked away
  s("hh").struct("<~ x ~ ~>").bank('crate')
    .gain(.15).room(.3)
    .mask("<1 1 1 0>/4")
  ,
  // BASS — Bb drone falling to F
  note("<bb1@7 f1@7>")
    .s("gm_acoustic_bass").gain(.85)
  ,
  // MELODY — sparse e-piano in Bb minor pentatonic
  note("[[bb3, f4]@3 ~ [eb4 db4]@3 ~] [[db4@2 ~] [ab3 c4]@2 ~ f4@3]")
    .s("gm_epiano1:1")
    .room(.65).delay(.35)
    .lpf(sine.range(700, 1800).slow(16)).lpq(3)
    .gain(perlin.range(.45, .7))
    .mask("<1 1 0 1>/8")
  ,
  // WIND — filtered noise, barely there
  s("noise").lpf(sine.range(300, 900).slow(8))
    .gain(.035).room(.8)
)
.late("[0 .01]*4").late("[0 .01]*2").size(3)
