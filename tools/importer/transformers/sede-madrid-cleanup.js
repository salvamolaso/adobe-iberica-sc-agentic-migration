/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Sede Madrid website cleanup
 * Purpose: Remove non-content elements (navigation, sidebars, footers, popups, widgets)
 * Applies to: sede.madrid.es (all templates)
 * Generated: 2026-03-04
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 * - Elements verified in actual page HTML structure
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove mobile sidebar navigation menu
    // EXTRACTED: Found <nav id="menu" class="sidebar mm-menu mm-horizontal mm-offcanvas mm-hasheader">
    WebImporter.DOMUtils.remove(element, [
      'nav#menu',
    ]);

    // Remove vertical side menus (sharing, favorites, navigation links)
    // EXTRACTED: Found <div id="menuVertical" class="menuVertical normal hidden-print nocontent">
    // EXTRACTED: Found <div id="menuVerticalFooter" class="menuVertical normal hidden-print nocontent menuSocialFooter">
    WebImporter.DOMUtils.remove(element, [
      '#menuVertical',
      '#menuVerticalFooter',
    ]);

    // Remove ReadSpeaker widget
    // EXTRACTED: Found <div id="readspeaker_button1" class="rs_skip rsbtn rs_preserve mega_toggle">
    WebImporter.DOMUtils.remove(element, [
      '#readspeaker_button1',
    ]);

    // Remove "back" button
    // EXTRACTED: Found <a class="button button3 backbutton" href="#">Volver</a>
    WebImporter.DOMUtils.remove(element, [
      'a.backbutton',
    ]);

    // Remove breadcrumb navigation
    // EXTRACTED: Found <ul class="breadcrumb"> in header area
    WebImporter.DOMUtils.remove(element, [
      'ul.breadcrumb',
    ]);

    // Remove popup overlay
    // EXTRACTED: Found <div id="aytmad-popup-overlay" class="aytmad-popup-overlay">
    WebImporter.DOMUtils.remove(element, [
      '#aytmad-popup-overlay',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove feedback/rating section
    // EXTRACTED: Found <div class="useful nofluid nocontent"> with "¿Te ha sido útil esta página?"
    WebImporter.DOMUtils.remove(element, [
      '.useful',
    ]);

    // Remove footer
    // EXTRACTED: Found <footer class="footer nocontent">
    WebImporter.DOMUtils.remove(element, [
      'footer.footer',
    ]);

    // Remove hidden tracking elements
    // EXTRACTED: Found <div class="hidden"><img alt="" src="...infoVisitas.jsp...">
    WebImporter.DOMUtils.remove(element, [
      'div.hidden',
    ]);

    // Remove navigation arrows
    // EXTRACTED: Found <a href="#" id="nav_up" class="text-hide">Subir</a>
    // EXTRACTED: Found <a href="#" id="nav_down" class="text-hide">Bajar</a>
    WebImporter.DOMUtils.remove(element, [
      '#nav_up',
      '#nav_down',
    ]);

    // Remove remaining unwanted standard elements
    WebImporter.DOMUtils.remove(element, [
      'noscript',
    ]);
  }
}
