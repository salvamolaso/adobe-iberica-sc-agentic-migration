/**
 * Metadata block – reads key/value rows and applies them as <meta> tags.
 * The block itself is hidden from the page.
 * @param {Element} block The metadata block element
 */
export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key && value) {
        const existing = document.querySelector(`meta[name="${key}"], meta[property="${key}"]`);
        if (!existing) {
          const meta = document.createElement('meta');
          if (key.startsWith('og:')) {
            meta.setAttribute('property', key);
          } else {
            meta.setAttribute('name', key);
          }
          meta.setAttribute('content', value);
          document.head.appendChild(meta);
        }
      }
    }
  });
  block.closest('.section').remove();
}
