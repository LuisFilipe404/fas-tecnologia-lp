'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'motion/react';
import { RING } from '@/components/brand/logo-mark';
import {
  CAMERA_FOV,
  CAMERA_Z,
  LOGO_END,
  LOGO_START,
  PHONE_ASPECT,
  PHONE_DEPTH,
  PHONE_HEIGHT,
  PHONE_RADIUS,
  PHONE_ROT,
  WORLD_PER_BOX,
  phoneTransform,
} from './scene-config';

const PHONE_H = PHONE_HEIGHT * WORLD_PER_BOX;
const PHONE_W = PHONE_H * PHONE_ASPECT;

const RED = '#E02C26';
/** The tube reads coral (neon red seen through light), and settles into the logo red as it morphs. */
const CORAL = new THREE.Color('#FF6455');
const LOGO_RED = new THREE.Color(RED);
const STEPS = 360;
const RADIAL = 18;
const REVEAL_SECONDS = 2.2;
/** Share of the ribbon's length over which each end dissolves (helix only). */
const FADE_GLSL = '#define FADE 0.16';
/** CSS rotateZ is clockwise-positive with y down; three.js is the opposite. */
const TILT = THREE.MathUtils.degToRad(-PHONE_ROT.z);

/** The ribbon is a thin round tube… */
const TUBE_R = PHONE_W * 0.08;

/**
 * Helix: a ribbon spiralling down around the phone. It crosses in front of the phone exactly
 * twice — just above and just below the screen — and passes behind it everywhere else.
 */
const FRONT_Y = 0.52; // front crossings, as a fraction of the phone height
const END_TURNS = 0.22; // how far the ribbon keeps going past each crossing

function helixPoint(t: number, out: THREE.Vector3) {
  const from = Math.PI / 2 - END_TURNS * Math.PI * 2;
  const to = Math.PI / 2 + (1 + END_TURNS) * Math.PI * 2;
  const a = from + t * (to - from);
  const raw = (a - Math.PI / 2) / (Math.PI * 2);
  // past the crossings the tails ease off (smoothly, no kink) instead of running off the canvas
  const ease = (r: number) => 0.35 * r + 0.65 * 0.15 * Math.tanh(r / 0.15);
  const turn = raw < 0 ? ease(raw) : raw > 1 ? 1 + ease(raw - 1) : raw;
  return out.set(Math.cos(a) * PHONE_W * 0.98, PHONE_H * (FRONT_Y - turn * FRONT_Y * 2), Math.sin(a) * PHONE_W * 0.68);
}

/** …that winds into the ChefX ring: a leaning ellipse, open at the top right (same shape as the SVG mark). */
const RING_R = PHONE_H * 0.34;
const RING_HALF = RING_R * 0.16; // half the stroke width, in the ring's plane
const RING_DEPTH = RING_R * 0.07;
const RING_TILT = THREE.MathUtils.degToRad(-RING.tiltDeg);

function ringPoint(deg: number, out: THREE.Vector3) {
  const a = THREE.MathUtils.degToRad(deg);
  const x0 = RING_R * RING.rx * Math.cos(a);
  const y0 = RING_R * RING.ry * Math.sin(a);
  return out.set(
    x0 * Math.cos(RING_TILT) - y0 * Math.sin(RING_TILT),
    x0 * Math.sin(RING_TILT) + y0 * Math.cos(RING_TILT),
    0,
  );
}
const ringAt = (t: number, out: THREE.Vector3) => ringPoint(RING.fromDeg + t * (RING.toDeg - RING.fromDeg), out);

