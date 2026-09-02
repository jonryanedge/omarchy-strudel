// "disco bot" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Filter funk in B minor — wobbling saw bass, syncopated stabs, robotic square lead.
// bpm 122 | B minor: Bm . G vamp
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:tidalcycles/Dirt-Samples')
setcps(.51)

stack(
  // DRUMS — filtered disco four-on-floor
  stack(
    s("bd*4").gain(.6),
    s("cp").struct("[~ x]*2").gain(.5).room(.2),
    s("oh").struct("[~ x]*2").gain(.22).room(.15),
    s("hh*8").gain(.14)
  )
  ,
  // BASS — filter funk, the wobble is the hook
  note("[b1 ~ b1 ~] [b1 ~ b2 ~]")
    .s("sawtooth")
    .attack(0).release(.15)
    .lpf(sine.range(300, 1600).slow(2)).lpq(10)
    .gain(.7)
  ,
  // STRUMS — syncopated filtered chord stabs, Bm . G vamp
  note("<[[b3, d4, fs4] ~ [b3, d4, fs4] [b3, d4, fs4]] [[~ [b3, d4, fs4]] ~ [b3, d4, fs4] ~]> [[g3, b3, d4] ~ [g3, b3, d4] [g3, b3, d4]] [[~ [g3, b3, d4]] ~ [g3, b3, d4] ~]>")
    .s("sawtooth")
    .attack(0).release(.1)
    .lpf(sine.range(600, 2800).slow(4)).lpq(6)
    .gain(.3)
  ,
  // LEAD — robotic square, short phrases
  note("[fs4@2 a4] [b4@2 cs5] [d5@2 b4] [a4@2 fs4]")
    .s("square")
    .gain(.2)
    .lpf(2400)
    .delay(.35).room(.35)
    .mask("<1 1 0 1>/4")
)
.late("[0 .01]*4").late("[0 .01]*2").size(3)
