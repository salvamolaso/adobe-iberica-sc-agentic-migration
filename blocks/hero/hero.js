export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // First row contains the image, second row contains text
  const textRow = rows[rows.length - 1];
  const textDiv = textRow.querySelector('div');
  if (!textDiv) return;

  // Check if there's already an h1
  if (textDiv.querySelector('h1')) return;

  // Handle raw markdown heading syntax (# text) that wasn't converted
  const text = textDiv.textContent.trim();
  if (text.startsWith('# ')) {
    const h1 = document.createElement('h1');
    h1.textContent = text.substring(2);
    textDiv.innerHTML = '';
    textDiv.append(h1);
  } else if (!textDiv.querySelector('h1, h2, h3, h4, h5, h6')) {
    // Wrap plain text in h1
    const p = textDiv.querySelector('p');
    if (p) {
      const h1 = document.createElement('h1');
      h1.textContent = p.textContent;
      p.replaceWith(h1);
    }
  }
}