const smooth = (e0: number, e1: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

/**
 * The ribbon is swept on the CPU so it can morph from helix (round tube) to logo (flat stroke).
 * The cross-section stays upright on the helix — no twisting — and turns radial on the ring.
 */
function useMorphingRibbon() {
  const data = useMemo(() => {
    const n = STEPS + 1;
    const helix: THREE.Vector3[] = [];
    const ring: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / STEPS;
      helix.push(helixPoint(t, new THREE.Vector3()));
      ring.push(ringAt(t, new THREE.Vector3()));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * RADIAL * 3), 3));
    const along = new Float32Array(n * RADIAL);
    for (let i = 0; i < n; i++) along.fill(i / STEPS, i * RADIAL, (i + 1) * RADIAL);
    geo.setAttribute('along', new THREE.BufferAttribute(along, 1));
    const index: number[] = [];
    for (let i = 0; i < STEPS; i++) {
      for (let j = 0; j < RADIAL; j++) {
        const a = i * RADIAL + j;
        const b = (i + 1) * RADIAL + j;
        const c = (i + 1) * RADIAL + ((j + 1) % RADIAL);
        const d = i * RADIAL + ((j + 1) % RADIAL);
        index.push(a, b, d, b, c, d);
      }
    }
    geo.setIndex(index);
    return { geo, helix, ring, pts: helix.map((v) => v.clone()) };
  }, []);

  useEffect(() => () => data.geo.dispose(), [data]);

  /** Rebuilds the vertex buffer for morph m (0 = helix, 1 = logo). */
  const sweep = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const T = new THREE.Vector3();
    const side = new THREE.Vector3();
    const sideRing = new THREE.Vector3();
    const N = new THREE.Vector3();
    const v = new THREE.Vector3();
    return (m: number) => {
      const { geo, helix, ring, pts } = data;
      const pos = geo.getAttribute('position') as THREE.BufferAttribute;
      const halfA = THREE.MathUtils.lerp(TUBE_R, RING_HALF, m);
      const halfB = THREE.MathUtils.lerp(TUBE_R, RING_DEPTH, m);
      // circle → soft-cornered flat stroke
      const exp = THREE.MathUtils.lerp(1, 0.5, m);
      for (let i = 0; i <= STEPS; i++) pts[i].lerpVectors(helix[i], ring[i], m);
      for (let i = 0; i <= STEPS; i++) {
        T.subVectors(pts[Math.min(i + 1, STEPS)], pts[Math.max(i - 1, 0)]).normalize();
        side.copy(up).addScaledVector(T, -up.dot(T)).normalize();
        sideRing.set(ring[i].x, ring[i].y, 0).normalize();
        side.lerp(sideRing, m);
        side.addScaledVector(T, -side.dot(T)).normalize();
        N.crossVectors(T, side);
        for (let j = 0; j < RADIAL; j++) {
          const th = (j / RADIAL) * Math.PI * 2;
          const c = Math.cos(th);
          const s = Math.sin(th);
          const sx = Math.sign(c) * Math.abs(c) ** exp;
          const sy = Math.sign(s) * Math.abs(s) ** exp;
          v.copy(pts[i])
            .addScaledVector(side, sx * halfA)
            .addScaledVector(N, sy * halfB);
          pos.setXYZ(i * RADIAL + j, v.x, v.y, v.z);
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
    };
  }, [data]);

  return { geo: data.geo, sweep };
}

/**
 * Neon-tube material: PBR base, a hot core where the surface faces the camera, and a pulse of
 * light that travels along the ribbon (uPulse = 0..1).
 */
