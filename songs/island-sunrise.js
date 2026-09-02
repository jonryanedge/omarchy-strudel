// "island sunrise" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Tropical chill house — soft 4-floor, marimba-ish plucks, airy pentatonic wanderer.
// bpm 101 | A minor: Am . F . C . G
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.42)

stack(
  // DRUMS — soft four-on-floor, rim snaps, hushed shaker
  stack(
    s("bd").struct("[x ~ ~ ~] [x ~ ~ ~]").gain(.4).room(.2),
    s("rim").struct("[~ x ~ ~] [~ ~ x ~]").gain(.4).room(.35),
    s("hh*8").gain(.08).hpf(4000)
  ).mask("<[1 1] 1 1>/8")
  ,
  // BASS — soft sine roots, Am . F . C . G
  note("<a1@7 f1@7 c2@7 g1@7>")
    .s("sine").gain(.6)
  ,
  // PLUCKS — marimba-ish chord plucks
  note("<[c4, e4, a4] [f3, a3, c4] [c4, e4, g4] [g3, b3, d4]>")
    .segment(4).clip(rand.range(.3, .7))
    .s("triangle")
    .attack(0).release(.35)
    .lpf(1800)
    .room(.5).delay(.25)
    .gain(perlin.range(.3, .5))
    .mask("<1 1 0 1>/4")
  ,
  // LEAD — airy pentatonic wanderer
  n("<0 2 <4 3> [6, 7]>").scale("c:major:pentatonic")
    .s("gm_vibraphone")
    .room(.7).delay(.3)
    .gain(.3)
    .mask("<0 0 1 1>/8")
  ,
  // WASH — barely-there air
  s("noise")
    .lpf(sine.range(200, 700).slow(8))
    .gain(.03).room(.8)
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
