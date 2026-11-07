'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type * as ThreeNS from 'three';
import { gsap, useGSAP } from '@/lib/gsap';
import { WoodBackground } from './WoodBackground';
import type { Messages } from '@/lib/i18n';

type State = { rot: number; dolly: number; heat: number };

/** Real 3D geometry (stacked, displaced cone of meat on a metal rod), procedural texture and flickering firelight. */
export function DonerRotation({ t }: { t: Messages['doner'] }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>({ rot: 0, dolly: 0, heat: 0.55 });
  const [failed, setFailed] = useState(false);

  /* ---------------- scroll choreography ---------------- */
  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const s = state.current;
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: '+=260%', scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
        tl.to(s, { rot: Math.PI * 3.2, duration: 5 }, 0);
        tl.to(s, { dolly: 1, ease: 'power1.inOut', duration: 5 }, 0);
        tl.to(s, { heat: 1, duration: 3 }, 0);
        tl.fromTo(q('.dn__word'), { yPercent: 10, xPercent: -4 }, { yPercent: -10, xPercent: 4, duration: 5 }, 0);
        tl.fromTo(q('.dn__copy > *'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: 'power3.out', duration: 0.9, stagger: 0.18 }, 0.2);
        tl.fromTo(q('.dn__sandwich'), { xPercent: 70, rotation: 14, opacity: 0 }, { xPercent: 0, rotation: -4, opacity: 1, ease: 'power3.out', duration: 1.4 }, 3.4);
        tl.to({}, { duration: 0.6 }, 5);
      });

      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
        tl.to(s, { rot: Math.PI * 2.2, duration: 1 }, 0);
        tl.to(s, { dolly: 0.8, duration: 1, ease: 'power1.inOut' }, 0);
        tl.to(s, { heat: 1, duration: 0.6 }, 0);
        tl.fromTo(q('.dn__word'), { yPercent: 6 }, { yPercent: -6, duration: 1 }, 0);
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        s.rot = 0.7;
        s.heat = 0.8;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  /* ---------------- three.js scene ---------------- */
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    let disposed = false;
    let raf = 0;
    let cleanup = () => {};
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      try {
        const THREE = await import('three');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        scene.environmentIntensity = 0.16;

        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

        /* --- procedural meat texture (seamless around the cylinder) --- */
        const SZ = 1024;
        const c2 = document.createElement('canvas');
        c2.width = SZ;
        c2.height = SZ;
        const g = c2.getContext('2d')!;
        let seed = 1234567;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const wrap = (fn: (dx: number) => void) => { fn(0); fn(-SZ); fn(SZ); };
        g.fillStyle = '#4a2a14';
        g.fillRect(0, 0, SZ, SZ);
        const rows = 18;
        const rh = SZ / rows;
        for (let r = 0; r < rows; r++) {
          let x = -rnd() * 120;
          while (x < SZ) {
            const w = 110 + rnd() * 160;
            const h = rh * (1.05 + rnd() * 0.6);
            const k = rnd();
            const a = rnd(), b = rnd(), d = rnd(), rot = (rnd() - 0.5) * 0.5;
            const col = k > 0.8 ? `rgb(${168 + a * 26 | 0},${118 + b * 24 | 0},${62 + d * 18 | 0})` : k > 0.3 ? `rgb(${124 + a * 28 | 0},${82 + b * 20 | 0},${42 + d * 12 | 0})` : `rgb(${86 + a * 20 | 0},${54 + b * 14 | 0},${28 + d * 8 | 0})`;
            const cx = x + w / 2, cy = r * rh + rh / 2;
            wrap((dx) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx + dx, cy, w / 2, h / 2, rot, 0, 6.2832); g.fill(); });
            x += w * 0.72;
          }
        }
        // meat fibres: thin diagonal strands
        for (let i = 0; i < 2600; i++) {
          const x = rnd() * SZ, y = rnd() * SZ, len = 18 + rnd() * 70, ang = -0.5 + rnd() * 0.35, lw = 0.8 + rnd() * 1.8, tone = rnd();
          const col = tone > 0.7 ? `rgba(190,130,70,${0.1 + rnd() * 0.2})` : tone > 0.25 ? `rgba(60,32,14,${0.12 + rnd() * 0.25})` : `rgba(130,80,40,${0.1 + rnd() * 0.2})`;
          wrap((dx) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke(); });
        }
        // dark gap between layers
        for (let r = 0; r < rows; r++) {
          g.strokeStyle = 'rgba(20,8,2,0.55)';
          g.lineWidth = 4 + rnd() * 4;
          g.beginPath();
          g.moveTo(0, r * rh);
          for (let xx = 0; xx <= SZ; xx += 64) g.lineTo(xx, r * rh + Math.sin(xx * 0.05 + r) * 3);
          g.stroke();
        }
        // char
        for (let i = 0; i < 1400; i++) {
          const x = rnd() * SZ, y = rnd() * SZ, rx = 3 + rnd() * 12, ry = 1 + rnd() * 5, ang = rnd() * 3, al = 0.3 + rnd() * 0.5, cc = 8 + rnd() * 16 | 0;
          wrap((dx) => { g.fillStyle = `rgba(${cc},${cc * 0.45 | 0},0,${al})`; g.beginPath(); g.ellipse(x + dx, y, rx, ry, ang, 0, 6.2832); g.fill(); });
        }
        // fat / juice highlights
        for (let i = 0; i < 260; i++) {
          const x = rnd() * SZ, y = rnd() * SZ, rx = 2 + rnd() * 6, ry = 1 + rnd() * 3, ang = rnd() * 3, al = 0.1 + rnd() * 0.22;
          wrap((dx) => { g.fillStyle = `rgba(255,222,170,${al})`; g.beginPath(); g.ellipse(x + dx, y, rx, ry, ang, 0, 6.2832); g.fill(); });
        }
        // spice specks
        for (let i = 0; i < 520; i++) {
          const x = rnd() * SZ, y = rnd() * SZ, al = 0.25 + rnd() * 0.35, red = rnd() > 0.55;
          wrap((dx) => { g.fillStyle = red ? `rgba(160,40,10,${al})` : `rgba(210,150,50,${al})`; g.fillRect(x + dx, y, 2, 2); });
        }
        const map = new THREE.CanvasTexture(c2);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(2, 1);
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

        /* --- geometry: lathe cone with stacked, irregular layers --- */
        const H = 3.3;
        const prof: ThreeNS.Vector2[] = [new THREE.Vector2(0.02, -H / 2)];
        const N = 100;
        for (let i = 0; i <= N; i++) {
          const tt = i / N;
          const r = 0.56 + 0.47 * Math.pow(tt, 0.85) + Math.sin(Math.PI * tt) * 0.05;
          prof.push(new THREE.Vector2(r * (i === 0 ? 0.94 : 1), (tt - 0.5) * H));
        }
        prof.push(new THREE.Vector2(0.9, H / 2 + 0.01));
        prof.push(new THREE.Vector2(0.06, H / 2 + 0.01));
        const geo = new THREE.LatheGeometry(prof, 180);
        const pos = geo.attributes.position;
        const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
          const rr = Math.hypot(x, z);
          if (rr < 0.25 || Math.abs(y) > H / 2 - 0.02) continue;
          const ang = Math.atan2(z, x);
          const u = (y + H / 2) * 9;
          const layer = Math.floor(u), frac = u - layer;
          const d = Math.sin(frac * Math.PI) * 0.03 + (hash(layer) - 0.5) * 0.05 + 0.03 * Math.sin(ang * 5 + layer * 1.7) + 0.016 * Math.sin(ang * 13 + y * 20) + 0.01 * (hash(layer * 7 + Math.floor(ang * 3)) - 0.5);
          const nr = rr + d;
          pos.setX(i, (x / rr) * nr);
          pos.setZ(i, (z / rr) * nr);
        }
        geo.computeVertexNormals();
        const meatMat = new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 4, roughness: 0.72, metalness: 0, emissive: new THREE.Color(0x2a1204), emissiveIntensity: 0.06 });
        const spit = new THREE.Group();
        const meat = new THREE.Mesh(geo, meatMat);
        spit.add(meat);

        const metal = new THREE.MeshStandardMaterial({ color: 0xc4c4c8, metalness: 1, roughness: 0.26 });
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, H + 2.6, 24), metal);
        const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, 0.14, 40), metal);
        topCap.position.y = H / 2 + 0.09;
        const botPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 48), metal);
        botPlate.position.y = -H / 2 - 0.04;
        const finial = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 16), metal);
        finial.position.y = H / 2 + 1.35;
        spit.add(rod, topCap, botPlate, finial);
        spit.rotation.z = 0.0;
        scene.add(spit);

        /* --- heater glow behind the meat --- */
        const hc = document.createElement('canvas');
        hc.width = 64;
        hc.height = 256;
        const hg = hc.getContext('2d')!;
        const grad = hg.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, 'rgba(255,120,30,0)');
        grad.addColorStop(0.15, 'rgba(255,100,20,0.9)');
        grad.addColorStop(0.85, 'rgba(255,60,8,0.9)');
        grad.addColorStop(1, 'rgba(255,60,0,0)');
        hg.fillStyle = grad;
        hg.fillRect(0, 0, 64, 256);
        const hx = hg.createLinearGradient(0, 0, 64, 0);
        hx.addColorStop(0, 'rgba(0,0,0,0.9)');
        hx.addColorStop(0.5, 'rgba(0,0,0,0)');
        hx.addColorStop(1, 'rgba(0,0,0,0.9)');
        hg.globalCompositeOperation = 'destination-out';
        hg.fillStyle = hx;
        hg.fillRect(0, 0, 64, 256);
        const heaterTex = new THREE.CanvasTexture(hc);
        const heaterMat = new THREE.MeshBasicMaterial({ map: heaterTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const heater = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 3.6), heaterMat);
        heater.position.set(-1.7, 0, -0.5);
        heater.rotation.y = 0.45;
        scene.add(heater);
        const heater2 = heater.clone();
        heater2.position.set(1.8, 0, -0.55);
        heater2.rotation.y = -0.45;
        scene.add(heater2);

        /* --- lights (fire) --- */
        scene.add(new THREE.AmbientLight(0x2a1608, 0.4));
        const fireL = new THREE.PointLight(0xff9a3c, 55, 12, 1.6);
        fireL.position.set(-2.4, 0.3, 1.4);
        const fireR = new THREE.PointLight(0xff5a10, 38, 12, 1.6);
        fireR.position.set(2.6, 0.9, 1.1);
        const rim = new THREE.DirectionalLight(0xffc690, 1.1);
        rim.position.set(0.5, 3, -3);
        scene.add(fireL, fireR, rim);

        /* --- smoke + sparks --- */
        const sc = document.createElement('canvas');
        sc.width = sc.height = 128;
        const sg = sc.getContext('2d')!;
        const rg = sg.createRadialGradient(64, 64, 4, 64, 64, 62);
        rg.addColorStop(0, 'rgba(235,225,215,0.55)');
        rg.addColorStop(0.5, 'rgba(210,200,190,0.2)');
        rg.addColorStop(1, 'rgba(200,190,180,0)');
        sg.fillStyle = rg;
        sg.fillRect(0, 0, 128, 128);
        const smokeTex = new THREE.CanvasTexture(sc);
        const small = window.innerWidth < 768;
        const puffs = Array.from({ length: small ? 8 : 16 }, (_, i) => {
          const mat = new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 });
          const sp = new THREE.Sprite(mat);
          scene.add(sp);
          return { sp, mat, off: i / (small ? 8 : 16), dx: (hash(i) - 0.5) * 0.9, sd: 0.6 + hash(i + 9) * 0.8 };
        });
        const SPARKS = small ? 24 : 60;
        const sparkGeo = new THREE.BufferGeometry();
        const sparkPos = new Float32Array(SPARKS * 3);
        const sparkSeed = Array.from({ length: SPARKS }, (_, i) => ({ x: (hash(i * 3) - 0.5) * 4.2, z: (hash(i * 5) - 0.5) * 1.6, sp: 0.25 + hash(i * 7) * 0.5, ph: hash(i * 11) }));
        sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
        const sparkMat = new THREE.PointsMaterial({ color: 0xffa040, size: 0.045, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
        scene.add(new THREE.Points(sparkGeo, sparkMat));

        /* --- sizing + loop --- */
        const resize = () => {
          const w = cv.clientWidth || 1, h = cv.clientHeight || 1;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2));
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(() => { resize(); draw(clock.getElapsedTime()); });
        ro.observe(cv);

        const clock = new THREE.Clock();
        const s = state.current;
        const draw = (time: number) => {
          const aspect = camera.aspect;
          const k = aspect < 1.1 ? 1.1 / aspect : 1;
          const baseZ = 9.6 * Math.pow(k, 0.55);
          camera.position.set(0, 0.15 + s.dolly * 0.1, baseZ - s.dolly * baseZ * 0.14);
          camera.lookAt(0, 0.05, 0);
          spit.rotation.y = s.rot + 0.7 + (reduce ? 0 : time * 0.28);
          const f = 0.82 + 0.18 * Math.sin(time * 9.1) * Math.sin(time * 5.3 + 1) + 0.15 * Math.sin(time * 23);
          fireL.intensity = (10 + s.heat * 16) * f;
          fireR.intensity = (6 + s.heat * 12) * (1.7 - f);
          meatMat.emissiveIntensity = 0.03 + s.heat * 0.1 * f;
          heaterMat.opacity = 0.16 + s.heat * 0.2 * f;
          for (const p of puffs) {
            const lf = (time * 0.09 * p.sd + p.off) % 1;
            p.sp.position.set(p.dx + Math.sin(lf * 6 + p.off * 9) * 0.25, H / 2 + 0.2 + lf * 2.4, 0.2);
            const sc2 = 0.7 + lf * 1.7;
            p.sp.scale.set(sc2, sc2, 1);
            p.mat.opacity = Math.sin(lf * Math.PI) * (0.12 + s.heat * 0.2);
          }
          for (let i = 0; i < SPARKS; i++) {
            const sd = sparkSeed[i];
            const lf = (time * 0.12 * sd.sp + sd.ph) % 1;
            sparkPos[i * 3] = sd.x + Math.sin(time * 1.3 + i) * 0.1;
            sparkPos[i * 3 + 1] = -1.7 + lf * 3.8;
            sparkPos[i * 3 + 2] = sd.z;
          }
          sparkGeo.attributes.position.needsUpdate = true;
          sparkMat.opacity = 0.35 + s.heat * 0.55;
          renderer.render(scene, camera);
        };

        let visible = false;
        const tick = () => {
          raf = 0;
          if (!visible || disposed) return;
          draw(clock.getElapsedTime());
          raf = requestAnimationFrame(tick);
        };
        resize();
        draw(0);
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          if (visible && !raf && !reduce) raf = requestAnimationFrame(tick);
        }, { rootMargin: '100px' });
        io.observe(cv);
        if (reduce) window.addEventListener('resize', () => draw(0));

        cleanup = () => {
          io.disconnect();
          ro.disconnect();
          cancelAnimationFrame(raf);
          [geo, rod.geometry, topCap.geometry, botPlate.geometry, finial.geometry, heater.geometry, sparkGeo].forEach((x) => x.dispose());
          [meatMat, metal, heaterMat, sparkMat, ...puffs.map((p) => p.mat)].forEach((x) => x.dispose());
          [map, heaterTex, smokeTex, envTex].forEach((x) => x.dispose());
          pmrem.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return (
    <section className="dn" ref={root} id="doner">
      <WoodBackground className="dn__wood" />
      <span className="dn__fire" aria-hidden="true" />
      <p className="dn__word" aria-hidden="true">DÖNER</p>
      <div className="dn__view">
        {failed ? (
          <Image className="dn__fallback" src="/assets/food/doner_sandwich.png" alt={t.sandwichAlt} width={1254} height={1254} sizes="60vw" />
        ) : (
          <canvas ref={canvas} className="dn__canvas" role="img" aria-label={t.alt} />
        )}
      </div>
      <div className="dn__copy">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="display">
          {t.title}
          <em>{t.accent}</em>
        </h2>
        <p className="dn__text">{t.text}</p>
      </div>
      <div className="dn__sandwich">
        <Image src="/assets/food/doner_sandwich.png" alt={t.sandwichAlt} width={1254} height={1254} sizes="(max-width: 767px) 70vw, 34vw" />
      </div>
    </section>
  );
}
