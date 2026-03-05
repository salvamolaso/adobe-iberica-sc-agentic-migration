import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds the sidebar navigation for the first section.
 * @param {Element} main The container element
 */
function buildSidebar(main) {
  const firstSection = main.querySelector('.section');
  if (!firstSection) return;
  const wrapper = firstSection.querySelector(':scope > div');
  if (!wrapper) return;

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-nav';

  // Icons bar
  const icons = document.createElement('div');
  icons.className = 'sidebar-icons';
  icons.innerHTML = `
    <button type="button" aria-label="Favorito" class="sidebar-icon sidebar-icon-circle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#003df6" width="20" height="20"><path d="M12 2l2.9 6.3L22 9.2l-5 4.6 1.2 6.9L12 17.3 5.8 20.7 7 13.8l-5-4.6 7.1-.9z"/></svg>
    </button>
    <button type="button" aria-label="Compartir" class="sidebar-icon sidebar-icon-circle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#003df6" width="18" height="18"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
    </button>
    <span class="sidebar-divider">|</span>
    <button type="button" aria-label="Aumentar texto" class="sidebar-icon sidebar-icon-text sidebar-icon-text-large">a+</button>
    <button type="button" aria-label="Reducir texto" class="sidebar-icon sidebar-icon-text sidebar-icon-text-small">a-</button>
    <span class="sidebar-divider">|</span>
    <button type="button" aria-label="Imprimir" class="sidebar-icon sidebar-icon-print">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#333" width="22" height="22"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
    </button>
  `;

  // Navigation links
  const nav = document.createElement('nav');
  nav.className = 'sidebar-links';
  const links = [
    { label: 'Ayuda y preguntas frecuentes', href: '/ayuda', active: true },
    { label: 'Protección de datos personales', href: '/proteccion-datos' },
    { label: 'Identificación y firma electrónica', href: '/identificacion' },
    { label: 'Notificaciones electrónicas', href: '/notificaciones' },
    { label: 'Aplicación Madrid Móvil', href: '/madrid-movil' },
    { label: 'Actuaciones administrativas automatizadas', href: '/actuaciones' },
    { label: 'Inventario Electrónico de Procedimientos y Servicios', href: '/inventario' },
    { label: 'Acceso robotizado a servicios digitales', href: '/acceso-robotizado' },
    { label: 'Idiomas / Languages', href: '/idiomas' },
  ];

  const ul = document.createElement('ul');
  links.forEach(({ label, href, active }) => {
    const li = document.createElement('li');
    if (active) li.classList.add('active');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);

  sidebar.appendChild(icons);
  sidebar.appendChild(nav);
  wrapper.prepend(sidebar);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);

  // Wrap the first H1 in a div with a "Volver" button
  const h1 = main.querySelector('h1');
  if (h1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'h1-wrapper';
    h1.parentNode.insertBefore(wrapper, h1);
    wrapper.appendChild(h1);

    const btn = document.createElement('a');
    btn.className = 'back-button';
    btn.href = '#';
    btn.textContent = '\u2190 Volver';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });
    wrapper.appendChild(btn);

    // ReadSpeaker button after h1-wrapper
    const rsBtn = document.createElement('div');
    rsBtn.id = 'readspeaker_button1';
    rsBtn.className = 'rs_skip rsbtn rs_preserve mega_toggle';
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    rsBtn.innerHTML = `
      <button class="rsbtn_tooltoggle" title="Menú de webReader" aria-label="Menú de webReader" aria-expanded="false">
        <span class="rsicn rsicn-menu" aria-hidden="true"></span>
      </button>
      <a rel="nofollow" class="rsbtn_play" title="Escuchar esta página utilizando ReadSpeaker"
        href="https://app-eu.readspeaker.com/cgi-bin/rsent?customerid=13230&amp;lang=es_es&amp;readid=readspeaker&amp;url=${pageUrl}"
        role="button" aria-label="Escuchar" aria-haspopup="menu">
        <span class="rsbtn_left rsimg rspart"><span class="rsbtn_text" aria-hidden="true"><span>Escuchar</span></span></span>
        <span class="rsbtn_right rsimg rsplay rspart"></span>
      </a>`;
    wrapper.after(rsBtn);
  }
}

/**
 * Builds scroll-to-top and scroll-to-bottom floating buttons.
 */
function buildScrollButtons() {
  const container = document.createElement('div');
  container.className = 'scroll-buttons';

  const btnUp = document.createElement('button');
  btnUp.className = 'scroll-btn scroll-btn-up';
  btnUp.setAttribute('aria-label', 'Ir arriba');
  btnUp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
  btnUp.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const btnDown = document.createElement('button');
  btnDown.className = 'scroll-btn scroll-btn-down';
  btnDown.setAttribute('aria-label', 'Ir abajo');
  btnDown.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';
  btnDown.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));

  container.appendChild(btnUp);
  container.appendChild(btnDown);
  document.body.appendChild(container);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);
  buildSidebar(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  buildScrollButtons();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
