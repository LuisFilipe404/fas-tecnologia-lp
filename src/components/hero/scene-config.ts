/**
 * Shared between the HTML layout and the WebGL scene (kept free of three.js so it stays out of the main bundle).
 * Lengths are in "box" units: 1 = the height of the phone box in the hero.
 * The canvas is CANVAS_SCALE × the box, and the phone occupies PHONE_HEIGHT of it.
 */
export const CANVAS_SCALE = 1.8;
export const PHONE_HEIGHT = 0.82;
export const PHONE_ASPECT = 9 / 19.5;
export const PHONE_DEPTH = 0.035;
/** Corner radius as a fraction of the phone's width (Galaxy-style: tighter than an iPhone). */
export const PHONE_RADIUS = 0.09;

export const CAMERA_FOV = 30;
export const CAMERA_Z = 10;
const VIEW_H = 2 * CAMERA_Z * Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);
/** World units per box: the canvas (CANVAS_SCALE boxes tall) spans VIEW_H at z = 0. */
export const WORLD_PER_BOX = VIEW_H / CANVAS_SCALE;
/** CSS perspective that matches the WebGL camera, in boxes. */
export const PERSPECTIVE_BOX = CAMERA_Z / WORLD_PER_BOX;

/** Phone pose, as CSS rotations (degrees). The ribbon leans with PHONE_ROT.z. */
export const PHONE_ROT = { x: 10, y: -24, z: -8 } as const;

/** The phone's CSS transform; `unit` turns a box length into a CSS length. */
export function phoneTransform(unit: (box: number) => string) {
  return `perspective(${unit(PERSPECTIVE_BOX)}) rotateX(${PHONE_ROT.x}deg) rotateY(${PHONE_ROT.y}deg) rotateZ(${PHONE_ROT.z}deg)`;
}

/**
 * Scroll timeline of the pinned hero (0..1): the hero until HERO_END, then the steps, then from
 * LOGO_START the phone leaves and the ribbon winds itself into the ChefX logo by LOGO_END.
 */
export const HERO_END = 0.14;
export const LOGO_START = 0.76;
export const LOGO_END = 0.92;
