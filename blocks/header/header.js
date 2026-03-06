import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Abrir menú del portal' : 'Cerrar menú del portal');
  }
}

/**
 * Strips button/button-container classes that DA may add to links.
 * @param {Element} section The section element to clean
 */
function stripButtonClasses(section) {
  if (!section) return;
  section.querySelectorAll('.button').forEach((btn) => {
    btn.className = '';
    const container = btn.closest('.button-container');
    if (container) container.className = '';
  });
}

/**
 * Builds breadcrumb list items from page metadata or URL path fallback.
 * Metadata format: "Label::URL, Label::URL, Label" (last item without URL = current page)
 * @returns {string} HTML string of breadcrumb <li> elements
 */
function buildBreadcrumbItems() {
  const bcMeta = getMetadata('breadcrumb');
  if (bcMeta) {
    return bcMeta.split(',').map((item) => {
      const trimmed = item.trim();
      const sepIdx = trimmed.indexOf('::');
      if (sepIdx > -1) {
        const label = trimmed.substring(0, sepIdx).trim();
        const url = trimmed.substring(sepIdx + 2).trim();
        return `<li><a href="${url}" class="bc-item">${label}</a></li>`;
      }
      return `<li><span class="bc-item">${trimmed}</span></li>`;
    }).join('\n');
  }

  // Fallback: derive from URL path
  const pagePath = window.location.pathname
    .replace(/\.html$/, '')
    .replace(/^\/content/, '');
  const parts = pagePath.split('/').filter(Boolean);
  let html = '';
  parts.forEach((part, idx) => {
    const label = decodeURIComponent(part)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (idx === parts.length - 1) {
      html += `<li><span class="bc-item">${label}</span></li>`;
    } else {
      html += `<li><a href="/${parts.slice(0, idx + 1).join('/')}" class="bc-item">${label}</a></li>`;
    }
  });
  return html;
}

/**
 * Marks the active sub-menu item based on nav-section metadata.
 * @param {Element} subMenuSection The sub-menu section element
 * @returns {string|null} The active section name, or null
 */
function applyActiveSubMenu(subMenuSection) {
  if (!subMenuSection) return null;
  const navSection = getMetadata('nav-section');
  if (!navSection) return null;

  const links = [...subMenuSection.querySelectorAll('li')];
  const match = links.find((li) => {
    const a = li.querySelector('a');
    return a && a.textContent.trim().toLowerCase() === navSection.trim().toLowerCase();
  });
  if (match) {
    match.classList.add('active');
    return match.querySelector('a').textContent.trim();
  }
  return null;
}

/**
 * Creates the bg-fluid1 element with "Lo más visto" and breadcrumbs.
 * @param {Element} mostWatchedSection The most-watched nav section
 * @returns {Element} The bg-fluid1 container element
 */
function buildBgFluid(mostWatchedSection) {
  const bgFluid = document.createElement('div');
  bgFluid.className = 'bg-fluid1 fluid1--main';

  const container = document.createElement('div');
  container.className = 'bg-fluid1-container';

  // "Lo más visto" row
  if (mostWatchedSection) {
    const mwWrapper = document.createElement('div');
    mwWrapper.className = 'most-watched';

    const mwLabel = document.createElement('div');
    mwLabel.className = 'mw-title';
    mwLabel.innerHTML = '<span>Lo más visto</span><span class="mw-info" title="Páginas más visitadas">ⓘ</span>';

    const mwContent = document.createElement('div');
    mwContent.className = 'mw-content';

    const mwList = mostWatchedSection.querySelector('ul');
    if (mwList) {
      mwList.classList.add('mw-links');
      const items = [...mwList.querySelectorAll('li')];
      items.forEach((li, idx) => {
        li.classList.add('mw-item');
        // Add slash separator between items (after each except last)
        if (idx < items.length - 1) {
          const sep = document.createElement('span');
          sep.className = 'mw-separator';
          sep.setAttribute('aria-hidden', 'true');
          sep.textContent = '/';
          li.after(sep);
        }
      });
      mwContent.appendChild(mwList);
    }

    mwWrapper.appendChild(mwLabel);
    mwWrapper.appendChild(mwContent);
    container.appendChild(mwWrapper);
  }

  // Breadcrumbs
  const breadcrumbs = document.createElement('ul');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.innerHTML = `
    <li><a href="https://www.madrid.es" class="bc-item bc-item-home"><span>Home</span></a></li>
    <li><a href="/" class="bc-item">Sede electrónica</a></li>
    ${buildBreadcrumbItems()}
  `;
  container.appendChild(breadcrumbs);

  bgFluid.appendChild(container);
  return bgFluid;
}

