// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });
document.querySelectorAll('.r').forEach(el => obs.observe(el));

// Nav scroll opacity
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(8,8,8,0.98)'
      : 'rgba(8,8,8,0.92)';
  }, { passive: true });
}
