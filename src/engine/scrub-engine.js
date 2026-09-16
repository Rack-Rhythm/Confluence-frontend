/* ============================================================================
   scroll-world — portable scroll-scrubbed camera-flight engine
   Adapted for Confluence (React ES module + clean unmount support)
   ========================================================================== */

export function mountScrollWorld(container, config) {
  if (!container) return () => {};

  let isDestroyed = false;
  let rafId = null;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallMQ = window.matchMedia('(max-width: 860px)');
  const isMobile = () => coarse || smallMQ.matches;
  const SECTIONS = config.sections || [];
  const CONNECTORS = config.connectors || [];
  const CONNECTORS_M = config.connectorsMobile || [];
  const DIVE_W = config.diveScroll || 1.3;
  const CONN_W = config.connScroll || 0.9;
  const CROSSFADE = config.crossfade != null ? config.crossfade : 0.12;
  const N = SECTIONS.length;
  if (!N) return () => {};

  injectCSS();
  container.classList.add('sw-root');

  // Build the interleaved segment chain
  const SEGMENTS = [];
  SECTIONS.forEach((s, i) => {
    const dive = {
      kind: 'dive',
      si: i,
      clip: s.clip,
      clipM: s.clipMobile,
      still: s.still,
      stillM: s.stillMobile,
      accent: s.accent,
      w: s.scroll || DIVE_W,
      linger: s.linger || 0,
    };
    SEGMENTS.push(dive);
    s._seg = dive;
    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push({
        kind: 'conn',
        si: i,
        clip: CONNECTORS[i],
        clipM: CONNECTORS_M[i],
        still: SECTIONS[i + 1].still,
        stillM: SECTIONS[i + 1].stillMobile,
        accent: SECTIONS[i + 1].accent,
        w: CONN_W,
      });
    }
  });
  const NSEG = SEGMENTS.length;

  // DOM
  const sky = el('div', 'sw-sky');
  if (config.atmosphere !== false) {
    sky.appendChild(el('div', 'sw-sky__grad'));
    sky.appendChild(el('div', 'sw-sky__glow'));
  }
  const particles = el('div', 'sw-particles');
  sky.appendChild(particles);

  const scrollbar = el('div', 'sw-scrollbar');
  const scrollbarFill = el('span');
  scrollbar.appendChild(scrollbarFill);

  const topbar = el('div', 'sw-topbar');
  if (config.brand) {
    const brand = el('a', 'sw-brand');
    brand.href = config.brand.href || '#';
    if (config.brand.onBack) {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        config.brand.onBack();
      });
    }
    brand.appendChild(el('span', 'sw-brand__mark'));
    const nm = el('span', 'sw-brand__name');
    nm.textContent = config.brand.name || 'Confluence 3D World';
    brand.appendChild(nm);
    topbar.appendChild(brand);
  }

  const nav = el('nav', 'sw-nav');
  if (config.nav !== false) topbar.appendChild(nav);

  if (config.cta && config.cta.label) {
    const c = el('button', 'sw-topcta');
    c.textContent = config.cta.label;
    c.addEventListener('click', (e) => {
      e.preventDefault();
      if (config.cta.onClick) config.cta.onClick();
    });
    topbar.appendChild(c);
  }

  const stage = el('div', 'sw-stage');
  const copylayer = el('div', 'sw-copylayer');
  const route = el('div', 'sw-route');
  const hint = el('div', 'sw-hint');
  const hintText = el('span');
  hintText.textContent = config.hint || 'Scroll to fly through';
  hint.appendChild(hintText);
  hint.appendChild(el('i'));
  const track = el('div', 'sw-track');

  [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach((n) => container.appendChild(n));

  // segment scenes
  SEGMENTS.forEach((s) => {
    const scene = el('div', 'sw-scene');
    scene.style.setProperty('--sw-accent', s.accent || '');
    const img = el('img', 'sw-scene__still');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    const poster = isMobile() && s.stillM ? s.stillM : s.still;
    if (poster) img.src = poster;
    scene.appendChild(img);
    stage.appendChild(scene);
    s.el = scene;
    s.img = img;
    s.video = null;
    s.hasClip = false;
    s.loading = false;
    s.ready = false;
    s.cur = 0;
    s.target = 0;
    s.visible = false;
  });

  // per-section copy / route / nav
  const copies = [];
  const dots = [];
  SECTIONS.forEach((s, i) => {
    const c = el('article', 'sw-copy');
    c.style.setProperty('--sw-accent', s.accent || '');
    c.innerHTML =
      `<span class="sw-copy__num">${pad(i + 1)} / ${pad(N)}</span>` +
      (s.eyebrow ? `<span class="sw-copy__eyebrow">${esc(s.eyebrow)}</span>` : '') +
      (s.title ? `<h2 class="sw-copy__title">${esc(s.title)}</h2>` : '') +
      (s.body ? `<p class="sw-copy__body">${esc(s.body)}</p>` : '') +
      (s.tags && s.tags.length
        ? `<ul class="sw-copy__tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
        : '') +
      (s.cta ? `<div class="sw-copy__cta">${ctaBtns(s.cta)}</div>` : '');
    copylayer.appendChild(c);
    copies.push(c);

    // Attach click listeners to CTA buttons in copy
    const primaryBtn = c.querySelector('.sw-btn--primary');
    if (primaryBtn && s.cta?.primary?.onClick) {
      primaryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        s.cta.primary.onClick();
      });
    }
    const ghostBtn = c.querySelector('.sw-btn--ghost');
    if (ghostBtn && s.cta?.secondary?.onClick) {
      ghostBtn.addEventListener('click', (e) => {
        e.preventDefault();
        s.cta.secondary.onClick();
      });
    }

    const dot = el('button', 'sw-route__dot');
    dot.style.setProperty('--sw-accent', s.accent || '');
    dot.innerHTML = `<span class="sw-route__label">${esc(s.label || '')}</span><i></i>`;
    dot.addEventListener('click', () => jumpTo(i));
    route.appendChild(dot);
    dots.push(dot);

    if (config.nav !== false) {
      const b = el('button', 'sw-nav__item');
      b.textContent = s.label || '';
      b.addEventListener('click', () => jumpTo(i));
      nav.appendChild(b);
    }
  });

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x) => {
    x = clamp(x);
    return x * x * (3 - 2 * x);
  };
  const lingerEase = (x, L) => {
    L = clamp(L);
    const c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  };
  let vh = window.innerHeight;
  let stageX = 0;
  let totalW = 0;
  let activeIndex = -1;
  let ticking = false;
  let laidOutW = window.innerWidth;

  function layout() {
    if (isDestroyed) return;
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    let off = 0;
    SEGMENTS.forEach((s) => {
      s.start = off * vh;
      off += s.w;
      s.end = off * vh;
    });
    totalW = off;
    track.style.height = totalW * vh + vh + 'px';
    read();
  }

  function jumpTo(i) {
    if (isDestroyed) return;
    const seg = SECTIONS[i]._seg;
    window.scrollTo({
      top: seg.start + (seg.end - seg.start) * 0.5,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }

  function loadClip(s) {
    if (reduce || s.loading || !s.clip || isDestroyed) return;
    s.loading = true;
    const url = isMobile() && s.clipM ? s.clipM : s.clip;
    fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('404'))))
      .then((blob) => {
        if (isDestroyed) return;
        const v = document.createElement('video');
        v.className = 'sw-scene__video';
        v.muted = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.src = URL.createObjectURL(blob);
        v.addEventListener('loadedmetadata', () => {
          if (!isDestroyed) {
            s.ready = true;
            read();
          }
        });
        v.addEventListener(
          'seeked',
          () => {
            if (!isDestroyed) s.el.classList.add('has-clip');
          },
          { once: true }
        );
        v.addEventListener('loadeddata', () => {
          try {
            v.pause();
          } catch (e) {}
          if (userReady) primeVideo(v);
        });
        s.el.appendChild(v);
        s.video = v;
        s.hasClip = true;
      })
      .catch(() => {
        s.loading = false;
      });
  }

  function read() {
    if (isDestroyed) return;
    const y = window.scrollY || window.pageYOffset;
    const fade = CROSSFADE * vh;
    let ci = 0;
    for (let i = 0; i < NSEG; i++) {
      if (y >= SEGMENTS[i].start) ci = i;
    }

    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (y > s.start - 1.6 * vh && y < s.end + 1.6 * vh) loadClip(s);
      const local = clamp((y - s.start) / (s.end - s.start), 0, 1);
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      let outside = 0;
      if (y < s.start) outside = s.start - y;
      else if (y > s.end) outside = y - s.end;
      const op = smooth(1 - outside / fade);
      s.el.style.opacity = op;
      s.visible = op > 0.001;
      s.el.style.zIndex = i === ci ? '120' : String(100 + Math.round(op * 10));
      if (!s.hasClip || !s.ready) {
        const sc = reduce ? 1 : 1.03 + local * 0.14;
        s.img.style.transform = `translateX(${stageX - 2}vw) scale(${sc.toFixed(3)})`;
      }
    }

    for (let i = 0; i < N; i++) {
      const seg = SECTIONS[i]._seg;
      const pr = clamp((y - seg.start) / (seg.end - seg.start), 0, 1);
      const before = y < seg.start;
      const after = y > seg.end;
      let cop;
      if (i === 0) cop = after ? 0 : smooth(1 - pr / 0.62);
      else if (i === N - 1) cop = before ? 0 : smooth(pr / 0.4);
      else cop = before || after ? 0 : smooth(1 - Math.abs(pr - 0.5) / 0.5);
      const c = copies[i];
      c.style.opacity = cop;
      c.style.transform = reduce ? 'none' : `translateY(${(0.5 - pr) * 4}vh)`;
      c.style.pointerEvents = cop > 0.5 ? 'auto' : 'none';
    }

    const cur = SEGMENTS[ci];
    const near = clamp(
      cur.kind === 'dive'
        ? cur.si
        : (y - cur.start) / (cur.end - cur.start) > 0.5
        ? cur.si + 1
        : cur.si,
      0,
      N - 1
    );
    if (near !== activeIndex) {
      activeIndex = near;
      dots.forEach((d, k) => d.classList.toggle('is-active', k === near));
      nav.querySelectorAll('.sw-nav__item').forEach((n, k) => n.classList.toggle('is-active', k === near));
      container.style.setProperty('--sw-accent', SECTIONS[near].accent || '');
    }
    scrollbarFill.style.transform = `scaleX(${clamp(y / (totalW * vh))})`;
    hint.style.opacity = clamp(1 - y / (0.5 * vh));
    if (particles) particles.style.transform = `translate3d(0, ${-y * 0.05}px, 0)`;
    ticking = false;
  }

  function raf() {
    if (isDestroyed) return;
    const eps = isMobile() ? 0.02 : 0.008;
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (!s.hasClip || !s.ready || !s.video) continue;
      if (s.video.seeking) continue;
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
      s.cur += (s.target - s.cur) * (reduce ? 1 : 0.18);
      const dur = s.video.duration || 1;
      const t = clamp(s.cur, 0, 0.999) * dur;
      if (Math.abs(s.video.currentTime - t) > eps) {
        try {
          s.video.currentTime = t;
        } catch (e) {}
      }
    }
    rafId = requestAnimationFrame(raf);
  }

  let userReady = false;
  function primeVideo(v) {
    if (!isMobile() || !v) return;
    try {
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          try {
            v.pause();
          } catch (e) {}
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function onFirstGesture() {
    if (userReady || isDestroyed) return;
    userReady = true;
    SEGMENTS.forEach((s) => primeVideo(s.video));
  }

  window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
  window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });

  seedParticles(particles, reduce || coarse);

  const onScroll = () => {
    if (!ticking && !isDestroyed) {
      ticking = true;
      requestAnimationFrame(read);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  function onResize() {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', layout);

  layout();
  rafId = requestAnimationFrame(raf);

  function el(tag, cls) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function pad(n) {
    return String(n).padStart(2, '0');
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function ctaBtns(cta) {
    let h = '';
    if (cta.primary) {
      h += `<a class="sw-btn sw-btn--primary" href="${esc(cta.primary.href || '#')}">${esc(cta.primary.label)}</a>`;
    }
    if (cta.secondary) {
      h += `<a class="sw-btn sw-btn--ghost" href="${esc(cta.secondary.href || '#')}">${esc(cta.secondary.label)}</a>`;
    }
    return h;
  }

  // Return cleanup teardown function
  return () => {
    isDestroyed = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', layout);
    window.removeEventListener('pointerdown', onFirstGesture);
    window.removeEventListener('touchstart', onFirstGesture);
    container.innerHTML = '';
    container.classList.remove('sw-root');
  };
}

function seedParticles(host, reduce) {
  if (!host || reduce) return;
  const kinds = ['dot', 'dot', 'ring'];
  const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
  for (let k = 0; k < 20; k++) {
    const s = document.createElement('span');
    s.className = 'sw-pt sw-pt--' + kinds[k % kinds.length];
    s.style.left = seeds[k % seeds.length] + 'vw';
    s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + 'vh';
    s.style.setProperty('--sw-sc', (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
    const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = -(seeds[(k * 2) % seeds.length] % dur) + 's';
    host.appendChild(s);
  }
}

function injectCSS() {
  if (document.getElementById('sw-css')) return;
  const css = `
  .sw-root{--sw-bg:#0B0F19;--sw-ink:#FFFFFF;--sw-ink-soft:#94A3B8;--sw-accent:#3B82F6;
    --sw-font-display:ui-rounded,"SF Pro Rounded","Plus Jakarta Sans","Segoe UI",system-ui,sans-serif;
    --sw-font-body:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,system-ui,sans-serif;
    color:var(--sw-ink);font-family:var(--sw-font-body);position:relative;background:var(--sw-bg);}
  .sw-sky{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var(--sw-bg);}
  .sw-sky__grad{position:absolute;inset:-10%;background:radial-gradient(ellipse at top,color-mix(in srgb,var(--sw-accent) 24%,var(--sw-bg)) 0%,var(--sw-bg) 70%);}
  .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,color-mix(in srgb,var(--sw-accent) 30%,transparent),transparent 70%),radial-gradient(46% 34% at 50% 50%,color-mix(in srgb,#fff 10%,transparent),transparent 70%);}
  .sw-particles{position:absolute;inset:-6% -2%;will-change:transform;}
  .sw-pt{position:absolute;width:13px;height:13px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite;}
  .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%;}
  .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--sw-accent) 90%,#fff),var(--sw-accent) 82%);box-shadow:0 0 12px var(--sw-accent);}
  .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 70%,transparent);}
  @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.6}88%{opacity:.5}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
  .sw-scrollbar{position:fixed;top:0;left:0;right:0;height:4px;z-index:60;background:rgba(255,255,255,0.08);}
  .sw-scrollbar span{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg, #3B82F6, var(--sw-accent));box-shadow:0 0 10px var(--sw-accent);}
  .sw-topbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:clamp(14px,2.4vw,22px) clamp(18px,5vw,64px);backdrop-filter:blur(16px);background:rgba(11,15,25,0.7);border-bottom:1px solid rgba(255,255,255,0.08);}
  .sw-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--sw-ink);cursor:pointer;}
  .sw-brand__mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#3B82F6,var(--sw-accent));box-shadow:0 0 16px var(--sw-accent);display:inline-block;}
  .sw-brand__name{font-family:var(--sw-font-display);font-weight:800;font-size:1.15rem;letter-spacing:-0.02em;}
  .sw-nav{display:flex;gap:6px;padding:6px;background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.12);border-radius:999px;}
  .sw-nav__item{font:inherit;font-size:.84rem;font-weight:600;color:var(--sw-ink-soft);border:0;background:transparent;cursor:pointer;padding:7px 16px;border-radius:999px;transition:color .25s,background .25s;}
  .sw-nav__item:hover{color:#FFFFFF;background:rgba(255,255,255,0.08);} .sw-nav__item.is-active{color:#FFFFFF;background:var(--sw-accent);box-shadow:0 0 16px color-mix(in srgb,var(--sw-accent) 60%,transparent);}
  .sw-topcta{font:inherit;text-decoration:none;font-weight:700;font-size:.88rem;color:#fff;background:linear-gradient(135deg,#2563EB,#4F46E5);padding:10px 22px;border-radius:999px;white-space:nowrap;border:0;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,0.4);transition:transform .2s;}
  .sw-topcta:hover{transform:translateY(-1px);}
  .sw-stage{position:fixed;inset:0;z-index:10;pointer-events:none;}
  .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity;}
  .sw-scene__video,.sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;}
  .sw-scene__still{will-change:transform;transition:transform .1s linear;} .sw-scene.has-clip .sw-scene__still{opacity:0;} .sw-scene__video{z-index:1;}
  .sw-copylayer{position:fixed;inset:0;z-index:20;pointer-events:none;}
  .sw-copylayer::before{content:"";position:absolute;inset:0;width:min(62vw,860px);background:linear-gradient(90deg,var(--sw-bg) 0%,color-mix(in srgb,var(--sw-bg) 85%,transparent) 42%,color-mix(in srgb,var(--sw-bg) 30%,transparent) 72%,transparent 100%);}
  .sw-copy{position:absolute;left:clamp(18px,5vw,64px);top:50%;transform:translateY(-50%);width:min(46vw,520px);opacity:0;will-change:opacity,transform;}
  .sw-copy__num{font-family:ui-monospace,Menlo,monospace;font-size:.82rem;font-weight:700;letter-spacing:.15em;color:var(--sw-accent);background:color-mix(in srgb,var(--sw-accent) 15%,transparent);padding:4px 10px;border-radius:6px;border:1px solid color-mix(in srgb,var(--sw-accent) 30%,transparent);}
  .sw-copy__eyebrow{display:block;margin-top:20px;font-family:var(--sw-font-display);font-weight:800;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-accent);}
  .sw-copy__title{font-family:var(--sw-font-display);font-weight:900;color:#FFFFFF;font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.08;margin:12px 0 0;letter-spacing:-.02em;}
  .sw-copy__body{margin-top:18px;font-size:clamp(1.05rem,1.3vw,1.2rem);line-height:1.6;color:var(--sw-ink-soft);max-width:44ch;}
  .sw-copy__tags{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;}
  .sw-copy__tags li{font-size:.82rem;font-weight:600;color:#FFFFFF;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);backdrop-filter:blur(8px);}
  .sw-copy__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;pointer-events:auto;}
  .sw-btn{text-decoration:none;font-weight:700;font-size:.95rem;padding:14px 28px;border-radius:12px;transition:all .2s;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
  .sw-btn--primary{color:#fff;background:linear-gradient(135deg,#2563EB,var(--sw-accent));box-shadow:0 6px 20px color-mix(in srgb,var(--sw-accent) 45%,transparent);border:none;} .sw-btn--primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px color-mix(in srgb,var(--sw-accent) 65%,transparent);}
  .sw-btn--ghost{color:#FFFFFF;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.2);backdrop-filter:blur(8px);} .sw-btn--ghost:hover{transform:translateY(-2px);background:rgba(255,255,255,0.12);}
  .sw-route{position:fixed;right:clamp(14px,2.4vw,30px);top:50%;z-index:40;transform:translateY(-50%);display:flex;flex-direction:column;gap:22px;padding:18px 10px;}
  .sw-route::before{content:"";position:absolute;left:50%;top:22px;bottom:22px;width:2px;transform:translateX(-50%);background:var(--sw-accent);opacity:.28;}
  .sw-route__dot{position:relative;border:0;background:transparent;cursor:pointer;width:16px;height:16px;display:grid;place-items:center;}
  .sw-route__dot i{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.25);transition:transform .3s,background .3s,box-shadow .3s;}
  .sw-route__dot:hover i{transform:scale(1.3);background:var(--sw-accent);}
  .sw-route__dot.is-active i{background:var(--sw-accent);transform:scale(1.5);box-shadow:0 0 14px var(--sw-accent);}
  .sw-route__label{position:absolute;right:26px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;font-size:.8rem;font-weight:700;color:#FFFFFF;background:rgba(15,23,42,0.85);backdrop-filter:blur(10px);padding:6px 14px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;border:1px solid rgba(255,255,255,0.12);}
  .sw-route__dot:hover .sw-route__label,.sw-route__dot.is-active .sw-route__label{opacity:1;transform:translateY(-50%) translateX(0);}
  .sw-hint{position:fixed;left:50%;bottom:26px;z-index:30;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-ink-soft);transition:opacity .3s;}
  .sw-hint i{width:22px;height:34px;border-radius:12px;border:2px solid rgba(255,255,255,0.3);position:relative;}
  .sw-hint i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:7px;border-radius:2px;background:var(--sw-accent);box-shadow:0 0 8px var(--sw-accent);transform:translateX(-50%);animation:sw-wheel 1.7s ease-in-out infinite;}
  @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:17px}}
  .sw-track{position:relative;z-index:1;width:100%;pointer-events:none;}
  @media (max-width:860px){
    .sw-nav{display:none;}
    .sw-copylayer::before{width:100%;height:65%;top:auto;bottom:0;background:linear-gradient(0deg,var(--sw-bg) 12%,color-mix(in srgb,var(--sw-bg) 85%,transparent) 50%,transparent 100%);}
    .sw-copy{left:clamp(18px,5vw,32px);right:clamp(18px,5vw,32px);top:auto;bottom:clamp(64px,14vh,120px);transform:none;width:auto;max-width:560px;}
    .sw-copy__title{font-size:clamp(1.9rem,7.5vw,2.7rem);}
    .sw-copy__body{max-width:none;font-size:clamp(.98rem,3.6vw,1.1rem);}
    .sw-scene__video,.sw-scene__still{object-position:center center;}
    .sw-hint{bottom:20px;}
    .sw-route{gap:16px;right:6px;}
    .sw-route__label{display:none;}
  }
  @media (prefers-reduced-motion:reduce){ .sw-hint i::after{animation:none;} .sw-pt{display:none;} }
  `;
  const style = document.createElement('style');
  style.id = 'sw-css';
  style.textContent = '@layer sw {\n' + css + '\n}';
  document.head.appendChild(style);
}
