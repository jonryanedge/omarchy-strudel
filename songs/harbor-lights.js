// "harbor lights" @by jonryanedge
// w/ GLM-5.3-Flash
// @version 1.0
// Lo-fi house — coastline-style chords & arps riding a rush-hour groove.
// bpm 158 | Bb minor: Bbm9 . Fm9 . Ebm9 . Dbmaj9, Bbm pentatonic melody
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:eddyflux/crate')
setcps(.66)

stack(
  // DRUMS — rush-hour kit groove, crate kit, lazy swing
  stack(
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.45)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  ,
  // BASS — walking roots, Bbm . Fm . Ebm . Db
  note("<bb1@3 f1@4 db1@3 eb1@4> <f1@7 bb1@7>")
    .s("gm_acoustic_bass").gain(.9)
  ,
  // CHORDS — m9 voicings, one per bar
  chord("<Bbm9 Fm9 Ebm9 Dbmaj9>").dict('ireal')
    .offset(-1).voicing()
    .s("gm_epiano1:1")
    .room(.5)
  ,
  // MELODY — sparse e-piano motif, Bbm pentatonic
  note("[[f4, bb4]@2 [eb4 f4]@2 ~ [db4 f4]@3] [[~ eb4@2] [f4 ab4] ~ [c5@2 bb4]]")
    .s("gm_epiano1:1")
    .room(.6).delay(.25)
    .lpf(sine.range(900, 2200).slow(16)).lpq(3)
    .gain(perlin.range(.55, .8))
    .mask("<1 1 1 0>/8")
  ,
  // ARP — clipped chord arps answering the motif
  chord("<Bbm9 Fm9 Ebm9 Dbmaj9>")
    .n("[0 <3 5> <4 2>](<3 5>,8)")
    .anchor("C5").voicing()
    .segment(4).clip(rand.range(.4, .8))
    .s("gm_epiano1:2")
    .room(.75).delay(.25)
    .fm(sine.range(3, 8).slow(8))
    .lpf(sine.range(500, 1000).slow(8)).lpq(5)
    .rarely(ply("2")).chunk(4, fast(2))
    .gain(perlin.range(.5, .75))
    .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
