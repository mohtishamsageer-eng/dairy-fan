import * as THREE from 'three';
import { DIMS } from '../constants.js';
import { createDrum } from './drum.js';
import { createGuard } from './guard.js';
import { createRearFrame } from './rearFrame.js';
import { createMotor } from './motor.js';
import { createHub } from './hub.js';
import { createBladeSet } from './blades.js';

export function createFan(materials) {
  const fan = new THREE.Group();
  fan.name = 'dairy-fan-44';

  fan.add(createDrum(materials));

  const guardFront = createGuard(materials, { facingSign: 1 });
  guardFront.position.z = DIMS.drumDepth / 2 + 0.06;
  fan.add(guardFront);

  const guardBack = createGuard(materials, { facingSign: -1 });
  guardBack.position.z = -DIMS.drumDepth / 2 - 0.06;
  fan.add(guardBack);

  fan.add(createRearFrame(materials));
  fan.add(createMotor(materials));

  // The hub + 3 blades spin together; expose this group for the animation.
  const spinGroup = new THREE.Group();
  spinGroup.name = 'spin-group';
  spinGroup.add(createHub(materials));
  spinGroup.add(createBladeSet(materials));
  fan.add(spinGroup);

  return { group: fan, spinGroup };
}
