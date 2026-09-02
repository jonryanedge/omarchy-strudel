// "reverie" @by omarchy-strudel
// @version 2.0
// Homage to "Rêverie" by Girl From Nowhere & Boy From Nowhere
// (Lost Journey Memories, Lofi Girl 2023)
// Transcribed from audio via strudel-songlab: 92.3 BPM, B minor.
// Chord loop: Em7 - Emaj7 - Gmaj7 - Gmaj7 (1 bar each)

samples('github:eddyflux/crate')
setcps(.3846)

stack(
  // PADS — sawtooth, slow breath, real chord loop
  note("<[[e2,g2,b2,d3]@16] [[e2,ab2,b2,eb3]@16] [[g2,b2,d3,gb3]@16] [[g2,b2,d3,gb3]@16]>")
    .s("sawtooth")
    .attack(.6).release(1.2)
    .lpf(sine.range(700, 1500).slow(16)).lpq(2)
    .room(.8).gain(.38)
  ,
  // PADS 2 — e-piano dyads floating above
  note("<[[b3,gb4]@16] [[b3,eb4]@16] [[b3,d4]@16] [[b3,d4]@16]>")
    .s("gm_epiano1:1")
    .lpf(2400).room(.6).gain(.45)
  ,
  // BASS — transcribed rhythms (D in bass under Emaj7 = the dreamy 7th)
  note("<[e1@3 e1@1 e1@2 e1@2 e1@1 e1@3 e1@2 e1@2] [d2@2 d2@1 d2@3 d2@1 d2@2 d2@3 d2@1 d2@3] [g1@2 g1@2 b1@1 g1@2 g1@2 g1@1 g1@2 b1@4] [g1@3 g1@1 g1@2 g1@2 b1@2 g1@4]>")
    .s("gm_acoustic_bass")
    .gain(.9)
  ,
  // LEAD — wistful phrases in the transcribed register (B3-D5)
  note("<[b3@2 d4@2 gb4@3 ~ b3@2 d4@2 e4@3 ~] [eb4@2 b3@2 d4@3 ~ gb4@2 eb4@2 b3@2 ~] [d4@2 b3@2 g4@1 gb4@2 a4@2 g4@2 ~] [gb4@3 b3@2 d4@2 ~ a3@2 b3@3 ~]>")
    .s("gm_epiano1:2")
    .room(.7).delay(.35)
    .lpf(sine.range(1200, 2600).slow(24)).lpq(4)
    .gain(perlin.range(.45, .7))
    .mask("<1 1 1 0>/8")
  ,
  // ECHO — answers 2 bars later
  note("<[d4@3 b3@2 ~ a3@2] [~ eb4@2 b3@2] [~ g4@2 gb4@2] [d4@3 ~ b3@2 ~]>")
    .late(2)
    .s("triangle")
    .attack(.1).release(.6)
    .room(.8).delay(.3).gain(.3)
    .mask("<0 1 1 0>/16")
  ,
  // DRUMS — offbeat hats from the transcription, enter after the intro
  stack(
    s("bd").struct("x......x..x....."),
    s("rim").struct("....x.......x...").room("<0 .2>").gain(.8),
    s("hh").struct("..x...x...x...x.").gain(.55),
    n("[0 <1 3>]*4").s("hh").gain(.35).mask("<0 0 1 1>/16"),
    s("rd").struct("x...x...x...x...").gain(.3).mask("<0 0 1 1>/16")
  ).bank('crate')
  .mask("<0 0 0 1 1 1 1 1>/8")
)
.late("[0 .01]*4").size(4)