/**
 * Loads and decorates the header block.
 * Builds a multi-tier header matching sede.madrid.es:
 *   - Top bar (dark): hamburger + logo + search
 *   - Main menu: portal-wide links
 *   - Banner: "SEDE ELECTRÓNICA" with background image
 *   - Section heading (e.g. "Ciudadanía")
 *   - Sub-menu: section links (Mi Carpeta, Ciudadanía, etc.)
 * Also creates a bg-fluid1 div after the header with "Lo más visto" and breadcrumbs.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';

  // Collect all sections from the fragment
  // Sections: 0=brand, 1=main-menu, 2=sub-menu, 3=most-watched, 4=tools, 5=banner-bg
  const sections = [...fragment.children];
  const sectionNames = ['brand', 'main-menu', 'sub-menu', 'most-watched', 'tools', 'banner-bg'];
  sections.forEach((section, i) => {
    if (sectionNames[i]) {
      section.classList.add(`nav-${sectionNames[i]}`);
    }
    stripButtonClasses(section);
  });

  const [
    brandSection,
    mainMenuSection,
    subMenuSection,
    mostWatchedSection,
    toolsSection,
    bannerBgSection,
  ] = sections;

  // Create nav element
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // === TOP BAR (dark background: hamburger + logo + search + main menu) ===
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';

  // Hamburger button
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Abrir menú del portal">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  topBar.appendChild(hamburger);

  // Site title (left) + Brand logo (right)
  const siteTitle = document.createElement('div');
  siteTitle.className = 'nav-site-title';
  const siteTitleLink = document.createElement('a');
  siteTitleLink.href = '/';
  siteTitleLink.textContent = 'Sede electrónica del Ayuntamiento de Madrid';
  siteTitle.appendChild(siteTitleLink);
  topBar.appendChild(siteTitle);

  if (brandSection) topBar.appendChild(brandSection);

  // Main menu (Sede Electrónica, Actualidad, etc.) with search toggle inside
  if (mainMenuSection) {
    if (toolsSection) {
      const menuList = mainMenuSection.querySelector('ul');
      if (menuList) {
        const searchLi = document.createElement('li');
        searchLi.className = 'nav-search-item';
        searchLi.appendChild(toolsSection.querySelector('a') || toolsSection.querySelector('p'));
        menuList.appendChild(searchLi);
      }
    }
    topBar.appendChild(mainMenuSection);
  }

  nav.appendChild(topBar);

  // === BG-FLUID1 (Lo más visto + breadcrumbs) — inserted after header ===
  const bgFluid = buildBgFluid(mostWatchedSection);

  // === BANNER ("SEDE ELECTRÓNICA" with background image) ===
  const banner = document.createElement('div');
  banner.className = 'nav-banner';
  const bannerContent = document.createElement('div');
  bannerContent.className = 'nav-banner-content';
  const bannerTitle = document.createElement('span');
  bannerTitle.className = 'nav-banner-title';
  bannerTitle.textContent = 'SEDE ELECTRÓNICA';
  bannerContent.appendChild(bannerTitle);
  banner.appendChild(bannerContent);
  nav.appendChild(banner);

  // === SECTION HEADING (e.g. "Ciudadanía") ===
  const activeSectionName = applyActiveSubMenu(subMenuSection);
  if (activeSectionName) {
    const sectionHeading = document.createElement('h2');
    sectionHeading.className = 'nav-section-heading';
    sectionHeading.textContent = activeSectionName;
    nav.appendChild(sectionHeading);
  }

  // === SUB-MENU (Mi Carpeta, Ciudadanía, Empresas, etc.) ===
  if (subMenuSection) nav.appendChild(subMenuSection);

  // Hamburger toggle
  hamburger.addEventListener('click', () => toggleMenu(nav));
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  // Escape key to close mobile menu
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches) {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  // Wrap nav and append to block
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.appendChild(nav);

  // Banner background image from authored content (section 6)
  if (bannerBgSection) {
    const picture = bannerBgSection.querySelector('picture');
    if (picture) {
      picture.classList.add('nav-wrapper-bg');
      navWrapper.prepend(picture);
    }
  }

  block.appendChild(navWrapper);

  // Insert bg-fluid1 inside header block to avoid layout shift
  block.appendChild(bgFluid);
}