function useNeonMaterial() {
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: RED,
      emissive: RED,
      emissiveIntensity: 0.4,
      roughness: 0.45,
      metalness: 0,
      transparent: true,
    });
    // the uniform object is shared with the compiled shader, so updating .value is enough
    m.userData.uPulse = { value: 0 };
    m.userData.uMorph = { value: 0 };
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uPulse = m.userData.uPulse;
      shader.uniforms.uMorph = m.userData.uMorph;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float along;\nvarying float vAlong;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlong = along;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nuniform float uPulse;\nuniform float uMorph;\nvarying float vAlong;\n${FADE_GLSL}`)
        // the tube's ends dissolve like light trailing off, instead of stopping on a cap
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float fade = smoothstep(0.0, FADE, vAlong) * smoothstep(1.0, 1.0 - FADE, vAlong);
          diffuseColor.a *= mix(fade, 1.0, uMorph);`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float facing = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
          // the hot core reads as a tube; on the flat logo it would wash the red out
          totalEmissiveRadiance += vec3(1.0, 0.62, 0.56) * 0.35 * pow(facing, 2.0) * (1.0 - uMorph);
          float d = vAlong - uPulse;
          totalEmissiveRadiance += vec3(1.0, 0.7, 0.65) * 0.6 * exp(-d * d / 0.0025);`,
        );
    };
    return m;
  }, []);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/** The logo's dark arrowhead, at the ring's right end, pointing on round the ellipse. */
function useArrowGeometry() {
  const geo = useMemo(() => {
    const end = ringPoint(RING.toDeg, new THREE.Vector3());
    const prev = ringPoint(RING.toDeg - 1, new THREE.Vector3());
    const dir = new THREE.Vector2(end.x - prev.x, end.y - prev.y).normalize();
    const perp = new THREE.Vector2(-dir.y, dir.x);
    const e = new THREE.Vector2(end.x, end.y).addScaledVector(dir, RING_HALF * 2 * RING.arrowGap);
    const half = RING_HALF * 1.8;
    const b1 = e.clone().addScaledVector(perp, half);
    const b2 = e.clone().addScaledVector(perp, -half);
    const tip = e.clone().addScaledVector(dir, RING_HALF * 4.2);
    const s = new THREE.Shape();
    s.moveTo(b1.x, b1.y);
    s.lineTo(tip.x, tip.y);
    s.lineTo(b2.x, b2.y);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: RING_DEPTH * 2, bevelEnabled: false });
    g.translate(0, 0, -RING_DEPTH);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

/**
 * Depth-only silhouette of the CSS phone (front face, back face and the edge between them),
 * projected with the very same transform the HTML uses — so the ribbon disappears exactly
 * behind the device.
 */
function usePhoneMaskGeometry() {
  const geo = useMemo(() => {
    const B = 1000; // px per box for the DOMMatrix maths
    const w = PHONE_HEIGHT * PHONE_ASPECT * B;
    const h = PHONE_HEIGHT * B;
    const r = w * PHONE_RADIUS;
    const m = new DOMMatrix(phoneTransform((box) => `${box * B}px`));

    // rounded-rect outline, centred
    const outline: [number, number][] = [];
    const corners: [number, number, number][] = [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, 90],
      [-w / 2 + r, -h / 2 + r, 180],
      [w / 2 - r, -h / 2 + r, 270],
    ];
    for (const [cx, cy, start] of corners) {
      for (let k = 0; k <= 8; k++) {
        const a = THREE.MathUtils.degToRad(start + (k / 8) * 90);
        outline.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    }
    const project = (z: number) =>
      outline.map(([x, y]) => {
        const q = m.transformPoint(new DOMPoint(x, y, z, 1));
        // CSS px (y down) → world units (y up)
        return new THREE.Vector3((q.x / q.w / B) * WORLD_PER_BOX, (-q.y / q.w / B) * WORLD_PER_BOX, 0);
      });
    const front = project(0);
    const back = project(-PHONE_DEPTH * B);

    const tri: THREE.Vector3[] = [];
    const fan = (ring: THREE.Vector3[]) => {
      const c = ring.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(ring.length);
      ring.forEach((p, i) => tri.push(c, p, ring[(i + 1) % ring.length]));
    };
    fan(front);
    fan(back);
    front.forEach((p, i) => {
      const j = (i + 1) % front.length;
      tri.push(p, front[j], back[j], p, back[j], back[i]);
    });
    const g = new THREE.BufferGeometry().setFromPoints(tri);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

/**
 * Neon halo, rendered on the GPU: the same ribbon geometry pushed out along its normals, drawn
 * additively and fading towards its silhouette. (A CSS drop-shadow on the canvas looked similar
 * but re-blurred the whole canvas every frame.)
 */
function useHaloMaterial(opacity: number, falloff: number) {
  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      color: '#FF5A4A',
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    m.userData.uInflate = { value: 0 };
    m.userData.uMorph = { value: 0 };
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uInflate = m.userData.uInflate;
      shader.uniforms.uMorph = m.userData.uMorph;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nattribute float along;\nuniform float uInflate;\nvarying float vAlong;\nvarying float vFacing;',
        )
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlong = along;\ntransformed += normal * uInflate;')
        .replace(
          '#include <project_vertex>',
          '#include <project_vertex>\nvFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mvPosition.xyz)));',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>\nuniform float uMorph;\nvarying float vAlong;\nvarying float vFacing;\n${FADE_GLSL}`,
        )
        .replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `float fade = smoothstep(0.0, FADE, vAlong) * smoothstep(1.0, 1.0 - FADE, vAlong);
          // strong around the tube, soft on the flat logo (where stacked shells would read as outlines)
          vec4 diffuseColor = vec4( diffuse, opacity * pow(vFacing, ${falloff.toFixed(1)}) * mix(fade, 0.3, uMorph) );`,
        );
    };
    return m;
  }, [opacity, falloff]);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/** Halo shells: a tight neon rim, and a wide, faint light spilling around the ribbon. */
