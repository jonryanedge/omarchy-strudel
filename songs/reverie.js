// "reverie" @by omarchy-strudel
// @version 1.0
// Homage to "Rêverie" by Girl From Nowhere & Boy From Nowhere
// (Lost Journey Memories, Lofi Girl 2023) — B minor, ~92 BPM, chillsynth.
// Dreamy pads, wistful lead, soft drums. No AudioWorklet effects.

samples('github:eddyflux/crate')
setcps(.75)

stack(
  // DRUMS — soft, sparse, half-time dream
  stack(
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>").gain(.8),
    n("[0 <1 3>]*<2!3 4>").s("hh").gain(.6),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.35)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  ,
  // PADS — Bm . Gmaj7 . Dmaj7 . Aadd9 (2 cycles each)
  note("<[[b2,d3,gb3,a3]@7] [[g2,b2,d3,gb3]@7] [[d3,gb3,a3,db4]@7] [[a2,db3,e3,b3]@7]>/2")
    .s("sawtooth")
    .attack(.8).release(1.5)
    .lpf(sine.range(700, 1600).slow(20)).lpq(2)
    .room(.8).gain(.4)
  ,
  // PADS 2 — warm e-piano dyads floating above
  note("<[[b3,fs4]@7] [[g3,d4]@7] [[d4,a4]@7] [[a3,e4]@7]>/2")
    .s("gm_epiano1:1")
    .lpf(2400)
    .room(.6).gain(.5)
  ,
  // BASS — roots of the progression
  note("<b1@6 g1@6 d2@6 a1@6>/2")
    .s("gm_acoustic_bass")
    .gain(.85)
  ,
  // LEAD — wistful sighs in B minor
  note("<[gb5@2 e5@2] [d5@3 ~] [e5 d5 b4@2] [b4@3 ~]>")
    .slow(2)
    .s("gm_epiano1:2")
    .room(.75).delay(.4)
    .lpf(sine.range(1200, 2600).slow(24)).lpq(4)
    .gain(perlin.range(.45, .7))
    .mask("<1 1 1 0>/8")
  ,
  // ECHO — soft triangle answering one cycle later
  note("<[d5@2 b4@2] [~ gb4@3] [a4@2 gb4@2 e4@2] [~ d4@2 ~]>")
    .slow(2).early(1)
    .s("triangle")
    .attack(.1).release(.6)
    .room(.8).delay(.3)
    .gain(.35)
    .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").size(4)
