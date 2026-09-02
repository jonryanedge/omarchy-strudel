// "midnight drift" @by omarchy-strudel
// @version 1.0
// Lo-fi in Bb minor — drums + bass + e-piano melody, no chord pads.
// Headless-safe: no AudioWorklet effects (.phaser/.shape avoided).

samples('github:eddyflux/crate')
setcps(.6)

stack(
  // DRUMS — crate kit, lazy swing, mostly as coastline
  stack(
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.45)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  ,
  // BASS — Bbm . Fm . Ebm . Db (2 cycles each)
  note("<bb2 f2 eb2 db2>/2")
    .s("gm_acoustic_bass")
    .gain(.85)
  ,
  // MELODY — sparse e-piano motif in Bb minor pentatonic
  note("<[bb4@2 db5@2 eb5] [~ f5@2 eb5@2] [bb4@2 ab4 ~] [db5@3 ~>]>")
    .s("gm_epiano1:1")
    .room(.6).delay(.25)
    .lpf(sine.range(900, 2200).slow(16)).lpq(3)
    .gain(perlin.range(.55, .8))
    .mask("<1 1 1 0>/8")
  ,
  // ARP — soft plucks answering the motif
  note("bb4 f5 db5 ab4")
    .segment(4).clip(rand.range(.4,.8))
    .s("gm_epiano1:2")
    .room(.75).delay(.25)
    .fm(sine.range(3,8).slow(8))
    .lpf(sine.range(500,1000).slow(8)).lpq(5)
    .rarely(ply("2")).chunk(4, fast(2))
    .gain(perlin.range(.5, .75))
    .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(3)
