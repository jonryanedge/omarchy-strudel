// "first light" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// bpm 84 | D minor: Dm . Bb . F . C, phrygian-dominant lead color
// Cinematic trap in the spirit of DJ Snake "Intro" — swells, 808 sub, epic hook.
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.35)

stack(
  // DRUMS — halftime trap, enters after the intro
  stack(
    s("bd").struct("[x ~ ~ ~] [~ ~ x ~]").gain(.65),
    s("cp").struct("[~ ~ ~ ~] [x ~ ~ ~]").gain(.5).room(.4),
    s("hh*<2 4 8>").gain(.12),
    s("oh").struct("[~ x ~ ~]").gain(.15).room(.25)
  ).mask("<0 0 1 1>/8")
  ,
  // SUB — 808 sine, Dm . Bb . F . C
  note("<d1@7 bb1@7> <f1@7 c1@7>")
    .s("sine").gain(.85)
  ,
  // PADS — cinematic saw swells
  note("<[d2, f2, a2, c3] [bb1, d2, f2, a2]> <[f2, a2, c3, e3] [c2, e2, g2, bb2]>")
    .s("sawtooth")
    .attack(.8).release(1.4)
    .lpf(sine.range(500, 1600).slow(16)).lpq(3)
    .room(.6).gain(.2)
  ,
  // HOOK — epic D minor melody with phrygian color
  note("[d5@3 c5] [bb4@3 a4] [f4@2 g4 a4] [d5@3 ~]")
    .s("supersaw")
    .attack(.03).release(.3)
    .lpf(2600)
    .delay(.25).room(.45)
    .gain(.3)
    .mask("<1 1 1 0>/4")
  ,
  // WASH — barely-there air
  s("noise")
    .lpf(sine.range(200, 800).slow(8))
    .gain(.035).room(.8)
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
