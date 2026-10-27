/* 拾光烘焙 — Hero WebGL
   Warm bakery atelier: soft dough folds / layered pastry ribbons + butter-gold volumetric glow.
   Elegant small motion — no sphere/balloon piles. */
import * as THREE from '../vendor/three.module.min.js';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

function webglOK(){
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

if (reduced) root.classList.add('rm');
if (!webglOK() || reduced) root.classList.add('no-webgl');
else {
  try { init(); }
  catch (e) { console.warn('[shiguang] webgl disabled:', e && e.message); root.classList.add('no-webgl'); }
}

/** Soft ribbon / dough fold as a curved ribbon strip */
function doughRibbon(width, length, segs, amp, phase){
  const geo = new THREE.PlaneGeometry(width, length, 1, segs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i); // along length, -L/2..L/2
    const t = (y / length) + 0.5;
    const fold = Math.sin(t * Math.PI * 2.2 + phase) * amp
      + Math.sin(t * Math.PI * 5.1 + phase * 1.7) * amp * 0.28;
    pos.setZ(i, fold);
    // slight thickness curl on edges via x
    const x = pos.getX(i);
    pos.setZ(i, fold + Math.sin(t * Math.PI) * Math.abs(x) * 0.08);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function init(){
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const hero = document.getElementById('hero');
  let lite = innerWidth < 720 || coarse;

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: !lite, alpha: false, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.2 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x1A1410, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x2A1F1A, 0.045);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  camera.position.set(0, 1.2, 7.5);

  // warm atelier lights
  scene.add(new THREE.AmbientLight(0x8A7460, 0.45));
  const key = new THREE.DirectionalLight(0xE8D5A3, 1.2);
  key.position.set(-4, 5, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xC4785A, 0.28);
  fill.position.set(4, 1.5, -2);
  scene.add(fill);
  const oven = new THREE.PointLight(0xD4A84B, 1.4, 28);
  oven.position.set(2.5, 2.2, 1.5);
  scene.add(oven);
  const rim = new THREE.PointLight(0xC4785A, 0.45, 18);
  rim.position.set(-3, 1.2, 2);
  scene.add(rim);

  // sky / oven-glow dome
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x3D2B24) },
      uMid: { value: new THREE.Color(0x2A1F1A) },
      uBot: { value: new THREE.Color(0x1A1410) },
      uGlow: { value: new THREE.Color(0xD4A84B) },
      uCrust: { value: new THREE.Color(0xC4785A) },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vPos;
      void main(){
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`,
    fragmentShader: `
      uniform vec3 uTop,uMid,uBot,uGlow,uCrust;
      uniform float uTime;
      varying vec3 vPos;
      void main(){
        vec3 n = normalize(vPos);
        float h = n.y * 0.5 + 0.5;
        vec3 col = mix(uBot, uMid, smoothstep(0.0, 0.42, h));
        col = mix(col, uTop, smoothstep(0.38, 0.92, h));
        // butter-gold oven glow — right-upper
        float glow = pow(max(0.0, 1.0 - length(n.xy - vec2(0.35, 0.25))), 4.5);
        col += uGlow * glow * (0.35 + 0.06 * sin(uTime * 0.35));
        // soft crust warmth left-low
        float warm = pow(max(0.0, 1.0 - length(n.xy - vec2(-0.4, -0.15))), 5.0);
        col += uCrust * warm * 0.12;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), skyMat);
  scene.add(sky);

  const group = new THREE.Group();
  scene.add(group);

  // layered pastry / dough ribbons — elegant folds, not spheres
  const doughMats = [
    new THREE.MeshStandardMaterial({ color: 0xC4785A, roughness: 0.78, metalness: 0.04, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xD4A84B, roughness: 0.72, metalness: 0.06, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xE8D5A3, roughness: 0.68, metalness: 0.05, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xA85A42, roughness: 0.82, metalness: 0.03, side: THREE.DoubleSide })
  ];

  const ribbons = [];
  const specs = [
    { w: 5.5, l: 9, segs: lite ? 36 : 56, amp: 0.55, phase: 0.2, x: -0.8, y: 0.4, z: -1.2, rx: -0.55, ry: 0.35, rz: 0.15, mat: 0, scale: 1 },
    { w: 4.2, l: 8, segs: lite ? 32 : 48, amp: 0.42, phase: 1.4, x: 1.4, y: 0.9, z: -2.0, rx: -0.4, ry: -0.45, rz: -0.1, mat: 1, scale: 0.92 },
    { w: 3.6, l: 7, segs: lite ? 28 : 44, amp: 0.35, phase: 2.6, x: 0.2, y: 1.6, z: -2.8, rx: -0.7, ry: 0.2, rz: 0.25, mat: 2, scale: 0.85 },
    { w: 3.0, l: 6, segs: lite ? 24 : 40, amp: 0.3, phase: 3.8, x: -1.6, y: 1.1, z: -3.2, rx: -0.5, ry: 0.7, rz: -0.2, mat: 3, scale: 0.78 }
  ];

  specs.forEach((s, idx) => {
    const mesh = new THREE.Mesh(doughRibbon(s.w, s.l, s.segs, s.amp, s.phase), doughMats[s.mat]);
    mesh.position.set(s.x, s.y, s.z);
    mesh.rotation.set(s.rx, s.ry, s.rz);
    mesh.scale.setScalar(s.scale);
    group.add(mesh);
    ribbons.push({ mesh, baseY: s.y, phase: s.phase, idx });
  });

  // soft volumetric light sheets (butter glow planes)
  const glowGeo = new THREE.PlaneGeometry(10, 8);
  function glowMat(opacity, color){
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uOpacity,uTime;
        varying vec2 vUv;
        void main(){
          vec2 p = vUv - 0.5;
          float d = length(p * vec2(1.0, 1.15));
          float a = smoothstep(0.55, 0.0, d);
          a *= (0.75 + 0.25 * sin(uTime * 0.4 + d * 4.0));
          gl_FragColor = vec4(uColor, a * uOpacity);
        }`
    });
  }
  const glows = [];
  const g1 = new THREE.Mesh(glowGeo, glowMat(0.18, 0xD4A84B));
  g1.position.set(2.2, 1.8, -0.5);
  g1.rotation.y = -0.4;
  group.add(g1); glows.push(g1);
  if (!lite) {
    const g2 = new THREE.Mesh(glowGeo, glowMat(0.1, 0xC4785A));
    g2.position.set(-1.5, 0.8, -1.5);
    g2.scale.setScalar(0.7);
    group.add(g2); glows.push(g2);
  }

  // sparse flour dust — few points only
  const dustCount = lite ? 22 : 40;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i*3] = (Math.random() - 0.5) * 10;
    dustPos[i*3+1] = Math.random() * 4 + 0.2;
    dustPos[i*3+2] = -Math.random() * 6 - 0.5;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xE8D5A3,
    size: lite ? 0.035 : 0.045,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    sizeAttenuation: true
  }));
  group.add(dust);

  root.classList.add('webgl-on');
  root.classList.remove('no-webgl');

  let w = 1, h = 1, visible = true;
  function resize(){
    const r = hero ? hero.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    lite = innerWidth < 720 || coarse;
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!coarse) {
    addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let scrollFade = 1;
  function onScroll(){
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    const tot = Math.max(1, r.height);
    scrollFade = Math.max(0, Math.min(1, r.bottom / tot));
    visible = r.bottom > 0 && r.top < innerHeight;
    canvas.style.opacity = String(0.12 + scrollFade * 0.88);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const clock = new THREE.Clock();
  let alive = true;
  function frame(){
    if (!alive) return;
    requestAnimationFrame(frame);
    if (!visible && document.hidden) return;
    const t = clock.getElapsedTime();
    skyMat.uniforms.uTime.value = t;
    glows.forEach((g) => { g.material.uniforms.uTime.value = t; });

    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    group.rotation.y = mouse.x * 0.08;
    group.position.y = Math.sin(t * 0.22) * 0.05;
    camera.position.x = mouse.x * 0.4;
    camera.position.y = 1.2 + mouse.y * -0.18 + Math.sin(t * 0.18) * 0.03;
    camera.lookAt(0, 1.0, -1.5);

    ribbons.forEach((r) => {
      r.mesh.position.y = r.baseY + Math.sin(t * 0.3 + r.phase) * 0.06;
      r.mesh.rotation.z += Math.sin(t * 0.15 + r.idx) * 0.00015;
    });

    oven.intensity = 1.25 + Math.sin(t * 0.5) * 0.15;

    const arr = dust.geometry.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      arr[i*3+1] += Math.sin(t * 0.25 + i) * 0.0009;
      arr[i*3] += Math.cos(t * 0.12 + i * 0.6) * 0.0004;
      if (arr[i*3+1] > 4.5) arr[i*3+1] = 0.2;
    }
    dust.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  frame();

  addEventListener('beforeunload', () => { alive = false; });
}
