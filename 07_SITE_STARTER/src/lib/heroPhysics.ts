import type * as MatterNS from 'matter-js';

export type PhysItem = { el: HTMLElement; x: number; y: number; size: number; rot: number };
export type HeroPhysics = {
  burst: () => void;
  reset: () => void;
  setColliders: (on: boolean) => void;
  setRunning: (on: boolean) => void;
  remeasure: () => void;
  destroy: () => void;
};

/**
 * Rigid-body physics for the hero ingredients (matter-js, MIT). Ingredients rest in a cloud above the pizza,
 * get blasted off on the toss, then fall and bounce on the real headline text lines and on each other.
 * Coordinates are local to `box` (the square stage).
 */
export async function createHeroPhysics(box: HTMLElement, items: PhysItem[], textEls: HTMLElement[]): Promise<HeroPhysics> {
  const Matter = (await import('matter-js')).default as typeof MatterNS;
  const { Engine, World, Bodies, Body, Composite } = Matter;

  const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0.001 }, positionIterations: 8, velocityIterations: 6 });
  let W = box.clientWidth;
  let H = box.clientHeight;
  const rest = items.map((it) => ({ x: (it.x / 100) * W, y: (it.y / 100) * H, r: ((it.size / 100) * W) * 0.4, rot: (it.rot * Math.PI) / 180 }));

  const bodies = items.map((_, i) => {
    const b = Bodies.circle(rest[i].x, rest[i].y, rest[i].r, { restitution: 0.4, friction: 0.3, frictionAir: 0.02, density: 0.0016 * (1 + rest[i].r / 120) });
    Body.setStatic(b, true); // after creation, so Matter remembers the dynamic mass/inertia for setStatic(false)
    Body.setAngle(b, rest[i].rot);
    return b;
  });
  World.add(engine.world, bodies);
  items.forEach((it) => {
    it.el.style.left = '0px';
    it.el.style.top = '0px';
  });

  let ground: MatterNS.Body | null = null;
  const setGround = (on: boolean) => {
    if (ground) { Composite.remove(engine.world, ground); ground = null; }
    if (!on) return;
    const top = box.getBoundingClientRect().top;
    const y = window.innerHeight * 0.975 - top;
    ground = Bodies.rectangle(W / 2, y + 150, W * 4, 300, { isStatic: true, friction: 0.6, restitution: 0.3 });
    World.add(engine.world, ground);
  };
  let textBodies: MatterNS.Body[] = [];
  let collidersOn = false;
  const measureText = () => {
    const box0 = box.getBoundingClientRect();
    return textEls.map((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const b = r.getBoundingClientRect();
      const x = b.left - box0.left + b.width / 2;
      const y = b.top - box0.top + b.height / 2 + b.height * 0.04;
      return Bodies.rectangle(x, y, Math.max(10, b.width * 0.98), Math.max(10, b.height * 0.74), { isStatic: true, chamfer: { radius: Math.min(26, b.height * 0.22) }, restitution: 0.5, friction: 0.25 });
    });
  };
  const applyColliders = () => {
    if (textBodies.length) Composite.remove(engine.world, textBodies);
    textBodies = collidersOn ? measureText() : [];
    if (textBodies.length) World.add(engine.world, textBodies);
  };

  const sync = () => {
    for (let i = 0; i < items.length; i++) {
      const b = bodies[i];
      const el = items[i].el;
      if (!b.isStatic && b.position.y > H * 1.5 + 300) {
        Body.setStatic(b, true);
        Body.setPosition(b, { x: -9999, y: -9999 });
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.transform = `translate3d(${b.position.x.toFixed(1)}px, ${b.position.y.toFixed(1)}px, 0) rotate(${b.angle.toFixed(3)}rad)`;
    }
  };

  let raf = 0;
  let last = 0;
  let running = false;
  const tick = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(32, now - last || 16);
    last = now;
    Engine.update(engine, dt);
    sync();
    raf = requestAnimationFrame(tick);
  };

  sync();

  return {
    burst() {
      W = box.clientWidth;
      H = box.clientHeight;
      collidersOn = true;
      applyColliders();
      setGround(true);
      engine.gravity.y = 0.6;
      const cx = W * 0.56;
      const cy = H * 0.62;
      bodies.forEach((b, i) => {
        Body.setStatic(b, false);
        const dx = b.position.x - cx;
        const dy = b.position.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        const k = 5 + (i % 5) * 1.2;
        Body.setVelocity(b, { x: (dx / len) * k * 0.5 - (3 + (i % 5) * 1.5) + (Math.sin(i * 7.3)) * 2, y: -(9 + (i % 4) * 2.4) + (dy / len) * 2 });
        Body.setAngularVelocity(b, (i % 2 ? 1 : -1) * (0.06 + (i % 3) * 0.05));
      });
    },
    reset() {
      engine.gravity.y = 0;
      collidersOn = false;
      applyColliders();
      setGround(false);
      bodies.forEach((b, i) => {
        Body.setStatic(b, true);
        Body.setPosition(b, { x: rest[i].x, y: rest[i].y });
        Body.setAngle(b, rest[i].rot);
        Body.setVelocity(b, { x: 0, y: 0 });
        Body.setAngularVelocity(b, 0);
        items[i].el.style.visibility = '';
      });
      sync();
    },
    setColliders(on) {
      if (on === collidersOn) return;
      collidersOn = on;
      applyColliders();
    },
    setRunning(on) {
      running = on;
      if (on && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    },
    remeasure() {
      W = box.clientWidth;
      H = box.clientHeight;
      rest.forEach((r, i) => {
        r.x = (items[i].x / 100) * W;
        r.y = (items[i].y / 100) * H;
        r.r = ((items[i].size / 100) * W) * 0.4;
      });
      if (collidersOn) applyColliders();
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      World.clear(engine.world, false);
      Engine.clear(engine);
    },
  };
}