const RIM = { opacity: 0.55, falloff: 1.5, tube: 2.6, ring: 0.6 };
const SPILL = { opacity: 0.14, falloff: 3, tube: 7, ring: 1.6 };

function Scene({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const mask = useRef<THREE.Mesh>(null);
  const ribbon = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const spill = useRef<THREE.Mesh>(null);
  const arrow = useRef<THREE.Mesh>(null);
  const lastMorph = useRef(-1);
  const { geo, sweep } = useMorphingRibbon();
  const material = useNeonMaterial();
  const haloMaterial = useHaloMaterial(RIM.opacity, RIM.falloff);
  const spillMaterial = useHaloMaterial(SPILL.opacity, SPILL.falloff);
  const arrowGeo = useArrowGeometry();
  const maskGeo = usePhoneMaskGeometry();
  const total = STEPS * RADIAL * 6;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.get();
    const m = smooth(LOGO_START, LOGO_END, p);

    if (Math.abs(m - lastMorph.current) > 1e-4) {
      sweep(m);
      lastMorph.current = m;
    }

    const k = Math.min(1, t / REVEAL_SECONDS);
    geo.setDrawRange(0, Math.floor(((1 - Math.pow(1 - k, 3)) * total) / 6) * 6);

    const mat = ribbon.current?.material as THREE.MeshStandardMaterial | undefined;
    // scroll sends a pulse of light down the ribbon (once per step); idle drifts it slowly
    if (mat) {
      mat.userData.uPulse.value = ((reduced ? 0 : t * 0.08) + p * 3) % 1.2;
      mat.userData.uMorph.value = m;
      mat.color.lerpColors(CORAL, LOGO_RED, m);
      mat.emissive.lerpColors(CORAL, LOGO_RED, m);
    }
    for (const [shell, cfg] of [[halo, RIM], [spill, SPILL]] as const) {
      const shellMat = shell.current?.material as THREE.MeshBasicMaterial | undefined;
      if (!shellMat) continue;
      shellMat.userData.uInflate.value = THREE.MathUtils.lerp(TUBE_R * cfg.tube, RING_HALF * cfg.ring, m);
      shellMat.userData.uMorph.value = m;
    }

    // the phone (and its depth mask) leave as the logo forms
    if (mask.current) mask.current.visible = m < 0.02;
    if (arrow.current) arrow.current.scale.setScalar(Math.max(0.0001, smooth(0.75, 1, m)));
    if (outer.current) outer.current.rotation.z = TILT * (1 - m);
    if (inner.current) {
      const sway = Math.sin(p * Math.PI * 2) * 0.18 + (reduced ? 0 : Math.sin(t * 0.5) * 0.04);
      inner.current.rotation.y = sway * (1 - m);
      inner.current.position.y = reduced ? 0 : Math.sin(t * 0.9) * PHONE_H * 0.012;
    }
  });

  return (
    <>
      <mesh ref={mask} geometry={maskGeo} renderOrder={-1}>
        <meshBasicMaterial colorWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={outer}>
        <group ref={inner}>
          <mesh ref={ribbon} geometry={geo} material={material} />
          <mesh ref={spill} geometry={geo} material={spillMaterial} renderOrder={1} />
          <mesh ref={halo} geometry={geo} material={haloMaterial} renderOrder={2} />
          <mesh ref={arrow} geometry={arrowGeo}>
            <meshStandardMaterial color="#141414" roughness={0.35} metalness={0.2} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function RibbonScene({
  progress,
  reduced,
  active,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
  /** Pauses rendering entirely while the hero is off screen. */
  active: boolean;
}) {
  return (
    <Canvas
      flat
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
    >
      {/* lit from above: a pale highlight on top of the tube, deeper red underneath */}
      <hemisphereLight args={['#FFE3DE', '#5A0A08', 0.9]} />
      <directionalLight position={[-2, 8, 6]} intensity={2.6} color="#FFF1EE" />
      <pointLight position={[4, -3, 5]} intensity={8} color="#FFD6D0" />
      <Scene progress={progress} reduced={reduced} />
    </Canvas>
  );
}
