// All linear units are INCHES (1 three.js unit = 1 inch).
// Fan axis = Z. Air blows toward +Z. Front (blade/hub side) faces +Z, motor is at -Z.

export const IN = 1;
export const FT = 12 * IN;

export const DIMS = {
  outerDiameter: 44 * IN,
  outerRadius: 22 * IN,
  bladeTipDiameter: 42 * IN,
  bladeTipRadius: 21 * IN,
  drumDepth: 5 * IN,
  collarWidth: 1 * IN,
  hubDiameter: 7.5 * IN,
  hubRadius: 3.75 * IN,
  motorDiameter: 7.5 * IN,
  motorRadius: 3.75 * IN,
  motorLength: 9 * IN,
  tubeSize: 1.5 * IN,
  tubeSpacing: 7 * IN, // centre-to-centre
  airThrowFt: 50,
};

// Guard front face sits at Z = +drumDepth/2 (collar), back guard at Z = -drumDepth/2.
export const Z = {
  frontCollar: DIMS.drumDepth / 2,
  backCollar: -DIMS.drumDepth / 2,
  hubCenter: 0.3 * IN, // hub sits set back slightly from the front guard, centred-ish in the drum
};

export const COLORS = {
  blue: 0x7fafc4,
  blueHighlight: 0xb7dce7,
  blueShadow: 0x4c7a8c,
  motor: 0x5c6469,
  motorDark: 0x454b4f,
  hub: 0xc7cbcc,
  hubDark: 0x8b8f90,
  blade: 0x2b2e31,
  bolt: 0xb9bdbe,
  wireLead: 0xf2efe6,
  floor: 0x1b1f22,
};

export const GUARD = {
  vertCount: 13,
  horizCount: 8,
  wireRadius: 0.08 * IN, // ~4mm
  boltCount: 6,
};

// Rear frame / motor bracket geometry (shared between rearFrame.js and motor.js
// so the motor sits correctly seated on the bracket plate).
const tubeBackFaceZ = -DIMS.drumDepth / 2 - DIMS.tubeSize; // -4.0"
export const MOUNT = {
  tubeCenterZ: -DIMS.drumDepth / 2 - DIMS.tubeSize / 2, // -3.25"
  tubeBackFaceZ,
  plateTopY: -DIMS.motorRadius,
  plateThickness: 0.25 * IN,
  armThickness: DIMS.tubeSize,
  armLength: 9 * IN,
  get plateCenterY() {
    return this.plateTopY - this.plateThickness / 2;
  },
  get armCenterY() {
    return this.plateTopY - this.plateThickness - this.armThickness / 2;
  },
  get zStart() {
    return this.tubeBackFaceZ;
  },
  get zEnd() {
    return this.tubeBackFaceZ - this.armLength;
  },
  get motorCenterZ() {
    // Motor front bell sits just behind the tubes; shaft runs forward through
    // the back guard into the hub.
    const frontBellZ = this.tubeBackFaceZ - 0.4;
    return frontBellZ - DIMS.motorLength / 2;
  },
};
