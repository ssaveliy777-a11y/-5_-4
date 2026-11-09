/* ============================================================
   Info-Space — интерактив
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ---------- 1. Мобильное меню ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  /* ---------- 2. Табы (страницы входа, настроек, профиля, админки) ---------- */
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-panel').forEach(p =>
        p.classList.toggle('active', p.id === btn.dataset.tab));
    });
  });

  /* ---------- 3. Валидация форм ---------- */
  const EMAIL_RE = /^\S+@\S+\.\S+$/;

  function markError(field, msg) {
    const check = field.closest('.form-check');
    if (check) {
      check.classList.add('has-error');
      const err = check.parentElement.querySelector('.field-error');
      if (err) { if (msg) err.textContent = msg; err.classList.add('visible'); }
      return;
    }
    field.classList.add('is-invalid');
    const group = field.closest('.form-group');
    const err = group ? group.querySelector('.field-error') : null;
    if (err) { if (msg) err.textContent = msg; err.classList.add('visible'); }
  }

  function clearError(field) {
    field.classList.remove('is-invalid');
    const check = field.closest('.form-check');
    if (check) check.classList.remove('has-error');
    const group = field.closest('.form-group');
    const err = (group || field.parentElement);
    if (err) {
      const box = err.querySelector('.field-error');
      if (box) box.classList.remove('visible');
    }
  }

  document.querySelectorAll('form.js-validate').forEach(form => {
    if (!form.hasAttribute('novalidate')) form.setAttribute('novalidate', '');

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;

      form.querySelectorAll('[required]').forEach(field => {
        clearError(field);
        const value = (field.type === 'checkbox') ? '' : field.value.trim();

        if (field.type === 'checkbox' && !field.checked) {
          ok = false; markError(field, 'Отметьте этот пункт');
        } else if (!value) {
          ok = false; markError(field);
        } else if (field.type === 'email' && !EMAIL_RE.test(value)) {
          ok = false; markError(field);
        } else if (field.minLength > 0 && value.length < field.minLength) {
          ok = false; markError(field);
        }
      });

      // Совпадение паролей на форме регистрации
      const pass = form.querySelector('[name="password"]');
      const confirm = form.querySelector('#confirmPassword');
      if (pass && confirm && pass.value !== confirm.value) {
        ok = false; markError(confirm, 'Пароли не совпадают');
      }

      if (!ok) return;

      form.reset();
      form.querySelectorAll('.field-error.visible').forEach(el => el.classList.remove('visible'));
      if (form.dataset.success) {
        let box = form.querySelector('.form-success');
        if (!box) {
          box = document.createElement('div');
          box.className = 'form-success';
          form.appendChild(box);
        }
        box.textContent = form.dataset.success;
      }
    });

    // Ошибка снимается при первом же вводе
    form.addEventListener('input', e => {
      const t = e.target;
      if (t.classList.contains('is-invalid')) clearError(t);
      const check = t.closest('.form-check');
      if (check && check.classList.contains('has-error')) {
        check.classList.remove('has-error');
        const err = check.parentElement.querySelector('.field-error');
        if (err) err.classList.remove('visible');
      }
    });
  });

  /* ---------- 4. Лайки и закладки (делегирование) ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;
    const counter = btn.querySelector('[data-count]');
    let n = parseInt(counter ? counter.textContent : btn.dataset.likes, 10) || 0;
    btn.classList.toggle('liked');
    const liked = btn.classList.contains('liked');
    if (counter) counter.textContent = liked ? n + 1 : Math.max(0, n - 1);
    if (btn.dataset.likes) btn.dataset.likes = liked ? n + 1 : n;
  });

  /* ---------- 5. Живой поиск и фильтр категорий (Инфо-Доска) ---------- */
  const searchInput = document.getElementById('searchInput');
  const catFilter = document.getElementById('categoryFilter');
  const items = document.querySelectorAll('.searchable');
  const noRes = document.getElementById('noResults');

  function applyFilter() {
    if (!items.length) return;
    const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const cat = catFilter ? catFilter.value : '';
    let visible = 0;
    items.forEach(el => {
      const match = (!q || el.textContent.toLowerCase().includes(q)) &&
                    (!cat || el.dataset.category === cat);
      el.hidden = !match;
      if (match) visible++;
    });
    if (noRes) noRes.hidden = visible !== 0;
  }
  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (catFilter) catFilter.addEventListener('change', applyFilter);

  /* ---------- 6. Показ / скрытие пароля ---------- */
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.querySelector(btn.dataset.togglePassword);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Скрыть' : 'Показать';
    });
  });

  /* ---------- 7. Активная ссылка в меню (страховка) ---------- */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a[href]').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ---------- 8. Кнопка «наверх» ---------- */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.innerHTML = '&uarr;';
  toTop.setAttribute('aria-label', 'Наверх');
  document.body.appendChild(toTop);
  window.addEventListener('scroll', () =>
    toTop.classList.toggle('show', window.scrollY > 400), { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 9. Плавное появление карточек при скролле ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ---------- 10. Живые часы (админка) ---------- */
  const clock = document.getElementById('liveClock');
  if (clock) {
    const tick = () => { clock.textContent = new Date().toLocaleTimeString('ru-RU'); };
    tick();
    setInterval(tick, 1000);
  }
});