// "mirage" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// bpm 101 | D phrygian dominant: Dm . Bb . C . Am
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.42)

stack(
  // DRUMS — halftime trap: kick, snare on 3, rolling hats
  stack(
    s("bd").struct("[x ~ ~ ~] [~ ~ ~ ~]").gain(.7),
    s("sd").struct("[~ ~ ~ ~] [x ~ ~ ~]").gain(.5).room(.3),
    s("hh*<4 8>").gain(.13),
    s("oh").struct("[~ ~ x ~]").gain(.18).room(.2)
  ).mask("<0 1 1 1>/8")
  ,
  // SUB — 808 sine, Dm . Bb . C . Am
  note("<d1@7 bb1@7> <c1@7 a1@7>")
    .s("sine").gain(.85)
  ,
  // HOOK — snake-charmer square lead, D phrygian dominant
  note("[d4@2 eb4@2 fs4@2 g4@2] [a4@3 g4@2 fs4@2 g4]")
    .s("square")
    .lpf(2200)
    .delay(.3).room(.4)
    .gain(.28)
    .mask("<1 1 0 1>/4")
  ,
  // STABS — dark saw stabs over the progression
  note("<[d3, a3, d4] [bb2, f3, bb3]> <[c3, g3, c4] [a2, e3, a3]>")
    .s("sawtooth")
    .attack(.01).release(.2)
    .struct("[x ~ x ~]")
    .lpf(sine.range(600, 1800).slow(8)).lpq(4)
    .gain(.3).room(.3)
  ,
  // PLUCK — low triangle dyads tracking the roots
  note("[[d3, a3]@2 [d3, c3]@2] [[bb2, f3]@2 [a2, e3]@2]")
    .s("triangle")
    .attack(0).release(.25)
    .gain(.3)
    .lpf(1400)
)
.late("[0 .01]*4").late("[0 .01]*2").size(3)
