// "rush hour" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Lo-fi beat — no chords, drums + bass + e-piano melody in Bb minor

samples('github:eddyflux/crate')
setcps(.62)

stack(
  // DRUMS
  stack(
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.45)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  ,
  // BASS
  note("<bb1@7 f1@7 bb1@3 db1@4 f1@7 eb1@7>")
    .s("gm_acoustic_bass").gain(.9)
  ,
  // MELODY — sparse e-piano, Bb minor pentatonic
  note("[[bb3, eb4]@2 [db4 f4]@2 ~ [ab3 c4]@3] [[~ db4@2] [c4 eb4] ~ [f4@2 bb4]]")
    .s("gm_epiano1:1")
    .room(.6).delay(.3)
    .lpf(sine.range(800, 2000).slow(16)).lpq(3)
    .gain(perlin.range(.5, .75))
    .mask("<1 1 1 0>/8")
)
.late("[0 .01]*4").size(3)
