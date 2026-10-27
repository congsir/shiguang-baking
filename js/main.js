/* 拾光烘焙 — interactions */
(function(){
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) root.classList.add('rm');
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return [].slice.call((c || document).querySelectorAll(s)); };

  var nav = $('#nav'), lastY = 0;
  var darkSecs = $$('.hero, .sec-cocoa, .sec-ink');
  function navUpdate(){
    var y = scrollY, probe = 48, dark = false;
    for (var i = 0; i < darkSecs.length; i++) {
      var r = darkSecs[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { dark = true; break; }
    }
    nav.classList.toggle('scrolled', y > 24);
    nav.classList.toggle('top', y <= 24);
    nav.classList.toggle('on-dark', dark);
    nav.classList.toggle('on-light', !dark);
    if (!nav.classList.contains('open'))
      nav.classList.toggle('hide', y > lastY && y > 640 && y - lastY > 4);
    if (y < lastY - 4 || y < 640) nav.classList.remove('hide');
    lastY = y;
  }
  addEventListener('scroll', navUpdate, { passive: true });
  navUpdate();

  var tog = $('.nav-toggle');
  if (tog) {
    tog.addEventListener('click', function(){
      var o = nav.classList.toggle('open');
      tog.setAttribute('aria-expanded', o);
      document.body.classList.toggle('nav-lock', o);
    });
  }
  $$('.nav-links a, .nav-drawer a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      document.body.classList.remove('nav-lock');
      if (tog) tog.setAttribute('aria-expanded', 'false');
    });
  });

  var form = $('.contact-form');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = '已记录（示意）';
      btn.disabled = true;
      setTimeout(function(){ btn.textContent = old; btn.disabled = false; form.reset(); }, 1600);
    });
  }

  if (!hasGsap || reduced) {
    $$('.reveal, .reveal-img, .reveal-stagger > *').forEach(function(el){
      el.style.opacity = 1; el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.set('.hero-title .line > span', { yPercent: 110 });
  gsap.to('.hero-title .line > span', {
    yPercent: 0, duration: 1.15, ease: 'power3.out', stagger: 0.12, delay: 0.12,
    onComplete: function(){ gsap.set('.hero-title .line > span', { clearProps: 'transform' }); }
  });
  gsap.from('.hero-sub, .hero-actions, .eyebrow.light, .hero-foot', {
    opacity: 0, y: 18, duration: 0.9, ease: 'power2.out', stagger: 0.08, delay: 0.4
  });

  $$('.reveal').forEach(function(el){
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  $$('.reveal-img').forEach(function(el){
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.05, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
  $$('.reveal-stagger').forEach(function(wrap){
    gsap.to(wrap.children, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: wrap, start: 'top 85%' }
    });
  });
  $$('.reveal-lines').forEach(function(h){
    gsap.from(h, {
      opacity: 0, y: 28, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 88%' }
    });
  });
})();
