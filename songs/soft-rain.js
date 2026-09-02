// "soft rain" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Ambient in A minor — distant rain, slow 9th chords, vibraphone sparkles.
// bpm 132 | A minor: Am9 . Fmaj9 . Cmaj9 . Em9
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:eddyflux/crate')
setcps(.55)

stack(
  // RAIN — hushed hats high-passed into a wash
  s("hh*<2 4>").bank('crate')
    .hpf(6000)
    .gain(sine.range(.06, .12).slow(8))
    .room(.35)
  ,
  // HEARTBEAT — one soft kick every other cycle
  s("bd").struct("<[x ~ ~ ~] [~ ~ ~ ~]>")
    .bank('crate').gain(.35).room(.2)
  ,
  // BASS — Am . F . C . Em, one bar each
  note("<a1@7 f1@7 c2@7 e1@7>")
    .s("gm_acoustic_bass").gain(.75)
  ,
  // CHORDS — slow 9ths, heavily filtered
  chord("<Am9 Fmaj9 Cmaj9 Em9>/4").dict('ireal')
    .offset(-1).voicing()
    .s("gm_epiano1:1")
    .lpf(sine.range(700, 1600).slow(16)).lpq(2)
    .room(.6).gain(.4)
  ,
  // SPARKLE — pentatonic dyads, mostly silent
  n("<0 2 <4 3> [6, 7]>").scale("a:minor:pentatonic")
    .s("gm_vibraphone")
    .room(.75).delay(.35)
    .gain(.3)
    .mask("<0 0 1 1>/8")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
