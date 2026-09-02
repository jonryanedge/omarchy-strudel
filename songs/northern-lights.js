// "northern lights" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Melodic house in B minor — offbeat saw plucks, driving 8th bass, big lead hook.
// bpm 125 | B minor: Bm . G . D . A
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.52)

stack(
  // DRUMS — driving four-on-floor
  stack(
    s("bd*4").gain(.6),
    s("cp").struct("[~ x]*2").gain(.5).room(.15),
    s("hh*8").gain(.15),
    s("oh").struct("[~ x]*4").gain(.18).room(.2)
  )
  ,
  // BASS — driving 8ths through Bm . G . D . A
  note("<b1*8 g1*8 d2*8 a1*8>")
    .s("sawtooth")
    .attack(0).release(.1)
    .lpf(700)
    .gain("[.55 .9]*2")
  ,
  // CHORDS — offbeat saw plucks
  note("[~ [b3, d4, fs4]] [~ [g3, b3, d4]] [~ [d4, fs4, a4]] [~ [a3, cs4, e4]]")
    .s("sawtooth")
    .attack(.01).release(.18)
    .lpf(2200)
    .gain(.35)
  ,
  // LEAD — big melodic hook in D major pentatonic
  note("[fs5@2 e5@2 d5@2 b4@2] [cs5@2 d5@2 e5@2 fs5@2]")
    .s("supersaw")
    .attack(.02).release(.2)
    .lpf(3000)
    .delay(.2).room(.4)
    .gain(.3)
    .mask("<1 1 0 1>/4")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
