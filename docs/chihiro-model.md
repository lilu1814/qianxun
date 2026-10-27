# Chihiro procedural character model

## Reference analysis

The in-game Chapter One model was used as the reference. Visible identity features:

- child proportions, about 1.42 m tall
- warm pale skin
- chestnut bob with a high side ponytail, soft fringe and a pink hair tie
- large brown eyes, small nose and mouth
- oversized cream short-sleeve T-shirt with one wide green chest band, matching sleeve bands, and a green collar
- coral shorts
- white socks
- mustard-yellow shoes with a cream sole and dark outsole

The reconstruction is a **stylised, code-only approximation**. It does not reuse or extract the original mesh, and hidden sides are inferred. It is not a face copy of the film actor.

## Runtime model

`src/chihiro/chihiroModel.ts` exports `createChihiroModel(options)`.

The model is a named, articulated hierarchy:

```
root
└─ body                 // jump offset and whole-body lean
   └─ hips
      ├─ shorts / pelvis
      ├─ torso
      │  ├─ striped shirt, collar
      │  ├─ head
      │  │  ├─ face, eyes, brows, nose, mouth
      │  │  ├─ hair cap, fringe, side locks
      │  │  └─ side ponytail
      │  └─ armL/armR → elbowL/elbowR → forearm/hand
      └─ legL/legR → kneeL/kneeR → sock/shoe
```

All moving joints are available through `model.joints` for custom animation.

## API

```ts
import { createChihiroModel } from './chihiro/chihiroModel';

const chihiro = createChihiroModel({ height: 1.42 });
scene.add(chihiro.root);

chihiro.setAction('idle'); // idle | walk | run
chihiro.jump();

chihiro.setWalkConfig({ speed: 2.4, stride: 0.6, armSwing: 0.5 });
chihiro.setJumpConfig({ height: 0.55, duration: 0.8 });
chihiro.update(dt);
```

`root.userData.sculptRuntime` exposes the character kind, height, joint map and current action for debugging.

## Preview

Open `/chihiro-model.html`. The page includes orbit controls, action buttons and live sliders for step rate, stride, arm swing, jump height, jump duration and height.

## Current limitations

- Stylised rounded-primitive reconstruction, not a high-density sculpt.
- The face is an authored approximation; it does not reproduce the film actor's exact likeness.
- Single-view references cannot guarantee the exact back/inside clothing construction.
- Shoes and hands are simplified for real-time performance.


## Face texture

The face uses the supplied instruction-sheet face, cropped to an oval and feathered into a transparent PNG at `public/images/chihiro_face.png`. A shallow curved `face-decal` plane is placed in front of the skull; the primitive 3D eyes, brows, nose, mouth and blush are kept in the hierarchy but hidden.
