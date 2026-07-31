// Scène 04 — "Le basculement" : seul effet WebGL/GLSL du site (brief :
// Three.js/GLSL "uniquement si valeur réelle ajoutée", jamais partout).
// Un triangle tracé au trait (rigueur géométrique) se dissout dans un
// champ de couleur peint (fbm/bruit) au fil du scroll — rejoue
// littéralement le cerveau gauche cédant la place au cerveau droit.
// Le rendu CSS/SVG existant (bascule-figure / bascule-matter) reste en
// place comme repli : si WebGL échoue, on ne touche pas au DOM et le
// crossfade CSS déjà câblé dans portfolio.js continue de fonctionner.

// Import dynamique (pas de `import` statique en tête de fichier) : Three.js
// (~600 Ko) ne doit être téléchargé que par les sessions qui l'utilisent
// vraiment. initBasculeShader() n'est appelée que hors reduced-motion
// (voir portfolio.js), donc cet import ne se déclenche jamais pour les
// visiteurs qui préfèrent des animations réduites — gain Core Web Vitals.

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uLineColor;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * vnoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  // distance à un segment (pour tracer un triangle au trait)
  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float triangleOutline(vec2 p, vec2 a, vec2 b, vec2 c) {
    float d = min(sdSegment(p, a, b), min(sdSegment(p, b, c), sdSegment(p, c, a)));
    return d;
  }

  void main() {
    vec2 uv = vUv - 0.5;

    float rot = uProgress * 0.9;
    float s = sin(rot);
    float co = cos(rot);
    mat2 rotMat = mat2(co, -s, s, co);
    vec2 ruv = rotMat * uv;

    float d1 = triangleOutline(ruv, vec2(0.0, 0.36), vec2(0.36, -0.34), vec2(-0.36, -0.34));
    float d2 = triangleOutline(ruv, vec2(0.0, 0.16), vec2(0.2, -0.2), vec2(-0.2, -0.2));
    float lines = smoothstep(0.01, 0.0, d1) + smoothstep(0.008, 0.0, d2);
    lines = clamp(lines, 0.0, 1.0);
    float lineAlpha = 1.0 - smoothstep(0.0, 0.6, uProgress);

    vec2 fp = uv * 3.0 + vec2(uTime * 0.015, 0.0);
    float n = fbm(fp);
    float n2 = fbm(fp * 1.7 + 4.2);
    vec3 paint = mix(uColorC, uColorA, smoothstep(0.2, 0.8, n));
    paint = mix(paint, uColorB, smoothstep(0.3, 0.9, n2));
    float radial = smoothstep(0.62, 0.0, length(uv));
    float colorAlpha = smoothstep(0.45, 1.0, uProgress) * mix(0.35, 1.0, radial);

    vec3 col = mix(uLineColor, paint, colorAlpha);
    float alpha = max(colorAlpha, lines * lineAlpha);

    gl_FragColor = vec4(col, alpha);
  }
`;

export async function initBasculeShader(container) {
  const THREE = await import('https://unpkg.com/three@0.169.0/build/three.module.js');

  let renderer;
  const canvas = document.createElement('canvas');
  canvas.className = 'bascule-canvas';
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return null;
  }
  if (!renderer.getContext()) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0xb5702c) },
      uColorB: { value: new THREE.Color(0x8a2f1f) },
      uColorC: { value: new THREE.Color(0x1f3a5f) },
      uLineColor: { value: new THREE.Color(0x14120f) },
    },
  });
  scene.add(new THREE.Mesh(geometry, material));
  container.appendChild(canvas);

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  resize();
  window.addEventListener('resize', resize);

  let rafId = null;
  let active = false;
  const clock = new THREE.Clock();

  function render() {
    if (!active) return;
    material.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(render);
  }

  return {
    canvas,
    setProgress(p) {
      material.uniforms.uProgress.value = p;
    },
    setActive(isActive) {
      if (isActive && !active) {
        active = true;
        render();
      } else if (!isActive && active) {
        active = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    },
    dispose() {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
